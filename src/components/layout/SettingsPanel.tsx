import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Key, CheckCircle2, XCircle, AlertTriangle, Clock } from 'lucide-react';
import {
  getOpenAIKey, getAnthropicKey, getXAIKey,
  setOpenAIKey, setAnthropicKey, setXAIKey,
  getProviderStatuses, type ProviderInfo,
} from '../../services/config';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// ── Individual key entry field ────────────────────────────────────────────────

interface KeyFieldProps {
  label: string;
  placeholder: string;
  isSet: boolean;
  onSave: (key: string) => void;
  onClear: () => void;
}

function KeyField({ label, placeholder, isSet, onSave, onClear }: KeyFieldProps) {
  const [value, setValue] = useState('');
  const [visible, setVisible] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!value.trim()) return;
    onSave(value.trim());
    setValue('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-masa-text">{label}</span>
        <div className="flex items-center gap-1.5">
          {isSet ? (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-masa-success" />
              <span className="text-[11px] text-masa-success font-medium">Active</span>
            </>
          ) : (
            <>
              <XCircle className="w-3.5 h-3.5 text-masa-danger" />
              <span className="text-[11px] text-masa-danger font-medium">Not set</span>
            </>
          )}
        </div>
      </div>

      {/* Masked indicator for set key — no characters exposed */}
      {isSet && !value && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-masa-success/5 border border-masa-success/20">
          <span className="text-xs text-masa-text-dim font-mono tracking-widest">
            ••••••••••••••••••••
          </span>
          <button
            onClick={onClear}
            className="text-[11px] text-masa-danger hover:text-red-400 transition-colors"
          >
            Remove
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type={visible ? 'text' : 'password'}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={isSet ? 'Enter new key to replace...' : placeholder}
            className="w-full bg-masa-surface border border-masa-border rounded-lg px-3 py-2 text-sm text-masa-text font-mono placeholder:text-masa-text-muted focus:outline-none focus:border-masa-accent/50 pr-8"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <button
            onClick={() => setVisible(!visible)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-masa-text-dim hover:text-masa-text transition-colors"
          >
            {visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>
        <button
          onClick={handleSave}
          disabled={!value.trim()}
          className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
            saved
              ? 'bg-masa-success/20 text-masa-success'
              : value.trim()
                ? 'bg-masa-accent/20 text-masa-accent-light hover:bg-masa-accent/30'
                : 'bg-masa-surface text-masa-text-muted cursor-not-allowed'
          }`}
        >
          {saved ? 'Saved!' : 'Save'}
        </button>
      </div>
    </div>
  );
}

// ── Provider status row (no key entry — status display only) ─────────────────

function ProviderRow({ provider }: { provider: ProviderInfo }) {
  const statusConfig = {
    ready:           { icon: <CheckCircle2 className="w-3.5 h-3.5 text-masa-success" />, label: 'Connected',       cls: 'text-masa-success' },
    missing_key:     { icon: <XCircle className="w-3.5 h-3.5 text-masa-danger" />,       label: 'Key missing',     cls: 'text-masa-danger'  },
    not_configured:  { icon: <Clock className="w-3.5 h-3.5 text-masa-text-muted" />,     label: 'Coming soon',     cls: 'text-masa-text-muted' },
  }[provider.status];

  return (
    <div className="px-3 py-3 rounded-lg bg-masa-surface border border-masa-border space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {statusConfig.icon}
          <span className="text-sm font-medium text-masa-text">{provider.label}</span>
        </div>
        <span className={`text-[11px] font-medium ${statusConfig.cls}`}>
          {statusConfig.label}
        </span>
      </div>
      <div className="pl-0.5 space-y-0.5">
        <p className="text-[11px] text-masa-text-muted">
          Enables: {provider.features.join(', ')}
        </p>
        {provider.status !== 'ready' && provider.status !== 'not_configured' && (
          <p className="text-[11px] text-masa-text-muted">
            Get key: <span className="font-mono text-masa-accent-light">{provider.docsHint}</span>
          </p>
        )}
      </div>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function SettingsPanel({ isOpen, onClose }: Props) {
  const [tick, setTick] = useState(0);

  // Re-read key status whenever the panel opens or a key is saved
  const refresh = () => setTick((t) => t + 1);

  const openaiKey   = getOpenAIKey();
  const anthropicKey = getAnthropicKey();
  const xaiKey      = getXAIKey();
  const providers   = getProviderStatuses();

  // Suppress the "unused" warning — tick drives re-render, above reads are live
  void tick;

  const isOpenAISet    = !!openaiKey;
  const isAnthropicSet = !!anthropicKey;
  const isXAISet       = !!xaiKey;
  const allCoreSet     = isOpenAISet && isAnthropicSet;

  useEffect(() => {
    if (isOpen) refresh();
  }, [isOpen]);

  const handleSaveOpenAI = (key: string) => { setOpenAIKey(key);    refresh(); };
  const handleSaveAnthropic = (key: string) => { setAnthropicKey(key); refresh(); };
  const handleSaveXAI   = (key: string) => { setXAIKey(key);      refresh(); };
  const handleClearOpenAI    = () => { setOpenAIKey('');    refresh(); };
  const handleClearAnthropic = () => { setAnthropicKey(''); refresh(); };
  const handleClearXAI       = () => { setXAIKey('');       refresh(); };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-[420px] bg-masa-card border-l border-masa-border flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-masa-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-masa-surface flex items-center justify-center">
              <Key className="w-3.5 h-3.5 text-masa-accent-light" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-masa-text">Settings</h2>
              <p className="text-[11px] text-masa-text-dim">API keys & provider status</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-masa-text-dim hover:text-masa-text hover:bg-masa-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">

          {/* Status banner */}
          {!allCoreSet ? (
            <div className="flex items-start gap-2.5 px-3 py-3 rounded-lg bg-masa-warning/8 border border-masa-warning/20">
              <AlertTriangle className="w-4 h-4 text-masa-warning shrink-0 mt-0.5" />
              <div className="text-xs text-masa-text-dim leading-relaxed">
                <span className="text-masa-warning font-medium">Action required. </span>
                Add your OpenAI and Anthropic keys to enable the full pipeline.
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-masa-success/8 border border-masa-success/20">
              <CheckCircle2 className="w-4 h-4 text-masa-success shrink-0" />
              <span className="text-xs text-masa-success font-medium">All core providers connected — pipeline ready</span>
            </div>
          )}

          {/* Provider status overview */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-masa-text-muted uppercase tracking-wider">
              Provider Status
            </h3>
            {providers.map((p) => <ProviderRow key={p.id} provider={p} />)}
          </div>

          {/* Key entry forms */}
          <div className="space-y-5">
            <h3 className="text-xs font-semibold text-masa-text-muted uppercase tracking-wider">
              API Keys
            </h3>

            <KeyField
              label="OpenAI"
              placeholder="sk-proj-..."
              isSet={isOpenAISet}
              onSave={handleSaveOpenAI}
              onClear={handleClearOpenAI}
            />

            <KeyField
              label="Anthropic"
              placeholder="sk-ant-..."
              isSet={isAnthropicSet}
              onSave={handleSaveAnthropic}
              onClear={handleClearAnthropic}
            />

            <div className="space-y-2 opacity-60">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-masa-text">xAI / Grok</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-masa-border text-masa-text-muted">
                  Coming soon
                </span>
              </div>
              <KeyField
                label=""
                placeholder="xai-..."
                isSet={isXAISet}
                onSave={handleSaveXAI}
                onClear={handleClearXAI}
              />
            </div>
          </div>

          {/* Security note */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-masa-text-muted uppercase tracking-wider">
              Security
            </h3>
            <div className="px-3 py-3 rounded-lg bg-masa-surface border border-masa-border space-y-1.5">
              <p className="text-xs text-masa-text-dim leading-relaxed">
                Keys are saved in your <span className="text-masa-text font-medium">browser's local storage</span> and persist across sessions.
              </p>
              <p className="text-xs text-masa-text-dim leading-relaxed">
                For a more secure setup, add them to your{' '}
                <span className="font-mono text-masa-accent-light">.env</span> file as{' '}
                <span className="font-mono text-masa-accent-light">VITE_OPENAI_API_KEY</span> and{' '}
                <span className="font-mono text-masa-accent-light">VITE_ANTHROPIC_API_KEY</span>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
