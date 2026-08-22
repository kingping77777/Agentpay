"""
app/db/models/merchant_policy.py
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, Integer, Numeric
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.types import JSON_TYPE, UUID_TYPE


class MerchantPolicy(Base):
    """
    Merchant-defined rules that the Authority Agent enforces deterministically.
    All monetary values are in INR.
    """

    __tablename__ = "merchant_policies"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID_TYPE, primary_key=True, default=uuid.uuid4
    )
    merchant_id: Mapped[uuid.UUID] = mapped_column(
        UUID_TYPE,
        ForeignKey("merchants.id", ondelete="CASCADE"),
        unique=True,   # one policy per merchant
        nullable=False,
    )

    # Hard cap: AI cannot create orders above this amount (₹)
    max_transaction_amount: Mapped[float] = mapped_column(
        Numeric(12, 2), nullable=False, default=100_000.00
    )
    # Maximum discount percentage the AI is allowed to apply (e.g. 5.00 = 5%)
    max_discount_percentage: Mapped[float] = mapped_column(
        Numeric(5, 2), nullable=False, default=5.00
    )
    minimum_order_amount: Mapped[float] = mapped_column(
        Numeric(10, 2), nullable=False, default=500.00
    )
    # Whether the AI agent is allowed to complete purchases at all
    agent_purchase_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    upsell_enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    # Days within which a customer can request a refund
    refund_window_days: Mapped[int] = mapped_column(Integer, default=7, nullable=False)

    # Flexible delivery rules: {"free_above": 500, "standard_days": 5, "express_days": 2}
    delivery_rules: Mapped[dict | None] = mapped_column(JSON_TYPE)

    # If True, every AI-initiated purchase requires explicit human confirmation
    requires_authorization: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

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
        "Merchant", back_populates="policy"
    )

    # ── Indexes ───────────────────────────────────────────────────────────────
    __table_args__ = (Index("ix_merchant_policies_merchant_id", "merchant_id"),)

    def __repr__(self) -> str:
        return (
            f"<MerchantPolicy merchant={self.merchant_id} "
            f"max_tx={self.max_transaction_amount} "
            f"max_disc={self.max_discount_percentage}%>"
        )
