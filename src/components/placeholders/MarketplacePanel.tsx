import { Bot, TrendingUp, ShieldCheck, ShoppingCart } from 'lucide-react';

interface ProductCard {
  id: string;
  name: string;
  category: string;
  price: string;
  description: string;
}

const featuredProducts: ProductCard[] = [
  {
    id: 'p1',
    name: 'Robinhood Equities Auto-Trader',
    category: 'Trading Bot',
    price: '$79/mo',
    description: 'XGBoost-powered equities execution with risk controls and Discord alerts.',
  },
  {
    id: 'p2',
    name: 'Signal Scanner Pro',
    category: 'Data + Signals',
    price: '$49/mo',
    description: 'Pre-market and intraday signal feed for top US large-cap names.',
  },
  {
    id: 'p3',
    name: 'Risk Guard Policy Pack',
    category: 'Risk Management',
    price: '$29/mo',
    description: 'Preset limits, drawdown locks, and trade safety rules for automated systems.',
  },
];

export function MarketplacePanel() {
  return (
    <section className="space-y-5">
      <div className="bg-masa-card border border-masa-border rounded-xl p-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-masa-accent/15 text-masa-accent-light">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-masa-text">Marketplace</h2>
            <p className="text-sm text-masa-text-muted">
              Discover MASA-ready bots, strategies, and automation packs.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {featuredProducts.map((product) => (
          <article key={product.id} className="bg-masa-card border border-masa-border rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-masa-accent/10 text-masa-accent-light">
                {product.category}
              </span>
              <span className="text-sm text-masa-text">{product.price}</span>
            </div>
            <h3 className="mt-3 text-base font-semibold text-masa-text">{product.name}</h3>
            <p className="mt-2 text-sm text-masa-text-muted">{product.description}</p>
            <button className="mt-4 w-full px-3 py-2 rounded-lg bg-masa-accent/15 hover:bg-masa-accent/20 text-masa-accent-light text-sm transition-colors">
              View Product
            </button>
          </article>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-masa-card border border-masa-border rounded-xl p-4 flex items-start gap-3">
          <Bot className="w-4 h-4 mt-0.5 text-masa-text-dim" />
          <div>
            <h4 className="text-sm font-medium text-masa-text">Plug-and-Play Bots</h4>
            <p className="text-xs text-masa-text-muted mt-1">
              Ready-to-run strategies that connect with your existing MASA workflow.
            </p>
          </div>
        </div>
        <div className="bg-masa-card border border-masa-border rounded-xl p-4 flex items-start gap-3">
          <TrendingUp className="w-4 h-4 mt-0.5 text-masa-text-dim" />
          <div>
            <h4 className="text-sm font-medium text-masa-text">Performance Metrics</h4>
            <p className="text-xs text-masa-text-muted mt-1">
              Compare products by win-rate, drawdown profile, and live update cadence.
            </p>
          </div>
        </div>
        <div className="bg-masa-card border border-masa-border rounded-xl p-4 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 mt-0.5 text-masa-text-dim" />
          <div>
            <h4 className="text-sm font-medium text-masa-text">Safety First</h4>
            <p className="text-xs text-masa-text-muted mt-1">
              Product pages include risk notes, supported brokers, and default guardrails.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
