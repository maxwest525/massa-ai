# xerox-bot — Definitive Build Spec (Plugin Architecture)

## Project Overview

**xerox-bot** is a modular, plugin-based algorithmic trading bot with a live dashboard.
Strategies are self-contained YAML + Python pairs — drop one in, it appears in the dashboard with auto-generated controls. No framework code to touch.

**Stack:**
- **Backend**: Python 3.11+, FastAPI, WebSockets, asyncio
- **Data**: CCXT (exchange abstraction), Pandas, Redis (tick cache)
- **Dashboard**: React + TypeScript, Vite, TailwindCSS, shadcn/ui
- **Config**: YAML (per-strategy), .env (secrets), hot-reloaded by engine
- **Infra**: Docker Compose (bot + redis + dashboard)

---

## Repository Layout

```
xerox-bot/
├── CLAUDE.md                  # This file
├── docker-compose.yml
├── .env.example
├── knowledge/                 # Reference docs (do not modify)
│   ├── 01_architecture.md
│   ├── 02_exchange_api.md
│   ├── 03_risk_management.md
│   ├── 04_strategy_catalog.md
│   ├── 05_dashboard_spec.md
│   └── 06_deployment.md
├── engine/                    # Python backend
│   ├── main.py                # FastAPI entrypoint + WebSocket hub
│   ├── core/
│   │   ├── engine.py          # Strategy runner / event loop
│   │   ├── loader.py          # Plugin discovery & hot-reload
│   │   ├── risk.py            # Global risk guard
│   │   ├── order_manager.py   # Order lifecycle
│   │   └── data_feed.py       # CCXT tick fetcher → Redis
│   ├── strategies/            # Plugin folder — drop files here
│   │   ├── _base.py           # BaseStrategy ABC
│   │   ├── ema_cross/
│   │   │   ├── config.yaml
│   │   │   └── strategy.py
│   │   ├── grid/
│   │   │   ├── config.yaml
│   │   │   └── strategy.py
│   │   ├── mean_revert/
│   │   │   ├── config.yaml
│   │   │   └── strategy.py
│   │   └── breakout/
│   │       ├── config.yaml
│   │       └── strategy.py
│   ├── models/
│   │   ├── trade.py
│   │   ├── position.py
│   │   └── signal.py
│   └── utils/
│       ├── logger.py
│       └── metrics.py
├── dashboard/                 # React frontend
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/
│   │   │   ├── StrategyPanel.tsx    # Auto-renders controls from YAML schema
│   │   │   ├── PortfolioView.tsx
│   │   │   ├── TradeLog.tsx
│   │   │   ├── PnLChart.tsx
│   │   │   └── RiskGauge.tsx
│   │   ├── hooks/
│   │   │   ├── useWebSocket.ts
│   │   │   └── useStrategyConfig.ts
│   │   └── types/
│   │       ├── strategy.ts
│   │       └── trade.ts
│   ├── package.json
│   └── vite.config.ts
└── tests/
    ├── test_loader.py
    ├── test_risk.py
    └── strategies/
        └── test_ema_cross.py
```

---

## Plugin Architecture

### The Contract

Every strategy is a folder inside `engine/strategies/` containing exactly two files:

1. **`config.yaml`** — declarative parameter schema + metadata
2. **`strategy.py`** — a Python class extending `BaseStrategy`

The engine's `loader.py` scans the folder at startup and on file change, imports the class, and registers it. The dashboard's `StrategyPanel` reads the YAML schema and renders sliders/toggles automatically.

---

### `config.yaml` Schema

```yaml
# engine/strategies/ema_cross/config.yaml
id: ema_cross
name: "EMA Crossover"
version: "1.0.0"
description: "Trades the crossover of a fast and slow EMA"
symbol: "BTC/USDT"
exchange: "binance"
enabled: false

parameters:
  fast_period:
    label: "Fast EMA Period"
    type: integer
    default: 9
    min: 3
    max: 50
    step: 1

  slow_period:
    label: "Slow EMA Period"
    type: integer
    default: 21
    min: 10
    max: 200
    step: 1

  atr_multiplier:
    label: "ATR Stop Multiplier"
    type: float
    default: 1.5
    min: 0.5
    max: 5.0
    step: 0.1

  risk_per_trade:
    label: "Risk Per Trade (%)"
    type: float
    default: 1.0
    min: 0.1
    max: 5.0
    step: 0.1

  timeframe:
    label: "Timeframe"
    type: enum
    default: "1h"
    options: ["1m", "5m", "15m", "1h", "4h", "1d"]

risk_limits:
  max_position_pct: 10.0   # max % of portfolio in one position
  daily_loss_limit: 3.0    # halt strategy if daily loss exceeds % of portfolio
  max_open_trades: 3
```

