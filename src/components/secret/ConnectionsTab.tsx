import { Wifi, WifiOff, Key, Server } from 'lucide-react'

const DATA_FEEDS = [
  { name: 'CME Market Data', status: 'connected', desc: 'MES, MNQ, ES, NQ real-time L2' },
  { name: 'Coinbase WebSocket', status: 'connected', desc: 'BTC/USD, ETH/USD ticker + orderbook' },
  { name: 'Alpha Vantage', status: 'connected', desc: 'Daily OHLCV, technical indicators' },
  { name: 'Polygon.io', status: 'disconnected', desc: 'Equities, options, forex aggregates' },
]

const BROKERS = [
  { name: 'Interactive Brokers', status: 'planned', desc: 'TWS API — paper trading ready' },
  { name: 'Coinbase Advanced', status: 'planned', desc: 'REST + WebSocket — sandbox available' },
]

const API_KEYS = [
  { name: 'Anthropic', configured: true },
  { name: 'OpenAI', configured: true },
  { name: 'Alpha Vantage', configured: true },
  { name: 'Polygon.io', configured: false },
  { name: 'CoinGecko', configured: false },
]

export default function ConnectionsTab() {
  return (
    <div className="p-6 space-y-4">
      {/* Data Feeds */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex items-center gap-2 mb-4">
          <Server size={15} className="text-[var(--color-text-dim)]" />
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-dim)]">Data Feeds</h3>
        </div>
        <div className="space-y-3">
          {DATA_FEEDS.map(feed => (
            <div key={feed.name} className="flex items-center justify-between rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
              <div>
                <div className="text-[14px] font-medium">{feed.name}</div>
                <div className="text-[12px] text-[var(--color-text-muted)]">{feed.desc}</div>
              </div>
              <div className="flex items-center gap-2">
                {feed.status === 'connected' ? (
                  <>
                    <Wifi size={14} className="text-[var(--color-green)]" />
                    <span className="text-[11px] font-medium text-[var(--color-green)]">Connected</span>
                  </>
                ) : (
                  <>
                    <WifiOff size={14} className="text-[var(--color-text-dim)]" />
                    <span className="text-[11px] font-medium text-[var(--color-text-dim)]">Disconnected</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* API Keys */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <div className="flex items-center gap-2 mb-4">
            <Key size={15} className="text-[var(--color-text-dim)]" />
            <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-dim)]">API Keys</h3>
          </div>
          <div className="space-y-2">
            {API_KEYS.map(key => (
              <div key={key.name} className="flex items-center justify-between py-2 border-b border-[var(--color-border)] last:border-0">
                <span className="text-[13px]">{key.name}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  key.configured ? 'bg-[var(--color-green-dim)] text-[var(--color-green)]' : 'bg-[var(--color-surface-3)] text-[var(--color-text-dim)]'
                }`}>
                  {key.configured ? 'CONFIGURED' : 'NOT SET'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Brokers */}
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-dim)] mb-4">Broker Integrations</h3>
          <div className="space-y-3">
            {BROKERS.map(b => (
              <div key={b.name} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[14px] font-medium">{b.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--color-surface-3)] text-[var(--color-yellow)]">PLANNED</span>
                </div>
                <div className="text-[12px] text-[var(--color-text-muted)]">{b.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
