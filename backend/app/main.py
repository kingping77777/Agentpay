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


# ── Health check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["health"])
async def health():
    return {"status": "ok"}


# ── WebSockets for Live Multi-Agent Collaboration ─────────────────────────────
from fastapi import WebSocket, WebSocketDisconnect

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception:
                pass

ws_manager = ConnectionManager()

@app.websocket("/ws/agents")
async def websocket_agents_endpoint(websocket: WebSocket):
    await ws_manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_json({"type": "HEARTBEAT", "status": "CONNECTED"})
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)


@app.get("/api/health", tags=["health"])
async def api_health():
    return {
        "service": "AgentPay API",
        "version": "0.1.0",
        "status": "ok",
        "env": settings.NODE_ENV,
    }


# ── Frontend UI ───────────────────────────────────────────────────────────────
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend"))
dist_dir = os.path.join(frontend_dir, "dist")
target_dir = dist_dir if os.path.exists(os.path.join(dist_dir, "index.html")) else frontend_dir

if os.path.exists(target_dir):
    @app.get("/app", include_in_schema=False)
    async def serve_app():
        return FileResponse(os.path.join(target_dir, "index.html"))

    app.mount("/static", StaticFiles(directory=target_dir, html=True), name="static")
    app.mount("/", StaticFiles(directory=target_dir, html=True), name="frontend")
