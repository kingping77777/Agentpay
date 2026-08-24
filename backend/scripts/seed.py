"""
scripts/seed.py

Seeds the AgentPay database with a realistic demo environment:
- 2 users (1 merchant, 1 customer)
- 1 merchant (TechStore)
- 8 products (laptops + peripherals)
- Inventory for each product
- 6 product relations (cross-sell + upsell)
- 1 merchant policy
- 1 active promotion (bundle deal)
- 1 customer profile with ₹70,000 budget limit

Run from backend/ directory:
    python scripts/seed.py
"""

import asyncio
import os
import sys
import uuid
from datetime import datetime, timedelta, timezone

# Ensure the backend package is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), "..", ".env"))

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.db.models import (
    Cart,
    CartStatus,
    Customer,
    Inventory,
    Merchant,
    MerchantPolicy,
    MerchantStatus,
    Product,
    ProductRelation,
    Promotion,
    PromotionType,
    RelationType,
    User,
    UserRole,
)

# Configure stdout encoding for Windows compatibility
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

import bcrypt


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

# ── Colours for terminal output ───────────────────────────────────────────────
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
RESET = "\033[0m"
BOLD = "\033[1m"


def ok(msg: str) -> None:
    print(f"{GREEN}[OK]{RESET} {msg}")


def info(msg: str) -> None:
    print(f"{YELLOW}[INFO]{RESET} {msg}")


def err(msg: str) -> None:
    print(f"{RED}[ERR]{RESET} {msg}")


# ─────────────────────────────────────────────────────────────────────────────
# Seed Data Definitions
# ─────────────────────────────────────────────────────────────────────────────

MERCHANT_USER_EMAIL = "merchant@techstore.com"
CUSTOMER_USER_EMAIL = "demo@agentpay.com"
DEFAULT_PASSWORD = "AgentPay@2024"


