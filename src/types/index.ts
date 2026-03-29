export type Provider = 'gpt' | 'xai' | 'claude' | 'replit' | 'lovable' | 'github';

export type EnhanceProvider = 'auto' | 'openai' | 'xai';

export type BuildTarget = 'internal' | 'replit' | 'lovable' | 'github';

export type PacketStatus = 'not_ready' | 'ready' | 'generated';

export type AgentStatus = 'idle' | 'active' | 'busy' | 'error';

export type AgentRole = 'Strategist' | 'Architect' | 'Builder' | 'Researcher' | 'Automation' | 'Custom';

export type ProjectStatus = 'active' | 'paused' | 'complete';

export type PhaseStatus = 'idle' | 'active' | 'complete' | 'error';

export type PromptStatus = 'draft' | 'enhanced' | 'approved' | 'routed' | 'building' | 'complete';

export type ActionStatus = 'pending' | 'running' | 'complete' | 'failed';

export type BuildTool = 'lovable' | 'replit' | 'internal';

export interface Agent {
  id: string;
  name: string;
  provider: Provider;
  role: string;
  status: AgentStatus;
  avatar?: string;
  /** Human-readable description of what this agent does */
  description?: string;
  /** The task or area this agent is currently focused on */
  taskFocus?: string;
  updatedAt?: string;
}

export interface PipelinePhase {
  id: string;
  name: string;
  label: string;
  status: PhaseStatus;
  agentId?: string;
}

export interface PromptRecord {
  id: string;
  rawPrompt: string;
  enhancedPrompt: string;
  status: PromptStatus;
  createdAt: string;
  projectId: string;
}

export interface Action {
  id: string;
  type: 'enhance' | 'route' | 'plan' | 'build' | 'deploy' | 'scrape' | 'commit' | 'packet';
  description: string;
  agentId: string;
  agentName: string;
  timestamp: string;
  status: ActionStatus;
  output?: string;
  /** Enriched timeline fields — optional for backward compatibility */
  projectId?: string;
  agentRole?: string;
  providerSelected?: string;
  providerResolved?: string;
  buildTarget?: BuildTarget;
}

export interface HistoryEntry {
  id: string;
  promptRecordId: string;
  rawPrompt: string;
  enhancedPrompt: string;
  actions: Action[];
  summary: string;
  timestamp: string;
}

export interface ChangeEntry {
  id: string;
  type: 'file_created' | 'file_modified' | 'prompt_enhanced' | 'agent_assigned' | 'phase_advanced' | 'deployed';
  description: string;
  agentName: string;
  timestamp: string;
  details?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  agents: Agent[];
  promptHistory: PromptRecord[];
  actions: Action[];
  history: HistoryEntry[];
  changes: ChangeEntry[];
  pipeline: PipelinePhase[];
  /** Operational status */
  status?: ProjectStatus;
  updatedAt?: string;
}

export interface BuildPayload {
  id: string;
  goal: string;
  steps: string[];
  files: string[];
  recommendedTool: BuildTool;
  createdAt: string;
}

export interface BuildPacket {
  packetId: string;
  projectId: string;
  agentId: string | null;
  agentName?: string;
  target: BuildTarget;
  title: string;
  summary: string;
  objective: string;
  recommendedStack: string[];
  implementationSteps: string[];
  fileSuggestions: string[];
  executionNotes: string;
  rawPrompt: string;
  createdAt: string;
}

export interface ActionResult {
  id: string;
  actionId: string;
  toolUsed: BuildTool;
  inputSummary: string;
  resultSummary: string;
  status: ActionStatus;
  timestamp: string;
}

/** Lightweight per-agent memory stored per project */
export interface AgentMemory {
  agentId: string;
  projectId: string;
  lastPrompt: string;
  lastEnhancedSummary: string;
  lastPlanSummary: string;
  lastPacketId: string | null;
  recentActionDescriptions: string[];
  updatedAt: string;
}

export type PipelineStage =
  | 'idle' | 'error'
  | 'enhancing' | 'enhanced'
  | 'routing' | 'routed'
  | 'planning' | 'planned'
  | 'building' | 'built'
  | 'dispatching' | 'dispatched'
  | 'complete';

/** Starter agent role definitions for quick-create */
export const STARTER_AGENT_ROLES: { role: AgentRole; description: string }[] = [
  { role: 'Strategist',  description: 'Product thinking and decision making' },
  { role: 'Architect',   description: 'System design and technical planning'  },
  { role: 'Builder',     description: 'Code generation and implementation'    },
  { role: 'Researcher',  description: 'Research, analysis and summarization'  },
  { role: 'Automation',  description: 'Workflow and task automation'           },
];
