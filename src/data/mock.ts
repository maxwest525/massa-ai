import type { Project, Agent, PromptRecord, Action, HistoryEntry, ChangeEntry, PipelinePhase } from '../types';

const defaultPipeline: PipelinePhase[] = [
  { id: 'enhance', name: 'enhance', label: 'Enhance', status: 'complete' },
  { id: 'route', name: 'route', label: 'Route', status: 'complete' },
  { id: 'plan', name: 'plan', label: 'Plan', status: 'active' },
  { id: 'build', name: 'build', label: 'Build', status: 'idle' },
  { id: 'deploy', name: 'deploy', label: 'Deploy', status: 'idle' },
];

const idlePipeline: PipelinePhase[] = [
  { id: 'enhance', name: 'enhance', label: 'Enhance', status: 'idle' },
  { id: 'route', name: 'route', label: 'Route', status: 'idle' },
  { id: 'plan', name: 'plan', label: 'Plan', status: 'idle' },
  { id: 'build', name: 'build', label: 'Build', status: 'idle' },
  { id: 'deploy', name: 'deploy', label: 'Deploy', status: 'idle' },
];

const agentsProject1: Agent[] = [
  {
    id: 'agent-gpt-1',
    name: 'GPT-4o',
    provider: 'gpt',
    role: 'Prompt Enhancement',
    status: 'idle',
  },
  {
    id: 'agent-claude-1',
    name: 'Claude Opus',
    provider: 'claude',
    role: 'Architecture & Planning',
    status: 'active',
  },
  {
    id: 'agent-lovable-1',
    name: 'Lovable',
    provider: 'lovable',
    role: 'Preview & Publish',
    status: 'idle',
  },
];

const agentsProject2: Agent[] = [
  {
    id: 'agent-xai-2',
    name: 'Grok',
    provider: 'xai',
    role: 'Prompt Enhancement',
    status: 'idle',
  },
  {
    id: 'agent-claude-2',
    name: 'Claude Sonnet',
    provider: 'claude',
    role: 'Implementation Strategy',
    status: 'idle',
  },
  {
    id: 'agent-replit-2',
    name: 'Replit Agent',
    provider: 'replit',
    role: 'Code Execution & Testing',
    status: 'idle',
  },
  {
    id: 'agent-github-2',
    name: 'GitHub',
    provider: 'github',
    role: 'Repository & Version Control',
    status: 'idle',
  },
];

const promptsProject1: PromptRecord[] = [
  {
    id: 'prompt-1',
    rawPrompt: 'build me a landing page for my AI product, make it look modern and professional with a hero section and pricing',
    enhancedPrompt: 'Design and implement a modern, conversion-optimized landing page for an AI SaaS product. Include:\n\n1. Hero section with a compelling headline, subheadline, and CTA button\n2. Feature showcase with 3-4 key product capabilities using icons and brief descriptions\n3. Social proof section with testimonials or partner logos\n4. Pricing tier comparison (Free, Pro, Enterprise) with feature matrix\n5. Final CTA section with email capture\n\nTech: React + Tailwind CSS. Style: Dark theme, gradient accents, smooth scroll animations. Mobile-first responsive design.',
    status: 'approved',
    createdAt: '2026-03-28T10:30:00Z',
    projectId: 'project-1',
  },
  {
    id: 'prompt-2',
    rawPrompt: 'add a blog section to the marketing site',
    enhancedPrompt: 'Add a blog/content section to the existing marketing site with:\n\n1. Blog listing page with card grid layout (thumbnail, title, excerpt, date, read time)\n2. Individual blog post template with rich text rendering\n3. Category filtering and tag system\n4. SEO-optimized metadata for each post\n\nUse MDX for content authoring. Match existing dark theme design language.',
    status: 'complete',
    createdAt: '2026-03-27T14:15:00Z',
    projectId: 'project-1',
  },
];

const promptsProject2: PromptRecord[] = [
  {
    id: 'prompt-3',
    rawPrompt: 'i need an internal dashboard that shows user metrics and revenue, with charts and stuff',
    enhancedPrompt: 'Build an internal analytics dashboard with the following components:\n\n1. KPI summary cards: Active Users, MRR, Churn Rate, LTV\n2. Time-series chart for user growth (daily/weekly/monthly toggle)\n3. Revenue breakdown bar chart by plan tier\n4. User activity heatmap (last 30 days)\n5. Data table with sortable columns for recent transactions\n6. Date range picker for all views\n\nTech: React + TypeScript + Tailwind. Use Recharts for visualizations. Include loading skeletons and error states.',
    status: 'enhanced',
    createdAt: '2026-03-28T09:00:00Z',
    projectId: 'project-2',
  },
];

