import { Box, Activity, CircleDollarSign } from 'lucide-react';

interface OwnedProduct {
  id: string;
  name: string;
  status: 'active' | 'paused';
  tier: string;
  revenue: string;
  lastUpdate: string;
}

const myProducts: OwnedProduct[] = [
  {
    id: 'm1',
    name: 'Robinhood Equities Auto-Trader',
    status: 'active',
    tier: 'Pro',
    revenue: '$1,284.22',
    lastUpdate: '2h ago',
  },
  {
    id: 'm2',
    name: 'Signal Scanner Pro',
    status: 'paused',
    tier: 'Starter',
    revenue: '$312.70',
    lastUpdate: '1d ago',
  },
];

export function MyProductsPanel() {
  return (
    <section className="space-y-5">
      <div className="bg-masa-card border border-masa-border rounded-xl p-5">
        <h2 className="text-lg font-semibold text-masa-text">My Products</h2>
        <p className="text-sm text-masa-text-muted mt-1">
          Manage your listed products, monitor usage, and track subscriptions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-masa-card border border-masa-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-masa-text-dim">
            <Box className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">Products</span>
          </div>
          <div className="text-2xl font-semibold text-masa-text mt-2">{myProducts.length}</div>
        </div>
        <div className="bg-masa-card border border-masa-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-masa-text-dim">
            <Activity className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">Active</span>
          </div>
          <div className="text-2xl font-semibold text-masa-text mt-2">
            {myProducts.filter((p) => p.status === 'active').length}
          </div>
        </div>
        <div className="bg-masa-card border border-masa-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-masa-text-dim">
            <CircleDollarSign className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wide">Total Revenue</span>
          </div>
          <div className="text-2xl font-semibold text-masa-text mt-2">$1,596.92</div>
        </div>
      </div>

      <div className="bg-masa-card border border-masa-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-masa-border">
          <h3 className="text-sm font-medium text-masa-text">Catalog</h3>
        </div>
        <div className="divide-y divide-masa-border">
          {myProducts.map((product) => (
            <div key={product.id} className="px-4 py-3 flex items-center gap-4">
              <div className="flex-1">
                <div className="text-sm font-medium text-masa-text">{product.name}</div>
                <div className="text-xs text-masa-text-muted mt-1">
                  Tier: {product.tier} · Last update: {product.lastUpdate}
                </div>
              </div>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full ${
                  product.status === 'active'
                    ? 'bg-masa-success/20 text-masa-success'
                    : 'bg-masa-warning/20 text-masa-warning'
                }`}
              >
                {product.status}
              </span>
              <div className="text-sm text-masa-text min-w-[90px] text-right">{product.revenue}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
