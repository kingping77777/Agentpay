"""
app/db/models/agent_action.py
"""

import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import DateTime, Enum, ForeignKey, Index, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base
from app.db.types import JSON_TYPE, UUID_TYPE


class AgentType(str, PyEnum):
    SALES_AGENT = "SALES_AGENT"
    MERCHANT_AGENT = "MERCHANT_AGENT"
    AUTHORITY_AGENT = "AUTHORITY_AGENT"


class ActionStatus(str, PyEnum):
    SUCCESS = "SUCCESS"
    FAILED = "FAILED"
    PENDING = "PENDING"
    BLOCKED = "BLOCKED"


class AgentAction(Base):
    """
    Records every significant action taken by any agent during a session.
    Used for the live Agent Activity panel and post-session analytics.
    """

    __tablename__ = "agent_actions"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID_TYPE, primary_key=True, default=uuid.uuid4
    )
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID_TYPE,
        ForeignKey("agent_sessions.id", ondelete="CASCADE"),
        nullable=False,
    )
    agent_type: Mapped[AgentType] = mapped_column(
        Enum(AgentType, name="agenttype"), nullable=False
    )
    # e.g. "SEARCH_PRODUCTS", "VALIDATE_BUDGET", "CREATE_ORDER"
    action_type: Mapped[str] = mapped_column(String(100), nullable=False)

    # Sanitized input — never contains raw PII or card data
    input_data: Mapped[dict | None] = mapped_column(JSON_TYPE)
    # Structured output returned by the tool
    output_data: Mapped[dict | None] = mapped_column(JSON_TYPE)

    status: Mapped[ActionStatus] = mapped_column(
        Enum(ActionStatus, name="actionstatus"), nullable=False
    )
    # Human-readable explanation, especially important for BLOCKED/FAILED
    reason: Mapped[str | None] = mapped_column(Text)

    # Tool execution time in milliseconds (for performance monitoring)
    duration_ms: Mapped[int | None] = mapped_column(Integer)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    session: Mapped["AgentSession"] = relationship(  # type: ignore[name-defined]
        "AgentSession", back_populates="actions"
    )

    # ── Indexes ───────────────────────────────────────────────────────────────
    __table_args__ = (
        Index("ix_agent_actions_session_id", "session_id"),
        Index("ix_agent_actions_agent_type", "agent_type"),
        Index("ix_agent_actions_action_type", "action_type"),
        Index("ix_agent_actions_status", "status"),
        Index("ix_agent_actions_created_at", "created_at"),
    )

    def __repr__(self) -> str:
        return (
            f"<AgentAction agent={self.agent_type} "
            f"action={self.action_type} status={self.status}>"
        )
