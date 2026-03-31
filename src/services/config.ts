// Keys are saved to localStorage and persist across sessions.
// localStorage values take priority over .env variables.

const SK_OPENAI     = 'massa_openai_key';
const SK_ANTHROPIC  = 'massa_anthropic_key';
const SK_XAI        = 'massa_xai_key';
const SK_GEMINI     = 'massa_gemini_key';
const SK_CLAUDE_INS = 'massa_claude_instructions';

// ── Key getters / setters ──────────────────────────────────────────────────

export function getOpenAIKey(): string {
  return localStorage.getItem(SK_OPENAI) || import.meta.env.VITE_OPENAI_API_KEY || '';
}

export function getAnthropicKey(): string {
  return localStorage.getItem(SK_ANTHROPIC) || import.meta.env.VITE_ANTHROPIC_API_KEY || '';
}

export function getXAIKey(): string {
  return localStorage.getItem(SK_XAI) || import.meta.env.VITE_XAI_API_KEY || '';
}

export function getGeminiKey(): string {
  return localStorage.getItem(SK_GEMINI) || import.meta.env.VITE_GEMINI_API_KEY || '';
}

/** Custom standing instructions injected into every Claude call */
export function getClaudeInstructions(): string {
  return localStorage.getItem(SK_CLAUDE_INS) || '';
}

export function setOpenAIKey(key: string): void {
  const trimmed = key.trim();
  if (trimmed) localStorage.setItem(SK_OPENAI, trimmed);
  else localStorage.removeItem(SK_OPENAI);
}

export function setAnthropicKey(key: string): void {
  const trimmed = key.trim();
  if (trimmed) localStorage.setItem(SK_ANTHROPIC, trimmed);
  else localStorage.removeItem(SK_ANTHROPIC);
}

export function setXAIKey(key: string): void {
  const trimmed = key.trim();
  if (trimmed) localStorage.setItem(SK_XAI, trimmed);
  else localStorage.removeItem(SK_XAI);
}

export function setGeminiKey(key: string): void {
  const trimmed = key.trim();
  if (trimmed) localStorage.setItem(SK_GEMINI, trimmed);
  else localStorage.removeItem(SK_GEMINI);
}

export function setClaudeInstructions(instructions: string): void {
  const trimmed = instructions.trim();
  if (trimmed) localStorage.setItem(SK_CLAUDE_INS, trimmed);
  else localStorage.removeItem(SK_CLAUDE_INS);
}

// ── Availability checks ────────────────────────────────────────────────────

export function isOpenAIKeySet(): boolean   { return !!getOpenAIKey(); }
export function isAnthropicKeySet(): boolean { return !!getAnthropicKey(); }
export function isXAIKeySet(): boolean       { return !!getXAIKey(); }
export function isGeminiKeySet(): boolean    { return !!getGeminiKey(); }

export function getKeyStatus() {
  return {
    openai:    isOpenAIKeySet(),
    anthropic: isAnthropicKeySet(),
    xai:       isXAIKeySet(),
    gemini:    isGeminiKeySet(),
    allSet: isOpenAIKeySet() && isAnthropicKeySet(),
  };
}

// ── Provider registry ──────────────────────────────────────────────────────

export type ProviderStatus = 'ready' | 'missing_key';

export type ProviderId = 'openai' | 'anthropic' | 'xai' | 'gemini';

export interface ProviderInfo {
  id: ProviderId;
  label: string;
  status: ProviderStatus;
  features: string[];
  docsHint: string;
  envVar: string;
}

export function getProviderStatuses(): ProviderInfo[] {
  return [
    {
      id: 'openai',
      label: 'OpenAI (GPT-4o)',
      status: isOpenAIKeySet() ? 'ready' : 'missing_key',
      features: ['Prompt Enhancement', 'Smart Routing'],
      docsHint: 'platform.openai.com/api-keys',
      envVar: 'VITE_OPENAI_API_KEY',
    },
    {
      id: 'anthropic',
      label: 'Anthropic (Claude)',
      status: isAnthropicKeySet() ? 'ready' : 'missing_key',
      features: ['Planning', 'Architecture', 'Code Generation'],
      docsHint: 'console.anthropic.com/settings/keys',
      envVar: 'VITE_ANTHROPIC_API_KEY',
    },
    {
      id: 'xai',
      label: 'xAI (Grok)',
      status: isXAIKeySet() ? 'ready' : 'missing_key',
      features: ['Fast Enhancement', 'Creative Tasks'],
      docsHint: 'console.x.ai',
      envVar: 'VITE_XAI_API_KEY',
    },
    {
      id: 'gemini',
      label: 'Google (Gemini)',
      status: isGeminiKeySet() ? 'ready' : 'missing_key',
      features: ['Enhancement', 'Research', 'Multimodal'],
      docsHint: 'aistudio.google.com/apikey',
      envVar: 'VITE_GEMINI_API_KEY',
    },
  ];
}

// ── Provider resolution ────────────────────────────────────────────────────

import type { EnhanceProvider } from '../types';

export function resolveEnhanceProvider(
  selected: EnhanceProvider,
): { resolved: 'openai' | 'xai' | 'gemini'; label: string; fallback: boolean } {
  if (selected === 'openai') {
    return { resolved: 'openai', label: 'OpenAI GPT-4o', fallback: false };
  }
  if (selected === 'xai') {
    return { resolved: 'xai', label: 'xAI Grok', fallback: false };
  }
  if (selected === 'gemini') {
    return { resolved: 'gemini', label: 'Google Gemini', fallback: false };
  }

  // Auto: pick best available in priority order
  if (isOpenAIKeySet())  return { resolved: 'openai', label: 'OpenAI GPT-4o', fallback: false };
  if (isAnthropicKeySet()) return { resolved: 'openai', label: 'OpenAI GPT-4o', fallback: false };
  if (isGeminiKeySet())  return { resolved: 'gemini', label: 'Google Gemini', fallback: false };
  if (isXAIKeySet())     return { resolved: 'xai',    label: 'xAI Grok',      fallback: false };

  return { resolved: 'openai', label: 'OpenAI GPT-4o', fallback: false };
}
