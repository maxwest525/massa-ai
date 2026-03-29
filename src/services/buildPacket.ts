import type { BuildPacket, BuildTarget } from '../types';
import type { EnhancedPromptResult } from './openai';
import type { PlanResult } from './claude';
import type { RouteDecision } from './router';

interface BuildPacketInput {
  projectId: string;
  agentId: string | null;
  rawPrompt: string;
  enhancedResult: EnhancedPromptResult | null;
  routeDecision: RouteDecision | null;
  planResult: PlanResult | null;
  target: BuildTarget;
}

export function generateBuildPacket(input: BuildPacketInput): BuildPacket {
  const { projectId, agentId, rawPrompt, enhancedResult, planResult, routeDecision, target } = input;

  const objective = enhancedResult?.objective ?? rawPrompt.slice(0, 200);
  const title = objective.length > 80 ? `${objective.slice(0, 77)}...` : objective;
  const summary = enhancedResult?.whatIsBeingBuilt
    ?? enhancedResult?.objective
    ?? rawPrompt.slice(0, 200);

  const recommendedStack = enhancedResult?.suggestedStack ?? [];
  const implementationSteps =
    planResult?.implementationPlan.length
      ? planResult.implementationPlan
      : (enhancedResult?.nextSteps ?? []);
  const fileSuggestions = planResult?.componentSuggestions ?? [];

  const noteLines: string[] = [];
  if (planResult?.architectureOutline) {
    noteLines.push(`Architecture: ${planResult.architectureOutline}`);
  }
  if (planResult?.recommendedNextAction) {
    noteLines.push(`Recommended Next: ${planResult.recommendedNextAction}`);
  }
  if (routeDecision) {
    noteLines.push(`Route: ${routeDecision.target} (${routeDecision.confidence} confidence — ${routeDecision.reason})`);
  }

  return {
    packetId: `packet-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    projectId,
    agentId,
    target,
    title,
    summary,
    objective,
    recommendedStack,
    implementationSteps,
    fileSuggestions,
    executionNotes: noteLines.join('\n'),
    rawPrompt,
    createdAt: new Date().toISOString(),
  };
}
