from enum import Enum
from dataclasses import dataclass, field
from typing import Optional


class SignalType(str, Enum):
    BUY = "buy"
    SELL = "sell"
    CLOSE = "close"


@dataclass
class Signal:
    type: SignalType
    confidence: float = 1.0          # 0.0 – 1.0; used for position sizing
    price: Optional[float] = None    # None = market order
    notes: str = ""
