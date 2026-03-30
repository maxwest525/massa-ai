import { useState, useEffect } from 'react';
import {
  X, Sparkles, FileText, Hammer, Target, Star, ClipboardList,
  Code2, ArrowRight, Layers, ListChecks, Boxes, Lightbulb,
  CheckCircle2, ScanEye, Copy, CheckCheck, AlignLeft,
  PackageOpen, Rocket, Terminal, Save, GitBranch,
} from 'lucide-react';
import { useProject } from '../../hooks/useProject';
import { useUI } from '../../context/UIContext';
import { getToolDisplayName } from '../../services/dispatcher';
import { formatPacketForTarget, getTargetLabel } from '../../services/targetFormatter';
import type { BuildTarget } from '../../types';

type Tab = 'latest' | 'raw' | 'enhanced' | 'plan' | 'build' | 'packet';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'latest',   label: 'Latest',   icon: <ScanEye className="w-3.5 h-3.5" />     },
  { id: 'raw',      label: 'Raw',      icon: <AlignLeft className="w-3.5 h-3.5" />   },
  { id: 'enhanced', label: 'Enhanced', icon: <Sparkles className="w-3.5 h-3.5" />    },
  { id: 'plan',     label: 'Plan',     icon: <FileText className="w-3.5 h-3.5" />    },
  { id: 'build',    label: 'Build',    icon: <Hammer className="w-3.5 h-3.5" />      },
  { id: 'packet',   label: 'Packet',   icon: <PackageOpen className="w-3.5 h-3.5" /> },
];

