import type { AgentMemory } from '../types';

const STORAGE_KEY = 'masa-ai-agent-memory';

type AgentMemoryStore = Record<string, Record<string, AgentMemory>>;

function load(): AgentMemoryStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AgentMemoryStore;
  } catch { /* corrupted — start fresh */ }
  return {};
}

function save(store: AgentMemoryStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function saveAgentMemory(memory: AgentMemory): void {
  const store = load();
  if (!store[memory.projectId]) store[memory.projectId] = {};
  store[memory.projectId][memory.agentId] = memory;
  save(store);
}

export function getAgentMemory(projectId: string, agentId: string): AgentMemory | null {
  const store = load();
  return store[projectId]?.[agentId] ?? null;
}

export function getAllAgentMemories(projectId: string): AgentMemory[] {
  const store = load();
  return Object.values(store[projectId] ?? {});
}

/** Update a specific agent's memory in-place, merging with existing data. */
export function updateAgentMemory(
  projectId: string,
  agentId: string,
  patch: Partial<Omit<AgentMemory, 'agentId' | 'projectId'>>,
): void {
  const existing = getAgentMemory(projectId, agentId);
  const next: AgentMemory = {
    agentId,
    projectId,
    lastPrompt: '',
    lastEnhancedSummary: '',
    lastPlanSummary: '',
    lastPacketId: null,
    recentActionDescriptions: [],
    updatedAt: new Date().toISOString(),
    ...existing,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  saveAgentMemory(next);
}
