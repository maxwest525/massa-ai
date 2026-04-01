"""
EMA Crossover Strategy
======================
Buys when the fast EMA crosses above the slow EMA (bullish crossover).
Sells when the fast EMA crosses below the slow EMA (bearish crossover).
"""

from typing import Optional

import pandas as pd

from engine.core._base import BaseStrategy
from engine.models.signal import Signal, SignalType


class EmaCrossStrategy(BaseStrategy):
    """EMA crossover — reference implementation of the plugin contract."""

    def on_tick(self, ohlcv: pd.DataFrame) -> Optional[Signal]:
        # Need at least slow_period + 2 bars to detect a crossover
        min_bars = self.params.slow_period + 2
        if len(ohlcv) < min_bars:
            return None

        close = ohlcv["close"]
        fast = close.ewm(span=self.params.fast_period, adjust=False).mean()
        slow = close.ewm(span=self.params.slow_period, adjust=False).mean()

        prev_fast, prev_slow = fast.iloc[-2], slow.iloc[-2]
        curr_fast, curr_slow = fast.iloc[-1], slow.iloc[-1]

        # Bullish crossover: fast was below slow, now above
        if prev_fast < prev_slow and curr_fast > curr_slow:
            return Signal(type=SignalType.BUY, confidence=0.8)

        # Bearish crossover: fast was above slow, now below
        if prev_fast > prev_slow and curr_fast < curr_slow:
            return Signal(type=SignalType.SELL, confidence=0.8)

        return None

    def on_fill(self, order_id: str, fill_price: float, qty: float) -> None:
        pass  # no internal state needed for this strategy

    def on_stop(self) -> None:
        pass
