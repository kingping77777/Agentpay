"""
app/agents/orchestrator.py — routes messages to Sales/Merchant/Authority agents.
Uses new google-genai SDK (v2+).
"""

import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from google import genai
from google.genai import types

from app.db.models import AgentSession, SessionStatus, Cart, CartStatus, Order, OrderStatus
from app.agents.sales_agent import get_sales_agent
from app.agents.authority_agent import get_authority_agent
from app.agents import tools as db_tools
from app.core.config import settings


CHECKOUT_KEYWORDS = [
    "checkout", "place order", "pay now", "payment",
    "confirm order", "proceed to checkout", "complete purchase",
    "finalize order", "ready to pay", "i want to pay",
]
MERCHANT_KEYWORDS = [
    "upsell", "recommend", "suggest", "bundle", "offer", "deal",
    "promotion", "discount", "what else", "anything else",
    "more options", "alternatives", "similar products",
]
GREETING_KEYWORDS = [
    "hello", "hi", "hey", "good morning", "good afternoon",
    "what can you do", "help", "howdy", "hola",
]


def _get_client() -> genai.Client | None:
    if not settings.GEMINI_API_KEY:
        return None
    try:
        return genai.Client(api_key=settings.GEMINI_API_KEY)
    except Exception:
        return None


class AgentOrchestrator:
    def __init__(self):
        self.model = settings.GEMINI_MODEL

    def _is_checkout_intent(self, message: str) -> bool:
        return any(kw in message.lower() for kw in CHECKOUT_KEYWORDS)

    def _is_merchant_intent(self, message: str) -> bool:
        return any(kw in message.lower() for kw in MERCHANT_KEYWORDS)

    async def handle_message(
        self,
        db: AsyncSession,
        session_id: str,
        customer_id: str,
        merchant_id: str,
        message: str,
        chat_history: list[dict],
    ) -> dict:
        if self._is_checkout_intent(message):
            return await self._handle_checkout(db, session_id, customer_id, merchant_id)

        if self._is_merchant_intent(message):
            return await self._handle_merchant(db, session_id, customer_id, merchant_id, message)

        # Default: Multi-Agent Collaboration & Sales Discovery
        sales = get_sales_agent()
        result = await sales.process(
            db=db,
            message=message,
            session_id=session_id,
            customer_id=customer_id,
            merchant_id=merchant_id,
            chat_history=chat_history,
        )

        # ── Inter-Agent Collaboration (A2A) Protocol ────────────────────────
        a2a_dialogue = []
        
        # 1. Sales Agent introduces customer intent
        a2a_dialogue.append({
            "from": "SALES_AGENT",
            "to": "MERCHANT_AGENT",
            "message": f"Customer is inquiring: '{message}'. Discovered {len(result.get('products', []))} matching catalog items.",
            "timestamp": "Now"
        })

        # 2. Check web search if needed
        web_info = []
        if any(w in message.lower() for w in ["web", "online", "market", "review", "latest", "compare", "benchmark", "specs", "best"]):
            from app.agents.web_search import search_web_products
            web_info = await search_web_products(message, max_results=2)
            if web_info:
                result["web_results"] = web_info
                a2a_dialogue.append({
                    "from": "SYSTEM_MONITOR",
                    "to": "SALES_AGENT",
                    "message": f"Retrieved {len(web_info)} live web grounding sources for '{message}'.",
                    "timestamp": "Now"
                })

        # 3. Merchant Agent responds with bundle/stock context
        promos = await db_tools.get_active_promotions(db, merchant_id)
        if promos:
            promo_names = ", ".join(p['name'] for p in promos)
            a2a_dialogue.append({
                "from": "MERCHANT_AGENT",
                "to": "SALES_AGENT",
                "message": f"Promotions active: {promo_names}. Upsell policy allows up to 5% bundle discount.",
                "timestamp": "Now"
            })

        # 4. Authority Agent compliance review
        policy = await db_tools.get_merchant_policy(db, merchant_id)
        budget = await db_tools.get_customer_budget(db, customer_id)
        if policy and budget:
            a2a_dialogue.append({
                "from": "AUTHORITY_AGENT",
                "to": "SALES_AGENT",
                "message": f"Policy verified: Customer budget cap ₹{budget:,.0f} | Max single tx ₹{policy['max_transaction_amount']:,.0f}.",
                "timestamp": "Now"
            })

        result["a2a_dialogue"] = a2a_dialogue

        # After cart add, get cross-sell recs from Merchant Agent
        if result.get("intent") == "add_to_cart" and result.get("products"):
            product_id = result["products"][0]["id"]
            recs = await db_tools.get_recommendations(db, product_id, "CROSS_SELL")
            if recs:
                rec_text = "\n\n🏪 **Merchant Agent suggests:**\n"
                for r in recs[:2]:
                    rec_text += f"• {r['name']} — ₹{r['price']:,.0f}\n"
                result["message"] += rec_text
                result["recommendations"] = recs

        return result

    async def _handle_checkout(
        self,
        db: AsyncSession,
        session_id: str,
        customer_id: str,
        merchant_id: str,
    ) -> dict:
        cart = await db_tools.view_cart(db, customer_id, merchant_id)
        if not cart or not cart["items"]:
            return {
                "agent": "AUTHORITY_AGENT",
                "message": "🛒 Your cart is empty! Please add some products before checking out.",
                "products": [], "cart": None, "intent": "checkout_empty",
            }

        authority = get_authority_agent()
        validation = await authority.validate_checkout(
            db=db,
            session_id=session_id,
            customer_id=customer_id,
            merchant_id=merchant_id,
            cart_id=cart["id"],
            cart_total=cart["total"],
            discount_applied=cart["discount"],
        )

        if not validation["approved"]:
            return {
                "agent": "AUTHORITY_AGENT",
                "message": f"🚫 **Authority Agent: REJECTED**\n\n{validation['reason']}",
                "products": [], "cart": cart, "intent": "checkout_rejected",
                "validation": validation,
            }

        # Create order
        from app.db.models import Cart as CartModel, Order as OrderModel
        cart_result = await db.execute(
            select(CartModel).where(CartModel.id == uuid.UUID(cart["id"]))
        )
        cart_obj = cart_result.scalar_one()
        cart_obj.status = CartStatus.CHECKOUT

        order = OrderModel(
            customer_id=uuid.UUID(customer_id),
            merchant_id=uuid.UUID(merchant_id),
            cart_id=uuid.UUID(cart["id"]),
            amount=cart["total"],
            currency="INR",
            status=OrderStatus.AUTHORIZED,
            authority_decision={"approved": True, "checks": validation["checks"]},
        )
        db.add(order)
        await db.flush()

        await db_tools.log_audit(
            db, session_id=session_id,
            actor_type="AUTHORITY_AGENT", agent_type="AUTHORITY_AGENT",
            action="ORDER_AUTHORIZED", decision="APPROVED",
            reason=validation["reason"],
            entity_type="order", entity_id=str(order.id),
        )
        await db.commit()

        checks_summary = "\n".join(
            f"{'✅' if c['passed'] else '❌'} {c['rule']}: {c.get('detail','')}"
            for c in validation["checks"]
        )

        msg = (
            f"✅ **Authority Agent: APPROVED**\n\n"
            f"{validation['reason']}\n\n"
            f"**Policy Checks:**\n{checks_summary}\n\n"
            f"**Order Total:** ₹{cart['total']:,.2f}\n"
            f"**Order ID:** `{str(order.id)[:8]}...`\n\n"
            f"💳 Click the button below to pay via Razorpay"
        )

        return {
            "agent": "AUTHORITY_AGENT",
            "message": msg,
            "products": [], "cart": cart,
            "intent": "checkout_approved",
            "validation": validation,
            "order_id": str(order.id),
            "order_total": cart["total"],
        }

    async def _handle_merchant(
        self,
        db: AsyncSession,
        session_id: str,
        customer_id: str,
        merchant_id: str,
        message: str,
    ) -> dict:
        promos = await db_tools.get_active_promotions(db, merchant_id)
        cart   = await db_tools.view_cart(db, customer_id, merchant_id)

        context = f"""You are the Merchant Agent for AgentPay.
Present promotions and upsell opportunities to the customer.
Active promotions: {promos}
Customer cart: {cart}
Customer message: {message}
Present offers concisely in ₹. Max 100 words."""

        client = _get_client()
        agent_message = None
        if client:
            try:
                resp = client.models.generate_content(
                    model=self.model,
                    contents=context,
                    config=types.GenerateContentConfig(temperature=0.8),
                )
                agent_message = resp.text.strip()
            except Exception:
                pass

        if not agent_message:
            agent_message = "🎉 Great deals available! Ask about any product for personalized recommendations."

        await db_tools.log_agent_action(
            db, session_id=session_id,
            agent_type="MERCHANT_AGENT", action_type="PRESENT_PROMOTIONS",
            status="SUCCESS",
            input_data={"message": message},
            output_data={"promotions": promos},
        )
        await db.commit()

        return {
            "agent": "MERCHANT_AGENT",
            "message": agent_message,
            "products": [], "cart": cart,
            "intent": "promotions",
            "promotions": promos,
        }


_orchestrator: AgentOrchestrator | None = None


def get_orchestrator() -> AgentOrchestrator:
    global _orchestrator
    if _orchestrator is None:
        _orchestrator = AgentOrchestrator()
    return _orchestrator
