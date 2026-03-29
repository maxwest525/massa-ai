import { useState } from 'react';
import {
  Check, Pencil, RotateCcw, Copy, CheckCheck, Sparkles, Route,
  AlertTriangle, Target, Layers, Star, ClipboardList, Code2, ArrowRight,
} from 'lucide-react';
import { useProject } from '../../hooks/useProject';

export function OptimizedPreview() {
  const {
    enhancedPrompt,
    enhancedResult,
    setEnhancedPrompt,
    promptStatus,
    approvePrompt,
    resetPrompt,
    routeDecision,
    error,
    isPlanning,
  } = useProject();
  const [isEditing, setIsEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  if (promptStatus === 'idle' || promptStatus === 'enhancing') return null;

  // Pure error state — show dedicated card so the user can see what went wrong
  if (promptStatus === 'error') {
    return (
      <div className="bg-masa-card border border-masa-danger/30 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-masa-danger/20">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-masa-danger" />
            <span className="text-sm font-semibold text-masa-danger">Enhancement Failed</span>
          </div>
          <button
            onClick={resetPrompt}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-masa-surface border border-masa-border text-xs text-masa-text-dim hover:text-masa-text transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Try Again
          </button>
        </div>
        <div className="px-4 py-4">
          <p className="text-sm text-masa-text-dim leading-relaxed">
            {error ?? 'An unknown error occurred during enhancement.'}
          </p>
          <p className="text-xs text-masa-text-muted mt-2">
            Check your API key in Settings (⚙) and ensure your OpenAI key is valid.
          </p>
        </div>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(enhancedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const postApproveStages = new Set([
    'planning', 'planned', 'approved',
    'building', 'built', 'dispatching', 'dispatched', 'complete',
  ]);
  const isApproved = postApproveStages.has(promptStatus);
  const canApprove = promptStatus === 'enhanced' || promptStatus === 'routed';

  return (
    <div className="bg-masa-card border border-masa-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-masa-border">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-masa-accent-light" />
          <span className="text-sm font-semibold text-masa-text">Optimized Prompt</span>
          {isApproved && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-masa-success/20 text-masa-success font-medium">
              Approved
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-masa-text-dim hover:text-masa-text hover:bg-masa-surface transition-colors"
            title="Copy raw text"
          >
            {copied ? <CheckCheck className="w-3.5 h-3.5 text-masa-success" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          {!isApproved && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`p-1.5 rounded-lg transition-colors ${
                isEditing
                  ? 'text-masa-accent-light bg-masa-accent/10'
                  : 'text-masa-text-dim hover:text-masa-text hover:bg-masa-surface'
              }`}
              title="Edit raw text"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={resetPrompt}
            className="p-1.5 rounded-lg text-masa-text-dim hover:text-masa-text hover:bg-masa-surface transition-colors"
            title="Reset"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Route Decision Badge */}
      {routeDecision && (
        <div className="px-4 pt-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-masa-surface border border-masa-border text-xs">
            <Route className="w-3.5 h-3.5 text-masa-info" />
            <span className="text-masa-text-dim">
              Routed to{' '}
              <span className="text-masa-text font-semibold">{routeDecision.target.toUpperCase()}</span>
            </span>
            <span className="text-masa-text-muted">—</span>
            <span className="text-masa-text-muted">{routeDecision.reason}</span>
            <span
              className={`ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                routeDecision.confidence === 'high'
                  ? 'bg-masa-success/10 text-masa-success'
                  : routeDecision.confidence === 'medium'
                    ? 'bg-masa-warning/10 text-masa-warning'
                    : 'bg-masa-text-muted/10 text-masa-text-muted'
              }`}
            >
              {routeDecision.confidence}
            </span>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="px-4 pt-3">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-masa-danger/10 border border-masa-danger/20 text-xs text-masa-danger">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Body — structured view or raw edit */}
      <div className="p-4">
        {isEditing ? (
          <textarea
            value={enhancedPrompt}
            onChange={(e) => setEnhancedPrompt(e.target.value)}
            className="w-full min-h-[160px] bg-masa-surface border border-masa-border rounded-lg p-3 text-sm text-masa-text font-mono leading-relaxed resize-y focus:outline-none focus:border-masa-accent/50"
          />
        ) : enhancedResult ? (
          <StructuredView result={enhancedResult} />
        ) : (
          <div className="text-sm text-masa-text-dim font-mono leading-relaxed whitespace-pre-wrap">
            {enhancedPrompt}
          </div>
        )}
      </div>

      {/* Approve bar */}
      {canApprove && (
        <div className="flex items-center gap-2 px-4 pb-4">
          <button
            onClick={() => {
              setIsEditing(false);
              approvePrompt();
            }}
            disabled={isPlanning}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-masa-success/20 text-masa-success text-sm font-medium hover:bg-masa-success/30 transition-colors disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            {routeDecision?.target === 'claude' ? 'Approve & Plan with Claude' : 'Approve & Route'}
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-masa-card border border-masa-border text-masa-text-dim text-sm font-medium hover:text-masa-text hover:border-masa-border-light transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Edit First
          </button>
        </div>
      )}
    </div>
  );
}

// ── Structured sections display ───────────────────────────────────────────────

interface StructuredViewProps {
  result: {
    objective: string;
    whatIsBeingBuilt: string;
    keyFeatures: string[];
    requirements: string[];
    suggestedStack: string[];
    nextSteps: string[];
  };
}

function StructuredView({ result }: StructuredViewProps) {
  return (
    <div className="space-y-4">
      {/* Objective */}
      {result.objective && (
        <div className="space-y-1">
          <SectionLabel icon={<Target className="w-3.5 h-3.5" />} title="Objective" />
          <p className="text-sm text-masa-text leading-relaxed pl-5">{result.objective}</p>
        </div>
      )}

      {/* What is being built */}
      {result.whatIsBeingBuilt && (
        <div className="space-y-1">
          <SectionLabel icon={<Layers className="w-3.5 h-3.5" />} title="What Is Being Built" />
          <p className="text-sm text-masa-text-dim leading-relaxed pl-5">{result.whatIsBeingBuilt}</p>
        </div>
      )}

      {/* Key Features + Requirements in 2-col on wide */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {result.keyFeatures.length > 0 && (
          <div className="space-y-1.5">
            <SectionLabel icon={<Star className="w-3.5 h-3.5" />} title="Key Features" />
            <ul className="space-y-1 pl-5">
              {result.keyFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-masa-text-dim">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-masa-accent-light shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.requirements.length > 0 && (
          <div className="space-y-1.5">
            <SectionLabel icon={<ClipboardList className="w-3.5 h-3.5" />} title="Requirements" />
            <ul className="space-y-1 pl-5">
              {result.requirements.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-masa-text-dim">
                  <span className="mt-1.5 w-1 h-1 rounded-full bg-masa-info shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Suggested Stack */}
      {result.suggestedStack.length > 0 && (
        <div className="space-y-2">
          <SectionLabel icon={<Code2 className="w-3.5 h-3.5" />} title="Suggested Stack" />
          <div className="flex flex-wrap gap-1.5 pl-5">
            {result.suggestedStack.map((tech, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded-md bg-masa-surface border border-masa-border text-xs text-masa-text-dim font-mono"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Next Steps */}
      {result.nextSteps.length > 0 && (
        <div className="space-y-1.5">
          <SectionLabel icon={<ArrowRight className="w-3.5 h-3.5" />} title="Next Steps" />
          <ol className="space-y-1 pl-5">
            {result.nextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-masa-text-dim">
                <span className="shrink-0 w-4 h-4 rounded-full bg-masa-surface border border-masa-border flex items-center justify-center text-[9px] text-masa-text-muted font-mono">
                  {i + 1}
                </span>
                <span className="mt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}

function SectionLabel({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-masa-accent-light">{icon}</span>
      <span className="text-[11px] font-semibold text-masa-text-muted uppercase tracking-wider">{title}</span>
    </div>
  );
}
