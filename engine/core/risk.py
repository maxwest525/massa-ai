"""
Risk Guard — validates signals before they reach the order manager.

All checks are enforced globally.  A signal is rejected if any check fails.
Sprint 2 will wire in live balance fetching; this sprint provides the full
guard logic so it's ready to connect.
"""

import logging
import os
from dataclasses import dataclass, field
from datetime import date
from typing import Optional

from engine.models.signal import Signal, SignalType

logger = logging.getLogger(__name__)


@dataclass
class DailyStats:
    date: date = field(default_factory=date.today)
    realized_pnl: float = 0.0
    open_trades: int = 0

    def reset_if_new_day(self) -> None:
        today = date.today()
        if self.date != today:
            self.date = today
            self.realized_pnl = 0.0
            # open_trades carries over — they were opened previously


class RiskGuard:
    """
    Validates a signal against strategy-level and global risk rules.

    Usage:
        guard = RiskGuard()
        allowed, reason = guard.check(signal, strategy_id, risk_limits, portfolio_value)
        if allowed:
            order_manager.place(...)
    """

    def __init__(self) -> None:
        self._stats: dict[str, DailyStats] = {}

    def _get_stats(self, strategy_id: str) -> DailyStats:
        stats = self._stats.setdefault(strategy_id, DailyStats())
        stats.reset_if_new_day()
        return stats

    def check(
        self,
        signal: Signal,
        strategy_id: str,
        risk_limits: dict,
        portfolio_value: float,
        position_value: float = 0.0,
    ) -> tuple[bool, str]:
        """
        Returns (allowed: bool, reason: str).
        reason is empty string when allowed.
        """
        # Global kill switch
        if os.getenv("KILL_SWITCH", "false").lower() == "true":
            return False, "KILL_SWITCH is active"

        stats = self._get_stats(strategy_id)

        # Daily loss limit
        daily_loss_limit_pct = risk_limits.get("daily_loss_limit", 100.0)
        daily_loss_limit = portfolio_value * daily_loss_limit_pct / 100
        if stats.realized_pnl < -daily_loss_limit:
            return False, (
                f"Daily loss limit reached: {stats.realized_pnl:.2f} "
                f"(limit: -{daily_loss_limit:.2f})"
            )

        # Max open trades (only for entry signals)
        if signal.type in (SignalType.BUY, SignalType.SELL):
            max_open = risk_limits.get("max_open_trades", 999)
            if stats.open_trades >= max_open:
                return False, f"Max open trades reached: {stats.open_trades}/{max_open}"

            # Max position size
            max_position_pct = risk_limits.get("max_position_pct", 100.0)
            max_position_value = portfolio_value * max_position_pct / 100
            if position_value > max_position_value:
                return False, (
                    f"Position value {position_value:.2f} exceeds "
                    f"max {max_position_value:.2f} ({max_position_pct}%)"
                )

        return True, ""

    def record_open(self, strategy_id: str) -> None:
        self._get_stats(strategy_id).open_trades += 1

    def record_close(self, strategy_id: str, pnl: float) -> None:
        stats = self._get_stats(strategy_id)
        stats.open_trades = max(0, stats.open_trades - 1)
        stats.realized_pnl += pnl

    def get_daily_stats(self, strategy_id: str) -> dict:
        stats = self._get_stats(strategy_id)
        return {
            "date": stats.date.isoformat(),
            "realized_pnl": stats.realized_pnl,
            "open_trades": stats.open_trades,
        }
