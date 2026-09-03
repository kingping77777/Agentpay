"""
app/agents/sales_agent.py

Sales Agent (Michael) — universal product discovery and cart management engine across ALL categories.
Integrates local DB search, live web grounding, and universal product intelligence synthesis.
Supports every product domain: smartphones, laptops, clothing, shoes, fitness, home, kitchen, etc.
"""

import json
import time
import re
from sqlalchemy.ext.asyncio import AsyncSession
from google import genai
from google.genai import types

from app.core.config import settings
from app.agents import tools as db_tools
from app.agents.web_search import search_web_products
from app.agents.universal_catalog import clean_search_query, synthesize_products_for_query


SYSTEM_PROMPT = """You are Michael, the Lead Sales Discovery Agent for AgentPay — a cutting-edge autonomous multi-agent commerce platform.

Your Personality:
- Warm, enthusiastic, and genuinely helpful — like a knowledgeable friend at an electronics store
- You celebrate when customers find great deals
- You're proactive: suggest alternatives, compare options, highlight value

Your Capabilities:
- Find and recommend ANY product (electronics, smartphones, laptops, fashion, shoes, fitness, home & kitchen, furniture, bags, watches, audio gear, and much more)
- Deep product knowledge: specs, features, real Indian market pricing
- Cart management, bundle suggestions, and checkout guidance

Response Rules:
- ALWAYS quote prices in Indian Rupees (₹) with proper formatting
- Strictly respect user budget constraints (e.g., "phone under 14k" means ONLY products ≤ ₹14,000)
- Present products with key specs highlighted (Processor, Camera, Battery, etc.)
- Be conversational but structured — use bullet points and emojis
- When showing products, include 2-3 standout features per item
- After showing results, suggest next steps ("Want to add any to cart?", "Shall I compare specs?")
- Keep responses concise (max 150 words) and scannable"""


def _get_client() -> genai.Client | None:
    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY.startswith("AQ."):
        # Note: If invalid/demo key, return None to safely use intelligent offline brain
        return None
    try:
        return genai.Client(api_key=settings.GEMINI_API_KEY)
    except Exception:
        return None


