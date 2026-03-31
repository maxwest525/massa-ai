import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Key, CheckCircle2, XCircle, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import {
  getOpenAIKey, getAnthropicKey, getXAIKey, getGeminiKey, getClaudeInstructions,
  setOpenAIKey, setAnthropicKey, setXAIKey, setGeminiKey, setClaudeInstructions,
  getProviderStatuses, type ProviderInfo,
} from '../../services/config';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

// ── Key field ─────────────────────────────────────────────────────────────────

interface KeyFieldProps {
  label: string;
  placeholder: string;
  isSet: boolean;
  docsHint?: string;
  onSave: (key: string) => void;
  onClear: () => void;
}

function KeyField({ label, placeholder, isSet, docsHint, onSave, onClear }: KeyFieldProps) {
  const [value, setValue] = useState('');
  const [visible, setVisible] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (!value.trim()) return;
    onSave(value.trim());
    setValue('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-1.5">
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
              <span className="text-[11px] text-masa-danger">Not set</span>
            </>
          )}
        </div>
      </div>

      {docsHint && !isSet && (
        <p className="text-[11px] text-masa-text-muted">
          Get key:{' '}
          <span className="font-mono text-masa-accent-light">{docsHint}</span>
        </p>
      )}

      {isSet && !value && (
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-masa-success/5 border border-masa-success/20">
          <span className="text-xs text-masa-text-dim font-mono tracking-widest">••••••••••••••••••••</span>
          <button onClick={onClear} className="text-[11px] text-masa-danger hover:text-red-400 transition-colors">
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

// ── Provider status card ──────────────────────────────────────────────────────

function ProviderCard({ provider }: { provider: ProviderInfo }) {
  return (
    <div className={`flex items-center justify-between px-3 py-2.5 rounded-lg border ${
      provider.status === 'ready'
        ? 'bg-masa-success/5 border-masa-success/20'
        : 'bg-masa-surface border-masa-border'
    }`}>
      <div className="flex items-center gap-2">
        {provider.status === 'ready'
          ? <CheckCircle2 className="w-3.5 h-3.5 text-masa-success" />
          : <XCircle className="w-3.5 h-3.5 text-masa-text-muted" />}
        <span className="text-sm text-masa-text">{provider.label}</span>
      </div>
      <span className={`text-[11px] font-medium ${
        provider.status === 'ready' ? 'text-masa-success' : 'text-masa-text-muted'
      }`}>
        {provider.status === 'ready' ? 'Connected' : 'Not set'}
      </span>
    </div>
  );
}

// ── Main panel ────────────────────────────────────────────────────────────────

export function SettingsPanel({ isOpen, onClose }: Props) {
  const [tick, setTick] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);
  const [instructions, setInstructions] = useState('');
  const [instructionsSaved, setInstructionsSaved] = useState(false);

  void tick;

  const refresh = () => setTick((t) => t + 1);

  const openaiKey    = getOpenAIKey();
  const anthropicKey = getAnthropicKey();
  const xaiKey       = getXAIKey();
  const geminiKey    = getGeminiKey();
  const providers    = getProviderStatuses();
  const connectedCount = providers.filter((p) => p.status === 'ready').length;

  useEffect(() => {
    if (isOpen) {
      queueMicrotask(refresh);
      setInstructions(getClaudeInstructions());
    }
  }, [isOpen]);

  const handleSaveInstructions = () => {
    setClaudeInstructions(instructions);
    setInstructionsSaved(true);
    setTimeout(() => setInstructionsSaved(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed right-0 top-0 bottom-0 z-50 w-[440px] bg-masa-card border-l border-masa-border flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-masa-border shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-masa-surface flex items-center justify-center">
              <Key className="w-3.5 h-3.5 text-masa-accent-light" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-masa-text">Settings</h2>
              <p className="text-[11px] text-masa-text-dim">
                {connectedCount}/{providers.length} providers connected
              </p>
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

          {/* Provider overview */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-masa-text-muted uppercase tracking-wider">
              Connected Providers
            </h3>
            <div className="space-y-1.5">
              {providers.map((p) => <ProviderCard key={p.id} provider={p} />)}
            </div>
          </div>

          {/* API Keys */}
          <div className="space-y-5">
            <h3 className="text-xs font-semibold text-masa-text-muted uppercase tracking-wider">
              API Keys
            </h3>

            <KeyField
              label="OpenAI (GPT-4o)"
              placeholder="sk-proj-..."
              isSet={!!openaiKey}
              docsHint="platform.openai.com/api-keys"
              onSave={(k) => { setOpenAIKey(k); refresh(); }}
              onClear={() => { setOpenAIKey(''); refresh(); }}
            />

            <KeyField
              label="Anthropic (Claude)"
              placeholder="sk-ant-..."
              isSet={!!anthropicKey}
              docsHint="console.anthropic.com/settings/keys"
              onSave={(k) => { setAnthropicKey(k); refresh(); }}
              onClear={() => { setAnthropicKey(''); refresh(); }}
            />

            <KeyField
              label="Google Gemini"
              placeholder="AIza..."
              isSet={!!geminiKey}
              docsHint="aistudio.google.com/apikey"
              onSave={(k) => { setGeminiKey(k); refresh(); }}
              onClear={() => { setGeminiKey(''); refresh(); }}
            />

            <KeyField
              label="xAI (Grok)"
              placeholder="xai-..."
              isSet={!!xaiKey}
              docsHint="console.x.ai"
              onSave={(k) => { setXAIKey(k); refresh(); }}
              onClear={() => { setXAIKey(''); refresh(); }}
            />
          </div>

          {/* Claude Knowledge Base */}
          <div className="space-y-3">
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2">
                <Brain className="w-3.5 h-3.5 text-masa-accent-light" />
                <h3 className="text-xs font-semibold text-masa-text-muted uppercase tracking-wider">
                  Claude Knowledge Base
                </h3>
              </div>
              {showInstructions
                ? <ChevronUp className="w-3.5 h-3.5 text-masa-text-dim" />
                : <ChevronDown className="w-3.5 h-3.5 text-masa-text-dim" />}
            </button>

            {showInstructions && (
              <div className="space-y-2">
                <p className="text-[11px] text-masa-text-muted leading-relaxed">
                  These instructions are injected into every Claude call. Tell Claude about your stack, style, goals, or anything it should always know.
                </p>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder={`I build trading bots in Python using ccxt. I prefer async code, type annotations, and modular architecture. Always suggest tests. My primary exchange is Binance.`}
                  rows={6}
                  className="w-full bg-masa-surface border border-masa-border rounded-lg px-3 py-2.5 text-sm text-masa-text placeholder:text-masa-text-muted focus:outline-none focus:border-masa-accent/50 resize-none"
                />
                <button
                  onClick={handleSaveInstructions}
                  className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors ${
                    instructionsSaved
                      ? 'bg-masa-success/20 text-masa-success'
                      : 'bg-masa-accent/20 text-masa-accent-light hover:bg-masa-accent/30'
                  }`}
                >
                  {instructionsSaved ? 'Saved to knowledge base!' : 'Save Instructions'}
                </button>
              </div>
            )}
          </div>

          {/* Security note */}
          <div className="px-3 py-3 rounded-lg bg-masa-surface border border-masa-border">
            <p className="text-xs text-masa-text-dim leading-relaxed">
              Keys are stored in your{' '}
              <span className="text-masa-text font-medium">browser's local storage</span>.
              For a more secure setup, add them to your{' '}
              <span className="font-mono text-masa-accent-light">.env</span> file.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
