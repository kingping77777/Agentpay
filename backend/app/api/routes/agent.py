"""
app/api/routes/agent.py

Agent Session, Chat, and Status routes.
All DB-model imports are DEFERRED (inside function bodies) to break the
circular import: app.db.base imports all models → models import app.db.base.
"""

import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.session import get_db
from app.agents.orchestrator import get_orchestrator

router = APIRouter(prefix="/api/agent", tags=["agent"])


# ── Schemas ───────────────────────────────────────────────────────────────────

class SessionCreate(BaseModel):
    customer_id: str
    merchant_id: str
    session_type: str = "SHOPPING"


class ChatRequest(BaseModel):
    session_id: str
    message: str
    chat_history: list[dict] = []


class SessionResponse(BaseModel):
    session_id: str
    status: str
    customer_id: str
    merchant_id: str
    created_at: str


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/session")
async def create_session(
    body: SessionCreate,
    db: AsyncSession = Depends(get_db),
) -> SessionResponse:
    """Create a new agent session for a customer + merchant pair."""
    from app.db.models import AgentSession, SessionStatus, SessionType

    session = AgentSession(
        customer_id=uuid.UUID(body.customer_id),
        merchant_id=uuid.UUID(body.merchant_id),
        session_type=SessionType(body.session_type),
        status=SessionStatus.ACTIVE,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)

    return SessionResponse(
        session_id=str(session.id),
        status=session.status.value,
        customer_id=str(session.customer_id),
        merchant_id=str(session.merchant_id),
        created_at=session.created_at.isoformat(),
    )


