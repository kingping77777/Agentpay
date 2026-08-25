# AgentPay — AI-Powered Agentic Commerce Platform

> A hackathon project: a multi-agent AI shopping backend where autonomous agents handle product discovery, budget enforcement, merchant policy compliance, and Razorpay payment orchestration — all with a complete, immutable audit trail.

---

## Table of Contents

1. [What Is AgentPay?](#what-is-agentpay)
2. [Architecture Overview](#architecture-overview)
3. [Three-Agent System](#three-agent-system)
4. [Project Structure](#project-structure)
5. [Data Model (All 15 Tables)](#data-model-all-15-tables)
6. [Key Business Rules & Constraints](#key-business-rules--constraints)
7. [Technology Stack](#technology-stack)
8. [Environment Variables](#environment-variables)
9. [Setup & Running Locally](#setup--running-locally)
10. [Database Migrations](#database-migrations)
11. [Seeding Demo Data](#seeding-demo-data)
12. [API Endpoints](#api-endpoints)
13. [Enums Reference](#enums-reference)
14. [Security Notes](#security-notes)

---

## What Is AgentPay?

**AgentPay** is a backend service built with **FastAPI** (Python 3.13) that powers an agentic commerce experience. Instead of a traditional checkout flow, three specialized AI agents collaborate to:

1. Help a customer find the right products (Sales Agent)
2. Apply merchant-specific upsell/cross-sell strategies (Merchant Agent)
3. Enforce hard business rules before any money moves (Authority Agent)

Payments are processed via **Razorpay** (INR / Indian Rupee). Every decision made by any agent is recorded in an append-only **AuditLog** table for full explainability.

---

## Architecture Overview

```
Customer ──► [Sales Agent]
                  │
                  ▼
            [Merchant Agent]  ◄── merchant_policies, promotions, product_relations
                  │
                  ▼
           [Authority Agent]  ◄── budget_limit (Customer), max_transaction_amount (Policy)
                  │
              APPROVED?
             /         \
           YES           NO  ──► BLOCKED (logged in audit_logs)
            │
            ▼
     [Razorpay Order Created]
            │
            ▼
     [Razorpay Webhook] ──► payments table updated ──► order status → PAID
```

Every step in the flow above writes a record to:
- `agent_actions` — fine-grained tool call log per agent
- `audit_logs` — immutable, append-only decisions trail

---

## Three-Agent System

| Agent | Enum Value | Responsibility |
|---|---|---|
| **Sales Agent** | `SALES_AGENT` | Product search, recommendations, cart management |
| **Merchant Agent** | `MERCHANT_AGENT` | Upsell/cross-sell using `product_relations`, apply `promotions` |
| **Authority Agent** | `AUTHORITY_AGENT` | Enforces `MerchantPolicy` hard limits and customer `budget_limit` before order creation |

The **Authority Agent** is the gatekeeper — it cannot be bypassed. It checks:
- Order total ≤ `MerchantPolicy.max_transaction_amount`
- Order total ≥ `MerchantPolicy.minimum_order_amount`
- Discount applied ≤ `MerchantPolicy.max_discount_percentage`
- Cart total ≤ `Customer.budget_limit`
- `MerchantPolicy.agent_purchase_enabled` is `True`
- `MerchantPolicy.requires_authorization` — if True, human confirmation is needed

---

## Project Structure

```
Hackathon/
└── backend/
    ├── app/
    │   ├── main.py                  # FastAPI app entry point, CORS, lifespan hooks
    │   ├── core/
    │   │   └── config.py            # Pydantic-Settings config (reads .env)
    │   └── db/
    │       ├── base.py              # SQLAlchemy DeclarativeBase + all model imports
    │       ├── session.py           # Async engine, session factory, get_db() dependency
    │       └── models/
    │           ├── __init__.py      # Re-exports all models and enums
    │           ├── user.py          # User (auth identity, roles)
    │           ├── merchant.py      # Merchant (seller profile)
    │           ├── customer.py      # Customer (buyer profile + budget)
    │           ├── product.py       # Product catalog
    │           ├── inventory.py     # Stock tracking per product
    │           ├── product_relation.py  # Upsell / cross-sell / bundle graph
    │           ├── promotion.py     # Time-bound discounts
    │           ├── merchant_policy.py   # AI governance rules per merchant
    │           ├── cart.py          # Shopping cart
    │           ├── cart_item.py     # Line items (price-snapshotted)
    │           ├── order.py         # Order (with Razorpay order ID)
    │           ├── payment.py       # Payment record (from Razorpay webhook)
    │           ├── agent_session.py # Agent session lifecycle tracker
    │           ├── agent_action.py  # Per-agent tool call log
    │           └── audit_log.py     # Immutable append-only audit trail
    ├── alembic/                     # Database migration scripts
    │   └── env.py
    ├── scripts/
    │   ├── seed.py                  # Populates demo data (TechStore merchant, 8 products)
    │   └── verify_models.py        # Sanity check all models load correctly
    ├── requirements.txt             # Core: FastAPI, SQLAlchemy, psycopg3, Razorpay, etc.
    ├── requirements-agents.txt      # Agent layer: LangChain, OpenAI, numpy
    ├── alembic.ini
    └── .env.example                 # Template for environment variables
```

---

## Data Model (All 15 Tables)

### `users` — Authentication Identity

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `name` | String(100) | |
| `email` | String(255) UNIQUE | Indexed |
| `password_hash` | String(255) | bcrypt |
| `role` | Enum | `CUSTOMER`, `MERCHANT`, `ADMIN` — Indexed |
| `is_active` | Boolean | |
| `created_at` / `updated_at` | TimestampTZ | |

**Relationships:** 1-to-1 with `merchants` and `customers`.

---

### `merchants` — Seller Profile

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | UNIQUE, CASCADE delete |
| `name` | String(200) | |
| `business_type` | String(100) | Optional |
| `description` | Text | Optional |
| `status` | Enum | `ACTIVE`, `INACTIVE`, `PENDING` |
| `created_at` / `updated_at` | TimestampTZ | |

**Relationships:** has `products`, `policy`, `promotions`, `carts`, `orders`, `agent_sessions`.

---

### `customers` — Buyer Profile

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `user_id` | UUID FK → users | UNIQUE, CASCADE delete |
| `budget_limit` | Numeric(12,2) | **Authority Agent enforces this as a hard cap per session** |
| `preferred_categories` | JSONB array | e.g. `["laptops", "audio"]` |
| `preferred_brands` | JSONB array | e.g. `["lenovo", "logitech"]` |
| `location` | String(200) | |
| `created_at` / `updated_at` | TimestampTZ | |

**Relationships:** has `carts`, `orders`, `agent_sessions`.

---

### `products` — Product Catalog

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `merchant_id` | UUID FK → merchants | CASCADE delete |
| `name` | String(300) | |
| `category` | String(100) | Indexed |
| `brand` | String(100) | Indexed |
| `description` | Text | |
| `price` | Numeric(12,2) | INR, Indexed |
| `currency` | String(3) | Default `INR` |
| `sku` | String(100) UNIQUE | Indexed |
| `specifications` | JSONB | e.g. `{"ram": "16GB", "storage": "512GB SSD"}` — GIN indexed |
| `image_url` | String(500) | |
| `rating` | Numeric(3,2) | |
| `is_active` | Boolean | Indexed |
| `created_at` / `updated_at` | TimestampTZ | |

**Relationships:** has `inventory`, `relations_from`, `relations_to`, `promotions`, `cart_items`.

---

### `inventory` — Stock Levels

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `product_id` | UUID FK → products | UNIQUE, CASCADE delete |
| `stock_quantity` | Integer | >= 0 (DB CHECK) |
| `reserved_quantity` | Integer | >= 0 (DB CHECK) |
| `updated_at` | TimestampTZ | |

**Computed property:** `available_quantity = stock_quantity - reserved_quantity`

**DB Constraints:**
- `stock_quantity >= 0`
- `reserved_quantity >= 0`
- `stock_quantity >= reserved_quantity`

---

### `product_relations` — Upsell / Cross-Sell / Bundle Graph

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `product_id` | UUID FK → products | The "source" product |
| `related_product_id` | UUID FK → products | The recommended product |
| `relation_type` | Enum | `UPSELL`, `CROSS_SELL`, `BUNDLE`, `ALTERNATIVE` |
| `priority` | Integer | Lower = shown first (1 = highest priority) |
| `discount_value` | Numeric(10,2) | INR discount for bundles |
| `created_at` | TimestampTZ | |

**Constraint:** `UNIQUE(product_id, related_product_id, relation_type)` — no duplicate edges.

---

### `merchant_policies` — AI Governance Rules

> One policy per merchant. The **Authority Agent enforces these deterministically**.

| Column | Type | Default | Meaning |
|---|---|---|---|
| `id` | UUID PK | | |
| `merchant_id` | UUID FK UNIQUE | | One policy per merchant |
| `max_transaction_amount` | Numeric(12,2) | ₹1,00,000 | AI cannot create orders above this |
| `max_discount_percentage` | Numeric(5,2) | 5.00% | Max discount AI can apply |
| `minimum_order_amount` | Numeric(10,2) | ₹500 | Minimum order the AI can place |
| `agent_purchase_enabled` | Boolean | True | Kill switch — disables all AI purchases |
| `upsell_enabled` | Boolean | True | Can the AI suggest upsells? |
| `refund_window_days` | Integer | 7 | Days allowed for refund requests |
| `delivery_rules` | JSONB | null | e.g. `{"free_above": 500, "standard_days": 5}` |
| `requires_authorization` | Boolean | True | If True, every AI purchase needs human OK |
| `created_at` / `updated_at` | TimestampTZ | | |

---

### `promotions` — Time-Bound Discounts

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `merchant_id` | UUID FK → merchants | CASCADE delete |
| `product_id` | UUID FK → products | NULL = sitewide promotion |
| `name` | String(200) | |
| `promotion_type` | Enum | `PERCENTAGE`, `FIXED`, `BUNDLE` |
| `discount_value` | Numeric(10,2) | % for PERCENTAGE; INR for FIXED/BUNDLE |
| `minimum_cart_value` | Numeric(10,2) | Cart must be >= this to qualify |
| `start_date` / `end_date` | TimestampTZ | Active window |
| `is_active` | Boolean | |
| `created_at` | TimestampTZ | |

---

### `carts` — Shopping Cart

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `customer_id` | UUID FK → customers | CASCADE delete |
| `merchant_id` | UUID FK → merchants | RESTRICT delete |
| `status` | Enum | `ACTIVE`, `CHECKOUT`, `COMPLETED`, `ABANDONED` |
| `subtotal` | Numeric(12,2) | Computed by service layer, not LLM |
| `discount` | Numeric(12,2) | |
| `total` | Numeric(12,2) | |
| `created_at` / `updated_at` | TimestampTZ | |

**Relationships:** has `items` (eager-loaded via `selectin`), `orders`, `agent_sessions`.

---

### `cart_items` — Line Items

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `cart_id` | UUID FK → carts | CASCADE delete |
| `product_id` | UUID FK → products | RESTRICT delete |
| `quantity` | Integer | > 0 (DB CHECK) |
| `unit_price` | Numeric(12,2) | **PRICE SNAPSHOT** — locked at add-time, not updated when catalog changes |
| `discount` | Numeric(10,2) | Line-item discount (e.g. from bundle promo) |
| `final_price` | Numeric(12,2) | `(unit_price * quantity) - discount` |

> **Critical:** `unit_price` is snapshotted when the item is added to the cart. If the merchant later changes the product price, open carts are NOT affected. The Authority Agent re-validates prices at checkout time.

---

### `orders` — Orders

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `customer_id` | UUID FK → customers | RESTRICT delete |
| `merchant_id` | UUID FK → merchants | RESTRICT delete |
| `cart_id` | UUID FK → carts | RESTRICT delete |
| `amount` | Numeric(12,2) | INR |
| `currency` | String(3) | Default `INR` |
| `status` | Enum | `PENDING`, `AUTHORIZED`, `PAID`, `FAILED`, `CANCELLED` |
| `razorpay_order_id` | String(100) UNIQUE | Set after Razorpay order created |
| `authority_decision` | JSONB | Full Authority Agent decision record (rules checked, reasons, timestamps) |
| `created_at` / `updated_at` | TimestampTZ | |

**Order Lifecycle:**
`PENDING` → `AUTHORIZED` (Authority Agent approved) → `PAID` (Razorpay webhook confirmed)

---

### `payments` — Payment Records

> Populated **only** by Razorpay webhook handler. **No card data is ever stored here.**

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `order_id` | UUID FK → orders | CASCADE delete |
| `razorpay_payment_id` | String(100) UNIQUE | Format: `pay_xxxxx` |
| `razorpay_order_id` | String(100) | Format: `order_xxxxx` |
| `amount` | Numeric(12,2) | INR |
| `currency` | String(3) | Default `INR` |
| `status` | Enum | `PENDING`, `CAPTURED`, `FAILED`, `REFUNDED` |
| `method` | String(50) | `"card"`, `"upi"`, `"netbanking"`, `"wallet"` |
| `raw_event_reference` | String(500) | Razorpay webhook event ID for deduplication |
| `created_at` / `updated_at` | TimestampTZ | |

---

### `agent_sessions` — Session Lifecycle

> One session spans from the first customer message to payment completion.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `customer_id` | UUID FK → customers | CASCADE delete |
| `merchant_id` | UUID FK → merchants | RESTRICT delete |
| `session_type` | Enum | `SHOPPING`, `SUPPORT` |
| `status` | Enum | `ACTIVE`, `COMPLETED`, `ABANDONED` |
| `cart_id` | UUID FK → carts (nullable) | Linked once a cart is created during session |
| `order_id` | UUID FK → orders (nullable) | Linked once an order is created during session |
| `created_at` / `updated_at` | TimestampTZ | |

**Relationships:** has `actions` (ordered by `created_at`), `audit_logs`.

---

### `agent_actions` — Per-Agent Tool Call Log

> Records every significant tool call made by any agent during a session.
> Used for the live Agent Activity panel and post-session analytics.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `session_id` | UUID FK → agent_sessions | CASCADE delete |
| `agent_type` | Enum | `SALES_AGENT`, `MERCHANT_AGENT`, `AUTHORITY_AGENT` |
| `action_type` | String(100) | e.g. `"SEARCH_PRODUCTS"`, `"VALIDATE_BUDGET"`, `"CREATE_ORDER"` |
| `input_data` | JSONB | Sanitized input — **no raw PII or card data** |
| `output_data` | JSONB | Structured output returned by the tool |
| `status` | Enum | `SUCCESS`, `FAILED`, `PENDING`, `BLOCKED` |
| `reason` | Text | Human-readable explanation (critical for `BLOCKED`/`FAILED`) |
| `duration_ms` | Integer | Tool execution time in milliseconds (for performance monitoring) |
| `created_at` | TimestampTZ | |

---

### `audit_logs` — Immutable Audit Trail

> **APPEND-ONLY TABLE.** Never run UPDATE or DELETE on this table.
> This is the source of truth for every significant decision in AgentPay.

| Column | Type | Notes |
|---|---|---|
| `id` | UUID PK | |
| `session_id` | UUID FK (nullable) | May be null for system-generated entries before a session exists |
| `actor_type` | Enum | `CUSTOMER`, `MERCHANT`, `SALES_AGENT`, `MERCHANT_AGENT`, `AUTHORITY_AGENT`, `SYSTEM`, `RAZORPAY` |
| `actor_id` | String(100) | User UUID, agent name, or `"system"` |
| `agent_type` | Enum (nullable) | Which agent created this entry |
| `action` | String(200) | e.g. `"TRANSACTION_CHECK"`, `"PAYMENT_CREATED"`, `"PRODUCT_SEARCH"` |
| `entity_type` | String(100) | e.g. `"order"`, `"cart"`, `"product"` |
| `entity_id` | String(100) | UUID of the affected entity |
| `request_data` | JSONB | Sanitized context — **no passwords or card data** |
| `decision` | Enum (nullable) | `APPROVED`, `REJECTED`, `INFO`, `WARNING` |
| `reason` | Text | Why this decision was made |
| `created_at` | TimestampTZ | **No `updated_at`** — immutable timestamp |

**Feeds:**
- Live timeline in the merchant dashboard
- Hackathon demo explainability requirement
- Post-incident forensics

---

## Key Business Rules & Constraints

| Rule | Enforcement Level |
|---|---|
| `inventory.stock_quantity >= 0` | DB CHECK constraint |
| `inventory.reserved_quantity >= 0` | DB CHECK constraint |
| `inventory.stock_quantity >= reserved_quantity` | DB CHECK constraint |
| `cart_items.quantity > 0` | DB CHECK constraint |
| `cart_items.unit_price >= 0` | DB CHECK constraint |
| `cart_items.discount >= 0` | DB CHECK constraint |
| `cart_items.final_price >= 0` | DB CHECK constraint |
| No duplicate product relation edges | UNIQUE constraint on `(product_id, related_product_id, relation_type)` |
| One inventory record per product | UNIQUE FK on `inventory.product_id` |
| One policy per merchant | UNIQUE FK on `merchant_policies.merchant_id` |
| Price snapshot at cart-add time | Application-level: `unit_price` frozen at insert |
| No card data stored | Application-level: only Razorpay IDs stored |
| Audit log append-only | Application-level: no UPDATE/DELETE |
| Authority Agent is non-bypassable | Application-level: all order creation paths must pass through policy+budget validation |

---

## Technology Stack

| Layer | Technology | Version |
|---|---|---|
| **API Framework** | FastAPI | 0.115.0 |
| **ASGI Server** | Uvicorn | 0.30.6 |
| **ORM** | SQLAlchemy (async, `mapped_column` style) | 2.0.35 |
| **DB Driver** | psycopg3 (`psycopg[binary]`) | 3.2.3 |
| **Database** | PostgreSQL (Neon serverless recommended) | any |
| **Migrations** | Alembic | 1.13.2 |
| **Settings** | pydantic-settings | 2.5.2 |
| **Validation** | Pydantic | 2.9.2 |
| **Auth** | python-jose (JWT) + passlib (bcrypt) | |
| **Payments** | Razorpay SDK | 1.4.1 |
| **HTTP Client** | httpx | 0.27.2 |
| **Agent Framework** | LangChain + LangChain-OpenAI | >=0.3.7 |
| **LLM** | OpenAI gpt-4o-mini (configurable) | >=1.51.0 |

---

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
# PostgreSQL (Neon serverless — psycopg3 dialect)
# Both use the same driver; SQLAlchemy handles sync/async transparently
DATABASE_URL=postgresql+psycopg://user:password@ep-xxx.us-east-1.aws.neon.tech/agentpay?sslmode=require
SYNC_DATABASE_URL=postgresql+psycopg://user:password@ep-xxx.us-east-1.aws.neon.tech/agentpay?sslmode=require

# JWT Auth
JWT_SECRET=change-this-to-a-long-random-string
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440         # 24 hours

# OpenAI (for LangChain agents)
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini

# Razorpay (use Test Mode keys for development)
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
RAZORPAY_WEBHOOK_SECRET=...

# App
PORT=8000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

---

## Setup & Running Locally

```bash
# 1. Enter the backend directory
cd backend

# 2. Create and activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows PowerShell
# source venv/bin/activate     # Mac / Linux

# 3. Install core dependencies
pip install -r requirements.txt

# 4. Install agent layer (after core is confirmed working)
pip install -r requirements-agents.txt

# 5. Configure environment
copy .env.example .env         # Windows
# cp .env.example .env         # Mac/Linux
# Edit .env with your actual credentials

# 6. Create all database tables
alembic upgrade head

# 7. Seed demo data
python scripts/seed.py

# 8. Start the dev server
uvicorn app.main:app --reload --port 8000
```

**API Docs:**
| URL | Description |
|---|---|
| http://localhost:8000/ | Health + service info |
| http://localhost:8000/health | Simple health check |
| http://localhost:8000/docs | Swagger UI |
| http://localhost:8000/redoc | ReDoc |

---

## Database Migrations

```bash
# Apply all pending migrations (creates all tables on first run)
alembic upgrade head

# Create a new migration after changing a model
alembic revision --autogenerate -m "describe your change here"

# Rollback one migration
alembic downgrade -1

# Show current state
alembic current
```

> Alembic discovers all models automatically because every model class is imported in `app/db/base.py`.

---

## Seeding Demo Data

`scripts/seed.py` populates a complete, realistic demo environment:

| Entity | Details |
|---|---|
| **Merchant User** | `merchant@techstore.com` / password: `TechStore2024!` |
| **Customer User** | `demo@agentpay.com` / password: `Demo2024!` |
| **Merchant** | TechStore (Electronics) — status: ACTIVE |
| **Products** | 8 products: laptops + peripherals, all INR-priced |
| **Inventory** | Stock records for each product |
| **Product Relations** | 6 cross-sell + upsell edges |
| **Merchant Policy** | Max ₹80,000 transaction, 10% max discount, requires authorization: True |
| **Promotion** | Bundle deal — active for 30 days |
| **Customer** | Budget limit ₹70,000 |

```bash
# Run from the backend/ directory
python scripts/seed.py
```

---

## API Endpoints

Currently implemented:

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | Service info + health |
| `GET` | `/health` | Simple health check |
| `GET` | `/docs` | Swagger UI |
| `GET` | `/redoc` | ReDoc documentation |

> **Note:** Route handlers for auth, products, cart, orders, payments, and agent sessions are yet to be implemented. The current codebase establishes the complete database layer, configuration, and model definitions.

---

## Enums Reference

### User
| Enum | Values |
|---|---|
| `UserRole` | `CUSTOMER`, `MERCHANT`, `ADMIN` |

### Merchant
| Enum | Values |
|---|---|
| `MerchantStatus` | `ACTIVE`, `INACTIVE`, `PENDING` |

### Product
| Enum | Values |
|---|---|
| `RelationType` | `UPSELL`, `CROSS_SELL`, `BUNDLE`, `ALTERNATIVE` |
| `PromotionType` | `PERCENTAGE` (% off), `FIXED` (INR off), `BUNDLE` (multi-product discount) |

### Commerce
| Enum | Values |
|---|---|
| `CartStatus` | `ACTIVE`, `CHECKOUT`, `COMPLETED`, `ABANDONED` |
| `OrderStatus` | `PENDING`, `AUTHORIZED`, `PAID`, `FAILED`, `CANCELLED` |
| `PaymentStatus` | `PENDING`, `CAPTURED`, `FAILED`, `REFUNDED` |

### Agent
| Enum | Values |
|---|---|
| `AgentType` | `SALES_AGENT`, `MERCHANT_AGENT`, `AUTHORITY_AGENT` |
| `ActionStatus` | `SUCCESS`, `FAILED`, `PENDING`, `BLOCKED` |
| `SessionType` | `SHOPPING`, `SUPPORT` |
| `SessionStatus` | `ACTIVE`, `COMPLETED`, `ABANDONED` |

### Audit
| Enum | Values |
|---|---|
| `ActorType` | `CUSTOMER`, `MERCHANT`, `SALES_AGENT`, `MERCHANT_AGENT`, `AUTHORITY_AGENT`, `SYSTEM`, `RAZORPAY` |
| `AuditDecision` | `APPROVED`, `REJECTED`, `INFO`, `WARNING` |

---

## Security Notes

- **No card data stored.** Only Razorpay-generated IDs (`pay_xxxxx`, `order_xxxxx`) are persisted. The `payments` table explicitly documents this in its class docstring.
- **No raw PII in agent logs.** `agent_actions.input_data` and `audit_logs.request_data` are always sanitized before being written.
- **Passwords hashed with bcrypt** via `passlib`. Raw passwords never touch the database.
- **JWT tokens** expire after 24 hours (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES`).
- **Razorpay webhook deduplication** via `payments.raw_event_reference`.
- **Authority Agent is non-bypassable** — all order creation paths must pass through policy + budget validation before any Razorpay order is created.
- **Audit log is append-only** — no UPDATE or DELETE should ever be run against `audit_logs`. This is enforced at the application layer.
- **CORS** is configurable via `ALLOWED_ORIGINS` in `.env`.

---

## Entity Relationship Summary

```
users ──1:1──► merchants ──1:1──► merchant_policies
  │                │
  │                ├──1:N──► products ──1:1──► inventory
  │                │             │
  │                │             └──N:M──► product_relations (upsell/cross-sell graph)
  │                │
  │                ├──1:N──► promotions
  │                ├──1:N──► carts ──1:N──► cart_items
  │                └──1:N──► orders ──1:N──► payments
  │
  └──1:1──► customers ──1:N──► carts
                  │    ──1:N──► orders
                  └──1:N──► agent_sessions ──1:N──► agent_actions
                                           ──1:N──► audit_logs
```
