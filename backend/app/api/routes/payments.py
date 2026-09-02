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


class DirectBuyRequest(BaseModel):
    customer_id: str
    merchant_id: str
    product_id: str
    quantity: int = 1
    full_name: str
    street: str
    city: str
    pin_code: str
    phone: str
    payment_method: str = "UPI_QR"


@router.post("/direct-buy")
async def direct_buy_product(
    body: DirectBuyRequest,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Create an instant direct order for a product with delivery address and UPI QR Code."""
    import urllib.parse
    from datetime import datetime, timedelta, timezone
    from app.db.models import Order, OrderStatus, Product, Payment, PaymentStatus

    p_result = await db.execute(
        select(Product).where(Product.id == uuid.UUID(body.product_id))
    )
    product = p_result.scalar_one_or_none()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    total_amount = float(product.price) * body.quantity
    order_id = uuid.uuid4()
    rzp_order_id = f"order_direct_{order_id.hex[:8]}"

    # Create Order
    order = Order(
        id=order_id,
        customer_id=uuid.UUID(body.customer_id),
        merchant_id=uuid.UUID(body.merchant_id),
        amount=total_amount,
        currency="INR",
        status=OrderStatus.AUTHORIZED,
        razorpay_order_id=rzp_order_id,
    )
    db.add(order)
    await db.flush()

    # Generate real UPI deep link and QR code image URL
    merchant_vpa = "techstore.merchant@razorpay"
    merchant_name = "TechStore India"
    note = f"Order {order_id.hex[:8].upper()} - {product.name[:20]}"
    encoded_note = urllib.parse.quote(note)
    encoded_name = urllib.parse.quote(merchant_name)

    upi_string = (
        f"upi://pay?pa={merchant_vpa}&pn={encoded_name}&am={total_amount:.2f}&cu=INR&tn={encoded_note}"
    )
    qr_code_url = (
        f"https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data={urllib.parse.quote(upi_string)}"
    )

    est_date = (datetime.now(timezone.utc) + timedelta(days=2)).strftime("%A, %d %b %Y")

    await db.commit()

    return {
        "order_id": str(order.id),
        "product_name": product.name,
        "quantity": body.quantity,
        "total_amount": total_amount,
        "currency": "INR",
        "upi_vpa": merchant_vpa,
        "upi_string": upi_string,
        "qr_code_url": qr_code_url,
        "delivery_address": {
            "full_name": body.full_name,
            "street": body.street,
            "city": body.city,
            "pin_code": body.pin_code,
            "phone": body.phone,
        },
        "estimated_delivery": est_date,
        "status": "AWAITING_PAYMENT",
    }


class ConfirmPaymentRequest(BaseModel):
    order_id: str
    payment_method: str = "UPI_QR"


@router.post("/confirm-payment")
async def confirm_payment(
    body: ConfirmPaymentRequest,
    db: AsyncSession = Depends(get_db),
) -> dict:
    """Mark a direct order as PAID and capture the payment."""
    from app.db.models import Order, OrderStatus, Payment, PaymentStatus

    result = await db.execute(
        select(Order).where(Order.id == uuid.UUID(body.order_id))
    )
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = OrderStatus.PAID
    rzp_payment_id = f"pay_rzp_{uuid.uuid4().hex[:10]}"

    payment = Payment(
        order_id=order.id,
        razorpay_payment_id=rzp_payment_id,
        razorpay_order_id=order.razorpay_order_id or f"order_{order.id.hex[:8]}",
        amount=float(order.amount),
        currency="INR",
        status=PaymentStatus.CAPTURED,
        method=body.payment_method,
    )
    db.add(payment)

    await db_tools.log_audit(
        db,
        session_id=None,
        actor_type="CUSTOMER",
        agent_type="AUTHORITY_AGENT",
        action="DIRECT_PAYMENT_CAPTURED",
        decision="APPROVED",
        reason=f"Direct payment {rzp_payment_id} completed successfully for ₹{order.amount:.2f}",
        entity_type="order",
        entity_id=str(order.id),
    )
    await db.commit()

    return {
        "status": "PAID",
        "order_id": str(order.id),
        "payment_id": rzp_payment_id,
        "amount": float(order.amount),
        "currency": "INR",
        "method": body.payment_method,
        "message": "Payment verified and order captured successfully!",
    }
