"""
Simple in-memory metrics — no external dependency.
Sprint 5 can swap this for Prometheus if needed.
"""

from collections import defaultdict
from dataclasses import dataclass, field
from typing import Optional


@dataclass
class StrategyMetrics:
    strategy_id: str
    total_trades: int = 0
    winning_trades: int = 0
    losing_trades: int = 0
    total_pnl: float = 0.0
    max_drawdown: float = 0.0
    peak_pnl: float = 0.0
    equity_curve: list[float] = field(default_factory=list)

    @property
    def win_rate(self) -> Optional[float]:
        if self.total_trades == 0:
            return None
        return self.winning_trades / self.total_trades

    def record_trade(self, pnl: float) -> None:
        self.total_trades += 1
        self.total_pnl += pnl
        self.equity_curve.append(self.total_pnl)
        if pnl > 0:
            self.winning_trades += 1
        else:
            self.losing_trades += 1
        if self.total_pnl > self.peak_pnl:
            self.peak_pnl = self.total_pnl
        drawdown = self.peak_pnl - self.total_pnl
        if drawdown > self.max_drawdown:
            self.max_drawdown = drawdown

    def to_dict(self) -> dict:
        return {
            "strategy_id": self.strategy_id,
            "total_trades": self.total_trades,
            "winning_trades": self.winning_trades,
            "losing_trades": self.losing_trades,
            "total_pnl": round(self.total_pnl, 4),
            "win_rate": round(self.win_rate, 4) if self.win_rate is not None else None,
            "max_drawdown": round(self.max_drawdown, 4),
            "equity_curve": [round(v, 4) for v in self.equity_curve[-200:]],
        }


class MetricsStore:
    def __init__(self) -> None:
        self._data: dict[str, StrategyMetrics] = {}

    def get(self, strategy_id: str) -> StrategyMetrics:
        if strategy_id not in self._data:
            self._data[strategy_id] = StrategyMetrics(strategy_id=strategy_id)
        return self._data[strategy_id]

    def all(self) -> list[dict]:
        return [m.to_dict() for m in self._data.values()]