export function PreviewPanel() {
  const { setPreviewOpen } = useUI();
  const {
    rawPrompt, enhancedResult, planResult, buildPayload, buildResult,
    promptStatus, routeDecision, buildPacket, buildTarget,
  } = useProject();

  const [tab, setTab] = useState<Tab>('latest');
  const [copied, setCopied] = useState(false);

  // Auto-advance active tab when new content arrives (defer setState to avoid cascading renders)
  useEffect(() => {
    queueMicrotask(() => {
      if (buildPacket) { setTab('packet'); return; }
      if (buildResult || buildPayload) { setTab('build'); return; }
      if (planResult) { setTab('plan'); return; }
      if (enhancedResult) { setTab('enhanced'); }
    });
  }, [enhancedResult, planResult, buildResult, buildPayload, buildPacket]);

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hasContent = !!(rawPrompt || enhancedResult || planResult || buildPayload || buildPacket);

  return (
    <div className="w-[380px] shrink-0 border-l border-masa-border bg-masa-surface flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-masa-border shrink-0">
        <div className="flex items-center gap-2">
          <ScanEye className="w-4 h-4 text-masa-accent-light" />
          <span className="text-sm font-semibold text-masa-text">Preview</span>
          {promptStatus !== 'idle' && promptStatus !== 'enhancing' && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-masa-accent/10 text-masa-accent-light font-medium">
              {promptStatus}
            </span>
          )}
        </div>
        <button
          onClick={() => setPreviewOpen(false)}
          className="p-1.5 rounded-lg text-masa-text-dim hover:text-masa-text hover:bg-masa-card transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-masa-border shrink-0 px-2 pt-1">
        {TABS.map(({ id, label, icon }) => {
          const isActive = tab === id;
          const hasDot =
            (id === 'raw'      && !!rawPrompt) ||
            (id === 'enhanced' && !!enhancedResult) ||
            (id === 'plan'     && !!planResult) ||
            (id === 'build'    && !!buildPayload) ||
            (id === 'packet'   && !!buildPacket);

          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`
                relative flex items-center gap-1.5 px-3 py-2 text-xs font-medium transition-colors rounded-t
                ${isActive
                  ? 'text-masa-accent-light border-b-2 border-masa-accent-light -mb-px'
                  : 'text-masa-text-muted hover:text-masa-text-dim'
                }
              `}
            >
              {icon}
              {label}
              {hasDot && !isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-masa-accent-light" />
              )}
            </button>
          );
        })}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {!hasContent ? (
          <EmptyState />
        ) : (
          <>
            {tab === 'latest' && <LatestTab enhancedResult={enhancedResult} planResult={planResult} buildResult={buildResult} routeDecision={routeDecision} />}
            {tab === 'raw' && (
              rawPrompt
                ? <RawTab rawPrompt={rawPrompt} onCopy={() => copyText(rawPrompt)} copied={copied} />
                : <TabEmpty label="Type a prompt to see the raw input" icon={<AlignLeft className="w-5 h-5" />} />
            )}
            {tab === 'enhanced' && (
              enhancedResult
                ? <EnhancedTab result={enhancedResult} onCopy={() => copyText(enhancedResult.fullText)} copied={copied} />
                : <TabEmpty label="Enhance a prompt first" icon={<Sparkles className="w-5 h-5" />} />
            )}
            {tab === 'plan' && (
              planResult
                ? <PlanTab result={planResult} onCopy={() => copyText(planResult.fullText)} copied={copied} />
                : <TabEmpty label="Approve the prompt to generate a plan" icon={<FileText className="w-5 h-5" />} />
            )}
            {tab === 'build' && (
              buildPayload
                ? <BuildTab payload={buildPayload} result={buildResult} onCopy={() => copyText(buildPayload.goal)} copied={copied} />
                : <TabEmpty label="Start Build to see the payload" icon={<Hammer className="w-5 h-5" />} />
            )}
            {tab === 'packet' && (
              buildPacket
                ? <PacketTab packet={buildPacket} defaultTarget={buildTarget} />
                : <TabEmpty label="Generate a Build Packet to preview it here" icon={<PackageOpen className="w-5 h-5" />} />
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Empty States ─────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-masa-card border border-masa-border flex items-center justify-center">
        <ScanEye className="w-6 h-6 text-masa-text-muted" />
      </div>
      <div>
        <p className="text-sm font-medium text-masa-text-dim">No output to preview</p>
        <p className="text-xs text-masa-text-muted mt-1 leading-relaxed">
          Enhance a prompt to see structured output here.
        </p>
      </div>
      <div className="w-full space-y-2 mt-2">
        {['Enhanced Prompt', 'Implementation Plan', 'Build Payload'].map((item) => (
          <div key={item} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-masa-card border border-masa-border border-dashed">
            <span className="w-2 h-2 rounded-full bg-masa-border-light" />
            <span className="text-xs text-masa-text-muted">{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TabEmpty({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-masa-card border border-masa-border flex items-center justify-center text-masa-text-muted">
        {icon}
      </div>
      <p className="text-xs text-masa-text-muted">{label}</p>
    </div>
  );
}

// ── Latest Tab ───────────────────────────────────────────────────────────────

interface RouteDecision {
  target: string;
  reason: string;
  confidence: string;
}

function LatestTab({ enhancedResult, planResult, buildResult, routeDecision }: {
  enhancedResult: { objective: string; keyFeatures: string[]; suggestedStack: string[]; nextSteps: string[] } | null;
  planResult: { implementationPlan: string[]; architectureOutline: string; recommendedNextAction: string } | null;
  buildResult: { resultSummary: string; toolUsed: string; status: string } | null;
  routeDecision: RouteDecision | null;
}) {
  return (
    <div className="p-4 space-y-4">
      {/* Route decision pill */}
      {routeDecision && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-masa-card border border-masa-border text-xs">
          <span className="text-masa-text-muted">Route</span>
          <span className="font-semibold text-masa-text">{routeDecision.target.toUpperCase()}</span>
          <span className={`ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
            routeDecision.confidence === 'high' ? 'bg-masa-success/10 text-masa-success' :
            routeDecision.confidence === 'medium' ? 'bg-masa-warning/10 text-masa-warning' :
            'bg-masa-card text-masa-text-muted'
          }`}>{routeDecision.confidence}</span>
        </div>
      )}

      {/* Objective */}
      {enhancedResult?.objective && (
        <PreviewSection title="Objective" icon={<Target className="w-3.5 h-3.5" />}>
          <p className="text-sm text-masa-text leading-relaxed">{enhancedResult.objective}</p>
        </PreviewSection>
      )}

      {/* Key Features */}
      {enhancedResult && enhancedResult.keyFeatures.length > 0 && (
        <PreviewSection title="Key Features" icon={<Star className="w-3.5 h-3.5" />}>
          <ul className="space-y-1">
            {enhancedResult.keyFeatures.slice(0, 5).map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-masa-text-dim">
                <span className="mt-1.5 w-1 h-1 rounded-full bg-masa-accent-light shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </PreviewSection>
      )}

      {/* Plan summary */}
      {planResult && (
        <PreviewSection title="Plan Summary" icon={<ListChecks className="w-3.5 h-3.5" />}>
          <p className="text-xs text-masa-text-dim leading-relaxed mb-2">{planResult.architectureOutline}</p>
          {planResult.recommendedNextAction && (
            <div className="flex items-start gap-1.5 px-2 py-1.5 rounded-md bg-masa-accent/5 border border-masa-accent/15">
              <ArrowRight className="w-3 h-3 text-masa-accent-light shrink-0 mt-0.5" />
              <span className="text-[11px] text-masa-text-dim">{planResult.recommendedNextAction}</span>
            </div>
          )}
        </PreviewSection>
      )}

      {/* Build result */}
      {buildResult && (
        <PreviewSection title="Execution Result" icon={<CheckCircle2 className="w-3.5 h-3.5 text-masa-success" />}>
          <div className="text-xs text-masa-text-dim font-mono leading-relaxed bg-masa-card rounded-md p-2.5 border border-masa-border whitespace-pre-wrap">
            {buildResult.resultSummary.slice(0, 400)}
          </div>
        </PreviewSection>
      )}

      {/* Stack badges */}
      {enhancedResult && enhancedResult.suggestedStack.length > 0 && (
        <PreviewSection title="Stack" icon={<Code2 className="w-3.5 h-3.5" />}>
          <div className="flex flex-wrap gap-1.5">
            {enhancedResult.suggestedStack.map((t, i) => (
              <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-masa-card border border-masa-border text-masa-text-dim font-mono">
                {t}
              </span>
            ))}
          </div>
        </PreviewSection>
      )}
    </div>
  );
}

// ── Raw Tab ───────────────────────────────────────────────────────────────────

function RawTab({ rawPrompt, onCopy, copied }: {
  rawPrompt: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="p-4 space-y-4">
      <CopyBar label="Copy raw prompt" onCopy={onCopy} copied={copied} />
      <PreviewSection title="Raw Input" icon={<AlignLeft className="w-3.5 h-3.5" />}>
        <div className="text-sm text-masa-text-dim font-mono leading-relaxed bg-masa-card rounded-lg p-3 border border-masa-border whitespace-pre-wrap break-words">
          {rawPrompt}
        </div>
        <div className="text-[11px] text-masa-text-muted mt-1.5">
          {rawPrompt.trim().split(/\s+/).length} words · {rawPrompt.length} chars
        </div>
      </PreviewSection>
    </div>
  );
}

// ── Enhanced Tab ─────────────────────────────────────────────────────────────

function EnhancedTab({ result, onCopy, copied }: {
  result: {
    objective: string; whatIsBeingBuilt: string; keyFeatures: string[];
    requirements: string[]; suggestedStack: string[]; nextSteps: string[];
  };
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="p-4 space-y-5">
      <CopyBar label="Copy full text" onCopy={onCopy} copied={copied} />

      <PreviewSection title="Objective" icon={<Target className="w-3.5 h-3.5" />}>
        <p className="text-sm text-masa-text leading-relaxed">{result.objective}</p>
      </PreviewSection>

      {result.whatIsBeingBuilt && (
        <PreviewSection title="What Is Being Built" icon={<Layers className="w-3.5 h-3.5" />}>
          <p className="text-sm text-masa-text-dim leading-relaxed">{result.whatIsBeingBuilt}</p>
        </PreviewSection>
      )}

      {result.keyFeatures.length > 0 && (
        <PreviewSection title="Key Features" icon={<Star className="w-3.5 h-3.5" />}>
          <ul className="space-y-1.5">
            {result.keyFeatures.map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-masa-text-dim">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-masa-accent-light shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </PreviewSection>
      )}

      {result.requirements.length > 0 && (
        <PreviewSection title="Requirements" icon={<ClipboardList className="w-3.5 h-3.5" />}>
          <ul className="space-y-1.5">
            {result.requirements.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-masa-text-dim">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-masa-info shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </PreviewSection>
      )}

      {result.suggestedStack.length > 0 && (
        <PreviewSection title="Suggested Stack" icon={<Code2 className="w-3.5 h-3.5" />}>
          <div className="flex flex-wrap gap-1.5">
            {result.suggestedStack.map((tech, i) => (
              <span key={i} className="text-[11px] px-2.5 py-1 rounded-md bg-masa-card border border-masa-border text-masa-text-dim font-mono">
                {tech}
              </span>
            ))}
          </div>
        </PreviewSection>
      )}

      {result.nextSteps.length > 0 && (
        <PreviewSection title="Next Steps" icon={<ArrowRight className="w-3.5 h-3.5" />}>
          <ol className="space-y-1.5">
            {result.nextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-masa-text-dim">
                <span className="shrink-0 w-4 h-4 rounded-full bg-masa-card border border-masa-border flex items-center justify-center text-[9px] text-masa-text-muted font-mono">
                  {i + 1}
                </span>
                <span className="mt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </PreviewSection>
      )}
    </div>
  );
}

// ── Plan Tab ─────────────────────────────────────────────────────────────────

function PlanTab({ result, onCopy, copied }: {
  result: {
    implementationPlan: string[]; architectureOutline: string;
    componentSuggestions: string[]; recommendedNextAction: string; fullText: string;
  };
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="p-4 space-y-5">
      <CopyBar label="Copy full plan" onCopy={onCopy} copied={copied} />

      {result.implementationPlan.length > 0 && (
        <PreviewSection title="Implementation Steps" icon={<ListChecks className="w-3.5 h-3.5" />}>
          <ol className="space-y-2">
            {result.implementationPlan.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-masa-text-dim">
                <span className="shrink-0 w-5 h-5 rounded-full bg-masa-accent/10 text-masa-accent-light text-[9px] font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </PreviewSection>
      )}

      {result.architectureOutline && (
        <PreviewSection title="Architecture" icon={<Boxes className="w-3.5 h-3.5" />}>
          <div className="text-xs text-masa-text-dim font-mono leading-relaxed bg-masa-card rounded-lg p-3 border border-masa-border whitespace-pre-wrap">
            {result.architectureOutline}
          </div>
        </PreviewSection>
      )}

      {result.componentSuggestions.length > 0 && (
        <PreviewSection title="Components & Files" icon={<Code2 className="w-3.5 h-3.5" />}>
          <div className="flex flex-wrap gap-1.5">
            {result.componentSuggestions.map((c, i) => (
              <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-masa-card border border-masa-border text-masa-text-dim font-mono">
                {c}
              </span>
            ))}
          </div>
        </PreviewSection>
      )}

      {result.recommendedNextAction && (
        <div className="flex items-start gap-2 px-3 py-3 rounded-lg bg-masa-accent/5 border border-masa-accent/20">
          <Lightbulb className="w-4 h-4 text-masa-accent-light shrink-0 mt-0.5" />
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-masa-accent-light mb-0.5">
              Recommended Next
            </div>
            <div className="text-xs text-masa-text-dim">{result.recommendedNextAction}</div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Build Tab ────────────────────────────────────────────────────────────────

function BuildTab({ payload, result, onCopy, copied }: {
  payload: { goal: string; steps: string[]; files: string[]; recommendedTool: string };
  result: { resultSummary: string; toolUsed: string; status: string; timestamp: string } | null;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <div className="p-4 space-y-5">
      <CopyBar label="Copy goal" onCopy={onCopy} copied={copied} />

      <PreviewSection title="Goal" icon={<Target className="w-3.5 h-3.5" />}>
        <p className="text-sm text-masa-text leading-relaxed">{payload.goal}</p>
        <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] px-2 py-1 rounded-md bg-masa-warning/10 border border-masa-warning/20 text-masa-warning font-medium">
          <Lightbulb className="w-3 h-3" />
          {getToolDisplayName(payload.recommendedTool as 'lovable' | 'replit' | 'internal')}
        </div>
      </PreviewSection>

      {payload.steps.length > 0 && (
        <PreviewSection title="Build Steps" icon={<ListChecks className="w-3.5 h-3.5" />}>
          <ol className="space-y-1.5">
            {payload.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-masa-text-dim">
                <span className="shrink-0 w-4 h-4 rounded-full bg-masa-surface border border-masa-border flex items-center justify-center text-[9px] font-mono text-masa-text-muted">
                  {i + 1}
                </span>
                <span className="mt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </PreviewSection>
      )}

      {payload.files.length > 0 && (
        <PreviewSection title="Files / Components" icon={<Code2 className="w-3.5 h-3.5" />}>
          <div className="flex flex-wrap gap-1.5">
            {payload.files.map((f, i) => (
              <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-masa-card border border-masa-border text-masa-text-dim font-mono">
                {f}
              </span>
            ))}
          </div>
        </PreviewSection>
      )}

      {result && (
        <PreviewSection
          title="Execution Result"
          icon={<CheckCircle2 className="w-3.5 h-3.5 text-masa-success" />}
        >
          <div className="text-[11px] px-2 py-1 rounded-md bg-masa-success/10 border border-masa-success/20 text-masa-success font-medium mb-2 inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {getToolDisplayName(result.toolUsed as 'lovable' | 'replit' | 'internal')} · {result.status}
          </div>
          <div className="text-xs text-masa-text-dim font-mono leading-relaxed bg-masa-card rounded-lg p-3 border border-masa-border whitespace-pre-wrap">
            {result.resultSummary}
          </div>
          <div className="text-[11px] text-masa-text-muted mt-1.5">
            {new Date(result.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
          </div>
        </PreviewSection>
      )}
    </div>
  );
}

// ── Packet Tab ───────────────────────────────────────────────────────────────

const PACKET_TARGETS: { target: BuildTarget; icon: React.ReactNode }[] = [
  { target: 'internal', icon: <Save className="w-3 h-3" />    },
  { target: 'replit',   icon: <Terminal className="w-3 h-3" /> },
  { target: 'lovable',  icon: <Rocket className="w-3 h-3" />  },
  { target: 'github',   icon: <GitBranch className="w-3 h-3" />  },
];

function PacketTab({ packet, defaultTarget }: {
  packet: {
    packetId: string;
    title: string;
    objective: string;
    target: BuildTarget;
    implementationSteps: string[];
    fileSuggestions: string[];
    recommendedStack: string[];
    createdAt: string;
  };
  defaultTarget: BuildTarget;
}) {
  const [viewTarget, setViewTarget] = useState<BuildTarget>(defaultTarget);
  const [copied, setCopied] = useState(false);

  const formatted = formatPacketForTarget(packet as Parameters<typeof formatPacketForTarget>[0], viewTarget);

  const handleCopy = () => {
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Packet metadata */}
      <div className="px-3 py-2.5 rounded-lg bg-masa-card border border-masa-border space-y-1">
        <div className="text-xs font-semibold text-masa-text leading-snug">{packet.title}</div>
        <div className="text-[10px] text-masa-text-muted font-mono">
          {packet.packetId} · {new Date(packet.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
        </div>
      </div>

      {/* Target format selector */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-masa-text-muted">
          View as
        </span>
        <div className="flex items-center gap-1">
          {PACKET_TARGETS.map(({ target, icon }) => {
            const isActive = viewTarget === target;
            return (
              <button
                key={target}
                onClick={() => setViewTarget(target)}
                className={`
                  flex items-center gap-1 px-2 py-1 rounded-md border text-[11px] font-medium transition-all
                  ${isActive
                    ? 'bg-masa-accent/10 border-masa-accent/40 text-masa-accent-light'
                    : 'border-masa-border text-masa-text-muted hover:border-masa-border-light hover:text-masa-text-dim'
                  }
                `}
              >
                {icon}
                {getTargetLabel(target)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Copy bar */}
      <button
        onClick={handleCopy}
        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-masa-card border border-masa-border text-xs text-masa-text-dim hover:text-masa-text hover:border-masa-border-light transition-colors"
      >
        {copied ? <CheckCheck className="w-3.5 h-3.5 text-masa-success" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? 'Copied!' : `Copy for ${getTargetLabel(viewTarget)}`}
      </button>

      {/* Formatted output */}
      <div className="text-[11px] text-masa-text-dim font-mono leading-relaxed bg-masa-card rounded-lg p-3 border border-masa-border whitespace-pre-wrap break-words max-h-[500px] overflow-y-auto">
        {formatted}
      </div>
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function PreviewSection({ title, icon, children }: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <span className="text-masa-accent-light">{icon}</span>
        <span className="text-[11px] font-semibold text-masa-text-muted uppercase tracking-wider">{title}</span>
      </div>
      {children}
    </div>
  );
}

function CopyBar({ label, onCopy, copied }: { label: string; onCopy: () => void; copied: boolean }) {
  return (
    <button
      onClick={onCopy}
      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-masa-card border border-masa-border text-xs text-masa-text-dim hover:text-masa-text hover:border-masa-border-light transition-colors"
    >
      {copied ? <CheckCheck className="w-3.5 h-3.5 text-masa-success" /> : <Copy className="w-3.5 h-3.5" />}
      {copied ? 'Copied!' : label}
    </button>
  );
}
