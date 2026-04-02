import { useState } from 'react'
import { Play, Calendar, BarChart3 } from 'lucide-react'
import { mockStrategies } from '../../data/mockData'

export default function BacktestTab() {
  const [strategy, setStrategy] = useState(mockStrategies[0].name)
  const [dateRange, setDateRange] = useState({ from: '2025-01-01', to: '2025-03-31' })
  const [running, setRunning] = useState(false)
  const [results, setResults] = useState<null | { totalReturn: number; sharpe: number; maxDD: number; winRate: number; trades: number }>(null)

  const runBacktest = () => {
    setRunning(true)
    setResults(null)
    setTimeout(() => {
      setResults({
        totalReturn: 18.4,
        sharpe: 1.82,
        maxDD: -6.3,
        winRate: 67.2,
        trades: 142,
      })
      setRunning(false)
    }, 2000)
  }

  return (
    <div className="p-6 space-y-4">
      {/* Config */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-dim)] mb-4">Backtest Configuration</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] text-[var(--color-text-muted)] block mb-1.5">Strategy</label>
            <select
              value={strategy}
              onChange={e => setStrategy(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[13px] outline-none"
            >
              {mockStrategies.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-[var(--color-text-muted)] block mb-1.5">From</label>
            <input
              type="date"
              value={dateRange.from}
              onChange={e => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[13px] outline-none"
            />
          </div>
          <div>
            <label className="text-[11px] text-[var(--color-text-muted)] block mb-1.5">To</label>
            <input
              type="date"
              value={dateRange.to}
              onChange={e => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[13px] outline-none"
            />
          </div>
        </div>
        <button
          onClick={runBacktest}
          disabled={running}
          className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-green)] text-black font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-50"
        >
          <Play size={14} />
          {running ? 'Running...' : 'Run Backtest'}
        </button>
      </div>

      {/* Results */}
      {results && (
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: 'Total Return', value: `${results.totalReturn}%`, color: 'text-[var(--color-green)]' },
            { label: 'Sharpe Ratio', value: results.sharpe.toFixed(2), color: 'text-white' },
            { label: 'Max Drawdown', value: `${results.maxDD}%`, color: 'text-[var(--color-red)]' },
            { label: 'Win Rate', value: `${results.winRate}%`, color: 'text-white' },
            { label: 'Total Trades', value: `${results.trades}`, color: 'text-white' },
          ].map(r => (
            <div key={r.label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
              <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-dim)] mb-1">{r.label}</div>
              <div className={`text-xl font-semibold font-mono ${r.color}`}>{r.value}</div>
            </div>
          ))}
        </div>
      )}

      {!results && !running && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-16 text-center">
          <BarChart3 size={32} className="mx-auto mb-3 text-[var(--color-text-dim)]" />
          <p className="text-[var(--color-text-muted)] text-sm">Configure and run a backtest to see results</p>
        </div>
      )}

      {running && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-16 text-center">
          <div className="w-8 h-8 border-2 border-[var(--color-green)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[var(--color-text-muted)] text-sm">Running backtest for {strategy}...</p>
        </div>
      )}
    </div>
  )
}
