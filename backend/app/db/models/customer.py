"""
app/db/models/customer.py
"""

import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Index, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.types import JSON_TYPE, UUID_TYPE


class Customer(Base):
    """
    Customer profile — extends the core User with shopping preferences
    and the AI-enforced budget limit.
    """

    __tablename__ = "customers"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID_TYPE, primary_key=True, default=uuid.uuid4
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID_TYPE,
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    # The Authority Agent enforces this as a hard limit per session
    budget_limit: Mapped[float | None] = mapped_column(Numeric(12, 2))

    # ["laptops", "peripherals", "audio"]
    preferred_categories: Mapped[list | None] = mapped_column(JSON_TYPE, default=list)
    # ["lenovo", "logitech"]
    preferred_brands: Mapped[list | None] = mapped_column(JSON_TYPE, default=list)

    location: Mapped[str | None] = mapped_column(String(200))

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
        "User", back_populates="customer"
    )
    carts: Mapped[list["Cart"]] = relationship(  # type: ignore[name-defined]
        "Cart", back_populates="customer", cascade="all, delete-orphan"
    )
    orders: Mapped[list["Order"]] = relationship(  # type: ignore[name-defined]
        "Order", back_populates="customer"
    )
    agent_sessions: Mapped[list["AgentSession"]] = relationship(  # type: ignore[name-defined]
        "AgentSession", back_populates="customer"
    )

    # ── Indexes ───────────────────────────────────────────────────────────────
    __table_args__ = (Index("ix_customers_user_id", "user_id"),)

    def __repr__(self) -> str:
        return f"<Customer id={self.id} user_id={self.user_id} budget={self.budget_limit}>"
