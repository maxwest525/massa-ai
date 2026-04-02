# Xerox Bot — APEX Trading System

A self-contained trading dashboard built with React 19, TypeScript, Vite, and Tailwind CSS 4. Dark terminal aesthetic with neon-green/red accents.

## Features

- **Dashboard** — Open positions (live ticking), equity curve, strategy cards, recent trades, APEX risk limits
- **Trades** — Full trade log with strategy filters and summary stats
- **Backtest** — Configure and run strategy backtests with results
- **Strategies** — PIN-protected vault (PIN: `1337`) with deep-dive, risk metrics, APEX constants
- **Connections** — Data feeds, API keys, broker integrations
- **Knowledge** — IndexedDB-backed file storage with drag-and-drop upload, search, tagging, preview
- **News** — Sentiment feed with bullish/bearish/neutral classification
- **YOLO** — High-risk manual trade entry with risk bypass confirmation

## APEX Risk Rules

| Rule | Limit |
|------|-------|
| Max Risk / Trade | 2% |
| Daily Drawdown | 5% |
| Weekly Drawdown | 10% |
| Max Open Positions | 3 |
| Max Daily Trades | 8 |
| Correlation Threshold | 0.7 |
| Min Balance | $2,500 |
| Starting Capital | $5,000 |

## Tech Stack

- React 19 + TypeScript
- Vite 6
- Tailwind CSS 4
- Lucide React icons
- IndexedDB for knowledge base storage

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Outputs to `dist/` — deploy as a static site.

## Design

- True black backgrounds (`#000`)
- Robinhood green accent (`#00c805`)
- Fonts: Outfit, DM Sans, JetBrains Mono
- Minimal rounded corners, subtle borders
