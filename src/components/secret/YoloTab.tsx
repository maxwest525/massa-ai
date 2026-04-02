import { useState } from 'react'
import { Flame, AlertTriangle, Zap } from 'lucide-react'

export default function YoloTab() {
  const [symbol, setSymbol] = useState('MES')
  const [side, setSide] = useState<'LONG' | 'SHORT'>('LONG')
  const [size, setSize] = useState('1')
  const [confirmed, setConfirmed] = useState(false)

  return (
    <div className="p-6 space-y-4">
      {/* Warning */}
      <div className="rounded-xl border border-[var(--color-yellow)] bg-[#ffd60a0d] p-4 flex items-start gap-3">
        <AlertTriangle size={18} className="text-[var(--color-yellow)] mt-0.5 shrink-0" />
        <div>
          <div className="text-[13px] font-semibold text-[var(--color-yellow)]">High Risk Mode</div>
          <div className="text-[12px] text-[var(--color-text-muted)] mt-0.5">YOLO trades bypass normal risk management rules. Use at your own risk. Manual override only.</div>
        </div>
      </div>

      {/* Quick trade form */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Flame size={16} className="text-[var(--color-red)]" />
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-dim)]">Quick Trade</h3>
        </div>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-[11px] text-[var(--color-text-muted)] block mb-1.5">Symbol</label>
            <select
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[13px] outline-none"
            >
              {['MES', 'MNQ', 'ES', 'NQ', 'BTC/USD', 'ETH/USD'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-[var(--color-text-muted)] block mb-1.5">Side</label>
            <div className="flex gap-2">
              <button
                onClick={() => setSide('LONG')}
                className={`flex-1 py-2.5 rounded-lg text-[12px] font-semibold transition-all ${
                  side === 'LONG' ? 'bg-[var(--color-green)] text-black' : 'bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)]'
                }`}
              >LONG</button>
              <button
                onClick={() => setSide('SHORT')}
                className={`flex-1 py-2.5 rounded-lg text-[12px] font-semibold transition-all ${
                  side === 'SHORT' ? 'bg-[var(--color-red)] text-white' : 'bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[var(--color-text-muted)]'
                }`}
              >SHORT</button>
            </div>
          </div>
          <div>
            <label className="text-[11px] text-[var(--color-text-muted)] block mb-1.5">Contracts</label>
            <input
              type="number"
              value={size}
              onChange={e => setSize(e.target.value)}
              min="1"
              className="w-full px-3 py-2.5 rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-border)] text-[13px] font-mono outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} className="accent-[var(--color-red)]" />
            <span className="text-[12px] text-[var(--color-text-muted)]">I understand this bypasses risk rules</span>
          </label>
        </div>

        <button
          disabled={!confirmed}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--color-red)] text-white font-semibold text-sm hover:brightness-110 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Zap size={14} />
          Send It
        </button>
      </div>

      {/* Recent YOLO trades */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-dim)] mb-4">YOLO History</h3>
        <table className="w-full">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-dim)]">
              <th className="text-left pb-3 font-medium">Time</th>
              <th className="text-left pb-3 font-medium">Symbol</th>
              <th className="text-left pb-3 font-medium">Side</th>
              <th className="text-right pb-3 font-medium">P&L</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-[var(--color-border)] text-[13px]">
              <td className="py-3 text-[var(--color-text-muted)]">Mar 31</td>
              <td className="py-3 font-mono font-medium">MES</td>
              <td className="py-3"><span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--color-red-dim)] text-[var(--color-red)]">SHORT</span></td>
              <td className="py-3 text-right font-mono font-semibold text-[var(--color-red)]">-24.58</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
