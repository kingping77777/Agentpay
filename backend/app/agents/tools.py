"""
app/agents/tools.py

Pure async DB tool functions used by all agents.
These query/mutate the database and return plain Python dicts.
"""

import uuid
from decimal import Decimal
from typing import Any

from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models import (
    Product, Inventory, Cart, CartItem, CartStatus,
    Order, OrderStatus, MerchantPolicy, Promotion,
    ProductRelation, RelationType, Customer,
    AgentAction, AgentType, ActionStatus, AuditLog,
    ActorType, AuditDecision,
)


# ── Product Tools ─────────────────────────────────────────────────────────────

async def search_products(
    db: AsyncSession,
    merchant_id: str,
    query: str = "",
    category: str = "",
    brand: str = "",
    max_price: float = 0,
    limit: int = 6,
) -> list[dict]:
    """Search products by name/category/brand/price for a specific merchant."""
    from sqlalchemy import or_

    stmt = (
        select(Product)
        .options(selectinload(Product.inventory))
        .where(
            Product.merchant_id == uuid.UUID(merchant_id),
            Product.is_active == True,
        )
    )
    if query:
        raw_words = [w.strip().lower() for w in query.strip().split() if len(w.strip()) > 1 and w.lower() not in ("the", "and", "for", "with", "show", "me", "some", "any", "want", "under", "below", "need", "find", "buy")]
        words = set()
        for rw in raw_words:
            words.add(rw)
            # Add stems for plural/singular
            if rw.endswith(("ches", "shes", "xes", "sses", "zes")) and len(rw) > 4:
                words.add(rw[:-2])
            elif rw.endswith("ies") and len(rw) > 4:
                words.add(rw[:-3] + "y")
            elif rw.endswith("s") and not rw.endswith("ss") and len(rw) > 3:
                words.add(rw[:-1])
            else:
                words.add(rw + "s")
            # Category synonyms
            if rw in ("shoe", "shoes", "sneaker", "sneakers", "boots", "boot", "footwear"):
                words.update(["shoe", "shoes", "sneaker", "footwear"])

        if words:
            word_clauses = []
            for w in words:
                word_clauses.append(Product.name.ilike(f"%{w}%"))
                word_clauses.append(Product.category.ilike(f"%{w}%"))
                word_clauses.append(Product.brand.ilike(f"%{w}%"))
                word_clauses.append(Product.description.ilike(f"%{w}%"))
            stmt = stmt.where(or_(*word_clauses))
        else:
            stmt = stmt.where(or_(
                Product.name.ilike(f"%{query}%"),
                Product.category.ilike(f"%{query}%"),
                Product.brand.ilike(f"%{query}%"),
            ))

    if category:
        stmt = stmt.where(Product.category.ilike(f"%{category}%"))
    if brand:
        stmt = stmt.where(Product.brand.ilike(f"%{brand}%"))
    if max_price > 0:
        stmt = stmt.where(Product.price <= max_price)

    result = await db.execute(stmt.limit(limit))
    products = result.scalars().all()

    return [
        {
            "id": str(p.id),
            "name": p.name,
            "category": p.category,
            "brand": p.brand or "",
            "price": float(p.price),
            "currency": p.currency,
            "description": p.description or "",
            "specifications": p.specifications or {},
            "rating": float(p.rating) if p.rating else 4.7,
            "image_url": p.image_url or "",
            "in_stock": (p.inventory.available_quantity > 0) if p.inventory else False,
            "stock": p.inventory.available_quantity if p.inventory else 0,
        }
        for p in products
    ]


async def register_dynamic_product(
    db: AsyncSession,
    merchant_id: str,
    name: str,
    category: str = "gadgets",
    brand: str = "generic",
    price: float = 9999.00,
    description: str = "",
    specifications: dict | None = None,
    image_url: str = "",
    rating: float = 4.8,
) -> dict:
    """Dynamically register a newly searched tech/consumer product into the live database catalog."""
    p_id = uuid.uuid4()
    sku = f"DYN-{brand[:3].upper()}-{p_id.hex[:6].upper()}"
    product = Product(
        id=p_id,
        merchant_id=uuid.UUID(merchant_id),
        name=name,
        category=category.lower(),
        brand=brand.lower(),
        description=description or f"Verified {name} with manufacturer warranty and fast delivery.",
        price=price,
        currency="INR",
        sku=sku,
        specifications=specifications or {"type": "Consumer Product", "warranty": "1 Year Standard"},
        image_url=image_url or None,
        rating=rating,
        is_active=True,
    )
    db.add(product)
    await db.flush()

    inventory = Inventory(
        id=uuid.uuid4(),
        product_id=product.id,
        stock_quantity=15,
        reserved_quantity=0,
    )
    db.add(inventory)
    await db.commit()

    return {
        "id": str(product.id),
        "name": product.name,
        "category": product.category,
        "brand": product.brand,
        "price": float(product.price),
        "currency": "INR",
        "description": product.description,
        "specifications": product.specifications,
        "image_url": product.image_url or "",
        "rating": float(product.rating) if product.rating else 4.7,
        "in_stock": True,
        "stock": 15,
    }


