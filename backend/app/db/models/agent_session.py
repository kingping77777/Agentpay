"""
app/db/models/agent_session.py
"""

import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import DateTime, Enum, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.types import UUID_TYPE


class SessionType(str, PyEnum):
    SHOPPING = "SHOPPING"
    SUPPORT = "SUPPORT"


class SessionStatus(str, PyEnum):
    ACTIVE = "ACTIVE"
    COMPLETED = "COMPLETED"
    ABANDONED = "ABANDONED"


class AgentSession(Base):
    """
    Tracks the lifecycle of a multi-agent shopping session.
    One session spans from the first customer message to payment completion.
    """

    __tablename__ = "agent_sessions"

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
    session_type: Mapped[SessionType] = mapped_column(
        Enum(SessionType, name="sessiontype"),
        nullable=False,
        default=SessionType.SHOPPING,
    )
    status: Mapped[SessionStatus] = mapped_column(
        Enum(SessionStatus, name="sessionstatus"),
        nullable=False,
        default=SessionStatus.ACTIVE,
    )
    # Linked once a cart is created during this session
    cart_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID_TYPE,
        ForeignKey("carts.id", ondelete="SET NULL"),
        nullable=True,
    )
    # Linked once an order is created during this session
    order_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID_TYPE,
        ForeignKey("orders.id", ondelete="SET NULL"),
        nullable=True,
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
    customer: Mapped["Customer"] = relationship(  # type: ignore[name-defined]
        "Customer", back_populates="agent_sessions"
    )
    merchant: Mapped["Merchant"] = relationship(  # type: ignore[name-defined]
        "Merchant", back_populates="agent_sessions"
    )
    cart: Mapped["Cart | None"] = relationship(  # type: ignore[name-defined]
        "Cart", back_populates="agent_sessions", foreign_keys=[cart_id]
    )
    order: Mapped["Order | None"] = relationship(  # type: ignore[name-defined]
        "Order", back_populates="agent_sessions", foreign_keys=[order_id]
    )
    actions: Mapped[list["AgentAction"]] = relationship(  # type: ignore[name-defined]
        "AgentAction", back_populates="session", cascade="all, delete-orphan",
        order_by="AgentAction.created_at",
    )
    audit_logs: Mapped[list["AuditLog"]] = relationship(  # type: ignore[name-defined]
        "AuditLog", back_populates="session",
        order_by="AuditLog.created_at",
    )

    # ── Indexes ───────────────────────────────────────────────────────────────
    __table_args__ = (
        Index("ix_agent_sessions_customer_id", "customer_id"),
        Index("ix_agent_sessions_merchant_id", "merchant_id"),
        Index("ix_agent_sessions_status", "status"),
        Index("ix_agent_sessions_created_at", "created_at"),
    )

    def __repr__(self) -> str:
        return (
            f"<AgentSession id={self.id} "
            f"type={self.session_type} status={self.status}>"
        )
