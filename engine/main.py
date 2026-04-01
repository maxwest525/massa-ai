"""
FastAPI entrypoint — HTTP API + WebSocket hub.

Sprint 1 endpoints:
    GET  /api/health
    GET  /api/strategies
    GET  /api/strategies/{id}
    PUT  /api/strategies/{id}/params
    POST /api/strategies/{id}/enable
    POST /api/strategies/{id}/disable
    WS   /ws
"""

import asyncio
import json
import logging
import os
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from engine.core.engine import Engine
from engine.utils.logger import get_logger

logger = get_logger(__name__)

# ---------------------------------------------------------------------------
# Global engine instance
# ---------------------------------------------------------------------------

engine = Engine()
_ws_clients: list[WebSocket] = []


async def broadcast(payload: dict) -> None:
    """Send a JSON payload to all connected WebSocket clients."""
    message = json.dumps(payload)
    disconnected = []
    for ws in _ws_clients:
        try:
            await ws.send_text(message)
        except Exception:
            disconnected.append(ws)
    for ws in disconnected:
        _ws_clients.remove(ws)


# ---------------------------------------------------------------------------
# App lifecycle
# ---------------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    engine.set_broadcast(broadcast)
    asyncio.create_task(engine.start())
    logger.info("Engine task started")
    yield
    await engine.stop()
    logger.info("Engine stopped")


app = FastAPI(title="xerox-bot", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Request/response models
# ---------------------------------------------------------------------------

class ParamUpdate(BaseModel):
    params: dict[str, Any]


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "strategies_loaded": len(engine.loader.registry),
        "paper_trading": os.getenv("PAPER_TRADING", "true").lower() == "true",
        "kill_switch": os.getenv("KILL_SWITCH", "false").lower() == "true",
    }


@app.get("/api/strategies")
def list_strategies():
    return engine.loader.list_strategies()


@app.get("/api/strategies/{strategy_id}")
def get_strategy(strategy_id: str):
    schema = engine.loader.get_schema(strategy_id)
    if schema is None:
        raise HTTPException(status_code=404, detail=f"Strategy '{strategy_id}' not found")
    instance = engine.loader.registry[strategy_id]
    return {**schema, "current_params": instance.params.as_dict()}


@app.put("/api/strategies/{strategy_id}/params")
def update_params(strategy_id: str, body: ParamUpdate):
    if strategy_id not in engine.loader.registry:
        raise HTTPException(status_code=404, detail=f"Strategy '{strategy_id}' not found")

    schema = engine.loader.get_schema(strategy_id) or {}
    param_schema = schema.get("parameters", {})

    for key, value in body.params.items():
        if key not in param_schema:
            raise HTTPException(status_code=400, detail=f"Unknown parameter '{key}'")
        # Basic type coercion
        ptype = param_schema[key].get("type", "float")
        if ptype == "integer":
            value = int(value)
        elif ptype == "float":
            value = float(value)
        engine.loader.update_param(strategy_id, key, value)

    instance = engine.loader.registry[strategy_id]
    return {"strategy_id": strategy_id, "current_params": instance.params.as_dict()}


@app.post("/api/strategies/{strategy_id}/enable")
def enable_strategy(strategy_id: str):
    cfg = engine.loader.configs.get(strategy_id)
    if cfg is None:
        raise HTTPException(status_code=404, detail=f"Strategy '{strategy_id}' not found")
    cfg["enabled"] = True
    logger.info("Strategy '%s' enabled", strategy_id)
    return {"strategy_id": strategy_id, "enabled": True}


@app.post("/api/strategies/{strategy_id}/disable")
def disable_strategy(strategy_id: str):
    cfg = engine.loader.configs.get(strategy_id)
    if cfg is None:
        raise HTTPException(status_code=404, detail=f"Strategy '{strategy_id}' not found")
    cfg["enabled"] = False
    logger.info("Strategy '%s' disabled", strategy_id)
    return {"strategy_id": strategy_id, "enabled": False}


# ---------------------------------------------------------------------------
# WebSocket
# ---------------------------------------------------------------------------

@app.websocket("/ws")
async def websocket_endpoint(ws: WebSocket):
    await ws.accept()
    _ws_clients.append(ws)
    logger.info("WebSocket client connected (%d total)", len(_ws_clients))
    try:
        while True:
            # Keep connection alive; engine pushes events via broadcast()
            await ws.receive_text()
    except WebSocketDisconnect:
        _ws_clients.remove(ws)
        logger.info("WebSocket client disconnected (%d total)", len(_ws_clients))
