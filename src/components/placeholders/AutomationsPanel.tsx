import { Workflow, Globe, Zap, Lock } from 'lucide-react';

const automationStubs = [
  {
    icon: <Globe className="w-4 h-4" />,
    name: 'Web Scraper',
    description: 'Extract data from websites and feed into agents',
  },
  {
    icon: <Workflow className="w-4 h-4" />,
    name: 'Workflow Runner',
    description: 'Chain multiple agent actions into automated pipelines',
  },
  {
    icon: <Zap className="w-4 h-4" />,
    name: 'Scheduled Tasks',
    description: 'Run tasks on a schedule or trigger via webhooks',
  },
];

export function AutomationsPanel() {
  return (
    <div className="bg-masa-card border border-masa-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-masa-border flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-masa-text-muted">
          Automations & Scrapers
        </h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-masa-warning/20 text-masa-warning font-medium">
          Coming Soon
        </span>
      </div>
      <div className="p-3 space-y-2">
        {automationStubs.map((item) => (
          <div
            key={item.name}
            className="flex items-center gap-3 px-3 py-3 rounded-lg bg-masa-surface/50 border border-masa-border opacity-60"
          >
            <div className="p-2 rounded-lg bg-masa-card text-masa-text-dim">
              {item.icon}
            </div>
            <div className="flex-1">
              <div className="text-sm text-masa-text font-medium">{item.name}</div>
              <div className="text-[11px] text-masa-text-muted">{item.description}</div>
            </div>
            <Lock className="w-3.5 h-3.5 text-masa-text-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
