import {
  FilePlus,
  FileEdit,
  Wand2,
  Bot,
  ArrowRightCircle,
  Rocket,
} from 'lucide-react';
import { useProject } from '../../hooks/useProject';
import type { ChangeEntry } from '../../types';

const changeIcons: Record<ChangeEntry['type'], React.ReactNode> = {
  file_created: <FilePlus className="w-3.5 h-3.5" />,
  file_modified: <FileEdit className="w-3.5 h-3.5" />,
  prompt_enhanced: <Wand2 className="w-3.5 h-3.5" />,
  agent_assigned: <Bot className="w-3.5 h-3.5" />,
  phase_advanced: <ArrowRightCircle className="w-3.5 h-3.5" />,
  deployed: <Rocket className="w-3.5 h-3.5" />,
};

const changeColors: Record<ChangeEntry['type'], string> = {
  file_created: 'text-masa-success bg-masa-success/10',
  file_modified: 'text-masa-info bg-masa-info/10',
  prompt_enhanced: 'text-masa-accent-light bg-masa-accent/10',
  agent_assigned: 'text-masa-warning bg-masa-warning/10',
  phase_advanced: 'text-masa-info bg-masa-info/10',
  deployed: 'text-masa-success bg-masa-success/10',
};

function timeAgo(ts: string) {
  try {
    const diff = Date.now() - new Date(ts).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  } catch {
    return ts;
  }
}

export function ChangesActivity() {
  const { changes } = useProject();

  const sorted = [...changes].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="bg-masa-card border border-masa-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-masa-border flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-masa-text-muted">
          Changes & Activity
        </h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-masa-surface text-masa-text-dim">
          {sorted.length}
        </span>
      </div>
      <div className="max-h-[240px] overflow-y-auto">
        {sorted.length === 0 ? (
          <div className="p-4 text-center text-sm text-masa-text-muted">
            No activity yet
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[27px] top-3 bottom-3 w-px bg-masa-border" />
            <div className="divide-y divide-masa-border">
              {sorted.map((change) => (
                <div key={change.id} className="px-4 py-3 hover:bg-masa-surface/50 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className={`relative z-10 p-1.5 rounded-md ${changeColors[change.type]}`}>
                      {changeIcons[change.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-masa-text">{change.description}</div>
                      {change.details && (
                        <div className="text-[11px] text-masa-text-muted mt-0.5">
                          {change.details}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-masa-text-muted">
                        <span>{change.agentName}</span>
                        <span>·</span>
                        <span>{timeAgo(change.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
