"""
app/db/models/merchant.py
"""

import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import DateTime, Enum, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.types import UUID_TYPE


class MerchantStatus(str, PyEnum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    PENDING = "PENDING"


class Merchant(Base):
    __tablename__ = "merchants"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID_TYPE, primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID_TYPE,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    business_type: Mapped[str | None] = mapped_column(String(100))
    description: Mapped[str | None] = mapped_column(Text)
    status: Mapped[MerchantStatus] = mapped_column(
        Enum(MerchantStatus, name="merchantstatus"),
        nullable=False,
        default=MerchantStatus.ACTIVE,
    )
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
    user: Mapped["User"] = relationship(  # type: ignore[name-defined]
        "User", back_populates="merchant"
    )
    products: Mapped[list["Product"]] = relationship(  # type: ignore[name-defined]
        "Product", back_populates="merchant", cascade="all, delete-orphan"
    )
    policy: Mapped["MerchantPolicy"] = relationship(  # type: ignore[name-defined]
        "MerchantPolicy", back_populates="merchant", uselist=False, cascade="all, delete-orphan"
    )
    promotions: Mapped[list["Promotion"]] = relationship(  # type: ignore[name-defined]
        "Promotion", back_populates="merchant", cascade="all, delete-orphan"
    )
    carts: Mapped[list["Cart"]] = relationship(  # type: ignore[name-defined]
        "Cart", back_populates="merchant"
    )
    orders: Mapped[list["Order"]] = relationship(  # type: ignore[name-defined]
        "Order", back_populates="merchant"
    )
    agent_sessions: Mapped[list["AgentSession"]] = relationship(  # type: ignore[name-defined]
        "AgentSession", back_populates="merchant"
    )

    # ── Indexes ───────────────────────────────────────────────────────────────
    __table_args__ = (
        Index("ix_merchants_user_id", "user_id"),
        Index("ix_merchants_status", "status"),
    )

    def __repr__(self) -> str:
        return f"<Merchant id={self.id} name={self.name} status={self.status}>"
