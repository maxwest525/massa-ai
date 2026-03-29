import { Clock, MessageSquare, ArrowUpRight } from 'lucide-react';
import { useProject } from '../../hooks/useProject';

function formatDate(ts: string) {
  try {
    const d = new Date(ts);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) +
      ' ' +
      d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return ts;
  }
}

export function HistoryPanel() {
  const { activeProject, setRawPrompt } = useProject();
  const allHistory = [
    ...activeProject.history,
    ...activeProject.promptHistory
      .filter((p) => !activeProject.history.some((h) => h.promptRecordId === p.id))
      .map((p) => ({
        id: `ph-${p.id}`,
        promptRecordId: p.id,
        rawPrompt: p.rawPrompt,
        enhancedPrompt: p.enhancedPrompt,
        actions: [] as never[],
        summary: p.enhancedPrompt.slice(0, 80) + '...',
        timestamp: p.createdAt,
      })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="bg-masa-card border border-masa-border rounded-xl overflow-hidden h-full flex flex-col">
      <div className="px-4 py-3 border-b border-masa-border flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-masa-text-muted">
          History
        </h3>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-masa-surface text-masa-text-dim">
          {allHistory.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto">
        {allHistory.length === 0 ? (
          <div className="p-4 text-center text-sm text-masa-text-muted">
            No history yet. Your completed prompts will appear here.
          </div>
        ) : (
          <div className="divide-y divide-masa-border">
            {allHistory.map((entry) => (
              <button
                key={entry.id}
                onClick={() => setRawPrompt(entry.rawPrompt)}
                className="w-full text-left px-4 py-3 hover:bg-masa-surface/50 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-md bg-masa-surface text-masa-text-dim">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-masa-text truncate">
                      {entry.rawPrompt}
                    </div>
                    <div className="text-[11px] text-masa-text-muted mt-1 truncate">
                      {entry.summary}
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-masa-text-muted">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(entry.timestamp)}</span>
                    </div>
                  </div>
                  <ArrowUpRight className="w-3.5 h-3.5 text-masa-text-muted opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
