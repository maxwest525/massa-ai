import { useState, useEffect } from 'react'
import { Power, Bell, Settings, Columns3, Sun } from 'lucide-react'
import { useUI } from '../../context/UIContext'

export default function TopNav() {
  const { setKillSwitchOpen } = useUI()
  const [account, setAccount] = useState(6845.71)
  const [dayPnl] = useState(124.31)

  // Ticking account value
  useEffect(() => {
    const interval = setInterval(() => {
      setAccount(prev => prev + (Math.random() - 0.48) * 2)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="h-16 border-b border-[var(--color-border)] flex items-center justify-between px-6 bg-[var(--color-bg)]">
      {/* Left: Bot status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[var(--color-green)] flex items-center justify-center font-mono font-bold text-black text-sm">
            X
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-[15px] tracking-tight font-mono">XEROX BOT</span>
              <span className="flex items-center gap-1.5 text-[11px] text-[var(--color-text-muted)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-green)] animate-pulse" />
                RUNNING
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Account + Kill */}
      <div className="flex items-center gap-6">
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-dim)]">Account</div>
          <div className="text-xl font-semibold font-mono tracking-tight">
            ${account.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] uppercase tracking-[0.1em] text-[var(--color-text-dim)]">Day P&L</div>
          <div className={`text-xl font-semibold font-mono tracking-tight ${dayPnl >= 0 ? 'text-[var(--color-green)]' : 'text-[var(--color-red)]'}`}>
            {dayPnl >= 0 ? '+' : ''}${dayPnl.toFixed(2)}
            <span className="text-sm ml-1 text-[var(--color-text-muted)]">({((dayPnl / 6845.71) * 100).toFixed(2)}%)</span>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-2">
          <button className="p-2 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] transition-colors">
            <Bell size={16} />
          </button>
          <button className="p-2 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] transition-colors">
            <Sun size={16} />
          </button>
          <button className="p-2 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] transition-colors">
            <Columns3 size={16} />
          </button>
          <button className="p-2 rounded-lg hover:bg-[var(--color-surface)] text-[var(--color-text-muted)] transition-colors">
            <Settings size={16} />
          </button>
          <div className="w-8 h-8 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center text-xs font-semibold text-[var(--color-text-muted)]">
            M
          </div>
        </div>

        <button
          onClick={() => setKillSwitchOpen(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--color-red)] text-[var(--color-red)] text-sm font-semibold hover:bg-[var(--color-red-dim)] transition-all"
        >
          <Power size={14} />
          KILL
        </button>
      </div>
    </header>
  )
}
