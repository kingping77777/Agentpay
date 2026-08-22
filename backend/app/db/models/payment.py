"""
app/db/models/payment.py
"""

import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.types import UUID_TYPE


class PaymentStatus(str, PyEnum):
    PENDING = "PENDING"
    CAPTURED = "CAPTURED"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"


class Payment(Base):
    """
    Payment record populated by the Razorpay webhook handler.

    SECURITY: No card numbers, CVVs, or sensitive payment credentials are
    ever stored here. Only Razorpay-generated IDs and event references.
    """

    __tablename__ = "payments"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID_TYPE, primary_key=True, default=uuid.uuid4
    )
    order_id: Mapped[uuid.UUID] = mapped_column(
        UUID_TYPE,
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
    )
    # Razorpay-assigned IDs (format: pay_xxxxx, order_xxxxx)
    razorpay_payment_id: Mapped[str | None] = mapped_column(String(100), unique=True)
    razorpay_order_id: Mapped[str | None] = mapped_column(String(100))

    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(3), default="INR", nullable=False)
    status: Mapped[PaymentStatus] = mapped_column(
        Enum(PaymentStatus, name="paymentstatus"),
        nullable=False,
        default=PaymentStatus.PENDING,
    )
    # Payment method: "card", "upi", "netbanking", "wallet"
    method: Mapped[str | None] = mapped_column(String(50))

    # Razorpay webhook event ID for deduplication — not card data
    raw_event_reference: Mapped[str | None] = mapped_column(String(500))

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
    order: Mapped["Order"] = relationship(  # type: ignore[name-defined]
        "Order", back_populates="payments"
    )

    # ── Indexes ───────────────────────────────────────────────────────────────
    __table_args__ = (
        Index("ix_payments_order_id", "order_id"),
        Index("ix_payments_razorpay_payment_id", "razorpay_payment_id"),
        Index("ix_payments_status", "status"),
    )

    def __repr__(self) -> str:
        return (
            f"<Payment id={self.id} razorpay_id={self.razorpay_payment_id} "
            f"status={self.status} amount={self.amount}>"
        )
