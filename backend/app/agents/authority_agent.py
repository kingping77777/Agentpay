"""
app/agents/authority_agent.py

Authority Agent — deterministic rule enforcer (NO LLM for core checks).
Uses new google-genai SDK (v2+) only for human-readable rejection messages.
"""

import time
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from google import genai
from google.genai import types

from app.core.config import settings
from app.agents import tools as db_tools


def _get_client() -> genai.Client | None:
    if not settings.GEMINI_API_KEY:
        return None
    try:
        return genai.Client(api_key=settings.GEMINI_API_KEY)
    except Exception:
        return None


class AuthorityAgent:
    def __init__(self):
        self.model = settings.GEMINI_MODEL

    async def validate_checkout(
        self,
        db: AsyncSession,
        session_id: str,
        customer_id: str,
        merchant_id: str,
        cart_id: str,
        cart_total: float,
        discount_applied: float = 0.0,
    ) -> dict:
        start = time.time()
        checks = []
        rejections = []

        # 1. Get merchant policy
        policy = await db_tools.get_merchant_policy(db, merchant_id)
        if not policy:
            return {
                "approved": False,
                "reason": "No merchant policy found. Cannot process order.",
                "checks": [],
            }

        # 2. agent_purchase_enabled kill switch
        checks.append({
            "rule": "agent_purchase_enabled",
            "value": policy["agent_purchase_enabled"],
            "passed": policy["agent_purchase_enabled"],
            "detail": "AI purchases are enabled" if policy["agent_purchase_enabled"]
                      else "AI purchases are DISABLED by merchant",
        })
        if not policy["agent_purchase_enabled"]:
            rejections.append("AI-powered purchases are disabled by this merchant.")

        # 3. Minimum order amount
        min_ok = cart_total >= policy["minimum_order_amount"]
        checks.append({
            "rule": "minimum_order_amount",
            "value": cart_total,
            "threshold": policy["minimum_order_amount"],
            "passed": min_ok,
            "detail": f"Cart ₹{cart_total:.0f} vs minimum ₹{policy['minimum_order_amount']:.0f}",
        })
        if not min_ok:
            rejections.append(
                f"Cart total ₹{cart_total:.0f} is below the minimum of ₹{policy['minimum_order_amount']:.0f}."
            )

        # 4. Maximum transaction amount
        max_ok = cart_total <= policy["max_transaction_amount"]
        checks.append({
            "rule": "max_transaction_amount",
            "value": cart_total,
            "threshold": policy["max_transaction_amount"],
            "passed": max_ok,
            "detail": f"Cart ₹{cart_total:.0f} vs max ₹{policy['max_transaction_amount']:.0f}",
        })
        if not max_ok:
            rejections.append(
                f"Cart total ₹{cart_total:.0f} exceeds the limit of ₹{policy['max_transaction_amount']:.0f}."
            )

        # 5. Discount percentage
        if cart_total > 0 and discount_applied > 0:
            discount_pct = (discount_applied / (cart_total + discount_applied)) * 100
            disc_ok = discount_pct <= policy["max_discount_percentage"]
            checks.append({
                "rule": "max_discount_percentage",
                "value": discount_pct,
                "threshold": policy["max_discount_percentage"],
                "passed": disc_ok,
                "detail": f"Discount {discount_pct:.1f}% vs max {policy['max_discount_percentage']:.1f}%",
            })
            if not disc_ok:
                rejections.append(
                    f"Discount {discount_pct:.1f}% exceeds the max {policy['max_discount_percentage']:.1f}%."
                )
        else:
            checks.append({"rule": "max_discount_percentage", "passed": True, "detail": "No discount applied"})

        # 6. Customer budget limit
        budget = await db_tools.get_customer_budget(db, customer_id)
        if budget is not None:
            budget_ok = cart_total <= budget
            checks.append({
                "rule": "customer_budget_limit",
                "value": cart_total,
                "threshold": budget,
                "passed": budget_ok,
                "detail": f"Cart ₹{cart_total:.0f} vs your budget ₹{budget:.0f}",
            })
            if not budget_ok:
                rejections.append(
                    f"Cart ₹{cart_total:.0f} exceeds your personal budget of ₹{budget:.0f}."
                )
        else:
            checks.append({"rule": "customer_budget_limit", "passed": True, "detail": "No budget limit set"})

        approved = len(rejections) == 0
        duration_ms = int((time.time() - start) * 1000)

        if approved:
            reason = (
                f"All {len(checks)} policy checks passed. "
                f"Order total ₹{cart_total:.0f} is approved for processing."
            )
        else:
            client = _get_client()
            reason = None
            if client:
                try:
                    prompt = f"""You are the Authority Agent for an AI commerce platform.
Explain to a customer in 2-3 friendly sentences why their order was rejected:
Rejection reasons: {'; '.join(rejections)}
Be empathetic and suggest what they can do to fix it."""
                    resp = client.models.generate_content(
                        model=self.model,
                        contents=prompt,
                        config=types.GenerateContentConfig(temperature=0.5),
                    )
                    reason = resp.text.strip()
                except Exception:
                    pass

            if not reason:
                reason = " | ".join(rejections)

        decision = "APPROVED" if approved else "REJECTED"

        await db_tools.log_agent_action(
            db,
            session_id=session_id,
            agent_type="AUTHORITY_AGENT",
            action_type="VALIDATE_ORDER",
            status="SUCCESS" if approved else "BLOCKED",
            input_data={"cart_total": cart_total, "discount": discount_applied},
            output_data={"approved": approved, "checks": checks},
            reason=reason,
            duration_ms=duration_ms,
        )
        await db_tools.log_audit(
            db,
            session_id=session_id,
            actor_type="AUTHORITY_AGENT",
            agent_type="AUTHORITY_AGENT",
            action="TRANSACTION_CHECK",
            decision=decision,
            reason=reason,
            entity_type="cart",
            entity_id=cart_id,
            request_data={"cart_total": cart_total, "checks_run": len(checks)},
        )
        await db.commit()

        return {
            "approved": approved,
            "reason": reason,
            "checks": checks,
            "requires_authorization": policy["requires_authorization"],
            "duration_ms": duration_ms,
        }

    async def get_merchant_summary(self, db: AsyncSession, merchant_id: str) -> dict:
        policy = await db_tools.get_merchant_policy(db, merchant_id)
        if not policy:
            return {}
        return {
            "max_transaction": policy["max_transaction_amount"],
            "min_order": policy["minimum_order_amount"],
            "max_discount_pct": policy["max_discount_percentage"],
            "agent_enabled": policy["agent_purchase_enabled"],
            "requires_auth": policy["requires_authorization"],
            "refund_days": policy["refund_window_days"],
        }


_authority_agent: AuthorityAgent | None = None


def get_authority_agent() -> AuthorityAgent:
    global _authority_agent
    if _authority_agent is None:
        _authority_agent = AuthorityAgent()
    return _authority_agent
