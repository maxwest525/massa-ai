import { ArrowRight, Wand2, Route, FileText, Hammer, Rocket, CheckCircle2, Loader2, Circle } from 'lucide-react';
import { useProject } from '../../hooks/useProject';
import type { PhaseStatus } from '../../types';

const phaseIcons: Record<string, React.ReactNode> = {
  enhance: <Wand2 className="w-4 h-4" />,
  route: <Route className="w-4 h-4" />,
  plan: <FileText className="w-4 h-4" />,
  build: <Hammer className="w-4 h-4" />,
  deploy: <Rocket className="w-4 h-4" />,
};

function statusIcon(status: PhaseStatus) {
  switch (status) {
    case 'complete':
      return <CheckCircle2 className="w-4 h-4 text-masa-success" />;
    case 'active':
      return <Loader2 className="w-4 h-4 text-masa-accent-light animate-spin" />;
    default:
      return <Circle className="w-4 h-4 text-masa-text-muted" />;
  }
}

const statusStyles: Record<PhaseStatus, string> = {
  complete: 'border-masa-success/30 bg-masa-success/5 text-masa-success',
  active: 'border-masa-accent/40 bg-masa-accent/10 text-masa-accent-light',
  idle: 'border-masa-border bg-masa-card text-masa-text-muted',
  error: 'border-masa-danger/30 bg-masa-danger/5 text-masa-danger',
};

export function PipelineView() {
  const { pipeline } = useProject();

  return (
    <div className="bg-masa-card border border-masa-border rounded-xl p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-masa-text-muted mb-4">
        Pipeline Status
      </h3>
      <div className="flex items-center gap-2">
        {pipeline.map((phase, i) => (
          <div key={phase.id} className="flex items-center gap-2 flex-1">
            <div
              className={`flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all ${statusStyles[phase.status]}`}
            >
              <div className="shrink-0">{phaseIcons[phase.name]}</div>
              <span className="text-xs font-medium flex-1">{phase.label}</span>
              <div className="shrink-0">{statusIcon(phase.status)}</div>
            </div>
            {i < pipeline.length - 1 && (
              <ArrowRight className="w-3.5 h-3.5 text-masa-text-muted shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
