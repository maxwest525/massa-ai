import { useState, useMemo } from 'react'
import { mockTrades } from '../../data/mockData'

export default function TradesTab() {
  const [filter, setFilter] = useState('All')
  const strategies = ['All', ...new Set(mockTrades.map(t => t.strategy))]

  const filtered = useMemo(() => {
    if (filter === 'All') return mockTrades
    return mockTrades.filter(t => t.strategy === filter)
  }, [filter])

  const totalPnl = filtered.reduce((sum, t) => sum + t.pnl, 0)
  const winRate = (filtered.filter(t => t.pnl > 0).length / filtered.length * 100).toFixed(1)

  return (
    <div className="p-6 space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total P&L', value: `${totalPnl >= 0 ? '+' : ''}$${totalPnl.toFixed(2)}`, color: totalPnl >= 0 ? 'text-[var(--color-green)]' : 'text-[var(--color-red)]' },
          { label: 'Win Rate', value: `${winRate}%`, color: 'text-white' },
          { label: 'Total Trades', value: `${filtered.length}`, color: 'text-white' },
          { label: 'Avg P&L', value: `$${(totalPnl / filtered.length).toFixed(2)}`, color: totalPnl >= 0 ? 'text-[var(--color-green)]' : 'text-[var(--color-red)]' },
        ].map(card => (
          <div key={card.label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
            <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-dim)] mb-1">{card.label}</div>
            <div className={`text-xl font-semibold font-mono ${card.color}`}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Trades table */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-dim)]">Trade Log</h3>
          <div className="flex gap-1">
            {strategies.map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                  filter === s ? 'bg-[var(--color-green)] text-black' : 'text-[var(--color-text-muted)] hover:text-white'
                }`}
              >
                {s}
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
            {filtered.map(trade => (
              <tr key={trade.id} className="border-t border-[var(--color-border)] text-[13px]">
                <td className="py-3 text-[var(--color-text-muted)]">{trade.time}</td>
                <td className="py-3">{trade.strategy}</td>
                <td className="py-3 font-mono font-medium">{trade.symbol}</td>
                <td className="py-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    trade.side === 'LONG' ? 'bg-[var(--color-green-dim)] text-[var(--color-green)]' : 'bg-[var(--color-red-dim)] text-[var(--color-red)]'
                  }`}>{trade.side}</span>
                </td>
                <td className={`py-3 text-right font-mono font-semibold ${trade.pnl >= 0 ? 'text-[var(--color-green)]' : 'text-[var(--color-red)]'}`}>
                  {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