# ── Cart Tools ────────────────────────────────────────────────────────────────

async def get_or_create_cart(
    db: AsyncSession, customer_id: str, merchant_id: str
) -> dict:
    """Get an active cart or create one."""
    result = await db.execute(
        select(Cart)
        .options(selectinload(Cart.items).selectinload(CartItem.product))
        .where(
            Cart.customer_id == uuid.UUID(customer_id),
            Cart.merchant_id == uuid.UUID(merchant_id),
            Cart.status == CartStatus.ACTIVE,
        )
    )
    cart = result.scalar_one_or_none()

    if not cart:
        cart = Cart(
            customer_id=uuid.UUID(customer_id),
            merchant_id=uuid.UUID(merchant_id),
            status=CartStatus.ACTIVE,
        )
        db.add(cart)
        await db.flush()
        cart.items = []

    return _cart_to_dict(cart)


async def add_to_cart(
    db: AsyncSession,
    customer_id: str,
    merchant_id: str,
    product_id: str,
    quantity: int = 1,
) -> dict:
    """Add a product to the customer's active cart."""
    # get or create cart
    result = await db.execute(
        select(Cart)
        .options(selectinload(Cart.items))
        .where(
            Cart.customer_id == uuid.UUID(customer_id),
            Cart.merchant_id == uuid.UUID(merchant_id),
            Cart.status == CartStatus.ACTIVE,
        )
    )
    cart = result.scalar_one_or_none()
    if not cart:
        cart = Cart(
            customer_id=uuid.UUID(customer_id),
            merchant_id=uuid.UUID(merchant_id),
            status=CartStatus.ACTIVE,
        )
        db.add(cart)
        await db.flush()

    # get product
    p_result = await db.execute(
        select(Product)
        .options(selectinload(Product.inventory))
        .where(Product.id == uuid.UUID(product_id))
    )
    product = p_result.scalar_one_or_none()
    if not product:
        raise ValueError(f"Product {product_id} not found")

    # check existing item
    existing_result = await db.execute(
        select(CartItem).where(
            CartItem.cart_id == cart.id,
            CartItem.product_id == uuid.UUID(product_id),
        )
    )
    existing = existing_result.scalar_one_or_none()

    if existing:
        existing.quantity += quantity
        existing.final_price = float(existing.unit_price) * existing.quantity - float(existing.discount)
    else:
        unit_price = float(product.price)
        item = CartItem(
            cart_id=cart.id,
            product_id=uuid.UUID(product_id),
            quantity=quantity,
            unit_price=unit_price,
            discount=0.0,
            final_price=unit_price * quantity,
        )
        db.add(item)

    # recalculate cart totals
    await db.flush()
    await _recalculate_cart(db, cart)
    await db.commit()

    # reload with items
    result2 = await db.execute(
        select(Cart)
        .options(selectinload(Cart.items).selectinload(CartItem.product))
        .where(Cart.id == cart.id)
    )
    cart = result2.scalar_one()
    return _cart_to_dict(cart)


async def view_cart(
    db: AsyncSession, customer_id: str, merchant_id: str
) -> dict | None:
    result = await db.execute(
        select(Cart)
        .options(selectinload(Cart.items).selectinload(CartItem.product))
        .where(
            Cart.customer_id == uuid.UUID(customer_id),
            Cart.merchant_id == uuid.UUID(merchant_id),
            Cart.status == CartStatus.ACTIVE,
        )
    )
    cart = result.scalar_one_or_none()
    return _cart_to_dict(cart) if cart else None


async def remove_from_cart(
    db: AsyncSession, customer_id: str, merchant_id: str, product_id: str
) -> dict:
    result = await db.execute(
        select(Cart)
        .options(selectinload(Cart.items))
        .where(
            Cart.customer_id == uuid.UUID(customer_id),
            Cart.merchant_id == uuid.UUID(merchant_id),
            Cart.status == CartStatus.ACTIVE,
        )
    )
    cart = result.scalar_one_or_none()
    if not cart:
        return {"error": "No active cart found"}

    item_result = await db.execute(
        select(CartItem).where(
            CartItem.cart_id == cart.id,
            CartItem.product_id == uuid.UUID(product_id),
        )
    )
    item = item_result.scalar_one_or_none()
    if item:
        await db.delete(item)
        await _recalculate_cart(db, cart)
        await db.commit()

    result2 = await db.execute(
        select(Cart)
        .options(selectinload(Cart.items).selectinload(CartItem.product))
        .where(Cart.id == cart.id)
    )
    return _cart_to_dict(result2.scalar_one())


# ── Upsell / Promotion Tools ──────────────────────────────────────────────────