@router.post("/chat")
async def chat(
    body: ChatRequest,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Send a message to the agent system and get a response."""
    from app.db.models import AgentSession, SessionStatus

    result = await db.execute(
        select(AgentSession).where(AgentSession.id == uuid.UUID(body.session_id))
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session.status != SessionStatus.ACTIVE:
        raise HTTPException(status_code=400, detail=f"Session is {session.status.value}")

    orchestrator = get_orchestrator()
    response = await orchestrator.handle_message(
        db=db,
        session_id=body.session_id,
        customer_id=str(session.customer_id),
        merchant_id=str(session.merchant_id),
        message=body.message,
        chat_history=body.chat_history,
    )

    # Update session links
    if response.get("cart") and response["cart"].get("id"):
        from app.db.models import Cart
        session.cart_id = uuid.UUID(response["cart"]["id"])
    if response.get("order_id"):
        session.order_id = uuid.UUID(response["order_id"])
    await db.commit()

    return {
        "session_id": body.session_id,
        "agent": response.get("agent", "SALES_AGENT"),
        "message": response.get("message", ""),
        "products": response.get("products", []),
        "cart": response.get("cart"),
        "intent": response.get("intent", ""),
        "validation": response.get("validation"),
        "order_id": response.get("order_id"),
        "order_total": response.get("order_total"),
        "recommendations": response.get("recommendations", []),
        "promotions": response.get("promotions", []),
        "a2a_dialogue": response.get("a2a_dialogue", []),
        "web_results": response.get("web_results", []),
        "duration_ms": response.get("duration_ms", 0),
    }


@router.get("/status")
async def agent_status(db: AsyncSession = Depends(get_db)) -> dict:
    """Live status of all 6 system components for the bottom status bar."""
    from app.db.models import (
        AgentAction, AgentType, ActionStatus,
        AgentSession, SessionStatus,
        Payment, PaymentStatus,
        AuditLog,
    )

    # Action counts per agent
    action_counts: dict[str, int] = {}
    for at in ["SALES_AGENT", "MERCHANT_AGENT", "AUTHORITY_AGENT"]:
        res = await db.execute(
            select(func.count()).select_from(AgentAction).where(
                AgentAction.agent_type == AgentType(at)
            )
        )
        action_counts[at] = res.scalar_one()

    # Payment stats
    pay_total_res = await db.execute(select(func.count()).select_from(Payment))
    pay_total = pay_total_res.scalar_one()

    pay_success_res = await db.execute(
        select(func.count()).select_from(Payment).where(
            Payment.status == PaymentStatus.CAPTURED
        )
    )
    pay_success = pay_success_res.scalar_one()

    # Audit log count
    audit_res = await db.execute(select(func.count()).select_from(AuditLog))
    audit_count = audit_res.scalar_one()

    # Active sessions
    active_res = await db.execute(
        select(func.count()).select_from(AgentSession).where(
            AgentSession.status == SessionStatus.ACTIVE
        )
    )
    active_sessions = active_res.scalar_one()

    return {
        "agents": [
            {
                "id": "sales_agent", "name": "SALES AGENT",
                "model": "Gemini-1.5-Flash", "focus": "Customer Needs",
                "status": "online",
                "tasks": action_counts.get("SALES_AGENT", 0),
                "memory": 62, "active_sessions": active_sessions,
            },
            {
                "id": "merchant_agent", "name": "MERCHANT AGENT",
                "model": "Gemini-1.5-Flash", "focus": "Merchant Policy",
                "status": "online",
                "tasks": action_counts.get("MERCHANT_AGENT", 0),
                "memory": 58,
            },
            {
                "id": "authority_agent", "name": "AUTHORITY AGENT",
                "model": "Gemini-1.5-Flash", "focus": "Validation & Policy",
                "status": "active",
                "tasks": action_counts.get("AUTHORITY_AGENT", 0),
                "memory": 71,
            },
        ],
        "services": [
            {
                "id": "payment_service", "name": "PAYMENT SERVICE",
                "provider": "Razorpay API", "focus": "Transactions",
                "status": "online", "queue": pay_total,
                "success_rate": int((pay_success / pay_total * 100) if pay_total > 0 else 99),
            },
            {
                "id": "audit_logger", "name": "AUDIT LOGGER",
                "provider": "System Logger", "focus": "Audit Trail",
                "status": "online", "events": audit_count, "storage": 74,
            },
            {
                "id": "system_monitor", "name": "SYSTEM MONITOR",
                "provider": "Health Check", "focus": "System Health",
                "status": "online", "uptime": 99.9, "load": 42,
            },
        ],
    }


@router.get("/session/{session_id}/audit")
async def get_session_audit(
    session_id: str,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Get full audit trail for a session."""
    from app.db.models import AuditLog, AgentAction

    result = await db.execute(
        select(AuditLog)
        .where(AuditLog.session_id == uuid.UUID(session_id))
        .order_by(AuditLog.created_at)
    )
    logs = result.scalars().all()

    actions_result = await db.execute(
        select(AgentAction)
        .where(AgentAction.session_id == uuid.UUID(session_id))
        .order_by(AgentAction.created_at)
    )
    actions = actions_result.scalars().all()

    return {
        "session_id": session_id,
        "audit_logs": [
            {
                "id": str(l.id),
                "actor": l.actor_type.value,
                "action": l.action,
                "decision": l.decision.value if l.decision else None,
                "reason": l.reason,
                "entity_type": l.entity_type,
                "created_at": l.created_at.isoformat(),
            }
            for l in logs
        ],
        "agent_actions": [
            {
                "id": str(a.id),
                "agent": a.agent_type.value,
                "action": a.action_type,
                "status": a.status.value,
                "reason": a.reason,
                "duration_ms": a.duration_ms,
                "created_at": a.created_at.isoformat(),
            }
            for a in actions
        ],
    }


@router.get("/demo-ids")
async def get_demo_ids(db: AsyncSession = Depends(get_db)) -> dict:
    """Returns seeded demo customer and merchant IDs for quick frontend setup."""
    from app.db.models import Customer, Merchant, User

    cust_result = await db.execute(
        select(Customer)
        .join(User, Customer.user_id == User.id)
        .where(User.email == "demo@agentpay.com")
        .limit(1)
    )
    customer = cust_result.scalar_one_or_none()

    merch_result = await db.execute(
        select(Merchant)
        .join(User, Merchant.user_id == User.id)
        .where(User.email == "merchant@techstore.com")
        .limit(1)
    )
    merchant = merch_result.scalar_one_or_none()

    return {
        "customer_id": str(customer.id) if customer else None,
        "merchant_id": str(merchant.id) if merchant else None,
        "ready": bool(customer and merchant),
    }
