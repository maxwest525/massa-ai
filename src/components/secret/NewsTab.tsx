import { ExternalLink, TrendingUp, TrendingDown, Minus } from 'lucide-react'

const NEWS_ITEMS = [
  { time: '2m ago', title: 'Fed signals potential rate cut in June meeting', sentiment: 'bullish' as const, source: 'Reuters' },
  { time: '15m ago', title: 'MES futures surge on strong jobs data', sentiment: 'bullish' as const, source: 'Bloomberg' },
  { time: '32m ago', title: 'Bitcoin holds above $84k as ETF inflows continue', sentiment: 'bullish' as const, source: 'CoinDesk' },
  { time: '1h ago', title: 'Ethereum gas fees spike amid memecoin frenzy', sentiment: 'neutral' as const, source: 'The Block' },
  { time: '2h ago', title: 'Trade tensions escalate with new tariff proposals', sentiment: 'bearish' as const, source: 'WSJ' },
  { time: '3h ago', title: 'AI chip demand drives semiconductor index higher', sentiment: 'bullish' as const, source: 'CNBC' },
  { time: '4h ago', title: 'Oil prices dip on OPEC supply increase fears', sentiment: 'bearish' as const, source: 'Reuters' },
]

const SENTIMENT_MAP = {
  bullish: { icon: TrendingUp, color: 'text-[var(--color-green)]', bg: 'bg-[var(--color-green-dim)]' },
  bearish: { icon: TrendingDown, color: 'text-[var(--color-red)]', bg: 'bg-[var(--color-red-dim)]' },
  neutral: { icon: Minus, color: 'text-[var(--color-text-muted)]', bg: 'bg-[var(--color-surface-3)]' },
}

export default function NewsTab() {
  return (
    <div className="p-6 space-y-4">
      {/* Sentiment overview */}
      <div className="grid grid-cols-3 gap-4">
        {(['bullish', 'neutral', 'bearish'] as const).map(s => {
          const count = NEWS_ITEMS.filter(n => n.sentiment === s).length
          const { icon: Icon, color, bg } = SENTIMENT_MAP[s]
          return (
            <div key={s} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center`}>
                <Icon size={18} className={color} />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-dim)]">{s}</div>
                <div className={`text-xl font-semibold font-mono ${color}`}>{count}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Feed */}
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--color-text-dim)] mb-4">News & Sentiment Feed</h3>
        <div className="space-y-2">
          {NEWS_ITEMS.map((item, i) => {
            const { icon: Icon, color, bg } = SENTIMENT_MAP[item.sentiment]
            return (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3.5 hover:border-[var(--color-text-dim)] transition-colors">
                <div className={`w-8 h-8 rounded-md ${bg} flex items-center justify-center shrink-0`}>
                  <Icon size={14} className={color} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium truncate">{item.title}</div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-[var(--color-text-dim)]">{item.source}</span>
                    <span className="text-[11px] text-[var(--color-text-dim)]">·</span>
                    <span className="text-[11px] text-[var(--color-text-dim)]">{item.time}</span>
                  </div>
                </div>
                <ExternalLink size={13} className="text-[var(--color-text-dim)] shrink-0" />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
