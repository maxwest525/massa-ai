import { AlertTriangle, X } from 'lucide-react'
import { useUI } from '../../context/UIContext'

export default function KillSwitchModal() {
  const { killSwitchOpen, setKillSwitchOpen } = useUI()

  if (!killSwitchOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="w-[420px] rounded-2xl border border-[var(--color-red)] bg-[var(--color-surface)] p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-[var(--color-red)]">
            <AlertTriangle size={20} />
            <span className="font-semibold text-lg">Kill Switch</span>
          </div>
          <button onClick={() => setKillSwitchOpen(false)} className="text-[var(--color-text-muted)] hover:text-white">
            <X size={18} />
          </button>
        </div>
        <p className="text-sm text-[var(--color-text-muted)] mb-6 leading-relaxed">
          This will immediately close all open positions, cancel all pending orders, and pause all active strategies. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setKillSwitchOpen(false)}
            className="flex-1 py-2.5 rounded-lg border border-[var(--color-border)] text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-2)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              setKillSwitchOpen(false)
              // Kill logic would go here
            }}
            className="flex-1 py-2.5 rounded-lg bg-[var(--color-red)] text-white text-sm font-semibold hover:brightness-110 transition-all"
          >
            Confirm Kill
          </button>
        </div>
      </div>
    </div>
  )
}
