import { useState, useEffect } from 'react';
import { Wand2, Loader2, AlertTriangle, Settings } from 'lucide-react';
import { useProject } from '../../hooks/useProject';
import { isOpenAIKeySet, isXAIKeySet } from '../../services/config';
import { canEnhanceWith, type EnhanceProvider } from '../../services/enhancer';

// ── Provider selector ─────────────────────────────────────────────────────────

const PROVIDER_OPTIONS: {
  id: EnhanceProvider;
  label: string;
  shortLabel: string;
}[] = [
  { id: 'auto',   label: 'Auto',    shortLabel: 'Auto'   },
  { id: 'openai', label: 'OpenAI',  shortLabel: 'GPT'    },
  { id: 'xai',    label: 'xAI',     shortLabel: 'Grok'   },
];

function ProviderSelector({
  value,
  onChange,
  disabled,
}: {
  value: EnhanceProvider;
  onChange: (p: EnhanceProvider) => void;
  disabled: boolean;
}) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1500);
    return () => clearInterval(id);
  }, []);

  void tick; // drives re-render for live key status

  const openaiOk = isOpenAIKeySet();
  const xaiOk    = isXAIKeySet();

  const available: Record<EnhanceProvider, boolean> = {
    auto:   openaiOk || xaiOk,
    openai: openaiOk,
    xai:    xaiOk,
  };

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] text-masa-text-muted shrink-0">Enhance via</span>
      <div className="flex items-center gap-1">
        {PROVIDER_OPTIONS.map(({ id, shortLabel }) => {
          const isSelected = value === id;
          const isAvailable = available[id];

          return (
            <button
              key={id}
              onClick={() => !disabled && onChange(id)}
              disabled={disabled}
              title={isAvailable ? `Use ${shortLabel}` : `${shortLabel} key not configured`}
              className={`
                flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-medium transition-colors
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${isSelected
                  ? 'bg-masa-accent/20 text-masa-accent-light border border-masa-accent/30'
                  : isAvailable
                    ? 'bg-masa-surface border border-masa-border text-masa-text-dim hover:border-masa-border-light hover:text-masa-text'
                    : 'bg-masa-surface border border-masa-border text-masa-text-muted'
                }
              `}
            >
              {/* Availability dot */}
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                id === 'auto'
                  ? (openaiOk || xaiOk) ? 'bg-masa-success' : 'bg-masa-danger'
                  : isAvailable ? 'bg-masa-success' : 'bg-masa-text-muted'
              }`} />
              {shortLabel}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function EnhanceButton() {
  const {
    rawPrompt, isEnhancing, enhancePrompt, promptStatus,
    enhanceProvider, setEnhanceProvider,
  } = useProject();

  const [noProviderAvailable, setNoProviderAvailable] = useState(
    () => !canEnhanceWith(enhanceProvider)
  );

  // Re-check every second — clears automatically when a key is saved
  useEffect(() => {
    const id = setInterval(() => {
      setNoProviderAvailable(!canEnhanceWith(enhanceProvider));
    }, 1000);
    return () => clearInterval(id);
  }, [enhanceProvider]);

  const postEnhance = promptStatus !== 'idle' && promptStatus !== 'enhancing' && promptStatus !== 'error';
  const disabled = !rawPrompt.trim() || isEnhancing || noProviderAvailable || postEnhance;

  return (
    <div className="space-y-2">
      {/* Provider selector */}
      {(promptStatus === 'idle' || promptStatus === 'error') && (
        <ProviderSelector
          value={enhanceProvider}
          onChange={setEnhanceProvider}
          disabled={isEnhancing}
        />
      )}

      {/* Missing provider banner */}
      {noProviderAvailable && (promptStatus === 'idle' || promptStatus === 'error') && (
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-amber-500/8 border border-amber-500/20 text-xs">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-masa-text-dim">
            {enhanceProvider === 'openai'
              ? 'OpenAI key required.'
              : enhanceProvider === 'xai'
                ? 'xAI key required.'
                : 'No enhancement provider configured.'
            }{' '}
            <span className="text-masa-text font-medium">
              Click <Settings className="w-3 h-3 inline-block -mt-px" /> Settings to add a key.
            </span>
          </span>
        </div>
      )}

      <button
        onClick={enhancePrompt}
        disabled={disabled}
        className={`
          group relative w-full py-4 px-6 rounded-xl font-semibold text-base
          transition-all duration-300 cursor-pointer
          ${disabled
            ? 'bg-masa-card border border-masa-border text-masa-text-muted cursor-not-allowed'
            : 'bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white border border-violet-500/30 hover:from-violet-500 hover:via-purple-500 hover:to-indigo-500'
          }
          ${!disabled && !isEnhancing ? 'shadow-[0_0_20px_rgba(124,58,237,0.4),0_0_40px_rgba(124,58,237,0.15)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5),0_0_60px_rgba(124,58,237,0.25)]' : ''}
        `}
        style={!disabled && !isEnhancing ? { animation: 'pulse-glow 3s ease-in-out infinite' } : {}}
      >
        {isEnhancing && (
          <div
            className="absolute inset-0 rounded-xl opacity-30"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />
        )}

        <div className="relative flex items-center justify-center gap-3">
          {isEnhancing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>
                Enhancing via {
                  enhanceProvider === 'auto' ? 'best available provider' :
                  enhanceProvider === 'xai' ? 'xAI Grok' : 'OpenAI GPT'
                }...
              </span>
            </>
          ) : (
            <>
              <Wand2 className="w-5 h-5 transition-transform group-hover:rotate-12" />
              <span>Enhance Prompt</span>
            </>
          )}
        </div>
      </button>
    </div>
  );
}
