"""
app/api/routes/products.py — Product listing API
"""
import uuid

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.session import get_db

router = APIRouter(prefix="/api/products", tags=["products"])


@router.get("")
@router.get("/")
async def list_products(
    merchant_id: str | None = Query(None),
    category: str | None = Query(None),
    q: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
) -> dict:
    from app.db.models import Product

    stmt = (
        select(Product)
        .options(selectinload(Product.inventory))
        .where(Product.is_active == True)
    )
    if merchant_id:
        stmt = stmt.where(Product.merchant_id == uuid.UUID(merchant_id))
    if category:
        stmt = stmt.where(Product.category.ilike(f"%{category}%"))
    if q:
        stmt = stmt.where(Product.name.ilike(f"%{q}%"))

    result = await db.execute(stmt.limit(20))
    products = result.scalars().all()

    return {
        "products": [
            {
                "id": str(p.id),
                "name": p.name,
                "category": p.category,
                "brand": p.brand,
                "price": float(p.price),
                "currency": p.currency,
                "description": p.description,
                "specifications": p.specifications,
                "rating": float(p.rating) if p.rating else None,
                "image_url": p.image_url,
                "in_stock": (p.inventory.available_quantity > 0) if p.inventory else False,
                "stock": p.inventory.available_quantity if p.inventory else 0,
            }
            for p in products
        ],
        "total": len(products),
    }
