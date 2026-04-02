import { useState } from 'react'
import { Lock, Eye, EyeOff, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { mockStrategies, mockRiskLimits } from '../../data/mockData'
import { APEX_RISK } from '../../types'

type VaultTab = 'deep-dive' | 'backtest' | 'controls' | 'performance' | 'risk' | 'builder'

export default function StrategiesTab() {
  const [unlocked, setUnlocked] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const [vaultTab, setVaultTab] = useState<VaultTab>('deep-dive')
  const [showPin, setShowPin] = useState(false)

  const handleUnlock = () => {
    if (pin === '1337') {
      setUnlocked(true)
      setError(false)
    } else {
      setError(true)
    }
  }

  if (!unlocked) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh]">
        <div className="w-[360px] rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center mx-auto mb-4">
            <Lock size={24} className="text-[var(--color-green)]" />
          </div>
          <h2 className="text-lg font-semibold mb-1">Strategy Vault</h2>
          <p className="text-[13px] text-[var(--color-text-muted)] mb-6">Enter PIN to access strategy configurations</p>
          <div className="relative mb-4">
            <input
              type={showPin ? 'text' : 'password'}
              value={pin}
              onChange={e => { setPin(e.target.value); setError(false) }}
              onKeyDown={e => e.key === 'Enter' && handleUnlock()}
              placeholder="Enter PIN"
              className={`w-full px-4 py-3 rounded-lg bg-[var(--color-surface-2)] border text-center font-mono text-lg tracking-[0.3em] outline-none transition-colors ${
                error ? 'border-[var(--color-red)]' : 'border-[var(--color-border)] focus:border-[var(--color-green)]'
              }`}
            />
            <button
              onClick={() => setShowPin(!showPin)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]"
            >
              {showPin ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {error && <p className="text-[var(--color-red)] text-xs mb-3">Invalid PIN</p>}
          <button
            onClick={handleUnlock}
            className="w-full py-3 rounded-lg bg-[var(--color-green)] text-black font-semibold text-sm hover:brightness-110 transition-all"
          >
            Unlock
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      {/* Vault sub-tabs */}
      <div className="flex gap-1 border-b border-[var(--color-border)] pb-3">
        {([
          ['deep-dive', 'Deep Dive'],
          ['backtest', 'Backtest'],
          ['controls', 'Controls'],
          ['performance', 'Performance'],
          ['risk', 'Risk Metrics'],
          ['builder', 'Builder'],
        ] as [VaultTab, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setVaultTab(id)}
            className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
              vaultTab === id
                ? 'bg-[var(--color-green)] text-black'
                : 'text-[var(--color-text-muted)] hover:text-white'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {vaultTab === 'deep-dive' && (
        <div className="space-y-4">
          {mockStrategies.map(s => (
            <div key={s.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-semibold text-[15px]">{s.name}</div>
                  <div className="text-[11px] text-[var(--color-text-dim)] font-mono">{s.codename}</div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  s.status === 'ACTIVE' ? 'bg-[var(--color-green-dim)] text-[var(--color-green)]' : 'bg-[var(--color-surface-3)] text-[var(--color-text-dim)]'
                }`}>{s.status}</span>
              </div>
              <p className="text-[13px] text-[var(--color-text-muted)] leading-relaxed">{s.description}</p>
            </div>
          ))}
        </div>
      )}

      {vaultTab === 'risk' && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 space-y-5">
          <h3 className="text-[13px] font-semibold">Non-Negotiable Rules</h3>
          <div className="grid grid-cols-2 gap-4">
            {mockRiskLimits.map(limit => {
              const pct = (limit.current / limit.max) * 100
              return (
                <div key={limit.label} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-[12px] text-[var(--color-text-muted)]">{limit.label}</span>
                    <span className="text-[12px] font-mono font-medium">{limit.current}{limit.unit} / {limit.max}{limit.unit}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${pct > 90 ? 'bg-[var(--color-red)]' : pct > 70 ? 'bg-[var(--color-yellow)]' : 'bg-[var(--color-green)]'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
            <h4 className="text-[12px] font-semibold mb-3 text-[var(--color-text-muted)]">APEX Constants</h4>
            <div className="grid grid-cols-2 gap-2 text-[12px] font-mono">
              {Object.entries(APEX_RISK).map(([key, val]) => (
                <div key={key} className="flex justify-between py-1 border-b border-[var(--color-border)]">
                  <span className="text-[var(--color-text-muted)]">{key}</span>
                  <span>{typeof val === 'number' && val < 1 ? `${(val * 100).toFixed(0)}%` : val.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!['deep-dive', 'risk'].includes(vaultTab) && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-12 text-center">
          <div className="text-[var(--color-text-dim)] text-sm">
            {vaultTab.charAt(0).toUpperCase() + vaultTab.slice(1)} — Coming soon
          </div>
        </div>
      )}
    </div>
  )
}
