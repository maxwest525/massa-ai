/**
 * Smart LLM Router
 *
 * Uses Claude or GPT-4o to analyze a prompt and recommend the best model.
 * Falls back to keyword heuristics if no API key is available.
 */

import { getAnthropicKey, getOpenAIKey } from './config';

export type RouteTarget = 'claude' | 'gpt' | 'grok' | 'gemini' | 'automation' | 'unknown';

export interface RouteDecision {
  target: RouteTarget;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
  modelLabel: string;
}

// ── LLM routing (preferred) ────────────────────────────────────────────────

const ROUTER_SYSTEM = `You are a routing engine that matches tasks to the best AI model.

Given a prompt, respond with ONLY a JSON object in this exact format (no markdown, no extra text):
{
  "target": "claude" | "gpt" | "grok" | "gemini" | "automation",
  "reason": "one sentence explaining the choice",
  "confidence": "high" | "medium" | "low"
}

Model strengths:
- claude: complex code generation, architecture design, multi-step implementation, reasoning
- gpt: research, content writing, brainstorming, analysis, summarization, general tasks
- grok: fast tasks, creative writing, quick answers, casual exploration
- gemini: multimodal tasks, Google ecosystem, document analysis, broad knowledge
- automation: scheduled jobs, scrapers, webhooks, cron tasks, monitoring, bots

Pick the single best match. Default to "claude" for anything involving building software.`;

async function routeWithClaude(prompt: string): Promise<RouteDecision | null> {
  const apiKey = getAnthropicKey();
  if (!apiKey) return null;

  try {
    const res = await fetch('/api/anthropic/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        system: ROUTER_SYSTEM,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const text: string = data.content?.find((b: { type: string }) => b.type === 'text')?.text ?? '';
    const parsed = JSON.parse(text.trim()) as { target: RouteTarget; reason: string; confidence: string };
    return {
      target: parsed.target,
      reason: parsed.reason,
      confidence: parsed.confidence as RouteDecision['confidence'],
      modelLabel: modelLabel(parsed.target),
    };
  } catch {
    return null;
  }
}

async function routeWithGPT(prompt: string): Promise<RouteDecision | null> {
  const apiKey = getOpenAIKey();
  if (!apiKey) return null;

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 200,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: ROUTER_SYSTEM },
          { role: 'user', content: prompt },
        ],
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const text: string = data.choices?.[0]?.message?.content ?? '';
    const parsed = JSON.parse(text) as { target: RouteTarget; reason: string; confidence: string };
    return {
      target: parsed.target,
      reason: parsed.reason,
      confidence: parsed.confidence as RouteDecision['confidence'],
      modelLabel: modelLabel(parsed.target),
    };
  } catch {
    return null;
  }
}

// ── Keyword fallback (used when no API key is available) ───────────────────

const KEYWORDS: Record<Exclude<RouteTarget, 'unknown'>, string[]> = {
  claude:     ['build', 'app', 'feature', 'implement', 'code', 'component', 'backend', 'frontend', 'api', 'deploy', 'architecture'],
  gpt:        ['research', 'summary', 'brainstorm', 'analyze', 'explain', 'write', 'content', 'email', 'blog', 'compare'],
  grok:       ['quick', 'fast', 'creative', 'casual', 'idea', 'draft'],
  gemini:     ['image', 'pdf', 'document', 'google', 'multimodal', 'vision', 'file'],
  automation: ['automate', 'scrape', 'cron', 'schedule', 'webhook', 'trigger', 'monitor', 'bot'],
};

function keywordFallback(prompt: string): RouteDecision {
  const text = prompt.toLowerCase();
  const scores = Object.entries(KEYWORDS).map(([target, kws]) => ({
    target: target as RouteTarget,
    score: kws.filter((kw) => text.includes(kw)).length,
  }));
  scores.sort((a, b) => b.score - a.score);

  const top = scores[0];
  if (top.score === 0) {
    return { target: 'unknown', reason: 'No strong signal detected', confidence: 'low', modelLabel: 'Unknown' };
  }
  return {
    target: top.target,
    reason: `Keyword match: ${top.score} signal(s) for ${top.target}`,
    confidence: top.score >= 3 ? 'high' : top.score >= 1 ? 'medium' : 'low',
    modelLabel: modelLabel(top.target),
  };
}

function modelLabel(target: RouteTarget): string {
  const labels: Record<RouteTarget, string> = {
    claude:     'Claude (Anthropic)',
    gpt:        'GPT-4o (OpenAI)',
    grok:       'Grok (xAI)',
    gemini:     'Gemini (Google)',
    automation: 'Automation Engine',
    unknown:    'Unknown',
  };
  return labels[target];
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function routePrompt(prompt: string): Promise<RouteDecision> {
  // Try Claude first (fastest & most accurate for this task), then GPT, then fallback
  const result =
    (await routeWithClaude(prompt)) ??
    (await routeWithGPT(prompt)) ??
    keywordFallback(prompt);
  return result;
}

/** Sync version for cases where async isn't possible (legacy callers) */
export function routePromptSync(prompt: string): RouteDecision {
  return keywordFallback(prompt);
}