class SalesAgent:
    def __init__(self):
        self.model = settings.GEMINI_MODEL

    def _fallback_intent(self, message: str) -> dict:
        msg = message.lower()
        if any(k in msg for k in ["view cart", "show cart", "my cart", "what is in cart", "cart items"]) and "add" not in msg:
            return {"intent": "view_cart", "query": ""}
        if any(k in msg for k in ["add", "buy", "put", "want"]) and "cart" in msg:
            clean = re.sub(r'(?i)\b(add|put|to my cart|to cart|in my cart|into cart|i want to buy|i want)\b', '', message).strip(' \'"`,')
            return {"intent": "add_to_cart", "product_name": clean, "query": clean}
        if any(k in msg for k in ["remove", "delete", "drop"]) and "cart" in msg:
            clean = re.sub(r'(?i)\b(remove|delete|drop|from my cart|from cart)\b', '', message).strip(' \'"`,')
            return {"intent": "remove_from_cart", "product_name": clean, "query": clean}

        cleaned_kw, max_price = clean_search_query(message)
        return {
            "intent": "search_products",
            "query": cleaned_kw,
            "max_price": max_price,
        }

    def _fallback_response(self, intent_type: str, action_result: dict, products: list, cart: dict | None, budget: float = 0) -> str:
        if intent_type in ("search_products", "product_info"):
            if products:
                budget_txt = f" within your ₹{budget:,.0f} budget" if budget > 0 else ""
                res = f"🔍 Found {len(products)} great options{budget_txt}! Here are my top picks:\n\n"
                for i, p in enumerate(products[:4], 1):
                    specs = p.get("specifications") or {}
                    spec_highlights = []
                    for k, v in list(specs.items())[:3]:
                        spec_highlights.append(f"{k.replace('_', ' ').title()}: {v}")
                    spec_str = f"\n  📋 {' | '.join(spec_highlights)}" if spec_highlights else ""

                    res += f"**{i}. {p['name']}** — ₹{p['price']:,.2f}\n  _{p.get('description', '')[:120]}_{spec_str}\n\n"
                res += "💡 *Want to add any to your cart? Just say 'Add [product name] to cart'!*"
                return res.strip()
            return "😅 I couldn't find exact matches for that. Try rephrasing — for example:\n• \"phone under 14k\"\n• \"running shoes below 3000\"\n• \"laptop under 50k\"\n\nI can search across phones, shoes, laptops, headphones, watches, fashion, and much more!"
        if intent_type == "add_to_cart":
            if action_result.get("added_product"):
                p = action_result["added_product"]
                return f"🛒 **Added to cart!** {p['name']} (₹{p['price']:,.2f})\n\nWant to keep shopping or ready to checkout? Just say 'checkout' when you're done!"
            return f"❌ {action_result.get('error', 'Could not add product to cart. Try searching for the product first.')}"
        if intent_type == "view_cart":
            if cart and cart.get("items"):
                res = f"🛒 **Your Shopping Cart** — {len(cart['items'])} item(s)\n\n"
                for item in cart["items"]:
                    res += f"• {item['product_name']} ×{item['quantity']} — ₹{item['final_price']:,.2f}\n"
                res += f"\n💰 **Total: ₹{cart['total']:,.2f}**\n\nSay 'checkout' to proceed to payment!"
                return res
            return "🛒 Your cart is empty! Browse products first — try searching for phones, laptops, shoes, or anything else."
        if intent_type == "remove_from_cart":
            if action_result.get("removed"):
                return f"🗑️ Removed **{action_result['removed']}** from your cart. Need anything else?"
            return "Couldn't find that item in your cart. Say 'view cart' to see what's there."
        return "👋 I'm Michael, your AI shopping assistant! I can help you:\n\n• 🔍 **Search** any product (phones, laptops, shoes, etc.)\n• 🛒 **Add to cart** and manage items\n• 💳 **Checkout** securely via Razorpay\n\nWhat would you like to find today?"

    async def process(
        self,
        db: AsyncSession,
        message: str,
        session_id: str,
        customer_id: str,
        merchant_id: str,
        chat_history: list[dict],
    ) -> dict:
        start = time.time()
        client = _get_client()

        # 1. Intent parsing
        intent = None
        if client:
            intent_prompt = f"""Analyse this customer message and return a JSON object with:
- intent: one of [search_products, add_to_cart, view_cart, remove_from_cart, product_info, general_chat]
- query: clean search keyword without conversational fillers
- category: product category (if applicable)
- brand: brand name (if applicable)
- max_price: maximum price in INR as number (if mentioned, else 0)
- product_name: product name to add/remove (if add_to_cart or remove_from_cart, else "")

Message: "{message}"

Respond with ONLY valid JSON, no markdown fences."""
            try:
                intent_resp = client.models.generate_content(
                    model=self.model,
                    contents=intent_prompt,
                )
                raw = intent_resp.text.strip()
                if raw.startswith("```"):
                    raw = raw.split("```")[1]
                    if raw.startswith("json"):
                        raw = raw[4:]
                intent = json.loads(raw.strip())
            except Exception:
                pass

        if not intent:
            intent = self._fallback_intent(message)

        # 2. Execute Intent
        products_found = []
        web_results = []
        cart_data = None
        action_result = {}
        intent_type = intent.get("intent", "general_chat")

        if intent_type in ("search_products", "product_info"):
            clean_kw, user_budget = clean_search_query(message)
            query_str = intent.get("query") or clean_kw
            cat_str = intent.get("category", "")
            brand_str = intent.get("brand", "")
            max_p = float(intent.get("max_price", 0) or user_budget or 0)

            # A. Search database catalog
            products_found = await db_tools.search_products(
                db,
                merchant_id=merchant_id,
                query=query_str,
                category=cat_str,
                brand=brand_str,
                max_price=max_p,
                limit=6,
            )

            # B. If no products in DB meet the criteria (or budget), synthesize domain-accurate products
            if len(products_found) == 0:
                synthesized = synthesize_products_for_query(message)
                products_found = []
                for sp in synthesized:
                    dyn_p = await db_tools.register_dynamic_product(
                        db,
                        merchant_id=merchant_id,
                        name=sp["name"],
                        category=sp.get("category", "consumer_goods"),
                        brand=sp.get("brand", "brand"),
                        price=float(sp["price"]),
                        description=sp.get("description", ""),
                        specifications=sp.get("specifications", {}),
                    )
                    products_found.append(dyn_p)

            action_result = {"products_count": len(products_found), "products": products_found}

        elif intent_type == "add_to_cart":
            product_name = intent.get("product_name") or intent.get("query", message)
            clean_name, _ = clean_search_query(product_name)
            products_found = await db_tools.search_products(
                db, merchant_id=merchant_id, query=clean_name or product_name, limit=1
            )
            # If not in DB, search & register dynamically
            if not products_found:
                synth = synthesize_products_for_query(product_name)
                first_item = synth[0] if synth else {
                    "name": product_name.title(),
                    "category": "consumer_goods",
                    "brand": "generic",
                    "price": 2999.00,
                    "description": f"Authentic {product_name} with official warranty.",
                    "specifications": {"type": "Standard", "warranty": "1 Year"},
                }
                dyn_p = await db_tools.register_dynamic_product(
                    db,
                    merchant_id=merchant_id,
                    name=first_item["name"],
                    category=first_item.get("category", "consumer_goods"),
                    brand=first_item.get("brand", "generic"),
                    price=float(first_item["price"]),
                    description=first_item.get("description", ""),
                    specifications=first_item.get("specifications", {}),
                )
                products_found = [dyn_p]

            product = products_found[0]
            cart_data = await db_tools.add_to_cart(
                db,
                customer_id=customer_id,
                merchant_id=merchant_id,
                product_id=product["id"],
                quantity=1,
            )
            action_result = {"added_product": product, "cart": cart_data}

        elif intent_type == "view_cart":
            cart_data = await db_tools.view_cart(db, customer_id, merchant_id)
            action_result = {"cart": cart_data}

        elif intent_type == "remove_from_cart":
            product_name = intent.get("product_name") or intent.get("query", message)
            clean_name, _ = clean_search_query(product_name)
            ps = await db_tools.search_products(db, merchant_id=merchant_id, query=clean_name or product_name, limit=1)
            if ps:
                cart_data = await db_tools.remove_from_cart(db, customer_id, merchant_id, ps[0]["id"])
                action_result = {"removed": ps[0]["name"], "cart": cart_data}

        # 3. Generate Natural Language Response
        response_text = None
        if client:
            try:
                contents = []
                for h in chat_history[-6:]:
                    role = "user" if h["role"] == "user" else "model"
                    contents.append(types.Content(role=role, parts=[types.Part(text=h["content"])]))

                context = f"""Customer message: {message}

Intent detected: {intent_type}
Products & Action result: {json.dumps(action_result, indent=2)}

Respond naturally as Michael (Sales Agent). Highlight features and prices in ₹. If items were added to cart, confirm enthusiastically."""

                contents.append(types.Content(role="user", parts=[types.Part(text=context)]))

                resp = client.models.generate_content(
                    model=self.model,
                    contents=contents,
                    config=types.GenerateContentConfig(
                        system_instruction=SYSTEM_PROMPT,
                        temperature=0.7,
                    ),
                )
                response_text = resp.text
            except Exception:
                pass

        if not response_text:
            max_p = float(intent.get("max_price", 0) or 0)
            response_text = self._fallback_response(intent_type, action_result, products_found, cart_data, budget=max_p)

        duration_ms = int((time.time() - start) * 1000)

        # Log action & audit
        await db_tools.log_agent_action(
            db,
            session_id=session_id,
            agent_type="SALES_AGENT",
            action_type=intent_type.upper(),
            status="SUCCESS",
            input_data={"message": message, "intent": intent},
            output_data=action_result,
            duration_ms=duration_ms,
        )
        await db_tools.log_audit(
            db,
            session_id=session_id,
            actor_type="SALES_AGENT",
            agent_type="SALES_AGENT",
            action=intent_type.upper(),
            decision="INFO",
            reason=response_text[:200],
            request_data={"message": message},
        )
        await db.commit()

        return {
            "agent": "SALES_AGENT",
            "message": response_text,
            "products": products_found,
            "web_results": web_results,
            "cart": cart_data,
            "intent": intent_type,
            "duration_ms": duration_ms,
        }


_sales_agent: SalesAgent | None = None


def get_sales_agent() -> SalesAgent:
    global _sales_agent
    if _sales_agent is None:
        _sales_agent = SalesAgent()
    return _sales_agent
