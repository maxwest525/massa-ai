import type { Action, ChangeEntry, HistoryEntry, BuildPayload, ActionResult, BuildTarget, BuildPacket, Project } from '../types';
import type { EnhancedPromptResult } from './openai';
import type { PlanResult } from './claude';
import type { RouteDecision } from './router';

// ── Prompt/session memory ─────────────────────────────────────────────────────

const STORAGE_KEY = 'massa-ai-memory';

export interface ProjectMemoryEntry {
  id: string;
  projectId: string;
  timestamp: string;
  rawPrompt: string;
  enhancedResult: EnhancedPromptResult | null;
  routeDecision: RouteDecision | null;
  planResult: PlanResult | null;
  buildPayload: BuildPayload | null;
  buildResult: ActionResult | null;
  buildTarget?: BuildTarget | null;
  buildPacket?: BuildPacket | null;
  actions: Action[];
  changes: ChangeEntry[];
}

interface MemoryStore {
  projects: Record<string, ProjectMemoryEntry[]>;
}

function loadStore(): MemoryStore {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted */ }
  return { projects: {} };
}

function saveStore(store: MemoryStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

export function saveProjectMemory(entry: ProjectMemoryEntry) {
  const store = loadStore();
  if (!store.projects[entry.projectId]) store.projects[entry.projectId] = [];

  const existing = store.projects[entry.projectId].findIndex((e) => e.id === entry.id);
  if (existing >= 0) {
    store.projects[entry.projectId][existing] = entry;
  } else {
    store.projects[entry.projectId].unshift(entry);
  }

  store.projects[entry.projectId] = store.projects[entry.projectId].slice(0, 50);
  saveStore(store);
}

export function getProjectMemory(projectId: string): ProjectMemoryEntry[] {
  const store = loadStore();
  return store.projects[projectId] ?? [];
}

export function getAllHistory(projectId: string): HistoryEntry[] {
  const entries = getProjectMemory(projectId);
  return entries.map((e) => ({
    id: e.id,
    promptRecordId: e.id,
    rawPrompt: e.rawPrompt,
    enhancedPrompt: e.enhancedResult?.fullText ?? '',
    actions: e.actions,
    summary: e.enhancedResult?.objective ?? e.rawPrompt.slice(0, 80),
    timestamp: e.timestamp,
  }));
}

export function clearProjectMemory(projectId: string) {
  const store = loadStore();
  delete store.projects[projectId];
  saveStore(store);
}

export function clearAllMemory() {
  localStorage.removeItem(STORAGE_KEY);
}

// ── Packet history ────────────────────────────────────────────────────────────

const PACKET_HISTORY_KEY = 'massa-ai-packet-history';

function loadPacketStore(): Record<string, BuildPacket[]> {
  try {
    const raw = localStorage.getItem(PACKET_HISTORY_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted */ }
  return {};
}

function savePacketStore(store: Record<string, BuildPacket[]>) {
  localStorage.setItem(PACKET_HISTORY_KEY, JSON.stringify(store));
}

export function savePacketToHistory(projectId: string, packet: BuildPacket): void {
  const store = loadPacketStore();
  if (!store[projectId]) store[projectId] = [];
  // Deduplicate by packetId
  store[projectId] = store[projectId].filter((p) => p.packetId !== packet.packetId);
  store[projectId].unshift(packet);
  // Keep last 30 per project
  store[projectId] = store[projectId].slice(0, 30);
  savePacketStore(store);
}

export function getPacketHistory(projectId: string): BuildPacket[] {
  return loadPacketStore()[projectId] ?? [];
}

export function clearPacketHistory(projectId: string): void {
  const store = loadPacketStore();
  delete store[projectId];
  savePacketStore(store);
}

// ── Project list persistence ──────────────────────────────────────────────────

const PROJECTS_KEY = 'massa-ai-projects';

export function saveProjectList(projects: Project[]): void {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}

export function loadProjectList(): Project[] | null {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Project[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* corrupted */ }
  return null;
}
