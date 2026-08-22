"""
app/db/models/inventory.py
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.types import UUID_TYPE


class Inventory(Base):
    __tablename__ = "inventory"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID_TYPE, primary_key=True, default=uuid.uuid4
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID_TYPE,
        ForeignKey("products.id", ondelete="CASCADE"),
        unique=True,   # one inventory record per product
        nullable=False,
    )
    stock_quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    reserved_quantity: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    product: Mapped["Product"] = relationship(  # type: ignore[name-defined]
        "Product", back_populates="inventory"
    )

    # ── Constraints ───────────────────────────────────────────────────────────
    __table_args__ = (
        CheckConstraint("stock_quantity >= 0", name="ck_inventory_stock_non_negative"),
        CheckConstraint("reserved_quantity >= 0", name="ck_inventory_reserved_non_negative"),
        CheckConstraint(
            "stock_quantity >= reserved_quantity",
            name="ck_inventory_stock_gte_reserved",
        ),
        Index("ix_inventory_product_id", "product_id"),
    )

    @property
    def available_quantity(self) -> int:
        """Real-time available stock (total minus reserved)."""
        return self.stock_quantity - self.reserved_quantity

    def __repr__(self) -> str:
        return (
            f"<Inventory product={self.product_id} "
            f"stock={self.stock_quantity} reserved={self.reserved_quantity}>"
        )