async def get_recommendations(
    db: AsyncSession, product_id: str, relation_type: str = "CROSS_SELL"
) -> list[dict]:
    """Get product recommendations (upsell / cross-sell)."""
    rt = RelationType(relation_type)
    result = await db.execute(
        select(ProductRelation)
        .options(selectinload(ProductRelation.related_product))
        .where(
            ProductRelation.product_id == uuid.UUID(product_id),
            ProductRelation.relation_type == rt,
        )
        .order_by(ProductRelation.priority)
        .limit(3)
    )
    rels = result.scalars().all()
    return [
        {
            "id": str(r.related_product.id),
            "name": r.related_product.name,
            "price": float(r.related_product.price),
            "relation_type": relation_type,
            "discount_value": float(r.discount_value) if r.discount_value else 0,
        }
        for r in rels
    ]


async def get_active_promotions(db: AsyncSession, merchant_id: str) -> list[dict]:
    """Get currently active promotions for a merchant."""
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    result = await db.execute(
        select(Promotion).where(
            Promotion.merchant_id == uuid.UUID(merchant_id),
            Promotion.is_active == True,
            Promotion.start_date <= now,
            Promotion.end_date >= now,
        )
    )
    promos = result.scalars().all()
    return [
        {
            "id": str(p.id),
            "name": p.name,
            "type": p.promotion_type.value,
            "discount_value": float(p.discount_value),
            "minimum_cart_value": float(p.minimum_cart_value),
            "product_id": str(p.product_id) if p.product_id else None,
        }
        for p in promos
    ]


# ── Policy Tools ──────────────────────────────────────────────────────────────

async def get_merchant_policy(db: AsyncSession, merchant_id: str) -> dict | None:
    result = await db.execute(
        select(MerchantPolicy).where(
            MerchantPolicy.merchant_id == uuid.UUID(merchant_id)
        )
    )
    policy = result.scalar_one_or_none()
    if not policy:
        return None
    return {
        "max_transaction_amount": float(policy.max_transaction_amount),
        "max_discount_percentage": float(policy.max_discount_percentage),
        "minimum_order_amount": float(policy.minimum_order_amount),
        "agent_purchase_enabled": policy.agent_purchase_enabled,
        "upsell_enabled": policy.upsell_enabled,
        "refund_window_days": policy.refund_window_days,
        "delivery_rules": policy.delivery_rules or {},
        "requires_authorization": policy.requires_authorization,
    }


async def get_customer_budget(db: AsyncSession, customer_id: str) -> float | None:
    result = await db.execute(
        select(Customer).where(Customer.id == uuid.UUID(customer_id))
    )
    customer = result.scalar_one_or_none()
    if not customer or customer.budget_limit is None:
        return None
    return float(customer.budget_limit)


# ── Audit / Logging ───────────────────────────────────────────────────────────

async def log_agent_action(
    db: AsyncSession,
    session_id: str,
    agent_type: str,
    action_type: str,
    status: str,
    input_data: dict | None = None,
    output_data: dict | None = None,
    reason: str | None = None,
    duration_ms: int | None = None,
) -> str:
    action = AgentAction(
        session_id=uuid.UUID(session_id),
        agent_type=AgentType(agent_type),
        action_type=action_type,
        status=ActionStatus(status),
        input_data=input_data,
        output_data=output_data,
        reason=reason,
        duration_ms=duration_ms,
    )
    db.add(action)
    await db.flush()
    return str(action.id)


async def log_audit(
    db: AsyncSession,
    session_id: str | None,
    actor_type: str,
    action: str,
    decision: str | None = None,
    reason: str | None = None,
    entity_type: str | None = None,
    entity_id: str | None = None,
    request_data: dict | None = None,
    agent_type: str | None = None,
    actor_id: str | None = None,
) -> None:
    from app.db.models.audit_log import AgentTypeForAudit
    log = AuditLog(
        session_id=uuid.UUID(session_id) if session_id else None,
        actor_type=ActorType(actor_type),
        actor_id=actor_id,
        agent_type=AgentTypeForAudit(agent_type) if agent_type else None,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        request_data=request_data,
        decision=AuditDecision(decision) if decision else None,
        reason=reason,
    )
    db.add(log)
    await db.flush()


# ── Helpers ───────────────────────────────────────────────────────────────────

def _cart_to_dict(cart: Cart) -> dict:
    return {
        "id": str(cart.id),
        "status": cart.status.value,
        "subtotal": float(cart.subtotal),
        "discount": float(cart.discount),
        "total": float(cart.total),
        "items": [
            {
                "id": str(item.id),
                "product_id": str(item.product_id),
                "product_name": item.product.name if item.product else "Unknown",
                "quantity": item.quantity,
                "unit_price": float(item.unit_price),
                "discount": float(item.discount),
                "final_price": float(item.final_price),
            }
            for item in (cart.items or [])
        ],
        "item_count": len(cart.items or []),
    }


async def _recalculate_cart(db: AsyncSession, cart: Cart) -> None:
    result = await db.execute(
        select(CartItem).where(CartItem.cart_id == cart.id)
    )
    items = result.scalars().all()
    subtotal = sum(float(i.unit_price) * i.quantity for i in items)
    discount = sum(float(i.discount) for i in items)
    cart.subtotal = subtotal
    cart.discount = discount
    cart.total = subtotal - discount
    db.add(cart)
