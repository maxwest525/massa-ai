"""
Strategy Engine — the main asyncio event loop.

Responsibilities:
1. Load all strategy plugins via PluginLoader.
2. Start a per-strategy tick coroutine.
3. Pass OHLCV data from DataFeed to each enabled strategy's on_tick().
4. Route returned Signals through RiskGuard → OrderManager.
5. Broadcast state updates over WebSocket (Sprint 5).
"""

import asyncio
import logging
from typing import Callable, Optional

from engine.core.loader import PluginLoader
from engine.core.data_feed import DataFeed
from engine.core.risk import RiskGuard
from engine.core.order_manager import OrderManager
from engine.models.signal import Signal, SignalType
from engine.utils.logger import get_logger

logger = get_logger(__name__)

# Tick interval in seconds (overridden per-strategy in Sprint 2)
DEFAULT_TICK_INTERVAL = 5.0

# Portfolio value placeholder — Sprint 2 fetches live balance
PORTFOLIO_VALUE = 10_000.0


class Engine:
    def __init__(self) -> None:
        self.loader = PluginLoader()
        self.risk = RiskGuard()
        self.orders = OrderManager()
        self._broadcast: Optional[Callable] = None  # injected by main.py (Sprint 5)
        self._running = False

    def set_broadcast(self, fn: Callable) -> None:
        """Inject the WebSocket broadcast function (Sprint 5)."""
        self._broadcast = fn

    async def start(self) -> None:
        logger.info("Engine starting — discovering plugins…")
        self.loader.discover()
        self._running = True

        tasks = [
            asyncio.create_task(self._run_strategy(sid))
            for sid, instance in self.loader.registry.items()
        ]
        if not tasks:
            logger.warning("No strategies loaded — engine idling")
            return

        await asyncio.gather(*tasks, return_exceptions=True)

    async def stop(self) -> None:
        self._running = False
        for instance in self.loader.registry.values():
            try:
                instance.on_stop()
            except Exception as exc:
                logger.warning("on_stop() error: %s", exc)

    # ------------------------------------------------------------------
    # Per-strategy tick loop
    # ------------------------------------------------------------------

    async def _run_strategy(self, strategy_id: str) -> None:
        instance = self.loader.registry[strategy_id]
        config = self.loader.configs.get(strategy_id, {})

        if not config.get("enabled", False):
            logger.info("Strategy '%s' is disabled — skipping", strategy_id)
            return

        feed = DataFeed(symbol=instance.symbol)
        logger.info("Starting tick loop for '%s' on %s", strategy_id, instance.symbol)

        async for ohlcv in feed.stream(interval=DEFAULT_TICK_INTERVAL):
            if not self._running:
                break

            # Re-check enabled flag (can change via API)
            if not self.loader.configs.get(strategy_id, {}).get("enabled", False):
                logger.info("Strategy '%s' disabled — pausing tick loop", strategy_id)
                await asyncio.sleep(1.0)
                continue

            try:
                signal: Optional[Signal] = instance.on_tick(ohlcv)
            except Exception as exc:
                logger.error("on_tick() error in '%s': %s", strategy_id, exc, exc_info=True)
                continue

            if signal is None:
                continue

            await self._handle_signal(signal, strategy_id, instance, ohlcv)

    async def _handle_signal(self, signal, strategy_id, instance, ohlcv) -> None:
        current_price = float(ohlcv["close"].iloc[-1])

        allowed, reason = self.risk.check(
            signal=signal,
            strategy_id=strategy_id,
            risk_limits=instance.risk_limits,
            portfolio_value=PORTFOLIO_VALUE,
        )

        if not allowed:
            logger.warning("Signal blocked for '%s': %s", strategy_id, reason)
            return

        # Simple position sizing: risk_per_trade% of portfolio / current_price
        risk_pct = instance.params.get("risk_per_trade", 1.0)
        qty = (PORTFOLIO_VALUE * risk_pct / 100) / current_price * signal.confidence

        order_id = self.orders.place(
            signal=signal,
            strategy_id=strategy_id,
            symbol=instance.symbol,
            qty=qty,
            current_price=current_price,
        )

        if order_id:
            self.risk.record_open(strategy_id)
            instance.on_fill(order_id, current_price, qty)

            if self._broadcast:
                await self._broadcast({
                    "type": "fill",
                    "strategy_id": strategy_id,
                    "order_id": order_id,
                    "signal": signal.type,
                    "price": current_price,
                    "qty": qty,
                })
