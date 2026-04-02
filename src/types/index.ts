export type SecretTab = 'dashboard' | 'strategy-vault' | 'trades' | 'backtest' | 'strategies' | 'connections' | 'knowledge' | 'news' | 'scraper' | 'yolo'

export interface Position {
  id: string
  symbol: string
  side: 'LONG' | 'SHORT'
  entry: number
  current: number
  pnl: number
  duration: string
}

export interface Strategy {
  id: string
  name: string
  codename: string
  status: 'ACTIVE' | 'PAUSED' | 'STOPPED'
  signal: 'LONG' | 'SHORT' | 'FLAT'
  confidence: number
  pnlToday: number
  description: string
}

export interface Trade {
  id: string
  time: string
  strategy: string
  symbol: string
  side: 'LONG' | 'SHORT'
  pnl: number
}

export interface RiskLimit {
  label: string
  current: number
  max: number
  unit: string
}

export const APEX_RISK = {
  maxRiskPerTrade: 0.02,
  dailyDDLimit: 0.05,
  weeklyDDLimit: 0.10,
  maxOpenPositions: 3,
  maxDailyTrades: 8,
  correlationThreshold: 0.7,
  minBalance: 2500,
  startingCapital: 5000,
} as const
