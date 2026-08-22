"""
app/db/models/cart_item.py
"""

import uuid

from sqlalchemy import CheckConstraint, ForeignKey, Index, Integer, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.types import UUID_TYPE


class CartItem(Base):
    """
    Individual line item in a cart.

    IMPORTANT: unit_price is SNAPSHOTTED at the time the item is added.
    This means merchant price changes do not silently alter open carts.
    The Authority Agent re-validates prices at checkout time.
    """

    __tablename__ = "cart_items"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID_TYPE, primary_key=True, default=uuid.uuid4
    )
    cart_id: Mapped[uuid.UUID] = mapped_column(
        UUID_TYPE,
        ForeignKey("carts.id", ondelete="CASCADE"),
        nullable=False,
    )
    product_id: Mapped[uuid.UUID] = mapped_column(
        UUID_TYPE,
        ForeignKey("products.id", ondelete="RESTRICT"),
        nullable=False,
    )
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    # Price snapshot — locked at add-time, not updated when catalog price changes
    unit_price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)

    # Discount applied to this specific line item (e.g. from a bundle promo)
    discount: Mapped[float] = mapped_column(Numeric(10, 2), default=0.00, nullable=False)

    # final_price = (unit_price * quantity) - discount
    final_price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)

    # ── Relationships ─────────────────────────────────────────────────────────
    cart: Mapped["Cart"] = relationship(  # type: ignore[name-defined]
        "Cart", back_populates="items"
    )
    product: Mapped["Product"] = relationship(  # type: ignore[name-defined]
        "Product", back_populates="cart_items"
    )

    # ── Constraints & Indexes ─────────────────────────────────────────────────
    __table_args__ = (
        CheckConstraint("quantity > 0", name="ck_cart_items_quantity_positive"),
        CheckConstraint("unit_price >= 0", name="ck_cart_items_unit_price_non_negative"),
        CheckConstraint("discount >= 0", name="ck_cart_items_discount_non_negative"),
        CheckConstraint("final_price >= 0", name="ck_cart_items_final_price_non_negative"),
        Index("ix_cart_items_cart_id", "cart_id"),
        Index("ix_cart_items_product_id", "product_id"),
    )

    def __repr__(self) -> str:
        return (
            f"<CartItem cart={self.cart_id} product={self.product_id} "
            f"qty={self.quantity} final={self.final_price}>"
        )
