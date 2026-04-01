"""
Order Manager — places, tracks, and cancels orders via CCXT.

Sprint 1: stub with paper-trading mode (logs only, no real orders).
Sprint 2: wire in live CCXT execution.
"""

import logging
import os
import uuid
from typing import Optional

from engine.models.signal import Signal, SignalType
from engine.models.trade import Trade

logger = logging.getLogger(__name__)


class OrderManager:
    def __init__(self) -> None:
        self.paper_trading: bool = os.getenv("PAPER_TRADING", "true").lower() == "true"
        self._open_trades: dict[str, Trade] = {}   # order_id → Trade
        self._closed_trades: list[Trade] = []
        self._exchange = None   # set in Sprint 2

    # ------------------------------------------------------------------
    # Sprint 2 hook
    # ------------------------------------------------------------------

    def connect(self, exchange_id: str, api_key: str, api_secret: str) -> None:
        """Initialize CCXT exchange. Called by engine on startup (Sprint 2)."""
        # import ccxt; self._exchange = ccxt.binance({"apiKey": ..., "secret": ...})
        logger.info("OrderManager.connect() — wired in Sprint 2")

    # ------------------------------------------------------------------
    # Order placement
    # ------------------------------------------------------------------

    def place(
        self,
        signal: Signal,
        strategy_id: str,
        symbol: str,
        qty: float,
        current_price: float,
    ) -> Optional[str]:
        """
        Place an order.  Returns order_id on success, None on failure.
        In paper mode: logs the order and records a synthetic fill at current_price.
        """
        order_id = str(uuid.uuid4())[:8]

        if self.paper_trading:
            logger.info(
                "[PAPER] %s %s qty=%.6f price=%.4f strategy=%s order=%s",
                signal.type.upper(), symbol, qty, current_price, strategy_id, order_id,
            )
            trade = Trade(
                id=order_id,
                strategy_id=strategy_id,
                symbol=symbol,
                side=signal.type,
                qty=qty,
                entry_price=signal.price or current_price,
            )
            self._open_trades[order_id] = trade
            return order_id

        # Live execution (Sprint 2)
        logger.warning("Live order placement not yet implemented (Sprint 2)")
        return None

    def close(self, order_id: str, exit_price: float, fees: float = 0.0) -> Optional[Trade]:
        """Close an open trade and move it to history."""
        trade = self._open_trades.pop(order_id, None)
        if trade is None:
            logger.warning("close() called for unknown order_id=%s", order_id)
            return None
        trade.close(exit_price, fees)
        self._closed_trades.append(trade)
        logger.info(
            "[PAPER] CLOSE order=%s pnl=%.4f",
            order_id, trade.pnl or 0.0,
        )
        return trade

    # ------------------------------------------------------------------
    # Queries
    # ------------------------------------------------------------------

    def open_trades(self, strategy_id: Optional[str] = None) -> list[Trade]:
        trades = list(self._open_trades.values())
        if strategy_id:
            trades = [t for t in trades if t.strategy_id == strategy_id]
        return trades

    def trade_history(
        self,
        strategy_id: Optional[str] = None,
        limit: int = 100,
        offset: int = 0,
    ) -> list[Trade]:
        trades = self._closed_trades
        if strategy_id:
            trades = [t for t in trades if t.strategy_id == strategy_id]
        return trades[offset: offset + limit]
