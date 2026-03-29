import { Rocket, GitBranch, ExternalLink, Lock } from 'lucide-react';

const deployTargets = [
  {
    icon: <Rocket className="w-5 h-5" />,
    name: 'Lovable',
    description: 'Preview, iterate, and publish directly from MASA',
    color: 'text-pink-400 bg-pink-400/10',
  },
  {
    icon: <GitBranch className="w-5 h-5" />,
    name: 'GitHub',
    description: 'Sync to repository, manage branches, and track commits',
    color: 'text-gray-300 bg-gray-300/10',
  },
];

export function DeployPanel() {
  return (
    <div className="bg-masa-card border border-masa-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-masa-border flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-masa-text-muted">
          Deploy & Publish
        </h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-masa-warning/20 text-masa-warning font-medium">
          Coming Soon
        </span>
      </div>
      <div className="p-3 space-y-2">
        {deployTargets.map((target) => (
          <div
            key={target.name}
            className="flex items-center gap-3 px-3 py-3 rounded-lg bg-masa-surface/50 border border-masa-border opacity-60"
          >
            <div className={`p-2 rounded-lg ${target.color}`}>
              {target.icon}
            </div>
            <div className="flex-1">
              <div className="text-sm text-masa-text font-medium flex items-center gap-2">
                {target.name}
                <ExternalLink className="w-3 h-3 text-masa-text-muted" />
              </div>
              <div className="text-[11px] text-masa-text-muted">{target.description}</div>
            </div>
            <Lock className="w-3.5 h-3.5 text-masa-text-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
