from dataclasses import dataclass
from typing import Optional
from engine.models.signal import SignalType


@dataclass
class Position:
    strategy_id: str
    symbol: str
    side: SignalType
    qty: float
    avg_entry: float
    unrealized_pnl: float = 0.0
    order_id: Optional[str] = None

    def update_unrealized(self, current_price: float) -> None:
        multiplier = 1 if self.side == SignalType.BUY else -1
        self.unrealized_pnl = multiplier * (current_price - self.avg_entry) * self.qty
