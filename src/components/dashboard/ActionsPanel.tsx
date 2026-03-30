import { Wand2, Route, FileText, Hammer, Rocket, Globe, GitCommit, PackageOpen, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { useProject } from '../../hooks/useProject';
import type { Action, ActionStatus } from '../../types';

const typeIcons: Record<Action['type'], React.ReactNode> = {
  enhance: <Wand2 className="w-3.5 h-3.5" />,
  route: <Route className="w-3.5 h-3.5" />,
  plan: <FileText className="w-3.5 h-3.5" />,
  build: <Hammer className="w-3.5 h-3.5" />,
  deploy: <Rocket className="w-3.5 h-3.5" />,
  scrape: <Globe className="w-3.5 h-3.5" />,
  commit: <GitCommit className="w-3.5 h-3.5" />,
  packet: <PackageOpen className="w-3.5 h-3.5" />,
};

const statusBadge: Record<ActionStatus, { icon: React.ReactNode; className: string }> = {
  complete: {
    icon: <CheckCircle2 className="w-3 h-3" />,
    className: 'text-masa-success bg-masa-success/10',
  },
  running: {
    icon: <Loader2 className="w-3 h-3 animate-spin" />,
    className: 'text-masa-accent-light bg-masa-accent/10',
  },
  pending: {
    icon: <Clock className="w-3 h-3" />,
    className: 'text-masa-text-muted bg-masa-card',
  },
  failed: {
    icon: <AlertCircle className="w-3 h-3" />,
    className: 'text-masa-danger bg-masa-danger/10',
  },
};

function formatTime(ts: string) {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return ts;
  }
}

export function ActionsPanel() {
  const { actions, activeAgent } = useProject();

  const filtered = activeAgent
    ? actions.filter((a) => a.agentId === activeAgent.id)
    : actions;

  return (
    <div className="bg-masa-card border border-masa-border rounded-xl overflow-hidden h-full flex flex-col">
      <div className="px-4 py-3 border-b border-masa-border flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-masa-text-muted">
          Actions
        </h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-masa-surface text-masa-text-dim">
          {filtered.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-4 text-center text-sm text-masa-text-muted">
            No actions yet. Enhance a prompt to get started.
          </div>
        ) : (
          <div className="divide-y divide-masa-border">
            {filtered.map((action) => {
              const badge = statusBadge[action.status];
              return (
                <div key={action.id} className="px-4 py-3 hover:bg-masa-surface/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 p-1.5 rounded-md bg-masa-surface text-masa-text-dim">
                      {typeIcons[action.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-masa-text font-medium truncate">
                          {action.description}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full font-medium ${badge.className}`}>
                          {badge.icon}
                          {action.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-masa-text-muted">
                        <span>{action.agentName}</span>
                        <span>·</span>
                        <span>{formatTime(action.timestamp)}</span>
                      </div>
                      {action.output && (
                        <div className="mt-1.5 text-xs text-masa-text-dim font-mono bg-masa-surface rounded-md px-2 py-1.5">
                          {action.output}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
