# AgentPay — Intelligent Multi-Agent Commerce Command Center

> **Autonomous AI-Powered Commerce Platform with Real-Time Agent-to-Agent (A2A) Negotiation, Live Web Search Grounding, Deterministic Safety Enforcement, Two-Way Voice Engine, Universal Catalog with Direct Buy Checkout, and an Interactive 2D Phaser.js Office Simulation.**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20TypeScript-61DAFB?style=flat-square&logo=react)](https://reactjs.org/)
[![Phaser](https://img.shields.io/badge/2D%20Engine-Phaser.js%203-FF5722?style=flat-square)](https://phaser.io/)
[![Google Gemini](https://img.shields.io/badge/AI%20Brain-Google%20Gemini%201.5%20Flash-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)
[![Razorpay](https://img.shields.io/badge/Payments-Razorpay%20API-0C2340?style=flat-square)](https://razorpay.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

---

## 🌟 Key Highlights & Innovations

1. **Multi-Agent Collaborative Brain (A2A Protocol)**:
   - **🛒 Sales Discovery Agent (Michael)**: Understands natural language customer intent, searches products across the universal catalog, and grounds answers using live web specs.
   - **🏪 Merchant Promotion Agent (TechStore)**: Evaluates real-time inventory, bundle discounts, upsell relations, and merchant margins.
   - **⚖️ Authority Gatekeeper Agent**: Deterministically verifies hard financial policies (customer budget caps, order minimums, transaction limits) with **zero LLM hallucination risk**.
   - **🗣️ Inter-Agent Dialogue**: Agents converse and negotiate autonomously in real-time (`[Sales ➔ Merchant]`, `[Merchant ➔ Sales]`, `[Merchant ➔ Authority]`) before rendering cohesive recommendations.

2. **Interactive 2D Pixel Office Simulation (Phaser.js 3)**:
   - Full-frame procedural rendering of an active commerce HQ: dual-monitor workstations, conference tables, server racks with pulsing LEDs, water cooler, and potted plants.
   - 5 Animated pixel characters (*Customer*, *Sales Agent*, *Merchant Agent*, *Authority Agent*, *Merchant Admin*).
   - Dynamic speech bubbles popping up above characters during live multi-agent negotiations.
   - High-contrast drop-shadow badge nameplates and live station indicators (*Live Web Hub*, *Razorpay POS Counter*).

3. **Universal Catalog & Direct Buy Checkout Flow**:
   - 30+ pre-seeded tech products across 6 categories: Laptops, Peripherals, Audio, Monitors, Storage, and Wearables.
   - Rich product cards featuring real product imagery, stock badges, rating stars, and specs.
   - **Direct Buy Modal**: Instant checkout supporting full shipping address collection and multi-channel payment selection (**UPI QR Code**, **Credit/Debit Card**, **Net Banking**, **Cash on Delivery**).
   - Automated order generation with simulated UPI QR code generation and real-time transaction receipts.

4. **Two-Way Voice Engine**:
   - **Speech-to-Text (STT)**: Built-in microphone input (`🎙️`) via Web Speech API allowing hands-free voice shopping.
   - **Text-to-Speech (TTS)**: Neural browser voice playback speaking agent recommendations and deal notifications aloud.

5. **Live Web Search Grounding**:
   - Real-time web search tool queries current tech benchmarks, release dates, and external market pricing to give users grounded purchase advice.

6. **Enterprise Telemetry & Immutable Audit Trail**:
   - 6 retro-cream status cards displaying live task queues, CPU/memory gauges, and service health LEDs.
   - Every single agent decision, transaction check, and policy evaluation is recorded in an immutable append-only audit log.

---

## 🏗️ System Architecture

```mermaid
flowchart TD
    User([👤 Customer / User]) -->|Voice / Text Chat| CommandCenter[Command Center UI]
    CommandCenter -->|WebSockets / REST| Orchestrator[Multi-Agent Orchestrator]

    subgraph Multi-Agent Collaboration Engine
        Orchestrator --> SalesAgent[🛒 Sales Discovery Agent]
        SalesAgent <-->|A2A Negotiation| MerchantAgent[🏪 Merchant Promotion Agent]
        MerchantAgent -->|Deal Proposal| AuthorityAgent[⚖️ Authority Gatekeeper Agent]
    end

    subgraph Live Grounding & Storage
        SalesAgent -->|Catalog Search| LocalDB[(SQLAlchemy 2.0 / Universal Catalog)]
        SalesAgent -->|Market Specs| WebSearch[🌐 Live Web Grounding]
        MerchantAgent -->|Policy & Promotions| PolicyDB[(Merchant Policies & Relations)]
    end

    subgraph Deterministic Safety Layer
        AuthorityAgent -->|Budget Validation| BudgetCheck{Within ₹70,000 Budget?}
        BudgetCheck -->|Yes| OrderService[Order Generator]
        BudgetCheck -->|No| RejectFeedback[Detailed Refusal & Audit Log]
    end

    subgraph Payment & Telemetry
        OrderService --> DirectBuy[⚡ Direct Buy / UPI QR / Card]
        OrderService --> Razorpay[💳 Razorpay Payment Gateway]
        Orchestrator --> Telemetry[🖥️ Live System Telemetry]
        Orchestrator --> AuditTrail[(Immutable Audit Logs)]
    end
```

---

## 💻 Tech Stack

### **Frontend**
- **Core**: React 18, TypeScript, HTML5, CSS3
- **2D Game Engine**: Phaser.js 3 (Custom procedural office canvas & character animations)
- **Networking**: WebSockets, Axios
- **Icons & UI**: Lucide React, Tailwind-inspired utility CSS
- **Voice**: Web Speech API (`SpeechRecognition` + `SpeechSynthesis`)
- **Build Tool**: Vite 6

### **Backend**
- **Framework**: FastAPI (Python 3.11+ / 3.13)
- **AI Brain**: Google Gemini 1.5 Flash via official SDK
- **Database & ORM**: SQLAlchemy 2.0 (Async), SQLite (`aiosqlite`) / PostgreSQL
- **Database Migrations**: Alembic
- **Web Grounding**: BeautifulSoup4, HTTPX
- **Payments**: Razorpay Python SDK + Direct POS simulation

---

## 📁 Repository Structure

```text
Hackathon/
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   │   ├── authority_agent.py   # Deterministic safety gatekeeper
│   │   │   ├── merchant_agent.py    # Promotions & upsell engine
│   │   │   ├── orchestrator.py      # Central router & A2A protocol
│   │   │   ├── sales_agent.py       # Customer discovery & cart sync
│   │   │   ├── tools.py             # Pure async DB tool functions
│   │   │   ├── universal_catalog.py # 30+ product comprehensive tech catalog
│   │   │   └── web_search.py        # Live web grounding tool
│   │   ├── api/routes/
│   │   │   ├── agent.py             # Session, chat, and status endpoints
│   │   │   ├── payments.py          # Direct buy, Razorpay orders, and payment confirmation
│   │   │   └── products.py          # Catalog listing & search
│   │   ├── core/
│   │   │   └── config.py            # Pydantic environment configuration
│   │   ├── db/
│   │   │   ├── models/              # SQLAlchemy ORM models (15 entities)
│   │   │   ├── base.py              # DeclarativeBase definition
│   │   │   ├── session.py           # Async engine & session factory
│   │   │   └── types.py             # Cross-platform JSONB/UUID types
│   │   └── main.py                  # FastAPI app & WebSocket mount
│   ├── scripts/
│   │   └── seed.py                  # Demo catalog & database seeder
│   ├── requirements.txt             # Python dependencies
│   ├── .env.example                 # Public environment template
│   └── .env                         # Local runtime credentials (ignored by git)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── BottomTelemetryBar.tsx  # 6 Retro-cream status cards
│   │   │   ├── CommandCenter.tsx       # Multi-tab command terminal, chat, and product list
│   │   │   ├── DirectCheckoutModal.tsx # Multi-step checkout & payment modal
│   │   │   ├── PhaserOffice.tsx        # React wrapper for Phaser canvas
│   │   │   └── TopBar.tsx              # Header with session badges & clock
│   │   ├── phaser/
│   │   │   └── OfficeScene.ts          # 2D pixel office simulation
│   │   ├── services/
│   │   │   ├── api.ts                  # Axios API client
│   │   │   └── voice.ts                # Two-way STT / TTS voice engine
│   │   ├── types/
│   │   │   └── index.ts                # TypeScript interface definitions
│   │   ├── App.tsx                     # Main layout coordinator
│   │   ├── main.tsx                    # React mount entry point
│   │   └── index.css                   # Global styles & typography
│   ├── index.html                      # Vite template
│   ├── package.json                    # Node dependencies
│   ├── tsconfig.json                   # TypeScript configuration
│   └── vite.config.ts                  # Vite server & proxy settings
├── .gitignore                          # Security exclusions
└── README.md                           # Documentation
```

---

## ⚡ Quickstart Guide

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate      # On Windows
# source venv/bin/activate # On macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
# Copy .env.example to .env and insert your GEMINI_API_KEY
copy .env.example .env

# Seed the database with demo products, policies, and users
python scripts/seed.py

# Start the FastAPI backend server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install npm dependencies
npm install

# Start the Vite development server with hot-reload
npm run dev

# Or build the production bundle
npm run build
```

### 3. Open in Browser
Navigate your browser to:
👉 **[http://localhost:5173/](http://localhost:5173/)** *(or [http://localhost:8000/](http://localhost:8000/) for direct backend-served build)*

---

## 🎯 Pre-Seeded Demo Scenarios

| Scenario | Action / User Prompt | Expected Agent Behavior |
|---|---|---|
| **1. Natural Language Search** | *"Show me some good laptops under 70000"* | **Sales Agent** finds Lenovo IdeaPad Slim 5 (₹62,000) & HP Pavilion 15 (₹67,000) with full specs. |
| **2. Category Browsing** | *"Recommend premium mechanical keyboards and gaming mice"* | **Sales Agent** retrieves Keychron K2, Logitech G502 HERO, and Razer DeathAdder with real images. |
| **3. Direct Buy & Instant Checkout** | Click **"⚡ DIRECT BUY"** on any product card | Opens Checkout Modal with address capture and payment options (UPI QR / Card / COD). |
| **4. Cart Sync & Cross-Sell** | Say *"Add Lenovo IdeaPad to my cart"* | **Sales Agent** adds item; **Merchant Agent** initiates A2A dialogue offering bundle discount on accessories. |
| **5. Live Web Grounding** | *"Search the web for latest lightweight ultrabooks 2026"* | **Sales Agent** executes live web search and returns external market sources & benchmarks. |
| **6. Budget Approval & Payment** | Say *"Proceed to checkout"* (Cart total ₹62,000) | **Authority Agent** validates ₹62,000 <= ₹70,000 budget cap ➔ **APPROVED** ➔ Unlocks **💳 Razorpay Payment Button**. |
| **7. Policy Enforcement (Budget Rejection)** | Add **Dell Inspiron 15** (₹72,000) & say *"Proceed to checkout"* | **Authority Agent** catches ₹72,000 > ₹70,000 budget cap ➔ **REJECTED** with detailed explanation and audit record. |
| **8. Two-Way Voice Experience** | Click **`🎙️` Microphone** and speak your query | Transcribes speech to text in real-time and speaks responses aloud with neural TTS. |

---

## 🛡️ Deterministic Safety Rules

The **Authority Agent** executes strict policy logic in pure Python without LLM hallucination:

1. **`agent_purchase_enabled`**: Master kill switch allowing/disallowing AI autonomous purchases.
2. **`minimum_order_amount`**: Enforces minimum cart threshold (e.g., ₹500).
3. **`max_transaction_amount`**: Strict merchant upper transaction limit (e.g., ₹100,000).
4. **`max_discount_percentage`**: Caps promotional discounts (max 5.0%).
5. **`customer_budget_limit`**: Protects customer financial safety against personal budget cap (e.g., ₹70,000).

---

## 👥 Submission Information
- **Project Name**: AgentPay Command Center
- **Repository**: [https://github.com/kingping77777/fegesg](https://github.com/kingping77777/fegesg)
- **License**: MIT
