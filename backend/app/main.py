"""
app/main.py

FastAPI application entry point.
Mounts all routers and configures middleware.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings


# ── Lifespan (startup / shutdown) ────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Runs once on startup and once on shutdown."""
    print(f"[AgentPay] Starting server — env={settings.NODE_ENV}")
    print(f"[AgentPay] Database: {settings.DATABASE_URL[:40]}...")
    print(f"[AgentPay] Gemini model: {settings.GEMINI_MODEL}")
    yield
    print("[AgentPay] Shutting down.")


# ── App ───────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="AgentPay API",
    description="AI-Powered Agentic Commerce Platform",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # permissive for hackathon/frontend dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
from app.api.routes.agent import router as agent_router
from app.api.routes.products import router as products_router
from app.api.routes.payments import router as payments_router

app.include_router(agent_router)
app.include_router(products_router)
app.include_router(payments_router)


# ── Health check & Frontend UI ────────────────────────────────────────────────
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend"))
if os.path.exists(frontend_dir):
    app.mount("/static", StaticFiles(directory=frontend_dir, html=True), name="static")

    @app.get("/app", include_in_schema=False)
    async def serve_app():
        return FileResponse(os.path.join(frontend_dir, "index.html"))


@app.get("/", tags=["health"])
async def root():
    return {
        "service": "AgentPay API",
        "version": "0.1.0",
        "status": "ok",
        "env": settings.NODE_ENV,
        "ui": "/app",
    }


@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok"}
