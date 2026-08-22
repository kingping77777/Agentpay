"""
app/db/models/promotion.py
"""

import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Index, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.types import UUID_TYPE


class PromotionType(str, PyEnum):
    PERCENTAGE = "PERCENTAGE"   # e.g. 10% off
    FIXED = "FIXED"             # e.g. ₹300 off
    BUNDLE = "BUNDLE"           # buy product A + B, get discount


class Promotion(Base):
    __tablename__ = "promotions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID_TYPE, primary_key=True, default=uuid.uuid4
    )
    merchant_id: Mapped[uuid.UUID] = mapped_column(
        UUID_TYPE,
        ForeignKey("merchants.id", ondelete="CASCADE"),
        nullable=False,
    )
    # null product_id = sitewide promotion
    product_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID_TYPE,
        ForeignKey("products.id", ondelete="SET NULL"),
        nullable=True,
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    promotion_type: Mapped[PromotionType] = mapped_column(
        Enum(PromotionType, name="promotiontype"), nullable=False
    )
    # Monetary value for FIXED, percentage for PERCENTAGE, fixed INR for BUNDLE
    discount_value: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    minimum_cart_value: Mapped[float] = mapped_column(
        Numeric(10, 2), default=0.00, nullable=False
    )
    start_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    end_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    merchant: Mapped["Merchant"] = relationship(  # type: ignore[name-defined]
        "Merchant", back_populates="promotions"
    )
    product: Mapped["Product | None"] = relationship(  # type: ignore[name-defined]
        "Product", back_populates="promotions"
    )

    # ── Indexes ───────────────────────────────────────────────────────────────
    __table_args__ = (
        Index("ix_promotions_merchant_id", "merchant_id"),
        Index("ix_promotions_product_id", "product_id"),
        Index("ix_promotions_is_active", "is_active"),
        Index("ix_promotions_dates", "start_date", "end_date"),
    )

    def __repr__(self) -> str:
        return (
            f"<Promotion id={self.id} name={self.name} "
            f"type={self.promotion_type} value={self.discount_value}>"
        )
