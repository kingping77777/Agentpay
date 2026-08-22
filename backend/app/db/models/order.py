"""
app/db/models/order.py
"""

import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.types import JSON_TYPE, UUID_TYPE


class OrderStatus(str, PyEnum):
    PENDING = "PENDING"
    AUTHORIZED = "AUTHORIZED"   # Authority Agent approved, awaiting payment
    PAID = "PAID"               # Razorpay webhook confirmed
    FAILED = "FAILED"           # Payment failed
    CANCELLED = "CANCELLED"


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID_TYPE, primary_key=True, default=uuid.uuid4
    )
    customer_id: Mapped[uuid.UUID] = mapped_column(
        UUID_TYPE,
        ForeignKey("customers.id", ondelete="RESTRICT"),
        nullable=False,
    )
    merchant_id: Mapped[uuid.UUID] = mapped_column(
        UUID_TYPE,
        ForeignKey("merchants.id", ondelete="RESTRICT"),
        nullable=False,
    )
    cart_id: Mapped[uuid.UUID] = mapped_column(
        UUID_TYPE,
        ForeignKey("carts.id", ondelete="RESTRICT"),
        nullable=False,
    )
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="INR", nullable=False)
    status: Mapped[OrderStatus] = mapped_column(
        Enum(OrderStatus, name="orderstatus"),
        nullable=False,
        default=OrderStatus.PENDING,
    )
    # Set after Razorpay order is created
    razorpay_order_id: Mapped[str | None] = mapped_column(String(100), unique=True)

    # Full JSON record from the Authority Agent (rules checked, reasons, timestamps)
    authority_decision: Mapped[dict | None] = mapped_column(JSON_TYPE)

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
        "Customer", back_populates="orders"
    )
    merchant: Mapped["Merchant"] = relationship(  # type: ignore[name-defined]
        "Merchant", back_populates="orders"
    )
    cart: Mapped["Cart"] = relationship(  # type: ignore[name-defined]
        "Cart", back_populates="orders"
    )
    payments: Mapped[list["Payment"]] = relationship(  # type: ignore[name-defined]
        "Payment", back_populates="order", cascade="all, delete-orphan"
    )
    agent_sessions: Mapped[list["AgentSession"]] = relationship(  # type: ignore[name-defined]
        "AgentSession", back_populates="order"
    )

    # ── Indexes ───────────────────────────────────────────────────────────────
    __table_args__ = (
        Index("ix_orders_customer_id", "customer_id"),
        Index("ix_orders_merchant_id", "merchant_id"),
        Index("ix_orders_status", "status"),
        Index("ix_orders_razorpay_order_id", "razorpay_order_id"),
    )

    def __repr__(self) -> str:
        return f"<Order id={self.id} status={self.status} amount={self.amount}>"
