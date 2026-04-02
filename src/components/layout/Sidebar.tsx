import { LayoutDashboard, Lock, BarChart3, Link2, BookOpen, Globe, Flame, Zap } from 'lucide-react'
import { useUI } from '../../context/UIContext'
import type { SecretTab } from '../../types'

const NAV_ITEMS: { id: SecretTab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'trades', label: 'Trades', icon: BarChart3 },
  { id: 'backtest', label: 'Backtest', icon: Zap },
  { id: 'strategies', label: 'Strategies', icon: Lock },
  { id: 'connections', label: 'Connections', icon: Link2 },
  { id: 'knowledge', label: 'Knowledge', icon: BookOpen },
  { id: 'news', label: 'News', icon: Globe },
  { id: 'yolo', label: 'YOLO', icon: Flame },
]

export default function Sidebar() {
  const { activeTab, setActiveTab } = useUI()

  return (
    <aside className="w-[220px] h-screen flex flex-col border-r border-[var(--color-border)] bg-[var(--color-bg)] fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-[var(--color-border)]">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-green)] flex items-center justify-center">
          <Zap size={16} className="text-black" />
        </div>
        <span className="text-[15px] font-semibold tracking-tight">
          Massa <span className="text-[var(--color-text-muted)]">AI</span>
        </span>
      </div>

      {/* Secret Project Label */}
      <div className="px-5 pt-5 pb-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[var(--color-text-dim)]">
          Secret Project
        </span>
      </div>

      {/* Xerox Bot Button */}
      <div className="px-3 pb-4">
        <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-[var(--color-green)] text-black text-[13px] font-semibold transition-all hover:brightness-110">
          <LayoutDashboard size={15} />
          Zerox Bot
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id
          return (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all ${
                isActive
                  ? 'bg-[var(--color-surface-2)] text-[var(--color-green)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface)]'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          )
        })}
      </nav>
    </aside>
  )
}
