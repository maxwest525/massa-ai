from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
from engine.models.signal import SignalType


@dataclass
class Trade:
    id: str
    strategy_id: str
    symbol: str
    side: SignalType
    qty: float
    entry_price: float
    exit_price: Optional[float] = None
    opened_at: datetime = field(default_factory=datetime.utcnow)
    closed_at: Optional[datetime] = None
    pnl: Optional[float] = None
    fees: float = 0.0

    @property
    def is_open(self) -> bool:
        return self.exit_price is None

    def close(self, exit_price: float, fees: float = 0.0) -> None:
        self.exit_price = exit_price
        self.closed_at = datetime.utcnow()
        self.fees += fees
        multiplier = 1 if self.side == SignalType.BUY else -1
        self.pnl = multiplier * (exit_price - self.entry_price) * self.qty - self.fees
