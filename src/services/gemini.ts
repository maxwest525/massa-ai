import { getGeminiKey } from './config';
import { ENHANCE_SYSTEM_PROMPT, parseEnhancedResponse, type EnhancedPromptResult } from './openai';

const GEMINI_MODEL    = 'gemini-2.0-flash';
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const REQUEST_TIMEOUT_MS = 30_000;

export async function enhancePromptWithGemini(rawPrompt: string): Promise<EnhancedPromptResult> {
  const apiKey = getGeminiKey();
  if (!apiKey) {
    throw new Error('Google Gemini API key is not set. Open Settings (⚙) to add your key.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: ENHANCE_SYSTEM_PROMPT }],
        },
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Enhance this raw request into a structured build specification:\n\n"${rawPrompt}"`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500,
        },
      }),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error('Gemini request timed out after 30s. Try again.');
    }
    throw new Error(`Gemini network error: ${err instanceof Error ? err.message : String(err)}`);
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    const msg =
      errBody?.error?.message ?? `Gemini API error: ${res.status}`;
    throw new Error(msg);
  }

  const data = await res.json();
  const content: string =
    data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  if (!content) {
    throw new Error('Gemini returned an empty response. Try again.');
  }

  return parseEnhancedResponse(content);
}
