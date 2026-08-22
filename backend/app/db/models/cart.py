"""
app/db/models/cart.py
"""

import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.types import UUID_TYPE


class CartStatus(str, PyEnum):
    ACTIVE = "ACTIVE"
    CHECKOUT = "CHECKOUT"
    COMPLETED = "COMPLETED"
    ABANDONED = "ABANDONED"


class Cart(Base):
    __tablename__ = "carts"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID_TYPE, primary_key=True, default=uuid.uuid4
    )
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID_TYPE,
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=False,
    )
    merchant_id: Mapped[uuid.UUID] = mapped_column(
        UUID_TYPE,
        ForeignKey("merchants.id", ondelete="RESTRICT"),
        nullable=False,
    )
    status: Mapped[CartStatus] = mapped_column(
        Enum(CartStatus, name="cartstatus"),
        nullable=False,
        default=CartStatus.ACTIVE,
    )
    # These are computed and stored by the cart service, not by the LLM
    subtotal: Mapped[float] = mapped_column(Numeric(12, 2), default=0.00, nullable=False)
    discount: Mapped[float] = mapped_column(Numeric(12, 2), default=0.00, nullable=False)
    total: Mapped[float] = mapped_column(Numeric(12, 2), default=0.00, nullable=False)

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
    customer: Mapped["Customer"] = relationship(  # type: ignore[name-defined]
        "Customer", back_populates="carts"
    )
    merchant: Mapped["Merchant"] = relationship(  # type: ignore[name-defined]
        "Merchant", back_populates="carts"
    )
    items: Mapped[list["CartItem"]] = relationship(  # type: ignore[name-defined]
        "CartItem",
        back_populates="cart",
        cascade="all, delete-orphan",
        lazy="selectin",
    )
    orders: Mapped[list["Order"]] = relationship(  # type: ignore[name-defined]
        "Order", back_populates="cart"
    )
    agent_sessions: Mapped[list["AgentSession"]] = relationship(  # type: ignore[name-defined]
        "AgentSession", back_populates="cart"
    )

    # ── Indexes ───────────────────────────────────────────────────────────────
    __table_args__ = (
        Index("ix_carts_customer_id", "customer_id"),
        Index("ix_carts_merchant_id", "merchant_id"),
        Index("ix_carts_status", "status"),
    )

    def __repr__(self) -> str:
        return f"<Cart id={self.id} status={self.status} total={self.total}>"
