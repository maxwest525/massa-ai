import { getXAIKey } from './config';
import { ENHANCE_SYSTEM_PROMPT, parseEnhancedResponse, type EnhancedPromptResult } from './openai';

// xAI uses the OpenAI-compatible messages API.
// Update this constant when newer Grok models are released.
const XAI_MODEL = 'grok-4-1-fast';
const XAI_ENDPOINT = 'https://api.x.ai/v1/chat/completions';
const REQUEST_TIMEOUT_MS = 30_000;

export async function enhancePromptWithXAI(rawPrompt: string): Promise<EnhancedPromptResult> {
  const apiKey = getXAIKey();
  if (!apiKey) {
    throw new Error('xAI API key is not set. Open Settings (⚙) to add your key.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(XAI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: XAI_MODEL,
        messages: [
          { role: 'system', content: ENHANCE_SYSTEM_PROMPT },
          {
            role: 'user',
            content: `Enhance this raw request into a structured build specification:\n\n"${rawPrompt}"`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
        stream: false,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('xAI request timed out after 30s. Try again.');
    }
    throw new Error(`xAI network error: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const msg = errBody?.error?.message ?? errBody?.message ?? `xAI API error: ${res.status}`;
    throw new Error(msg);
  }

  const data = await res.json();
  const content: string = data.choices?.[0]?.message?.content ?? '';

  if (!content) {
    throw new Error('xAI returned an empty response. Try again.');
  }

  return parseEnhancedResponse(content);
}
