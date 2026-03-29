import { isOpenAIKeySet, isXAIKeySet } from './config';
import { enhancePromptWithGPT, type EnhancedPromptResult } from './openai';
import { enhancePromptWithXAI } from './xai';

export type EnhanceProvider = 'auto' | 'openai' | 'xai';
export type ResolvedProvider = 'openai' | 'xai';

export interface EnhancementRun {
  result: EnhancedPromptResult;
  providerUsed: ResolvedProvider;
  latencyMs: number;
  fallbackUsed: boolean;
}

/**
 * Returns the provider that would actually be used for the given selection.
 * Throws a user-readable error if the selection cannot be satisfied.
 */
export function resolveEnhanceProvider(selected: EnhanceProvider): ResolvedProvider {
  if (selected === 'openai') {
    if (!isOpenAIKeySet()) throw new Error('OpenAI key not configured. Add it in Settings (⚙).');
    return 'openai';
  }
  if (selected === 'xai') {
    if (!isXAIKeySet()) throw new Error('xAI key not configured. Add it in Settings (⚙).');
    return 'xai';
  }
  // auto — prefer OpenAI, fall back to xAI
  if (isOpenAIKeySet()) return 'openai';
  if (isXAIKeySet()) return 'xai';
  throw new Error(
    'No enhancement provider is configured. Add an OpenAI or xAI key in Settings (⚙).'
  );
}

/**
 * Returns true if the given provider selection can currently run.
 * Safe to call without try/catch — never throws.
 */
export function canEnhanceWith(selected: EnhanceProvider): boolean {
  try {
    resolveEnhanceProvider(selected);
    return true;
  } catch {
    return false;
  }
}

/**
 * Returns a human-readable label for a provider.
 */
export function providerLabel(p: ResolvedProvider | EnhanceProvider): string {
  switch (p) {
    case 'openai': return 'OpenAI GPT';
    case 'xai':   return 'xAI Grok';
    case 'auto':  return 'Auto';
  }
}

/**
 * Runs the enhancement call through the selected provider.
 * Records latency and whether a fallback was used.
 */
export async function runEnhancement(
  rawPrompt: string,
  selected: EnhanceProvider
): Promise<EnhancementRun> {
  const resolved = resolveEnhanceProvider(selected);
  const fallbackUsed = selected === 'auto' && resolved !== 'openai'
    ? true  // xAI was chosen as fallback in auto mode
    : false;

  const startMs = Date.now();
  const result =
    resolved === 'xai'
      ? await enhancePromptWithXAI(rawPrompt)
      : await enhancePromptWithGPT(rawPrompt);

  return {
    result,
    providerUsed: resolved,
    latencyMs: Date.now() - startMs,
    fallbackUsed,
  };
}
