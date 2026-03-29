export type RouteTarget = 'claude' | 'gpt' | 'automation' | 'unknown';

export interface RouteDecision {
  target: RouteTarget;
  reason: string;
  confidence: 'high' | 'medium' | 'low';
}

const CLAUDE_KEYWORDS = [
  'build', 'app', 'feature', 'ui', 'dashboard', 'workflow', 'component',
  'page', 'layout', 'design', 'implement', 'create', 'develop', 'architect',
  'system', 'api', 'backend', 'frontend', 'database', 'deploy', 'website',
  'landing', 'form', 'authentication', 'login', 'signup', 'crud',
  'integration', 'platform', 'tool', 'service', 'module',
];

const GPT_KEYWORDS = [
  'research', 'summary', 'brainstorm', 'ideas', 'compare', 'analyze',
  'explain', 'write', 'content', 'copy', 'email', 'blog', 'article',
  'translate', 'review', 'feedback', 'describe', 'outline', 'list',
  'suggest', 'recommend', 'pros', 'cons',
];

const AUTOMATION_KEYWORDS = [
  'automate', 'automation', 'scrape', 'scraper', 'crawl', 'bot',
  'schedule', 'cron', 'webhook', 'trigger', 'pipeline', 'workflow',
  'monitor', 'alert', 'notification', 'batch', 'recurring',
];

function countKeywordHits(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.reduce((count, kw) => count + (lower.includes(kw) ? 1 : 0), 0);
}

export function routePrompt(enhancedPrompt: string): RouteDecision {
  const claudeScore = countKeywordHits(enhancedPrompt, CLAUDE_KEYWORDS);
  const gptScore = countKeywordHits(enhancedPrompt, GPT_KEYWORDS);
  const autoScore = countKeywordHits(enhancedPrompt, AUTOMATION_KEYWORDS);

  const maxScore = Math.max(claudeScore, gptScore, autoScore);

  if (maxScore === 0) {
    return {
      target: 'claude',
      reason: 'No clear signal detected — defaulting to Claude for planning',
      confidence: 'low',
    };
  }

  if (autoScore >= 3 && autoScore >= claudeScore) {
    return {
      target: 'automation',
      reason: `Detected automation/scraper intent (${autoScore} signals)`,
      confidence: autoScore >= 5 ? 'high' : 'medium',
    };
  }

  if (gptScore > claudeScore && gptScore >= 3) {
    return {
      target: 'gpt',
      reason: `Detected research/content task (${gptScore} signals)`,
      confidence: gptScore >= 5 ? 'high' : 'medium',
    };
  }

  const confidence =
    claudeScore >= 5 ? 'high' : claudeScore >= 2 ? 'medium' : 'low';

  return {
    target: 'claude',
    reason: `Detected build/implementation task (${claudeScore} signals)`,
    confidence,
  };
}
