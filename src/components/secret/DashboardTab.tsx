import { useState, useEffect, useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { mockPositions, mockStrategies, mockTrades, mockRiskLimits, equityCurveData } from '../../data/mockData'

type TradeFilter = 'All' | string

export default function DashboardTab() {
  const [tradeFilter, setTradeFilter] = useState<TradeFilter>('All')
  const [curveRange, setCurveRange] = useState<'1W' | '1M' | '3M' | 'ALL'>('3M')
  const [positions, setPositions] = useState(mockPositions)

  // Tick positions
  useEffect(() => {
    const interval = setInterval(() => {
      setPositions(prev =>
        prev.map(p => {
          const delta = (Math.random() - 0.45) * 1.5
          const newCurrent = +(p.current + delta).toFixed(2)
          return { ...p, current: newCurrent, pnl: +((newCurrent - p.entry) * (p.symbol === 'MES' ? 5 : 1)).toFixed(2) }
        })
      )
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  const filteredTrades = useMemo(() => {
    if (tradeFilter === 'All') return mockTrades
    return mockTrades.filter(t => t.strategy === tradeFilter)
  }, [tradeFilter])

  const strategyFilters = ['All', ...new Set(mockTrades.map(t => t.strategy))]

  return (
    <div className="grid grid-cols-2 gap-4 p-6">
      {/* Open Positions */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-dim)] mb-4">
          Open Positions
        </h3>
        <div className="space-y-5">
          {positions.map(pos => (
            <div key={pos.id}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-semibold text-[15px] font-mono">{pos.symbol}</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    pos.side === 'LONG' ? 'bg-[var(--color-green-dim)] text-[var(--color-green)]' : 'bg-[var(--color-red-dim)] text-[var(--color-red)]'
                  }`}>
                    {pos.side}
                  </span>
                </div>
                <span className={`font-mono font-semibold text-[15px] ${pos.pnl >= 0 ? 'text-[var(--color-green)]' : 'text-[var(--color-red)]'}`}>
                  {pos.pnl >= 0 ? '+' : ''}${pos.pnl.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-[12px] text-[var(--color-text-muted)]">
                <span>Entry: {pos.entry.toLocaleString()}</span>
                <span>Now: {pos.current.toLocaleString()}</span>
              </div>
              {/* Progress bar */}
              <div className="mt-2 h-1 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${pos.pnl >= 0 ? 'bg-[var(--color-green)]' : 'bg-[var(--color-red)]'}`}
                  style={{ width: `${Math.min(Math.abs(pos.pnl) / 2, 100)}%` }}
                />
              </div>
              <div className="text-[11px] text-[var(--color-text-dim)] mt-1">{pos.duration}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Equity Curve */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-dim)]">
            Equity Curve
          </h3>
          <div className="flex gap-1">
            {(['1W', '1M', '3M', 'ALL'] as const).map(range => (
              <button
                key={range}
                onClick={() => setCurveRange(range)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  curveRange === range
                    ? 'bg-[var(--color-green)] text-black'
                    : 'text-[var(--color-text-muted)] hover:text-white'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>
        <EquityCurveSVG data={equityCurveData} />
      </div>

      {/* Strategies */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-dim)] mb-4">
          Strategies
        </h3>
        <div className="space-y-3">
          {mockStrategies.map(strat => (
            <StrategyCard key={strat.id} strategy={strat} />
          ))}
        </div>
      </div>

      {/* Recent Trades */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-dim)]">
            Recent Trades
          </h3>
          <div className="flex gap-1">
            {strategyFilters.map(f => (
              <button
                key={f}
                onClick={() => setTradeFilter(f)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  tradeFilter === f
                    ? 'bg-[var(--color-green)] text-black'
                    : 'text-[var(--color-text-muted)] hover:text-white'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-dim)]">
              <th className="text-left pb-3 font-medium">Time</th>
              <th className="text-left pb-3 font-medium">Strategy</th>
              <th className="text-left pb-3 font-medium">Symbol</th>
              <th className="text-left pb-3 font-medium">Side</th>
              <th className="text-right pb-3 font-medium">P&L</th>
            </tr>
          </thead>
          <tbody>
            {filteredTrades.map(trade => (
              <tr key={trade.id} className="border-t border-[var(--color-border)] text-[13px]">
                <td className="py-3 text-[var(--color-text-muted)]">{trade.time}</td>
                <td className="py-3">{trade.strategy}</td>
                <td className="py-3 font-mono font-medium">{trade.symbol}</td>
                <td className="py-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    trade.side === 'LONG' ? 'bg-[var(--color-green-dim)] text-[var(--color-green)]' : 'bg-[var(--color-red-dim)] text-[var(--color-red)]'
                  }`}>
                    {trade.side}
                  </span>
                </td>
                <td className={`py-3 text-right font-mono font-semibold ${trade.pnl >= 0 ? 'text-[var(--color-green)]' : 'text-[var(--color-red)]'}`}>
                  {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Risk Limits Bar - full width */}
      <div className="col-span-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-dim)] mb-4">
          APEX Risk Limits
        </h3>
        <div className="grid grid-cols-5 gap-4">
          {mockRiskLimits.map(limit => {
            const pct = (limit.current / limit.max) * 100
            const isWarning = pct > 70
            const isDanger = pct > 90
            return (
              <div key={limit.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] text-[var(--color-text-muted)]">{limit.label}</span>
                  <span className="text-[12px] font-mono font-medium">
                    {limit.current}{limit.unit} / {limit.max}{limit.unit}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDanger ? 'bg-[var(--color-red)]' : isWarning ? 'bg-[var(--color-yellow)]' : 'bg-[var(--color-green)]'
                    }`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function StrategyCard({ strategy }: { strategy: typeof mockStrategies[0] }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="font-semibold text-[14px]">{strategy.name}</span>
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
          strategy.status === 'ACTIVE'
            ? 'bg-[var(--color-green-dim)] text-[var(--color-green)]'
            : 'bg-[var(--color-surface-3)] text-[var(--color-text-dim)]'
        }`}>
          {strategy.status}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-dim)] mb-0.5">Signal</div>
          <div className={`text-[14px] font-bold font-mono flex items-center gap-1 ${
            strategy.signal === 'LONG' ? 'text-[var(--color-green)]'
            : strategy.signal === 'SHORT' ? 'text-[var(--color-red)]'
            : 'text-[var(--color-text-muted)]'
          }`}>
            {strategy.signal === 'LONG' ? <TrendingUp size={13} /> : strategy.signal === 'SHORT' ? <TrendingDown size={13} /> : <Minus size={13} />}
            {strategy.signal}
          </div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-dim)] mb-0.5">Confidence</div>
          <div className="text-[14px] font-semibold font-mono">{strategy.confidence}%</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-dim)] mb-0.5">P&L Today</div>
          <div className={`text-[14px] font-semibold font-mono ${strategy.pnlToday >= 0 ? 'text-[var(--color-green)]' : 'text-[var(--color-red)]'}`}>
            {strategy.pnlToday >= 0 ? '+' : ''}{strategy.pnlToday.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  )
}

function EquityCurveSVG({ data }: { data: number[] }) {
  const width = 560
  const height = 220
  const padding = { top: 10, right: 10, bottom: 25, left: 10 }
  const chartW = width - padding.left - padding.right
  const chartH = height - padding.top - padding.bottom

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((val, i) => ({
    x: padding.left + (i / (data.length - 1)) * chartW,
    y: padding.top + chartH - ((val - min) / range) * chartH,
  }))

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const areaPath = `${linePath} L${points[points.length - 1].x},${height - padding.bottom} L${points[0].x},${height - padding.bottom} Z`

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
      <defs>
        <linearGradient id="curveGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-green)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--color-green)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#curveGrad)" />
      <path d={linePath} fill="none" stroke="var(--color-green)" strokeWidth="2" />
      {/* Labels */}
      <text x={padding.left} y={height - 5} fill="var(--color-text-dim)" fontSize="10" fontFamily="var(--font-mono)">Dec 31</text>
      <text x={width - padding.right} y={height - 5} fill="var(--color-text-dim)" fontSize="10" fontFamily="var(--font-mono)" textAnchor="end">Mar 31</text>
    </svg>
  )
}
