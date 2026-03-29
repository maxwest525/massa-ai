import { useState } from 'react';
import {
  Hammer, Rocket, Terminal, Save, Loader2, CheckCircle2,
  Target, ListChecks, FileCode, Lightbulb, PackageOpen,
  GitBranch, Copy, CheckCheck, Zap,
} from 'lucide-react';
import { useProject } from '../../hooks/useProject';
import type { BuildTool, BuildTarget } from '../../types';
import { getToolDisplayName } from '../../services/dispatcher';
import { getTargetLabel, formatPacketForTarget } from '../../services/targetFormatter';

// ── Build Target selector config ─────────────────────────────────────────────

const BUILD_TARGETS: {
  target: BuildTarget;
  icon: React.ReactNode;
  accent: string;
}[] = [
  { target: 'internal', icon: <Save className="w-3 h-3" />,   accent: 'border-masa-border text-masa-text-dim hover:border-masa-border-light hover:text-masa-text' },
  { target: 'replit',   icon: <Terminal className="w-3 h-3" />, accent: 'border-blue-500/30 text-blue-400 hover:border-blue-400/50' },
  { target: 'lovable',  icon: <Rocket className="w-3 h-3" />,  accent: 'border-pink-500/30 text-pink-400 hover:border-pink-400/50' },
  { target: 'github',   icon: <GitBranch className="w-3 h-3" />,  accent: 'border-violet-500/30 text-violet-400 hover:border-violet-400/50' },
];

// ── Dispatch button config (old execution flow) ──────────────────────────────

