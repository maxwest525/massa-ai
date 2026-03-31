import { isOpenAIKeySet, isXAIKeySet, isGeminiKeySet } from './config';
import { enhancePromptWithGPT, type EnhancedPromptResult } from './openai';
import { enhancePromptWithXAI } from './xai';
import { enhancePromptWithGemini } from './gemini';

export type EnhanceProvider = 'auto' | 'openai' | 'xai' | 'gemini';
export type ResolvedProvider = 'openai' | 'xai' | 'gemini';

export interface EnhancementRun {
  result: EnhancedPromptResult;
  providerUsed: ResolvedProvider;
  latencyMs: number;
  fallbackUsed: boolean;
}

export function resolveEnhanceProvider(selected: EnhanceProvider): ResolvedProvider {
  if (selected === 'openai') {
    if (!isOpenAIKeySet()) throw new Error('OpenAI key not configured. Add it in Settings (⚙).');
    return 'openai';
  }
  if (selected === 'xai') {
    if (!isXAIKeySet()) throw new Error('xAI key not configured. Add it in Settings (⚙).');
    return 'xai';
  }
  if (selected === 'gemini') {
    if (!isGeminiKeySet()) throw new Error('Gemini key not configured. Add it in Settings (⚙).');
    return 'gemini';
  }

  // Auto — prefer OpenAI → Gemini → xAI
  if (isOpenAIKeySet())  return 'openai';
  if (isGeminiKeySet())  return 'gemini';
  if (isXAIKeySet())     return 'xai';

  throw new Error('No enhancement provider configured. Add an API key in Settings (⚙).');
}

export function canEnhanceWith(selected: EnhanceProvider): boolean {
  try {
    resolveEnhanceProvider(selected);
    return true;
  } catch {
    return false;
  }
}

export function providerLabel(p: ResolvedProvider | EnhanceProvider): string {
  switch (p) {
    case 'openai': return 'OpenAI GPT-4o';
    case 'xai':    return 'xAI Grok';
    case 'gemini': return 'Google Gemini';
    case 'auto':   return 'Auto';
  }
}

export async function runEnhancement(
  rawPrompt: string,
  selected: EnhanceProvider,
): Promise<EnhancementRun> {
  const resolved = resolveEnhanceProvider(selected);
  const fallbackUsed = selected === 'auto' && resolved !== 'openai';

  const startMs = Date.now();

  let result: EnhancedPromptResult;
  if (resolved === 'xai') {
    result = await enhancePromptWithXAI(rawPrompt);
  } else if (resolved === 'gemini') {
    result = await enhancePromptWithGemini(rawPrompt);
  } else {
    result = (await enhancePromptWithGPT(rawPrompt)).result;
  }

  return { result, providerUsed: resolved, latencyMs: Date.now() - startMs, fallbackUsed };
}
