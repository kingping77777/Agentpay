"""
app/db/models/audit_log.py

APPEND-ONLY table — this is the source of truth for every significant
decision in AgentPay. No UPDATE or DELETE should ever be run on this table.
"""

import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import DateTime, Enum, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.types import JSON_TYPE, UUID_TYPE


class ActorType(str, PyEnum):
    CUSTOMER = "CUSTOMER"
    MERCHANT = "MERCHANT"
    SALES_AGENT = "SALES_AGENT"
    MERCHANT_AGENT = "MERCHANT_AGENT"
    AUTHORITY_AGENT = "AUTHORITY_AGENT"
    SYSTEM = "SYSTEM"
    RAZORPAY = "RAZORPAY"


class AuditDecision(str, PyEnum):
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    INFO = "INFO"
    WARNING = "WARNING"


class AgentTypeForAudit(str, PyEnum):
    """Mirrors AgentType but kept separate so audit_log has no FK dependency on agent_action."""
    SALES_AGENT = "SALES_AGENT"
    MERCHANT_AGENT = "MERCHANT_AGENT"
    AUTHORITY_AGENT = "AUTHORITY_AGENT"


class AuditLog(Base):
    """
    Immutable audit trail entry.

    Every important decision — product search, budget check, policy check,
    payment creation, webhook receipt — must create an AuditLog record.

    The audit trail feeds:
      - The live timeline in the merchant dashboard
      - The hackathon demo explainability requirement
      - Post-incident forensics
    """

    __tablename__ = "audit_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID_TYPE, primary_key=True, default=uuid.uuid4
    )
    # May be null for system-generated entries before a session exists
    session_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID_TYPE,
        ForeignKey("agent_sessions.id", ondelete="SET NULL"),
        nullable=True,
    )
    actor_type: Mapped[ActorType] = mapped_column(
        Enum(ActorType, name="actortype"), nullable=False
    )
    # User ID, agent name, or "system"
    actor_id: Mapped[str | None] = mapped_column(String(100))

    agent_type: Mapped[AgentTypeForAudit | None] = mapped_column(
        Enum(AgentTypeForAudit, name="agenttypeforaudit"), nullable=True
    )

    # e.g. "TRANSACTION_CHECK", "PAYMENT_CREATED", "PRODUCT_SEARCH"
    action: Mapped[str] = mapped_column(String(200), nullable=False)

    # e.g. "order", "cart", "product"
    entity_type: Mapped[str | None] = mapped_column(String(100))
    entity_id: Mapped[str | None] = mapped_column(String(100))

    # Sanitized request context — never include raw passwords or card data
    request_data: Mapped[dict | None] = mapped_column(JSON_TYPE)

    decision: Mapped[AuditDecision | None] = mapped_column(
        Enum(AuditDecision, name="auditdecision"), nullable=True
    )
    # Human-readable explanation of why this decision was made
    reason: Mapped[str | None] = mapped_column(Text)

    # Immutable timestamp — no updated_at on this table
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    session: Mapped["AgentSession | None"] = relationship(  # type: ignore[name-defined]
        "AgentSession", back_populates="audit_logs"
    )

    # ── Indexes ───────────────────────────────────────────────────────────────
    __table_args__ = (
        Index("ix_audit_logs_session_id", "session_id"),
        Index("ix_audit_logs_actor_type", "actor_type"),
        Index("ix_audit_logs_action", "action"),
        Index("ix_audit_logs_decision", "decision"),
        Index("ix_audit_logs_created_at", "created_at"),
        # Composite index for dashboard timeline queries
        Index("ix_audit_logs_session_created", "session_id", "created_at"),
    )

    def __repr__(self) -> str:
        return (
            f"<AuditLog actor={self.actor_type} action={self.action} "
            f"decision={self.decision} at={self.created_at}>"
        )
