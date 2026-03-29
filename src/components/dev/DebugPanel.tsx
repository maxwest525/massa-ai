import { useState } from 'react';
import { Bug, ChevronDown, ChevronUp } from 'lucide-react';
import { useProject } from '../../hooks/useProject';
import { getProviderStatuses, isAnthropicKeySet } from '../../services/config';
import { getTargetLabel } from '../../services/targetFormatter';

/**
 * Dev-only debug overlay. Only rendered when import.meta.env.DEV is true.
 * Fixed to the bottom-left corner; collapsible.
 */
export function DebugPanel() {
  const [open, setOpen] = useState(false);
  const {
    promptStatus, error, isEnhancing, isPlanning, isBuilding, isDispatching,
    enhanceProvider, resolvedProvider, planningSkipReason,
    buildTarget, buildPacket, packetStatus,
  } = useProject();

  const providers = getProviderStatuses();
  const planningAvailable = isAnthropicKeySet();

  const statusDot = (ok: boolean) =>
    ok
      ? <span className="w-2 h-2 rounded-full bg-green-500 shrink-0 inline-block" />
      : <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 inline-block" />;

  const activeFlags = [
    isEnhancing   && 'enhancing',
    isPlanning    && 'planning',
    isBuilding    && 'building',
    isDispatching && 'dispatching',
  ].filter(Boolean);

  return (
    <div className="fixed bottom-3 left-3 z-[9999] font-mono text-[11px]">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-masa-card/90 border border-masa-border text-masa-text-muted hover:text-masa-text backdrop-blur-sm transition-colors"
      >
        <Bug className="w-3 h-3" />
        <span>debug</span>
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
      </button>

      {/* Panel */}
      {open && (
        <div className="mt-1 w-[280px] bg-masa-card/95 border border-masa-border rounded-lg p-3 space-y-3 backdrop-blur-sm shadow-xl">
          {/* Providers */}
          <section className="space-y-1">
            <p className="text-masa-text-muted uppercase tracking-wider text-[9px] font-semibold">Providers</p>
            {providers.map((p) => (
              <div key={p.id} className="flex items-center gap-2 text-masa-text-dim">
                {statusDot(p.status === 'ready')}
                <span>{p.label}</span>
                <span className="ml-auto text-masa-text-muted">{p.status}</span>
              </div>
            ))}
          </section>

          {/* Enhance provider */}
          <section className="space-y-1">
            <p className="text-masa-text-muted uppercase tracking-wider text-[9px] font-semibold">Enhance Provider</p>
            <div className="flex items-center gap-2 text-masa-text-dim">
              <span className="text-masa-text-muted">selected:</span>
              <span className="text-masa-text">{enhanceProvider}</span>
            </div>
            <div className="flex items-center gap-2 text-masa-text-dim">
              <span className="text-masa-text-muted">resolved:</span>
              <span className="text-masa-text">{resolvedProvider ?? '—'}</span>
            </div>
          </section>

          {/* Build target + packet */}
          <section className="space-y-1">
            <p className="text-masa-text-muted uppercase tracking-wider text-[9px] font-semibold">Build Packet</p>
            <div className="flex items-center gap-2 text-masa-text-dim">
              <span className="text-masa-text-muted">target:</span>
              <span className="text-masa-text">{getTargetLabel(buildTarget)}</span>
            </div>
            <div className="flex items-center gap-2 text-masa-text-dim">
              <span className="text-masa-text-muted">status:</span>
              <span className={`${packetStatus === 'generated' ? 'text-green-400' : packetStatus === 'ready' ? 'text-masa-warning' : 'text-masa-text-muted'}`}>
                {packetStatus}
              </span>
            </div>
            {buildPacket && (
              <div className="flex items-center gap-2 text-masa-text-dim">
                <span className="text-masa-text-muted">id:</span>
                <span className="text-masa-text truncate">{buildPacket.packetId.slice(-12)}</span>
              </div>
            )}
          </section>

          {/* Pipeline stage */}
          <section className="space-y-1">
            <p className="text-masa-text-muted uppercase tracking-wider text-[9px] font-semibold">Pipeline</p>
            <div className="flex items-center gap-2 text-masa-text-dim">
              <span className="text-masa-text">{promptStatus}</span>
              {activeFlags.length > 0 && (
                <span className="text-masa-warning">[{activeFlags.join(', ')}]</span>
              )}
            </div>
          </section>

          {/* Planning availability */}
          <section className="space-y-1">
            <p className="text-masa-text-muted uppercase tracking-wider text-[9px] font-semibold">Planning</p>
            <div className="flex items-center gap-2 text-masa-text-dim">
              {statusDot(planningAvailable)}
              <span>{planningAvailable ? 'available' : 'key missing'}</span>
            </div>
            {planningSkipReason && (
              <p className="text-masa-warning leading-relaxed break-words text-[10px]">
                skip: {planningSkipReason.length > 80 ? `${planningSkipReason.slice(0, 80)}…` : planningSkipReason}
              </p>
            )}
          </section>

          {/* Last error */}
          <section className="space-y-1">
            <p className="text-masa-text-muted uppercase tracking-wider text-[9px] font-semibold">Last Error</p>
            {error ? (
              <p className="text-masa-danger leading-relaxed break-words">
                {error.length > 120 ? `${error.slice(0, 120)}…` : error}
              </p>
            ) : (
              <p className="text-masa-text-muted">none</p>
            )}
          </section>

          {/* Execution mode */}
          <section className="space-y-1">
            <p className="text-masa-text-muted uppercase tracking-wider text-[9px] font-semibold">Dispatch</p>
            <p className="text-masa-text-dim">simulated (no real Replit/Lovable)</p>
          </section>
        </div>
      )}
    </div>
  );
}
