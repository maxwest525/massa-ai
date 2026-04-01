"""
Data Feed — fetches OHLCV data from exchanges via CCXT and caches in Redis.

Sprint 1: stub that generates synthetic OHLCV for testing on_tick() without
          a live exchange connection.
Sprint 2: wire in real CCXT fetching + Redis caching.
"""

import asyncio
import logging
import random
from datetime import datetime, timezone
from typing import AsyncIterator

import pandas as pd

logger = logging.getLogger(__name__)

_COLUMNS = ["timestamp", "open", "high", "low", "close", "volume"]


def _synthetic_ohlcv(base_price: float = 30_000.0, bars: int = 200) -> pd.DataFrame:
    """Generate random walk OHLCV data for testing."""
    price = base_price
    rows = []
    now = datetime.now(timezone.utc).timestamp() * 1000
    interval_ms = 3_600_000  # 1h in ms

    for i in range(bars):
        ts = now - (bars - i) * interval_ms
        change = price * random.uniform(-0.01, 0.01)
        open_ = price
        close = price + change
        high = max(open_, close) * random.uniform(1.0, 1.005)
        low = min(open_, close) * random.uniform(0.995, 1.0)
        volume = random.uniform(10, 500)
        rows.append([ts, open_, high, low, close, volume])
        price = close

    return pd.DataFrame(rows, columns=_COLUMNS)


class DataFeed:
    """
    Provides OHLCV data to the engine.

    Sprint 1 behaviour: returns synthetic data every `interval` seconds.
    Sprint 2: fetch from exchange → cache in Redis → return fresh DataFrame.
    """

    def __init__(self, symbol: str = "BTC/USDT", timeframe: str = "1h") -> None:
        self.symbol = symbol
        self.timeframe = timeframe
        self._cache: pd.DataFrame = _synthetic_ohlcv()

    async def latest(self) -> pd.DataFrame:
        """Return the most recent OHLCV DataFrame (cached)."""
        # Sprint 2: fetch from CCXT / Redis here
        return self._cache.copy()

    async def stream(self, interval: float = 5.0) -> AsyncIterator[pd.DataFrame]:
        """
        Async generator — yields a fresh OHLCV snapshot every `interval` seconds.
        In Sprint 1 this appends a synthetic bar; Sprint 2 replaces with live data.
        """
        while True:
            await asyncio.sleep(interval)
            self._append_synthetic_bar()
            yield self._cache.copy()

    def _append_synthetic_bar(self) -> None:
        last_close = float(self._cache["close"].iloc[-1])
        change = last_close * random.uniform(-0.005, 0.005)
        close = last_close + change
        bar = pd.DataFrame([[
            datetime.now(timezone.utc).timestamp() * 1000,
            last_close,
            max(last_close, close) * 1.001,
            min(last_close, close) * 0.999,
            close,
            random.uniform(10, 300),
        ]], columns=_COLUMNS)
        self._cache = pd.concat([self._cache, bar], ignore_index=True).tail(500)