PRODUCTS_DATA = [
    # ── Laptops ───────────────────────────────────────────────────────────────
    {
        "name": "Lenovo IdeaPad Slim 5",
        "category": "laptops",
        "brand": "lenovo",
        "description": (
            "The Lenovo IdeaPad Slim 5 is a sleek, performance-oriented laptop "
            "designed for professionals and students. Equipped with AMD Ryzen 7 "
            "processor and 16GB RAM, it handles coding, multitasking, and "
            "light creative work with ease."
        ),
        "price": 62_000.00,
        "sku": "LEN-IPS5-16-512",
        "specifications": {
            "processor": "AMD Ryzen 7 5700U",
            "ram": "16GB DDR4",
            "storage": "512GB NVMe SSD",
            "display": "15.6-inch FHD IPS 300-nits",
            "os": "Windows 11 Home",
            "battery": "56Wh, up to 10hrs",
            "weight": "1.67kg",
            "ports": "USB-C, USB-A x2, HDMI, SD Card",
        },
        "image_url": "https://placehold.co/400x300?text=Lenovo+IdeaPad+Slim+5",
        "rating": 4.5,
        "stock": 14,
    },
    {
        "name": "HP Pavilion 15",
        "category": "laptops",
        "brand": "hp",
        "description": (
            "HP Pavilion 15 combines everyday performance with a premium feel. "
            "Features Intel Core i5 12th Gen processor with 16GB RAM and a "
            "dedicated NVIDIA MX550 GPU, ideal for coding and light gaming."
        ),
        "price": 67_000.00,
        "sku": "HP-PAV15-I5-512",
        "specifications": {
            "processor": "Intel Core i5-1235U (12th Gen)",
            "ram": "16GB DDR4 3200MHz",
            "storage": "512GB NVMe SSD",
            "gpu": "NVIDIA GeForce MX550 2GB",
            "display": "15.6-inch FHD IPS Anti-glare",
            "os": "Windows 11 Home",
            "battery": "70Wh, up to 9hrs",
            "weight": "1.75kg",
        },
        "image_url": "https://placehold.co/400x300?text=HP+Pavilion+15",
        "rating": 4.3,
        "stock": 3,
    },
    {
        "name": "Dell Inspiron 15",
        "category": "laptops",
        "brand": "dell",
        "description": (
            "Dell Inspiron 15 offers a premium build with Intel Core i7 12th Gen, "
            "16GB RAM, and 1TB SSD. Best suited for power users who need serious "
            "computing performance."
        ),
        "price": 72_000.00,
        "sku": "DEL-INS15-I7-1TB",
        "specifications": {
            "processor": "Intel Core i7-1255U (12th Gen)",
            "ram": "16GB DDR4 3200MHz",
            "storage": "1TB NVMe SSD",
            "display": "15.6-inch FHD IPS, 120Hz",
            "os": "Windows 11 Home",
            "battery": "54Wh, up to 8hrs",
            "weight": "1.73kg",
        },
        "image_url": "https://placehold.co/400x300?text=Dell+Inspiron+15",
        "rating": 4.4,
        "stock": 8,
    },
    # ── Peripherals ───────────────────────────────────────────────────────────
    {
        "name": "Logitech MX Master 3 Mouse",
        "category": "peripherals",
        "brand": "logitech",
        "description": (
            "The Logitech MX Master 3 is the ultimate productivity mouse. "
            "Features MagSpeed electromagnetic scrolling, ergonomic design, "
            "USB-C charging, and works across 3 computers simultaneously."
        ),
        "price": 6_500.00,
        "sku": "LOG-MXM3-BLK",
        "specifications": {
            "type": "Wireless",
            "dpi": "200-4000 DPI",
            "buttons": "7 programmable buttons",
            "battery": "USB-C, 70 days per charge",
            "connectivity": "Bluetooth + USB receiver",
            "compatibility": "Windows, Mac, Linux",
        },
        "image_url": "https://placehold.co/400x300?text=Logitech+MX+Master+3",
        "rating": 4.8,
        "stock": 25,
    },
    {
        "name": "USB Wired Optical Mouse",
        "category": "peripherals",
        "brand": "techstore",
        "description": (
            "A reliable, plug-and-play wired USB mouse. No drivers needed, "
            "1000 DPI optical sensor, ambidextrous design. Perfect for "
            "everyday computing and pairs well with any laptop."
        ),
        "price": 1_200.00,
        "sku": "TS-USB-MOUSE-WHT",
        "specifications": {
            "type": "Wired USB",
            "dpi": "1000 DPI",
            "buttons": "3 buttons",
            "cable_length": "1.5m",
            "compatibility": "Universal USB",
        },
        "image_url": "https://placehold.co/400x300?text=USB+Wired+Mouse",
        "rating": 4.1,
        "stock": 40,
    },
    # ── Accessories ───────────────────────────────────────────────────────────
    {
        "name": "Laptop Bag 15.6\"",
        "category": "accessories",
        "brand": "techstore",
        "description": (
            "Durable water-resistant laptop bag with a padded compartment for "
            "15.6-inch laptops. Multiple pockets for accessories, USB charging "
            "port on the outside. Comfortable ergonomic shoulder straps."
        ),
        "price": 1_500.00,
        "sku": "TS-BAG-156-GRY",
        "specifications": {
            "material": "Water-resistant nylon",
            "laptop_size": "Up to 15.6 inches",
            "compartments": "3 main + 5 accessory pockets",
            "usb_port": "External USB-A charging port",
            "weight": "0.8kg",
        },
        "image_url": "https://placehold.co/400x300?text=Laptop+Bag+15.6",
        "rating": 4.2,
        "stock": 18,
    },
    {
        "name": "USB-C Hub 7-in-1",
        "category": "accessories",
        "brand": "techstore",
        "description": (
            "Expand your laptop's connectivity with this 7-in-1 USB-C hub. "
            "Includes 4K HDMI, USB-C PD 100W, SD/MicroSD card slots, "
            "3x USB-A 3.0 ports. Compatible with all USB-C laptops."
        ),
        "price": 2_200.00,
        "sku": "TS-USBC-HUB7",
        "specifications": {
            "ports": "4K HDMI, USB-C PD 100W, USB-A x3, SD, MicroSD",
            "data_speed": "USB 3.0 5Gbps",
            "hdmi": "4K @ 30Hz",
            "pd_charging": "100W pass-through",
            "compatibility": "All USB-C laptops",
        },
        "image_url": "https://placehold.co/400x300?text=USB-C+Hub+7-in-1",
        "rating": 4.3,
        "stock": 12,
    },
    {
        "name": "Mechanical Keyboard TKL",
        "category": "peripherals",
        "brand": "techstore",
        "description": (
            "Tenkeyless mechanical keyboard with Cherry MX Blue switches. "
            "N-Key rollover, RGB backlighting, durable aluminum top plate. "
            "Perfect companion for coding and gaming."
        ),
        "price": 4_500.00,
        "sku": "TS-MECH-TKL-BLU",
        "specifications": {
            "layout": "TKL (87-key)",
            "switches": "Cherry MX Blue (tactile, clicky)",
            "backlight": "RGB per-key",
            "connectivity": "USB-C detachable cable",
            "n_key_rollover": "Yes",
            "material": "Aluminum top plate, ABS keycaps",
        },
        "image_url": "https://placehold.co/400x300?text=Mechanical+Keyboard+TKL",
        "rating": 4.6,
        "stock": 9,
    },
]

