import type { BuildPayload, BuildTool, ActionResult } from '../types';
import type { EnhancedPromptResult } from './openai';
import type { PlanResult } from './claude';
import type { RouteDecision } from './router';

const LOVABLE_KEYWORDS = [
  'ui', 'frontend', 'design', 'layout', 'page', 'component', 'form',
  'landing', 'hero', 'dashboard', 'card', 'button', 'modal', 'responsive',
  'tailwind', 'css', 'style', 'theme', 'preview', 'visual',
];

const REPLIT_KEYWORDS = [
  'script', 'backend', 'server', 'api', 'database', 'experiment',
  'test', 'run', 'execute', 'python', 'node', 'function', 'cron',
  'scrape', 'bot', 'cli', 'automation', 'webhook', 'data',
];

function pickRecommendedTool(text: string): BuildTool {
  const lower = text.toLowerCase();
  let lovableScore = 0;
  let replitScore = 0;

  for (const kw of LOVABLE_KEYWORDS) {
    if (lower.includes(kw)) lovableScore++;
  }
  for (const kw of REPLIT_KEYWORDS) {
    if (lower.includes(kw)) replitScore++;
  }

  if (lovableScore > replitScore && lovableScore >= 2) return 'lovable';
  if (replitScore > lovableScore && replitScore >= 2) return 'replit';
  if (lovableScore > 0) return 'lovable';
  if (replitScore > 0) return 'replit';
  return 'internal';
}

export function prepareBuildPayload(
  enhancedResult: EnhancedPromptResult | null,
  planResult: PlanResult | null,
  _routeDecision: RouteDecision | null,
): BuildPayload {
  const goal = enhancedResult?.objective ?? 'Execute planned task';
  const steps = planResult?.implementationPlan ?? [];
  const files = planResult?.componentSuggestions ?? [];

  const combinedText = [
    enhancedResult?.fullText ?? '',
    planResult?.fullText ?? '',
  ].join(' ');

  return {
    id: `build-${Date.now()}`,
    goal,
    steps,
    files,
    recommendedTool: pickRecommendedTool(combinedText),
    createdAt: new Date().toISOString(),
  };
}

const TOOL_RESPONSES: Record<BuildTool, (payload: BuildPayload) => string> = {
  lovable: (p) =>
    `Lovable: Preview generated successfully.\n` +
    `Project: ${p.goal.slice(0, 60)}\n` +
    `Components created: ${p.files.length}\n` +
    `Preview URL: https://lovable.dev/preview/${p.id.slice(-8)}\n` +
    `Status: Ready for review and publish`,
  replit: (p) =>
    `Replit: Execution environment created.\n` +
    `Project: ${p.goal.slice(0, 60)}\n` +
    `Files scaffolded: ${p.files.length}\n` +
    `Repl URL: https://replit.com/@masa-ai/${p.id.slice(-8)}\n` +
    `Status: Running — all tests passing`,
  internal: (p) =>
    `Internal: Output saved to project.\n` +
    `Goal: ${p.goal.slice(0, 60)}\n` +
    `Steps completed: ${p.steps.length}\n` +
    `Files tracked: ${p.files.length}\n` +
    `Status: Stored in project memory`,
};

const TOOL_NAMES: Record<BuildTool, string> = {
  lovable: 'Lovable',
  replit: 'Replit',
  internal: 'Internal Store',
};

export function getToolDisplayName(tool: BuildTool): string {
  return TOOL_NAMES[tool];
}

export async function simulateDispatch(
  payload: BuildPayload,
  target: BuildTool,
): Promise<ActionResult> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const actionId = `dispatch-${Date.now()}`;

  return {
    id: `result-${Date.now()}`,
    actionId,
    toolUsed: target,
    inputSummary: `${payload.goal.slice(0, 80)} (${payload.steps.length} steps, ${payload.files.length} files)`,
    resultSummary: TOOL_RESPONSES[target](payload),
    status: 'complete',
    timestamp: new Date().toISOString(),
  };
}
