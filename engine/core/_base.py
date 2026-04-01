"""
BaseStrategy — the contract every plugin must implement.

Plugin authors extend this class and implement on_tick().
The engine calls on_tick() on each new OHLCV bar; the strategy
returns a Signal or None.  Params are injected from config.yaml
and updated live on hot-reload without restarting the strategy.
"""

from abc import ABC, abstractmethod
from typing import Optional
import pandas as pd

from engine.models.signal import Signal


class ParamProxy:
    """
    Thin wrapper around the params dict loaded from config.yaml.
    Gives attribute-style access: self.params.fast_period
    """

    def __init__(self, data: dict) -> None:
        object.__setattr__(self, "_data", data)

    def __getattr__(self, name: str):
        try:
            return self._data[name]
        except KeyError:
            raise AttributeError(f"Strategy has no parameter '{name}'") from None

    def __setattr__(self, name: str, value) -> None:
        self._data[name] = value

    def get(self, name: str, default=None):
        return self._data.get(name, default)

    def as_dict(self) -> dict:
        return dict(self._data)


class BaseStrategy(ABC):
    """
    Extend this class to create a plugin strategy.

    Class name convention: <CamelCase folder name> + "Strategy"
    e.g. folder "ema_cross" → class "EmaCrossStrategy"

    Attributes set by the loader before first tick:
        strategy_id  str          from config.yaml `id`
        symbol       str          from config.yaml `symbol`
        params       ParamProxy   live param values, updated on hot-reload
        risk_limits  dict         from config.yaml `risk_limits`
    """

    strategy_id: str = ""
    symbol: str = ""
    params: ParamProxy
    risk_limits: dict

    def _init_from_config(self, config: dict) -> None:
        """Called by loader — do not call from strategy code."""
        self.strategy_id = config["id"]
        self.symbol = config.get("symbol", "BTC/USDT")
        self.risk_limits = config.get("risk_limits", {})
        raw_params = {k: v["default"] for k, v in config.get("parameters", {}).items()}
        self.params = ParamProxy(raw_params)

    def _update_param(self, key: str, value) -> None:
        """Called by loader on hot-reload — do not call from strategy code."""
        setattr(self.params, key, value)

    @abstractmethod
    def on_tick(self, ohlcv: pd.DataFrame) -> Optional[Signal]:
        """
        Called on every new OHLCV bar.

        Args:
            ohlcv: DataFrame with columns [timestamp, open, high, low, close, volume].
                   Sorted ascending; the last row is the most recent bar.

        Returns:
            Signal to act on, or None to pass.
        """

    def on_fill(self, order_id: str, fill_price: float, qty: float) -> None:
        """Optional: called when one of this strategy's orders is filled."""

    def on_stop(self) -> None:
        """Optional: called when the strategy is disabled. Release resources here."""
