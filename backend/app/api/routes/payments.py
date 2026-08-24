"""
app/api/routes/payments.py — Razorpay payment creation and webhook handler
"""
import hashlib
import hmac
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.core.config import settings
from app.agents import tools as db_tools

router = APIRouter(prefix="/api/payments", tags=["payments"])


class CreatePaymentRequest(BaseModel):
    order_id: str


@router.post("/create")
async def create_payment(
    body: CreatePaymentRequest,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Create a Razorpay order for an authorized order."""
    from app.db.models import Order, OrderStatus

    result = await db.execute(
        select(Order).where(Order.id == uuid.UUID(body.order_id))
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order.status != OrderStatus.AUTHORIZED:
        raise HTTPException(status_code=400, detail=f"Order status is {order.status.value}, not AUTHORIZED")

    try:
        import razorpay
        client = razorpay.Client(
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
        )
        rzp_order = client.order.create({
            "amount": int(float(order.amount) * 100),
            "currency": order.currency,
            "receipt": str(order.id)[:40],
        })
        order.razorpay_order_id = rzp_order["id"]
        await db.commit()
        return {
            "razorpay_order_id": rzp_order["id"],
            "amount": int(float(order.amount) * 100),
            "currency": order.currency,
            "key_id": settings.RAZORPAY_KEY_ID,
            "order_id": str(order.id),
        }
    except Exception:
        # Demo mode — no real Razorpay keys
        mock_rzp_id = f"order_demo_{str(order.id)[:8]}"
        order.razorpay_order_id = mock_rzp_id
        await db.commit()
        return {
            "razorpay_order_id": mock_rzp_id,
            "amount": int(float(order.amount) * 100),
            "currency": order.currency,
            "key_id": settings.RAZORPAY_KEY_ID or "rzp_test_demo",
            "order_id": str(order.id),
            "demo_mode": True,
        }


@router.post("/webhook")
async def razorpay_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Handle Razorpay payment webhooks."""
    from app.db.models import Order, OrderStatus, Payment, PaymentStatus

    body = await request.body()

    if settings.RAZORPAY_WEBHOOK_SECRET:
        signature = request.headers.get("X-Razorpay-Signature", "")
        expected = hmac.new(
            settings.RAZORPAY_WEBHOOK_SECRET.encode(),
            body,
            hashlib.sha256,
        ).hexdigest()
        if not hmac.compare_digest(expected, signature):
            raise HTTPException(status_code=400, detail="Invalid webhook signature")

    import json
    payload = json.loads(body)
    event = payload.get("event", "")

    if event == "payment.captured":
        payment_entity = payload["payload"]["payment"]["entity"]
        rzp_payment_id = payment_entity["id"]
        rzp_order_id   = payment_entity["order_id"]

        order_result = await db.execute(
            select(Order).where(Order.razorpay_order_id == rzp_order_id)
        )
        order = order_result.scalar_one_or_none()
        if order:
            order.status = OrderStatus.PAID
            payment = Payment(
                order_id=order.id,
                razorpay_payment_id=rzp_payment_id,
                razorpay_order_id=rzp_order_id,
                amount=float(payment_entity["amount"]) / 100,
                currency=payment_entity["currency"],
                status=PaymentStatus.CAPTURED,
                method=payment_entity.get("method"),
                raw_event_reference=payload.get("id"),
            )
            db.add(payment)
            await db_tools.log_audit(
                db, session_id=None,
                actor_type="RAZORPAY",
                action="PAYMENT_CAPTURED",
                decision="APPROVED",
                reason=f"Payment {rzp_payment_id} captured for ₹{payment.amount:.2f}",
                entity_type="payment",
                entity_id=rzp_payment_id,
            )
            await db.commit()

    return {"status": "ok"}
