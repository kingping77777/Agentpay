"""
app/agents/sales_agent.py

Sales Agent — handles product search and cart management.
Uses Google Gemini via the new google-genai SDK (v2+).
"""

import json
import time
from sqlalchemy.ext.asyncio import AsyncSession
from google import genai
from google.genai import types

from app.core.config import settings
from app.agents import tools as db_tools


SYSTEM_PROMPT = """You are the Sales Agent for AgentPay — an AI-powered agentic commerce platform.
Your job is to help customers discover products, answer questions about them, and manage their shopping cart.

Rules:
- Always refer to prices in Indian Rupees (₹)
- Be friendly, concise, and enthusiastic
- When a customer asks for products, search and show them clearly
- When a customer says "add", "buy", or "I want", add the product to their cart
- Confirm every cart action clearly
- Never make up product details — only use what the database returns
- If no products are found, say so and suggest alternatives

You have access to these capabilities:
- Search products by name, category, brand, or max price
- View and manage the customer's shopping cart
- Show product details and specifications"""


def _get_client() -> genai.Client | None:
    if not settings.GEMINI_API_KEY:
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
            clean = message.replace("add", "").replace("Add", "").replace("to my cart", "").replace("to cart", "").replace("I want to buy", "").strip(" '\"`")
            return {"intent": "add_to_cart", "product_name": clean, "query": clean}
        if any(k in msg for k in ["remove", "delete", "drop"]) and "cart" in msg:
            clean = message.replace("remove", "").replace("delete", "").replace("from my cart", "").replace("from cart", "").strip(" '\"`")
            return {"intent": "remove_from_cart", "product_name": clean, "query": clean}
        return {"intent": "search_products", "query": message}

    def _fallback_response(self, intent_type: str, action_result: dict, products: list, cart: dict | None) -> str:
        if intent_type in ("search_products", "product_info"):
            if products:
                res = "Here are the top products found:\n\n"
                for p in products:
                    res += f"• **{p['name']}** — ₹{p['price']:,.2f} ({'In Stock' if p['in_stock'] else 'Out of Stock'})\n"
                return res
            return "Sorry, I couldn't find any products matching your search. Try searching for 'laptop', 'mouse', or 'keyboard'."
        if intent_type == "add_to_cart":
            if action_result.get("added_product"):
                p = action_result["added_product"]
                return f"🛒 Added **{p['name']}** (₹{p['price']:,.2f}) to your cart!"
            return f"❌ {action_result.get('error', 'Could not add product to cart.')}"
        if intent_type == "view_cart":
            if cart and cart.get("items"):
                res = f"🛒 **Your Shopping Cart** (Total: ₹{cart['total']:,.2f}):\n\n"
                for item in cart["items"]:
                    res += f"• {item['product_name']} x{item['quantity']} — ₹{item['final_price']:,.2f}\n"
                return res
            return "🛒 Your cart is currently empty."
        if intent_type == "remove_from_cart":
            if action_result.get("removed"):
                return f"🗑️ Removed **{action_result['removed']}** from your cart."
            return "Could not remove item from cart."
        return "I can help you search for laptops and tech accessories or manage your shopping cart!"

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

        # --- Intent parsing ---
        intent = None
        if client:
            intent_prompt = f"""Analyse this customer message and return a JSON object with:
- intent: one of [search_products, add_to_cart, view_cart, remove_from_cart, product_info, general_chat]
- query: search keywords (if search_products or product_info)
- category: product category (if applicable, else "")
- brand: brand name (if applicable, else "")
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

        # --- Execute intent ---
        products_found = []
        cart_data = None
        action_result = {}
        intent_type = intent.get("intent", "general_chat")

        if intent_type in ("search_products", "product_info"):
            products_found = await db_tools.search_products(
                db,
                merchant_id=merchant_id,
                query=intent.get("query", message),
                category=intent.get("category", ""),
                brand=intent.get("brand", ""),
                max_price=float(intent.get("max_price", 0) or 0),
            )
            action_result = {"products_count": len(products_found), "products": products_found}

        elif intent_type == "add_to_cart":
            product_name = intent.get("product_name") or intent.get("query", message)
            products_found = await db_tools.search_products(
                db, merchant_id=merchant_id, query=product_name, limit=1
            )
            if products_found:
                product = products_found[0]
                cart_data = await db_tools.add_to_cart(
                    db,
                    customer_id=customer_id,
                    merchant_id=merchant_id,
                    product_id=product["id"],
                    quantity=1,
                )
                action_result = {"added_product": product, "cart": cart_data}
            else:
                action_result = {"error": f"No product found matching '{product_name}'"}

        elif intent_type == "view_cart":
            cart_data = await db_tools.view_cart(db, customer_id, merchant_id)
            action_result = {"cart": cart_data}

        elif intent_type == "remove_from_cart":
            product_name = intent.get("product_name") or intent.get("query", message)
            ps = await db_tools.search_products(db, merchant_id=merchant_id, query=product_name, limit=1)
            if ps:
                cart_data = await db_tools.remove_from_cart(db, customer_id, merchant_id, ps[0]["id"])
                action_result = {"removed": ps[0]["name"], "cart": cart_data}

        # --- Generate response ---
        response_text = None
        if client:
            try:
                contents = []
                for h in chat_history[-6:]:
                    role = "user" if h["role"] == "user" else "model"
                    contents.append(types.Content(role=role, parts=[types.Part(text=h["content"])]))

                context = f"""Customer message: {message}

Intent detected: {intent_type}

Database result: {json.dumps(action_result, indent=2)}

Based on the database result, respond naturally to the customer.
If products were found, present them nicely with names and prices in ₹.
If an item was added to cart, confirm it enthusiastically.
Keep response under 150 words. Use bullet points for product lists."""

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
            response_text = self._fallback_response(intent_type, action_result, products_found, cart_data)

        duration_ms = int((time.time() - start) * 1000)

        # Log to DB
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