**Supported parameter types:** `integer`, `float`, `boolean`, `enum`, `string`

---

### `strategy.py` Contract

```python
# engine/strategies/ema_cross/strategy.py
from engine.core._base import BaseStrategy, Signal
from engine.models.signal import SignalType
import pandas as pd

class EmaCrossStrategy(BaseStrategy):
    """Must be named exactly: <CamelCase of folder name> + Strategy"""

    def on_tick(self, ohlcv: pd.DataFrame) -> Signal | None:
        """
        Called every tick with fresh OHLCV data.
        Return a Signal to trade, or None to do nothing.
        Access self.params for current YAML parameter values.
        """
        fast = ohlcv['close'].ewm(span=self.params.fast_period).mean()
        slow = ohlcv['close'].ewm(span=self.params.slow_period).mean()

        if fast.iloc[-2] < slow.iloc[-2] and fast.iloc[-1] > slow.iloc[-1]:
            return Signal(type=SignalType.BUY, confidence=0.8)
        if fast.iloc[-2] > slow.iloc[-2] and fast.iloc[-1] < slow.iloc[-1]:
            return Signal(type=SignalType.SELL, confidence=0.8)
        return None

    def on_fill(self, order_id: str, fill_price: float, qty: float) -> None:
        """Optional: called when an order is filled"""
        pass

    def on_stop(self) -> None:
        """Optional: cleanup when strategy is disabled"""
        pass
```

---

### Plugin Loader (`engine/core/loader.py`)

- Uses `watchdog` to monitor `engine/strategies/` for file changes
- On change: re-imports the module, replaces the live instance, preserves open positions
- Exposes `registry: dict[str, BaseStrategy]` to the engine
- Auto-discovers by: folder exists + `config.yaml` + `strategy.py` present

---

### Hot-Reload Flow

```
User moves slider in dashboard
  → PUT /api/strategies/{id}/params  { key: value }
  → engine writes value back to config.yaml
  → watchdog detects change
  → loader re-reads YAML, updates self.params on live instance
  → no restart needed
```

---

## Core Engine (`engine/core/engine.py`)

- Single asyncio event loop
- Per-strategy coroutine, rate-limited to exchange API constraints
- Passes fresh OHLCV data to `strategy.on_tick()`
- Routes Signal → risk.py → order_manager.py
- Broadcasts state via WebSocket to dashboard

---

## Risk Guard (`engine/core/risk.py`)

Enforced globally, before any order reaches the exchange:

| Check | Source |
|---|---|
| Max position size | strategy `risk_limits.max_position_pct` |
| Daily loss limit | strategy `risk_limits.daily_loss_limit` |
| Max open trades | strategy `risk_limits.max_open_trades` |
| Global kill switch | `.env: KILL_SWITCH=true` (env var, no restart needed) |
| Exchange balance check | live API call before each order |

---

## API Endpoints (`engine/main.py`)

```
GET  /api/strategies                    → list all plugins + current params
GET  /api/strategies/{id}              → single strategy detail
PUT  /api/strategies/{id}/params       → update param(s), triggers hot-reload
POST /api/strategies/{id}/enable       → enable strategy
POST /api/strategies/{id}/disable      → disable strategy
GET  /api/portfolio                    → current positions + PnL
GET  /api/trades                       → trade history (paginated)
GET  /api/health                       → engine status

WS   /ws                               → real-time stream: ticks, fills, PnL, errors
```

---

## Dashboard (`dashboard/src/`)

### `StrategyPanel.tsx`

- Fetches strategy list from `/api/strategies`
- For each strategy, renders controls by reading `parameters` from the YAML schema:
  - `integer` / `float` → `<Slider>` with min/max/step
  - `boolean` → `<Switch>`
  - `enum` → `<Select>`
  - `string` → `<Input>`
