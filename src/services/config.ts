// Keys are saved to localStorage and persist across sessions.
// localStorage values take priority over .env variables.

const SK_OPENAI = 'masa_openai_key';
const SK_ANTHROPIC = 'masa_anthropic_key';
const SK_XAI = 'masa_xai_key';

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

// ── Availability checks ────────────────────────────────────────────────────

export function isOpenAIKeySet(): boolean {
  return !!getOpenAIKey();
}

export function isAnthropicKeySet(): boolean {
  return !!getAnthropicKey();
}

export function isXAIKeySet(): boolean {
  return !!getXAIKey();
}

export function getKeyStatus() {
  return {
    openai: isOpenAIKeySet(),
    anthropic: isAnthropicKeySet(),
    xai: isXAIKeySet(),
    allSet: isOpenAIKeySet() && isAnthropicKeySet(),
  };
}

// ── Provider registry ──────────────────────────────────────────────────────

export type ProviderStatus = 'ready' | 'missing_key' | 'not_configured';

export type ProviderId = 'openai' | 'anthropic' | 'xai';

export interface ProviderInfo {
  id: ProviderId;
  label: string;
  status: ProviderStatus;
  /** Features unlocked when this provider is connected */
  features: string[];
  /** Human-readable hint for where to get the key */
  docsHint: string;
  envVar: string;
}

export function getProviderStatuses(): ProviderInfo[] {
  return [
    {
      id: 'openai',
      label: 'OpenAI',
      status: isOpenAIKeySet() ? 'ready' : 'missing_key',
      features: ['Prompt Enhancement', 'Routing'],
      docsHint: 'platform.openai.com/api-keys',
      envVar: 'VITE_OPENAI_API_KEY',
    },
    {
      id: 'anthropic',
      label: 'Anthropic',
      status: isAnthropicKeySet() ? 'ready' : 'missing_key',
      features: ['Implementation Planning', 'Architecture Outline'],
      docsHint: 'console.anthropic.com/settings/keys',
      envVar: 'VITE_ANTHROPIC_API_KEY',
    },
    {
      id: 'xai',
      label: 'xAI / Grok',
      // xAI integration not yet implemented — always not_configured regardless of key
      status: 'not_configured',
      features: ['Alternative Enhancement (coming soon)'],
      docsHint: 'console.x.ai',
      envVar: 'VITE_XAI_API_KEY',
    },
  ];
}

// ── Provider resolution ────────────────────────────────────────────────────

import type { EnhanceProvider } from '../types';

/**
 * Given the user's selected enhance provider preference, return the actual
 * provider that will be used and a human-readable label for action logging.
 *
 * Auto priority: OpenAI → xAI (xAI currently always falls through since it
 * is not yet live; the fallback ensures the app never silently picks nothing).
 */
export function resolveEnhanceProvider(
  selected: EnhanceProvider,
): { resolved: 'openai' | 'xai'; label: string; fallback: boolean } {
  if (selected === 'openai') {
    return { resolved: 'openai', label: 'OpenAI (GPT-4o mini)', fallback: false };
  }

  if (selected === 'xai') {
    // xAI not yet live — fall back to OpenAI if available
    if (isOpenAIKeySet()) {
      return { resolved: 'openai', label: 'OpenAI (GPT-4o mini)', fallback: true };
    }
    return { resolved: 'xai', label: 'xAI / Grok', fallback: false };
  }

  // Auto: pick best available
  if (isOpenAIKeySet()) {
    return { resolved: 'openai', label: 'OpenAI (GPT-4o mini)', fallback: false };
  }
  // Nothing available — return openai so the call runs and gives a clean key-missing error
  return { resolved: 'openai', label: 'OpenAI (GPT-4o mini)', fallback: false };
}
