import { getOpenAIKey } from './config';

export interface EnhancedPromptResult {
  objective: string;
  whatIsBeingBuilt: string;
  keyFeatures: string[];
  requirements: string[];
  suggestedStack: string[];
  nextSteps: string[];
  fullText: string;
}

/** Metadata attached to a successful enhance call for action-history logging. */
export interface EnhanceCallMeta {
  provider: 'openai';
  model: string;
  latencyMs: number;
}

const MODEL = 'gpt-4o-mini';
const TIMEOUT_MS = 30_000;

const SYSTEM_PROMPT = `You are MASA AI's prompt enhancement engine. Your job is to take a messy, informal user request and transform it into a clear, structured build specification.

Return your response in EXACTLY this format (use these exact headers):

## Objective
[One clear sentence describing the goal]

## What Is Being Built
[2-3 sentences describing the deliverable]

## Key Features
- [Feature 1]
- [Feature 2]
- [Feature 3]
- [Add more as needed]

## Requirements
- [Requirement 1]
- [Requirement 2]
- [Add more as needed]

## Suggested Stack
- [Technology/tool 1]
- [Technology/tool 2]
- [Add more as needed]

## Next Steps
1. [Step 1]
2. [Step 2]
3. [Step 3]
4. [Add more as needed]

Be specific, practical, and thorough. Transform vague ideas into actionable specifications.`;

/** Shared: used by xai.ts and enhancer.ts */
export const ENHANCE_SYSTEM_PROMPT = SYSTEM_PROMPT;

/** Shared: parses LLM markdown response into structured result */
export function parseEnhancedResponse(text: string): EnhancedPromptResult {
  const section = (header: string): string => {
    const regex = new RegExp(`## ${header}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, 'i');
    return regex.exec(text)?.[1]?.trim() ?? '';
  };

  const listItems = (raw: string): string[] =>
    raw
      .split('\n')
      .map((l) => l.replace(/^[-*\d.]+\s*/, '').trim())
      .filter(Boolean);

  const result: EnhancedPromptResult = {
    objective: section('Objective'),
    whatIsBeingBuilt: section('What Is Being Built'),
    keyFeatures: listItems(section('Key Features')),
    requirements: listItems(section('Requirements')),
    suggestedStack: listItems(section('Suggested Stack')),
    nextSteps: listItems(section('Next Steps')),
    fullText: text,
  };

  // Graceful recovery: if model deviated and key sections are empty,
  // use the raw text as the objective so callers always have something usable.
  if (!result.objective && !result.whatIsBeingBuilt && result.keyFeatures.length === 0) {
    result.objective = text.slice(0, 200).replace(/\n/g, ' ').trim();
    result.whatIsBeingBuilt = text.slice(0, 400).trim();
  }

  return result;
}

export async function enhancePromptWithGPT(
  rawPrompt: string,
): Promise<{ result: EnhancedPromptResult; meta: EnhanceCallMeta }> {
  const apiKey = getOpenAIKey();
  if (!apiKey) {
    throw new Error('OpenAI API key is not set. Open Settings (⚙) to add your key.');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const startedAt = Date.now();

  let res: Response;
  try {
    res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Enhance this raw request into a structured build specification:\n\n"${rawPrompt}"`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      }),
      signal: controller.signal,
    });
  } catch (fetchErr) {
    clearTimeout(timeoutId);
    if ((fetchErr as Error).name === 'AbortError') {
      throw new Error(`OpenAI request timed out after ${TIMEOUT_MS / 1000}s. Check your connection and try again.`);
    }
    // Network-level failure (no internet, DNS, etc.)
    throw new Error(
      `Network error reaching OpenAI: ${(fetchErr as Error).message ?? 'unknown network failure'}`,
    );
  }

  clearTimeout(timeoutId);
  const latencyMs = Date.now() - startedAt;

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as Record<string, unknown>;
    const msg =
      (err?.error as { message?: string } | undefined)?.message ??
      `OpenAI API error: ${res.status}`;
    throw new Error(msg);
  }

  const data = await res.json() as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content ?? '';

  if (!content) {
    throw new Error('OpenAI returned an empty response. Try again.');
  }

  return {
    result: parseEnhancedResponse(content),
    meta: { provider: 'openai', model: MODEL, latencyMs },
  };
}