- On slider change: debounce 300ms → PUT to `/api/strategies/{id}/params`
- Enable/Disable toggle calls the corresponding endpoint

### `PnLChart.tsx`

- Real-time equity curve from WebSocket stream
- Per-strategy breakdown + portfolio total
- Time range selector: 1H, 24H, 7D, 30D

### `RiskGauge.tsx`

- Visual meter per strategy: daily loss used vs limit
- Red flash + alert when > 80% of daily limit consumed

---

## Environment Variables (`.env.example`)

```bash
# Exchange
EXCHANGE=binance
API_KEY=your_api_key
API_SECRET=your_api_secret
PAPER_TRADING=true          # true = use exchange sandbox / no real orders

# Risk
KILL_SWITCH=false           # set to true to halt ALL orders immediately

# Infrastructure
REDIS_URL=redis://localhost:6379
ENGINE_PORT=8000
DASHBOARD_PORT=3000

# Logging
LOG_LEVEL=INFO
```

---

## Sprint Plan

### Sprint 1 — Foundation
- [ ] Repo layout, docker-compose, .env.example
- [ ] `BaseStrategy` ABC (`_base.py`)
- [ ] `loader.py` with watchdog discovery (no hot-reload yet)
- [ ] `engine.py` stub — asyncio loop, calls `on_tick()`, logs output
- [ ] `ema_cross` plugin (config.yaml + strategy.py) as reference impl
- [ ] FastAPI app with `/api/strategies` and `/api/health`
- [ ] Basic React dashboard shell: sidebar + strategy list

### Sprint 2 — Data + Execution
- [ ] `data_feed.py`: CCXT OHLCV fetcher, caches to Redis
- [ ] `order_manager.py`: place/cancel/track orders via CCXT
- [ ] `risk.py`: all guards implemented and tested
- [ ] Paper trading mode (log orders, don't send)
- [ ] `/api/portfolio` and `/api/trades` endpoints

### Sprint 3 — Hot-Reload + Param Control
- [ ] `watchdog` integration in loader — live reload on file change
- [ ] `PUT /api/strategies/{id}/params` writes YAML + triggers reload
- [ ] Dashboard sliders wired to API with 300ms debounce
- [ ] Enable/Disable toggle functional

### Sprint 4 — Strategy Pack
- [ ] `grid/` plugin — grid trading with configurable levels
- [ ] `mean_revert/` plugin — Bollinger Band mean reversion
- [ ] `breakout/` plugin — volatility breakout with ATR sizing
- [ ] Each with full config.yaml + tested strategy.py

### Sprint 5 — Real-Time Dashboard
- [ ] WebSocket hub in engine, broadcasts on every tick + fill
- [ ] `useWebSocket` hook in dashboard
- [ ] `PnLChart` live equity curve
- [ ] `RiskGauge` daily loss meter with red flash
- [ ] `TradeLog` live scrolling fills

### Sprint 6 — Hardening + Deploy
- [ ] Full test suite: loader, risk, each strategy (backtestable tick sequences)
- [ ] GitHub Actions: lint (ruff, mypy) + test on push
- [ ] Docker multi-stage builds (engine + dashboard)
- [ ] Deployment docs: VPS + systemd or Railway

---

## How to Add a New Strategy

1. Create `engine/strategies/my_strat/config.yaml` — define all parameters with min/max/step
2. Create `engine/strategies/my_strat/strategy.py` — class `MyStratStrategy(BaseStrategy)`
3. Implement `on_tick(ohlcv) → Signal | None`
4. Restart engine (or wait for watchdog hot-reload if engine is running)
5. Strategy appears in dashboard automatically with all sliders rendered from YAML

That's the entire extension contract. No framework files to touch.

---

## Build Instructions for Claude Code

When given a sprint to build, Claude Code should:

1. Read this file fully before writing any code
2. Read all files in `knowledge/` for domain context
3. Build all files for that sprint — do not leave stubs
4. After each file: verify imports resolve, types match, no circular deps
5. Run `pytest tests/` if tests exist and fix failures before moving on
6. Commit with message: `feat(sprintN): <description>`

Start with: **"Build Sprint 1: Foundation"**