const DISPATCH_BUTTONS: {
  tool: BuildTool;
  icon: React.ReactNode;
  accent: string;
  hoverAccent: string;
}[] = [
  { tool: 'lovable',  icon: <Rocket className="w-4 h-4" />,   accent: 'bg-pink-500/20 text-pink-400 border-pink-500/30 hover:bg-pink-500/30',       hoverAccent: 'ring-pink-500/40'         },
  { tool: 'replit',   icon: <Terminal className="w-4 h-4" />, accent: 'bg-blue-500/20 text-blue-400 border-blue-500/30 hover:bg-blue-500/30',         hoverAccent: 'ring-blue-500/40'         },
  { tool: 'internal', icon: <Save className="w-4 h-4" />,     accent: 'bg-masa-success/20 text-masa-success border-masa-success/30 hover:bg-masa-success/30', hoverAccent: 'ring-masa-success/40' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export function BuildPanel() {
  const {
    buildPayload, buildResult, isDispatching, promptStatus, dispatchTo,
    buildTarget, setBuildTarget, buildPacket, packetStatus, generateBuildPacket,
    enhancedResult,
  } = useProject();

  const [dispatchingTool, setDispatchingTool] = useState<BuildTool | null>(null);
  const [packetCopied, setPacketCopied] = useState(false);

  const showPanel =
    promptStatus === 'planned' ||
    promptStatus === 'building' ||
    promptStatus === 'built' ||
    promptStatus === 'dispatching' ||
    promptStatus === 'dispatched' ||
    promptStatus === 'complete';

  if (!showPanel) return null;

  const canGeneratePacket = !!(enhancedResult);
  const isPacketGenerated = packetStatus === 'generated';

  const handleDispatch = async (tool: BuildTool) => {
    setDispatchingTool(tool);
    await dispatchTo(tool);
    setDispatchingTool(null);
  };

  const handleCopyPacket = () => {
    if (!buildPacket) return;
    const text = formatPacketForTarget(buildPacket, buildTarget);
    navigator.clipboard.writeText(text);
    setPacketCopied(true);
    setTimeout(() => setPacketCopied(false), 2000);
  };

  return (
    <div className="bg-masa-card border border-masa-border rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-masa-border flex items-center gap-2">
        <Hammer className="w-4 h-4 text-masa-accent-light" />
        <span className="text-sm font-semibold text-masa-text">Build & Handoff</span>
        {isPacketGenerated && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-masa-accent/15 text-masa-accent-light font-medium">
            Packet Ready
          </span>
        )}
        {buildResult && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-masa-success/20 text-masa-success font-medium ml-auto">
            Dispatched
          </span>
        )}
      </div>

      <div className="p-4 space-y-5">
        {/* ── Build Target Selector ── */}
        <div className="space-y-1.5">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-masa-text-muted">
            Build Target
          </div>
          <div className="flex items-center gap-1.5">
            {BUILD_TARGETS.map(({ target, icon, accent }) => {
              const isActive = buildTarget === target;
              return (
                <button
                  key={target}
                  onClick={() => setBuildTarget(target)}
                  title={getTargetLabel(target)}
                  className={`
                    flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium
                    transition-all
                    ${isActive
                      ? 'bg-masa-accent/10 border-masa-accent/40 text-masa-accent-light'
                      : `bg-transparent ${accent}`
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

        {/* ── Build Packet Section ── */}
        <div className="space-y-2">
          <div className="text-[10px] font-semibold uppercase tracking-wider text-masa-text-muted">
            Build Packet
          </div>

          {!isPacketGenerated ? (
            <button
              onClick={generateBuildPacket}
              disabled={!canGeneratePacket}
              className={`
                w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium
                transition-all
                ${canGeneratePacket
                  ? 'bg-masa-accent/10 border-masa-accent/30 text-masa-accent-light hover:bg-masa-accent/15 hover:border-masa-accent/40'
                  : 'bg-masa-surface border-masa-border text-masa-text-muted opacity-50 cursor-not-allowed'
                }
              `}
            >
              <PackageOpen className="w-4 h-4" />
              Generate Build Packet
              {canGeneratePacket && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-masa-accent/15 text-masa-accent-light font-medium ml-1">
                  for {getTargetLabel(buildTarget)}
                </span>
              )}
            </button>
          ) : (
            <div className="rounded-lg border border-masa-accent/20 bg-masa-accent/5 overflow-hidden">
              {/* Packet header */}
              <div className="px-3 py-2.5 flex items-start gap-2">
                <PackageOpen className="w-3.5 h-3.5 text-masa-accent-light shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-masa-text truncate">
                    {buildPacket!.title}
                  </div>
                  <div className="text-[10px] text-masa-text-muted mt-0.5 flex items-center gap-1.5">
                    <span className="px-1.5 py-0.5 rounded bg-masa-accent/10 text-masa-accent-light">
                      {getTargetLabel(buildTarget)}
                    </span>
                    <span>{buildPacket!.implementationSteps.length} steps</span>
                    {buildPacket!.fileSuggestions.length > 0 && (
                      <span>· {buildPacket!.fileSuggestions.length} files</span>
                    )}
                  </div>
                </div>
              </div>
              {/* Copy action */}
              <div className="border-t border-masa-accent/15 px-3 py-2 flex items-center gap-2">
                <button
                  onClick={handleCopyPacket}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-masa-accent/15 border border-masa-accent/30 text-xs font-medium text-masa-accent-light hover:bg-masa-accent/20 transition-colors"
                >
                  {packetCopied
                    ? <><CheckCheck className="w-3.5 h-3.5" /> Copied!</>
                    : <><Copy className="w-3.5 h-3.5" /> Copy for {getTargetLabel(buildTarget)}</>
                  }
                </button>
                <span className="text-[10px] text-masa-text-muted">
                  Open Preview → Packet tab for all formats
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Existing Build Payload section (only when payload exists) ── */}
        {buildPayload && (
          <>
            <div className="border-t border-masa-border pt-4 space-y-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-masa-text-muted flex items-center gap-1.5">
                <Zap className="w-3 h-3" />
                Execution Payload
              </div>
              <div className="flex items-start gap-2">
                <Target className="w-3.5 h-3.5 text-masa-accent-light mt-0.5 shrink-0" />
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-masa-text-muted mb-0.5">Goal</div>
                  <div className="text-sm text-masa-text">{buildPayload.goal}</div>
                </div>
              </div>

              {buildPayload.steps.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <ListChecks className="w-3.5 h-3.5 text-masa-info" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-masa-text-muted">
                      Steps
                    </span>
                  </div>
                  <div className="space-y-1">
                    {buildPayload.steps.slice(0, 5).map((step, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs">
                        <span className="shrink-0 w-4 h-4 rounded-full bg-masa-surface text-masa-text-muted text-[9px] font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        <span className="text-masa-text-dim">{step}</span>
                      </div>
                    ))}
                    {buildPayload.steps.length > 5 && (
                      <div className="text-[10px] text-masa-text-muted pl-6">
                        +{buildPayload.steps.length - 5} more steps
                      </div>
                    )}
                  </div>
                </div>
              )}

              {buildPayload.files.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <FileCode className="w-3.5 h-3.5 text-masa-success" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-masa-text-muted">
                      Files
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {buildPayload.files.slice(0, 8).map((file, i) => (
                      <span
                        key={i}
                        className="text-[11px] px-2 py-0.5 rounded-md bg-masa-surface border border-masa-border text-masa-text-dim font-mono"
                      >
                        {file}
                      </span>
                    ))}
                    {buildPayload.files.length > 8 && (
                      <span className="text-[10px] text-masa-text-muted self-center">
                        +{buildPayload.files.length - 8}
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-masa-surface border border-masa-border text-xs">
                <Lightbulb className="w-3.5 h-3.5 text-masa-warning" />
                <span className="text-masa-text-dim">
                  Recommended:{' '}
                  <span className="text-masa-text font-semibold">
                    {getToolDisplayName(buildPayload.recommendedTool)}
                  </span>
                </span>
              </div>
            </div>

            {/* Dispatch buttons */}
            {!buildResult && (
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-wider text-masa-text-muted mb-2">
                  Simulate Dispatch
                </div>
                <div className="flex items-center gap-2">
                  {DISPATCH_BUTTONS.map(({ tool, icon, accent, hoverAccent }) => {
                    const isRecommended = tool === buildPayload.recommendedTool;
                    const isActive = dispatchingTool === tool;

                    return (
                      <button
                        key={tool}
                        onClick={() => handleDispatch(tool)}
                        disabled={isDispatching}
                        className={`
                          flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium
                          transition-all disabled:opacity-50 disabled:cursor-not-allowed
                          ${accent}
                          ${isRecommended ? `ring-1 ${hoverAccent}` : ''}
                        `}
                      >
                        {isActive ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
                        <span>
                          {tool === 'internal' ? 'Save' : getToolDisplayName(tool)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Execution Result */}
            {buildResult && (
              <div className="rounded-lg bg-masa-surface border border-masa-success/20 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-masa-success" />
                  <span className="text-sm font-semibold text-masa-success">Execution Complete</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-masa-success/10 text-masa-success font-medium ml-auto">
                    {getToolDisplayName(buildResult.toolUsed)}
                  </span>
                </div>
                <div className="text-xs text-masa-text-dim font-mono leading-relaxed whitespace-pre-wrap bg-masa-card rounded-md p-3 border border-masa-border">
                  {buildResult.resultSummary}
                </div>
                <div className="flex items-center gap-2 mt-2 text-[11px] text-masa-text-muted">
                  <span>Status: {buildResult.status}</span>
                  <span>·</span>
                  <span>{new Date(buildResult.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
