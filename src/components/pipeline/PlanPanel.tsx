import { FileText, Loader2, ListChecks, Boxes, Lightbulb, ArrowRight, Hammer, Info } from 'lucide-react';
import { useProject } from '../../hooks/useProject';

export function PlanPanel() {
  const { planResult, isPlanning, promptStatus, startBuild, planningSkipReason } = useProject();

  if (promptStatus === 'idle' || promptStatus === 'enhancing' || promptStatus === 'enhanced' || promptStatus === 'routing' || promptStatus === 'routed') {
    return null;
  }

  if (isPlanning) {
    return (
      <div className="bg-masa-card border border-masa-border rounded-xl p-6">
        <div className="flex items-center gap-3 text-masa-accent-light">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm font-semibold">Claude is generating your implementation plan...</span>
        </div>
        <div className="mt-3 space-y-2">
          {['Analyzing requirements', 'Designing architecture', 'Planning implementation steps'].map((step, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-masa-text-muted">
              <div className="w-1.5 h-1.5 rounded-full bg-masa-accent-light animate-pulse" />
              {step}
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!planResult) {
    // Planning was intentionally skipped — show an informational card, not an error
    if (planningSkipReason) {
      return (
        <div className="bg-masa-card border border-masa-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-masa-border flex items-center gap-2">
            <Info className="w-4 h-4 text-masa-info" />
            <span className="text-sm font-semibold text-masa-text">Implementation Plan</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-masa-info/10 text-masa-info font-medium">
              Skipped
            </span>
          </div>
          <div className="px-4 py-4 space-y-3">
            <p className="text-sm text-masa-text-dim leading-relaxed">{planningSkipReason}</p>
            <p className="text-xs text-masa-text-muted">
              You can still proceed to Build with the enhanced prompt and route decision.
            </p>
            {promptStatus === 'planned' && (
              <button
                onClick={startBuild}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-semibold border border-amber-500/30 hover:from-amber-500 hover:to-orange-500 transition-all shadow-[0_0_15px_rgba(217,119,6,0.3)] hover:shadow-[0_0_25px_rgba(217,119,6,0.4)]"
              >
                <Hammer className="w-4 h-4" />
                Continue to Build
              </button>
            )}
          </div>
        </div>
      );
    }
    return null;
  }

  return (
    <div className="bg-masa-card border border-masa-border rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-masa-border flex items-center gap-2">
        <FileText className="w-4 h-4 text-masa-accent-light" />
        <span className="text-sm font-semibold text-masa-text">Implementation Plan</span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-masa-success/20 text-masa-success font-medium">
          Generated
        </span>
      </div>

      <div className="p-4 space-y-5">
        {/* Implementation Steps */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ListChecks className="w-3.5 h-3.5 text-masa-info" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-masa-text-dim">
              Implementation Steps
            </h4>
          </div>
          <div className="space-y-1.5">
            {planResult.implementationPlan.map((step, i) => (
              <div key={i} className="flex items-start gap-2 text-sm">
                <span className="shrink-0 w-5 h-5 rounded-full bg-masa-accent/10 text-masa-accent-light text-[10px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <span className="text-masa-text-dim">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Architecture */}
        {planResult.architectureOutline && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Boxes className="w-3.5 h-3.5 text-masa-warning" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-masa-text-dim">
                Architecture
              </h4>
            </div>
            <div className="text-sm text-masa-text-dim font-mono bg-masa-surface rounded-lg p-3 leading-relaxed whitespace-pre-wrap">
              {planResult.architectureOutline}
            </div>
          </div>
        )}

        {/* Components */}
        {planResult.componentSuggestions.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Boxes className="w-3.5 h-3.5 text-masa-success" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-masa-text-dim">
                Suggested Components
              </h4>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {planResult.componentSuggestions.map((comp, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded-lg bg-masa-surface border border-masa-border text-masa-text-dim font-mono"
                >
                  {comp}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Next Action */}
        {planResult.recommendedNextAction && (
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-masa-accent/5 border border-masa-accent/20">
            <Lightbulb className="w-4 h-4 text-masa-accent-light shrink-0 mt-0.5" />
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider text-masa-accent-light mb-0.5">
                Recommended Next Action
              </div>
              <div className="text-sm text-masa-text-dim flex items-center gap-1">
                <ArrowRight className="w-3 h-3 text-masa-accent-light shrink-0" />
                {planResult.recommendedNextAction}
              </div>
            </div>
          </div>
        )}

        {/* Start Build button */}
        {promptStatus === 'planned' && (
          <button
            onClick={startBuild}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 text-white text-sm font-semibold border border-amber-500/30 hover:from-amber-500 hover:to-orange-500 transition-all shadow-[0_0_15px_rgba(217,119,6,0.3)] hover:shadow-[0_0_25px_rgba(217,119,6,0.4)]"
          >
            <Hammer className="w-4 h-4" />
            Start Build
          </button>
        )}
      </div>
    </div>
  );
}