# Product relations: (source_sku, related_sku, type, priority, discount)
RELATIONS_DATA = [
    # Lenovo → mouse (cross-sell with bundle discount)
    ("LEN-IPS5-16-512", "TS-USB-MOUSE-WHT", RelationType.CROSS_SELL, 1, 300.00),
    # Lenovo → bag
    ("LEN-IPS5-16-512", "TS-BAG-156-GRY", RelationType.CROSS_SELL, 2, None),
    # Lenovo → USB-C hub
    ("LEN-IPS5-16-512", "TS-USBC-HUB7", RelationType.CROSS_SELL, 3, None),
    # Lenovo → HP (upsell: higher spec)
    ("LEN-IPS5-16-512", "HP-PAV15-I5-512", RelationType.UPSELL, 1, None),
    # HP → Logitech mouse (premium cross-sell)
    ("HP-PAV15-I5-512", "LOG-MXM3-BLK", RelationType.CROSS_SELL, 1, None),
    # HP → mechanical keyboard
    ("HP-PAV15-I5-512", "TS-MECH-TKL-BLU", RelationType.CROSS_SELL, 2, None),
    # Dell → Logitech mouse (premium bundle)
    ("DEL-INS15-I7-1TB", "LOG-MXM3-BLK", RelationType.CROSS_SELL, 1, None),
    # Dell → keyboard
    ("DEL-INS15-I7-1TB", "TS-MECH-TKL-BLU", RelationType.CROSS_SELL, 2, None),
]


# ─────────────────────────────────────────────────────────────────────────────
# Seed Runner
# ─────────────────────────────────────────────────────────────────────────────

async def seed() -> None:
    print(f"\n{BOLD}==========================================={RESET}")
    print(f"{BOLD}  AgentPay Database Seed{RESET}")
    print(f"{BOLD}==========================================={RESET}\n")

    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    from app.db.base import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        try:
            await _seed_all(session)
            await session.commit()
            print(f"\n{BOLD}{GREEN}Seed completed successfully!{RESET}\n")
        except Exception as e:
            await session.rollback()
            err(f"Seed failed: {e}")
            raise
        finally:
            await engine.dispose()