const actionsProject1: Action[] = [
  {
    id: 'action-1',
    type: 'enhance',
    description: 'Enhanced raw prompt into optimized build specification',
    agentId: 'agent-gpt-1',
    agentName: 'GPT-4o',
    timestamp: '2026-03-28T10:30:15Z',
    status: 'complete',
    output: 'Prompt enhanced with 6 specific sections and tech requirements',
  },
  {
    id: 'action-2',
    type: 'route',
    description: 'Routed task to Claude Opus for architecture planning',
    agentId: 'agent-claude-1',
    agentName: 'Claude Opus',
    timestamp: '2026-03-28T10:30:45Z',
    status: 'complete',
  },
  {
    id: 'action-3',
    type: 'plan',
    description: 'Generating component tree and implementation plan',
    agentId: 'agent-claude-1',
    agentName: 'Claude Opus',
    timestamp: '2026-03-28T10:31:00Z',
    status: 'running',
    output: 'Analyzing requirements and designing component architecture...',
  },
];

const actionsProject2: Action[] = [
  {
    id: 'action-4',
    type: 'enhance',
    description: 'Enhanced dashboard prompt with detailed specifications',
    agentId: 'agent-xai-2',
    agentName: 'Grok',
    timestamp: '2026-03-28T09:00:30Z',
    status: 'complete',
    output: 'Added KPI definitions, chart types, and technical requirements',
  },
];

const historyProject1: HistoryEntry[] = [
  {
    id: 'hist-1',
    promptRecordId: 'prompt-2',
    rawPrompt: 'add a blog section to the marketing site',
    enhancedPrompt: 'Add a blog/content section to the existing marketing site...',
    actions: [],
    summary: 'Blog section added with MDX support, category filtering, and SEO optimization',
    timestamp: '2026-03-27T14:15:00Z',
  },
];

const historyProject2: HistoryEntry[] = [];

const changesProject1: ChangeEntry[] = [
  {
    id: 'change-1',
    type: 'prompt_enhanced',
    description: 'Landing page prompt enhanced',
    agentName: 'GPT-4o',
    timestamp: '2026-03-28T10:30:15Z',
    details: 'Raw input converted to structured build specification with 6 sections',
  },
  {
    id: 'change-2',
    type: 'agent_assigned',
    description: 'Task routed to Claude Opus',
    agentName: 'System',
    timestamp: '2026-03-28T10:30:45Z',
    details: 'Architecture and planning phase initiated',
  },
  {
    id: 'change-3',
    type: 'phase_advanced',
    description: 'Pipeline advanced to Plan phase',
    agentName: 'System',
    timestamp: '2026-03-28T10:31:00Z',
  },
  {
    id: 'change-4',
    type: 'file_created',
    description: 'Blog section components created',
    agentName: 'Claude Opus',
    timestamp: '2026-03-27T15:20:00Z',
    details: 'Created BlogList.tsx, BlogPost.tsx, BlogCard.tsx',
  },
];

const changesProject2: ChangeEntry[] = [
  {
    id: 'change-5',
    type: 'prompt_enhanced',
    description: 'Dashboard prompt enhanced',
    agentName: 'Grok',
    timestamp: '2026-03-28T09:00:30Z',
    details: 'Added detailed KPI definitions and chart specifications',
  },
];

export const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Massa Marketing Site',
    description: 'Public-facing marketing website with landing page, blog, and pricing',
    createdAt: '2026-03-25T08:00:00Z',
    agents: agentsProject1,
    promptHistory: promptsProject1,
    actions: actionsProject1,
    history: historyProject1,
    changes: changesProject1,
    pipeline: defaultPipeline,
  },
  {
    id: 'project-2',
    name: 'Internal Dashboard',
    description: 'Analytics dashboard for tracking user metrics, revenue, and system health',
    createdAt: '2026-03-27T12:00:00Z',
    agents: agentsProject2,
    promptHistory: promptsProject2,
    actions: actionsProject2,
    history: historyProject2,
    changes: changesProject2,
    pipeline: idlePipeline,
  },
];

export const mockEnhancedResponses: Record<string, string> = {
  default: `Based on your request, here is an optimized build specification:

1. **Core Requirements**: Identified primary objectives and deliverables
2. **Architecture**: Recommended component structure and data flow
3. **Tech Stack**: Selected optimal tools and frameworks for this task
4. **Implementation Plan**: Step-by-step build order with dependencies
5. **Quality Gates**: Testing strategy and acceptance criteria
6. **Deployment**: Staging and production deployment workflow

This specification is ready for routing to the appropriate build agent.`,
};
