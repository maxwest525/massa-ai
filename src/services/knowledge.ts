/**
 * Claude Knowledge Base
 *
 * Builds a rich context block injected into every Claude system prompt.
 * Includes: custom standing instructions, active project summary,
 * assigned agents, and recent session history.
 */

import { getClaudeInstructions } from './config';
import { getProjectMemory } from './memory';
import type { Project } from '../types';

/** Builds the knowledge-base block to prepend to Claude's system prompt */
export function buildKnowledgeBase(activeProject: Project | null): string {
  const parts: string[] = [];

  // ── 1. Custom standing instructions ───────────────────────────────────────
  const customInstructions = getClaudeInstructions();
  if (customInstructions) {
    parts.push(`## Standing Instructions from User\n${customInstructions}`);
  }

  // ── 2. Active project context ──────────────────────────────────────────────
  if (activeProject) {
    const agentList = activeProject.agents
      .map((a) => `- ${a.name} (${a.provider}, role: ${a.role})${a.taskFocus ? ` — currently: ${a.taskFocus}` : ''}`)
      .join('\n');

    parts.push(
      `## Active Project: ${activeProject.name}\n` +
      `${activeProject.description || 'No description set.'}\n\n` +
      `**Assigned agents:**\n${agentList || '- None assigned yet'}`
    );

    // ── 3. Recent session history ────────────────────────────────────────────
    const history = getProjectMemory(activeProject.id).slice(0, 5);
    if (history.length > 0) {
      const historyLines = history.map((entry, i) => {
        const goal = entry.enhancedResult?.objective ?? entry.rawPrompt.slice(0, 80);
        const planSummary = entry.planResult?.recommendedNextAction
          ? ` → Next: ${entry.planResult.recommendedNextAction}`
          : '';
        return `${i + 1}. "${goal}"${planSummary}`;
      });
      parts.push(`## Recent Work (last ${history.length} sessions)\n${historyLines.join('\n')}`);
    }
  }

  if (parts.length === 0) return '';

  return (
    `<knowledge_base>\n` +
    parts.join('\n\n') +
    `\n</knowledge_base>\n\n`
  );
}