async def _seed_all(session: AsyncSession) -> None:
    # ── Step 1: Users ─────────────────────────────────────────────────────────
    info("Creating users...")

    merchant_user = User(
        id=uuid.uuid4(),
        name="TechStore Admin",
        email=MERCHANT_USER_EMAIL,
        password_hash=hash_password(DEFAULT_PASSWORD),
        role=UserRole.MERCHANT,
        is_active=True,
    )
    customer_user = User(
        id=uuid.uuid4(),
        name="Demo Customer",
        email=CUSTOMER_USER_EMAIL,
        password_hash=hash_password(DEFAULT_PASSWORD),
        role=UserRole.CUSTOMER,
        is_active=True,
    )
    session.add_all([merchant_user, customer_user])
    await session.flush()
    ok(f"Users created: {MERCHANT_USER_EMAIL}, {CUSTOMER_USER_EMAIL}")

    # ── Step 2: Merchant ──────────────────────────────────────────────────────
    info("Creating merchant...")

    merchant = Merchant(
        id=uuid.uuid4(),
        user_id=merchant_user.id,
        name="TechStore",
        business_type="Electronics Retail",
        description=(
            "TechStore is a premier electronics retailer specializing in "
            "laptops, peripherals, and accessories. We use AI-powered sales "
            "to help customers find the perfect tech for their needs."
        ),
        status=MerchantStatus.ACTIVE,
    )
    session.add(merchant)
    await session.flush()
    ok(f"Merchant created: {merchant.name} (id={merchant.id})")

    # ── Step 3: Merchant Policy ───────────────────────────────────────────────
    info("Creating merchant policy...")

    policy = MerchantPolicy(
        id=uuid.uuid4(),
        merchant_id=merchant.id,
        max_transaction_amount=100_000.00,   # AI cannot create orders > ₹1L
        max_discount_percentage=5.00,         # Max 5% discount via AI
        minimum_order_amount=500.00,
        agent_purchase_enabled=True,
        upsell_enabled=True,
        refund_window_days=7,
        delivery_rules={
            "free_above": 5_000,
            "standard_days": 5,
            "express_days": 2,
            "express_charge": 299,
        },
        requires_authorization=True,          # Always require human confirmation
    )
    session.add(policy)
    await session.flush()
    ok(
        f"Policy set: max_tx=₹{policy.max_transaction_amount:,.0f}, "
        f"max_discount={policy.max_discount_percentage}%, "
        f"auth_required={policy.requires_authorization}"
    )

    # ── Step 4: Products ──────────────────────────────────────────────────────
    info("Creating products...")

    sku_to_product: dict[str, Product] = {}
    for p_data in PRODUCTS_DATA:
        stock = p_data.pop("stock")
        product = Product(
            id=uuid.uuid4(),
            merchant_id=merchant.id,
            **p_data,
        )
        session.add(product)
        await session.flush()

        # Create inventory record immediately
        inventory = Inventory(
            id=uuid.uuid4(),
            product_id=product.id,
            stock_quantity=stock,
            reserved_quantity=0,
        )
        session.add(inventory)

        sku_to_product[product.sku] = product
        ok(f"  Product: {product.name} — ₹{product.price:,.0f} | stock={stock}")

    await session.flush()
    ok(f"Products created: {len(PRODUCTS_DATA)} products, {len(PRODUCTS_DATA)} inventory records")

    # ── Step 5: Product Relations ─────────────────────────────────────────────
    info("Creating product relations...")

    for src_sku, rel_sku, rel_type, priority, discount in RELATIONS_DATA:
        if src_sku not in sku_to_product or rel_sku not in sku_to_product:
            err(f"  Skipping relation {src_sku} → {rel_sku}: product not found")
            continue
        relation = ProductRelation(
            id=uuid.uuid4(),
            product_id=sku_to_product[src_sku].id,
            related_product_id=sku_to_product[rel_sku].id,
            relation_type=rel_type,
            priority=priority,
            discount_value=discount,
        )
        session.add(relation)
        ok(f"  {src_sku} → {rel_sku} [{rel_type.value}] priority={priority}")

    await session.flush()
    ok(f"Product relations created: {len(RELATIONS_DATA)}")

    # ── Step 6: Promotion ─────────────────────────────────────────────────────
    info("Creating promotions...")

    now = datetime.now(timezone.utc)
    bundle_promo = Promotion(
        id=uuid.uuid4(),
        merchant_id=merchant.id,
        product_id=None,  # applies to any laptop + mouse bundle
        name="Laptop + Mouse Bundle Deal",
        promotion_type=PromotionType.BUNDLE,
        discount_value=300.00,
        minimum_cart_value=5_000.00,
        start_date=now,
        end_date=now + timedelta(days=180),
        is_active=True,
    )
    session.add(bundle_promo)
    await session.flush()
    ok(f"Promotion created: {bundle_promo.name} — ₹{bundle_promo.discount_value:.0f} off")

    # ── Step 7: Customer ──────────────────────────────────────────────────────
    info("Creating demo customer...")

    customer = Customer(
        id=uuid.uuid4(),
        user_id=customer_user.id,
        budget_limit=70_000.00,              # Key demo constraint
        preferred_categories=["laptops", "peripherals"],
        preferred_brands=["lenovo", "hp", "logitech"],
        location="Mumbai, Maharashtra",
    )
    session.add(customer)
    await session.flush()
    ok(
        f"Customer created: {customer_user.email} | "
        f"budget_limit=₹{customer.budget_limit:,.0f}"
    )

    # ── Summary ───────────────────────────────────────────────────────────────
    print(f"\n{BOLD}── Seed Summary ──────────────────────────{RESET}")
    print(f"  Merchant user : {MERCHANT_USER_EMAIL} / {DEFAULT_PASSWORD}")
    print(f"  Customer user : {CUSTOMER_USER_EMAIL} / {DEFAULT_PASSWORD}")
    print(f"  Merchant      : {merchant.name} (id={merchant.id})")
    print(f"  Products      : {len(PRODUCTS_DATA)} products seeded")
    print(f"  Relations     : {len(RELATIONS_DATA)} relations seeded")
    print(f"  Customer limit: ₹70,000 (demo scenario: Dell ₹72,000 will FAIL)")
    print(f"  DB URL        : {settings.DATABASE_URL[:40]}...")


if __name__ == "__main__":
    asyncio.run(seed())
