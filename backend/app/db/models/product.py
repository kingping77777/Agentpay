"""
app/db/models/product.py
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.types import JSON_TYPE, UUID_TYPE


class Product(Base):
    __tablename__ = "products"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID_TYPE, primary_key=True, default=uuid.uuid4
    )
    merchant_id: Mapped[uuid.UUID] = mapped_column(
        UUID_TYPE,
        ForeignKey("merchants.id", ondelete="CASCADE"),
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(300), nullable=False)
    category: Mapped[str] = mapped_column(String(100), nullable=False)
    brand: Mapped[str | None] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(Text)

    # Price stored as Numeric to avoid floating-point issues (₹ currency)
    price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="INR", nullable=False)

    sku: Mapped[str | None] = mapped_column(String(100), unique=True)

    # Flexible product attributes: {"ram": "16GB", "storage": "512GB SSD", ...}
    specifications: Mapped[dict | None] = mapped_column(JSON_TYPE)

    image_url: Mapped[str | None] = mapped_column(String(500))
    rating: Mapped[float | None] = mapped_column(Numeric(3, 2))

    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    merchant: Mapped["Merchant"] = relationship(  # type: ignore[name-defined]
        "Merchant", back_populates="products"
    )
    inventory: Mapped["Inventory"] = relationship(  # type: ignore[name-defined]
        "Inventory", back_populates="product", uselist=False, cascade="all, delete-orphan"
    )
    relations_from: Mapped[list["ProductRelation"]] = relationship(  # type: ignore[name-defined]
        "ProductRelation",
        foreign_keys="ProductRelation.product_id",
        back_populates="product",
        cascade="all, delete-orphan",
    )
    relations_to: Mapped[list["ProductRelation"]] = relationship(  # type: ignore[name-defined]
        "ProductRelation",
        foreign_keys="ProductRelation.related_product_id",
        back_populates="related_product",
    )
    promotions: Mapped[list["Promotion"]] = relationship(  # type: ignore[name-defined]
        "Promotion", back_populates="product"
    )
    cart_items: Mapped[list["CartItem"]] = relationship(  # type: ignore[name-defined]
        "CartItem", back_populates="product"
    )

    # ── Indexes ───────────────────────────────────────────────────────────────
    __table_args__ = (
        Index("ix_products_merchant_id", "merchant_id"),
        Index("ix_products_category", "category"),
        Index("ix_products_brand", "brand"),
        Index("ix_products_is_active", "is_active"),
        Index("ix_products_price", "price"),
        Index("ix_products_sku", "sku"),
        Index("ix_products_specifications", "specifications"),
    )

    def __repr__(self) -> str:
        return f"<Product id={self.id} name={self.name} price={self.price}>"
