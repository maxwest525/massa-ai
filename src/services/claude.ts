import { getAnthropicKey } from './config';

export interface PlanResult {
  implementationPlan: string[];
  architectureOutline: string;
  componentSuggestions: string[];
  recommendedNextAction: string;
  fullText: string;
}

const SYSTEM_PROMPT = `You are MASA AI's planning and architecture engine. Given an enhanced build specification, produce a concrete implementation plan.

Return your response in EXACTLY this format:

## Implementation Plan
1. [Step 1 with brief description]
2. [Step 2 with brief description]
3. [Continue as needed]

## Architecture Outline
[Describe the high-level architecture in 3-5 sentences: components, data flow, key patterns]

## Component / File Suggestions
- [component/file name]: [brief purpose]
- [Continue as needed]

## Recommended Next Action
[One clear sentence: what should be done first]

Be practical, specific, and opinionated. Favor modern best practices.`;

function parsePlanResponse(text: string): PlanResult {
  const section = (header: string): string => {
    const regex = new RegExp(`## ${header}\\s*\\n([\\s\\S]*?)(?=\\n## |$)`, 'i');
    return regex.exec(text)?.[1]?.trim() ?? '';
  };

  const listItems = (raw: string): string[] =>
    raw
      .split('\n')
      .map((l) => l.replace(/^[-*\d.]+\s*/, '').trim())
      .filter(Boolean);

  return {
    implementationPlan: listItems(section('Implementation Plan')),
    architectureOutline: section('Architecture Outline'),
    componentSuggestions: listItems(section('Component / File Suggestions').replace(/Component \/ File Suggestions/i, '')),
    recommendedNextAction: section('Recommended Next Action'),
    fullText: text,
  };
}

export async function planWithClaude(enhancedPrompt: string): Promise<PlanResult> {
  const apiKey = getAnthropicKey();
  if (!apiKey) {
    throw new Error('Anthropic API key is not set. Open Settings (⚙) to add your key.');
  }

  const res = await fetch('/api/anthropic/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Create an implementation plan for this build specification:\n\n${enhancedPrompt}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message ?? `Claude API error: ${res.status}`);
  }

  const data = await res.json();
  const content: string =
    data.content?.find((b: { type: string }) => b.type === 'text')?.text ?? '';

  if (!content) {
    throw new Error('Empty response from Claude');
  }

  return parsePlanResponse(content);
}
