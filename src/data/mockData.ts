import type { Position, Strategy, Trade, RiskLimit } from '../types'

export const mockPositions: Position[] = [
  {
    id: '1',
    symbol: 'MES',
    side: 'LONG',
    entry: 5312.50,
    current: 5328.75,
    pnl: 81.25,
    duration: '2h 14m',
  },
  {
    id: '2',
    symbol: 'ETH/USD',
    side: 'LONG',
    entry: 3482.10,
    current: 3501.40,
    pnl: 19.30,
    duration: '45m',
  },
]

export const mockStrategies: Strategy[] = [
  {
    id: '1',
    name: 'Momentum Rider',
    codename: 'APEX-Alpha',
    status: 'ACTIVE',
    signal: 'LONG',
    confidence: 73,
    pnlToday: 84.20,
    description: 'Daily Momentum — MES/MNQ daily bars, 20/50 EMA + ADX + RSI',
  },
  {
    id: '2',
    name: 'Snap Back',
    codename: 'APEX-Beta',
    status: 'ACTIVE',
    signal: 'SHORT',
    confidence: 68,
    pnlToday: 142.41,
    description: 'Mean Reversion — 15-min RTH, Bollinger 20,2.5 + RSI + VWAP',
  },
  {
    id: '3',
    name: 'Grid Harvest',
    codename: 'APEX-Gamma',
    status: 'ACTIVE',
    signal: 'LONG',
    confidence: 81,
    pnlToday: 45.77,
    description: 'Grid Bot — BTC/ETH, 30-day BB bounds, 10-20 grid levels',
  },
  {
    id: '4',
    name: 'YOLO Play',
    codename: 'APEX-Delta',
    status: 'PAUSED',
    signal: 'FLAT',
    confidence: 0,
    pnlToday: -24.58,
    description: 'High-risk momentum scalper — manual override only',
  },
]

export const mockTrades: Trade[] = [
  { id: '1', time: 'Mar 31', strategy: 'Grid Harvest', symbol: 'ETH/USD', side: 'SHORT', pnl: 142.41 },
  { id: '2', time: 'Mar 31', strategy: 'Grid Harvest', symbol: 'ETH/USD', side: 'SHORT', pnl: 145.77 },
  { id: '3', time: 'Mar 31', strategy: 'YOLO', symbol: 'MES', side: 'SHORT', pnl: -24.58 },
  { id: '4', time: 'Mar 30', strategy: 'Momentum Rider', symbol: 'MES', side: 'LONG', pnl: 67.50 },
  { id: '5', time: 'Mar 30', strategy: 'Snap Back', symbol: 'MNQ', side: 'SHORT', pnl: 93.25 },
  { id: '6', time: 'Mar 30', strategy: 'Grid Harvest', symbol: 'BTC/USD', side: 'LONG', pnl: 210.00 },
  { id: '7', time: 'Mar 29', strategy: 'Momentum Rider', symbol: 'MES', side: 'LONG', pnl: 45.00 },
  { id: '8', time: 'Mar 29', strategy: 'Grid Harvest', symbol: 'ETH/USD', side: 'SHORT', pnl: 88.30 },
]

export const mockRiskLimits: RiskLimit[] = [
  { label: 'Open Positions', current: 2, max: 3, unit: '' },
  { label: 'Daily Trades', current: 4, max: 8, unit: '' },
  { label: 'Daily Drawdown', current: 1.82, max: 5, unit: '%' },
  { label: 'Weekly Drawdown', current: 3.1, max: 10, unit: '%' },
  { label: 'Risk Per Trade', current: 1.5, max: 2, unit: '%' },
]

export const equityCurveData = [
  5000, 5020, 4980, 5050, 5100, 5080, 5150, 5200, 5180, 5250,
  5300, 5280, 5350, 5400, 5380, 5450, 5500, 5520, 5600, 5580,
  5650, 5700, 5720, 5800, 5850, 5900, 5880, 5950, 6000, 6050,
  6020, 6100, 6150, 6200, 6180, 6250, 6300, 6350, 6400, 6380,
  6450, 6500, 6520, 6580, 6600, 6650, 6700, 6750, 6800, 6845,
]
