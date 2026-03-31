import { createContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import type {
  Project, Agent, PipelinePhase, Action, ChangeEntry,
  PipelineStage, BuildPayload, ActionResult, BuildTool,
  EnhanceProvider, BuildTarget, BuildPacket, PacketStatus,
} from '../types';
import { mockProjects } from '../data/mock';
import type { EnhancedPromptResult } from '../services/openai';
import { planWithClaude, type PlanResult } from '../services/claude';
import { routePrompt, type RouteDecision } from '../services/router';
import { runEnhancement } from '../services/enhancer';
import { prepareBuildPayload, simulateDispatch, getToolDisplayName } from '../services/dispatcher';
import { saveProjectMemory, getAllHistory, type ProjectMemoryEntry } from '../services/memory';
import { resolveEnhanceProvider, isAnthropicKeySet } from '../services/config';
import { generateBuildPacket as generatePacketFn } from '../services/buildPacket';

export interface ProjectContextValue {
  projects: Project[];
  activeProject: Project;
  activeAgent: Agent | null;
  setActiveProjectId: (id: string) => void;
  setActiveAgentId: (id: string | null) => void;

  rawPrompt: string;
  setRawPrompt: (text: string) => void;
  enhancedPrompt: string;
  setEnhancedPrompt: (text: string) => void;
  isEnhancing: boolean;
  promptStatus: PipelineStage;

  enhancedResult: EnhancedPromptResult | null;
  routeDecision: RouteDecision | null;
  planResult: PlanResult | null;
  isPlanning: boolean;
  error: string | null;

  /** User-selected enhance provider preference */
  enhanceProvider: EnhanceProvider;
  setEnhanceProvider: (p: EnhanceProvider) => void;
  /** The actual provider label used for the last enhancement */
  resolvedProvider: string | null;
  /** Set when planning was intentionally skipped */
  planningSkipReason: string | null;

  /** Selected build target for the handoff packet */
  buildTarget: BuildTarget;
  setBuildTarget: (t: BuildTarget) => void;
  /** Generated build packet (canonical) */
  buildPacket: BuildPacket | null;
  /** Derived from buildPacket and enhancedResult */
  packetStatus: PacketStatus;
  /** Generate a build packet from current context state */
  generateBuildPacket: () => void;

  buildPayload: BuildPayload | null;
  buildResult: ActionResult | null;
  isBuilding: boolean;
  isDispatching: boolean;

  enhancePrompt: () => void;
  approvePrompt: () => void;
  startBuild: () => void;
  dispatchTo: (tool: BuildTool) => void;
  resetPrompt: () => void;

  pipeline: PipelinePhase[];
  actions: Action[];
  changes: ChangeEntry[];
}

export const ProjectContext = createContext<ProjectContextValue | null>(null);

const SK_ENHANCE_PROVIDER = (pid: string) => `massa-enhance-provider-${pid}`;
const SK_BUILD_TARGET = (pid: string) => `massa-build-target-${pid}`;

const STAGE_ORDER: PipelineStage[] = [
  'enhancing', 'enhanced',
  'routing', 'routed',
  'planning', 'planned',
  'building', 'built',
  'dispatching', 'dispatched',
  'complete',
];

const PHASE_START: Record<string, number> = {
  enhance: 0,
  route: 2,
  plan: 4,
  build: 6,
  deploy: 8,
};

function makePipeline(stage: PipelineStage): PipelinePhase[] {
  if (stage === 'error') {
    return [
      { id: 'enhance', name: 'enhance', label: 'Enhance', status: 'error' },
      { id: 'route',   name: 'route',   label: 'Route',   status: 'idle'  },
      { id: 'plan',    name: 'plan',    label: 'Plan',    status: 'idle'  },
      { id: 'build',   name: 'build',   label: 'Build',   status: 'idle'  },
      { id: 'deploy',  name: 'deploy',  label: 'Deploy',  status: 'idle'  },
    ];
  }

  const current = STAGE_ORDER.indexOf(stage);

  const s = (name: string): PipelinePhase['status'] => {
    const start = PHASE_START[name] ?? 99;
    if (stage === 'idle') return 'idle';
    if (stage === 'complete') return 'complete';
    if (current > start + 1) return 'complete';
    if (current >= start && current <= start + 1) return 'active';
    return 'idle';
  };

  return [
    { id: 'enhance', name: 'enhance', label: 'Enhance', status: s('enhance') },
    { id: 'route',   name: 'route',   label: 'Route',   status: s('route')   },
    { id: 'plan',    name: 'plan',    label: 'Plan',    status: s('plan')    },
    { id: 'build',   name: 'build',   label: 'Build',   status: s('build')   },
    { id: 'deploy',  name: 'deploy',  label: 'Deploy',  status: s('deploy')  },
  ];
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects] = useState<Project[]>(mockProjects);
  const [activeProjectId, setActiveProjectId] = useState(mockProjects[0].id);
  const [activeAgentId, setActiveAgentId] = useState<string | null>(null);

  const [rawPrompt, setRawPrompt] = useState('');
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [promptStatus, setPromptStatus] = useState<PipelineStage>('idle');

  const [enhancedResult, setEnhancedResult] = useState<EnhancedPromptResult | null>(null);
  const [routeDecision, setRouteDecision] = useState<RouteDecision | null>(null);
  const [planResult, setPlanResult] = useState<PlanResult | null>(null);
  const [isPlanning, setIsPlanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Provider selection ────────────────────────────────────────────────────

  const [enhanceProvider, setEnhanceProviderState] = useState<EnhanceProvider>(() => {
    const saved = localStorage.getItem(SK_ENHANCE_PROVIDER(mockProjects[0].id));
    return (saved as EnhanceProvider | null) ?? 'auto';
  });
  const [resolvedProvider, setResolvedProvider] = useState<string | null>(null);
  const [planningSkipReason, setPlanningSkipReason] = useState<string | null>(null);

  const setEnhanceProvider = useCallback((p: EnhanceProvider) => {
    localStorage.setItem(SK_ENHANCE_PROVIDER(activeProjectId), p);
    setEnhanceProviderState(p);
  }, [activeProjectId]);

  // ── Build target selection ────────────────────────────────────────────────

  const [buildTarget, setBuildTargetState] = useState<BuildTarget>(() => {
    const saved = localStorage.getItem(SK_BUILD_TARGET(mockProjects[0].id));
    return (saved as BuildTarget | null) ?? 'internal';
  });

  const setBuildTarget = useCallback((t: BuildTarget) => {
    localStorage.setItem(SK_BUILD_TARGET(activeProjectId), t);
    setBuildTargetState(t);
  }, [activeProjectId]);

  // ── Build packet ──────────────────────────────────────────────────────────

  const [buildPacket, setBuildPacket] = useState<BuildPacket | null>(null);

  // ── Build / dispatch state ────────────────────────────────────────────────

  const [buildPayload, setBuildPayload] = useState<BuildPayload | null>(null);
  const [buildResult, setBuildResult] = useState<ActionResult | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isDispatching, setIsDispatching] = useState(false);

  const [liveActions, setLiveActions] = useState<Action[]>([]);
  const [liveChanges, setLiveChanges] = useState<ChangeEntry[]>([]);
  const [memorySessionId] = useState(() => `session-${Date.now()}`);

  const [persistedHistory, setPersistedHistory] = useState<ReturnType<typeof getAllHistory>>([]);

  const activeProject = projects.find((p) => p.id === activeProjectId) ?? projects[0];
  const activeAgent = activeAgentId
    ? activeProject.agents.find((a) => a.id === activeAgentId) ?? null
    : null;

  // Restore per-project preferences when switching projects
  useEffect(() => {
    queueMicrotask(() => {
      setPersistedHistory(getAllHistory(activeProjectId));

      const savedProvider = localStorage.getItem(SK_ENHANCE_PROVIDER(activeProjectId));
      setEnhanceProviderState((savedProvider as EnhanceProvider | null) ?? 'auto');

      const savedTarget = localStorage.getItem(SK_BUILD_TARGET(activeProjectId));
      setBuildTargetState((savedTarget as BuildTarget | null) ?? 'internal');
    });
  }, [activeProjectId]);

  // ── Action/change helpers ─────────────────────────────────────────────────

  const addAction = useCallback((action: Omit<Action, 'id' | 'timestamp'>) => {
    const full: Action = {
      ...action,
      id: `action-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    setLiveActions((prev) => [full, ...prev]);
    return full;
  }, []);

  const updateAction = useCallback((id: string, updates: Partial<Action>) => {
    setLiveActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    );
  }, []);

  const addChange = useCallback((change: Omit<ChangeEntry, 'id' | 'timestamp'>) => {
    setLiveChanges((prev) => [
      {
        ...change,
        id: `change-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toISOString(),
      },
      ...prev,
    ]);
  }, []);

  // ── Memory persistence ────────────────────────────────────────────────────

  const persistMemory = useCallback(
    (overrides?: {
      enhanced?: EnhancedPromptResult | null;
      route?: RouteDecision | null;
      plan?: PlanResult | null;
      build?: BuildPayload | null;
      result?: ActionResult | null;
      packet?: BuildPacket | null;
    }) => {
      const entry: ProjectMemoryEntry = {
        id: memorySessionId,
        projectId: activeProjectId,
        timestamp: new Date().toISOString(),
        rawPrompt,
        enhancedResult: overrides?.enhanced ?? enhancedResult,
        routeDecision: overrides?.route ?? routeDecision,
        planResult: overrides?.plan ?? planResult,
        buildPayload: overrides?.build ?? buildPayload,
        buildResult: overrides?.result ?? buildResult,
        buildTarget,
        buildPacket: overrides?.packet ?? buildPacket,
        actions: liveActions,
        changes: liveChanges,
      };
      saveProjectMemory(entry);
      setPersistedHistory(getAllHistory(activeProjectId));
    },
    [
      memorySessionId, activeProjectId, rawPrompt, enhancedResult, routeDecision,
      planResult, buildPayload, buildResult, buildTarget, buildPacket, liveActions, liveChanges,
    ]
  );

  // ── Enhance ───────────────────────────────────────────────────────────────

  const enhancePrompt = useCallback(async () => {
    if (!rawPrompt.trim()) return;
    setError(null);
    setPlanningSkipReason(null);
    setIsEnhancing(true);
    setPromptStatus('enhancing');

    const resolution = resolveEnhanceProvider(enhanceProvider);
    setResolvedProvider(resolution.label);

    // Build an explicit provider note for action history
    let providerNote: string;
    if (enhanceProvider === 'auto') {
      providerNote = `Auto → ${resolution.label}`;
    } else if (resolution.fallback) {
      const selectedLabel = enhanceProvider === 'xai' ? 'xAI' : enhanceProvider.toUpperCase();
      const reason = enhanceProvider === 'xai' ? 'xAI not yet integrated' : 'provider unavailable';
      providerNote = `Selected: ${selectedLabel} | Resolved: ${resolution.label} (fallback) | Reason: ${reason}`;
    } else {
      providerNote = resolution.label;
    }

    const enhanceAction = addAction({
      type: 'enhance',
      description: `Enhancing prompt via ${resolution.label}`,
      agentId: `agent-${resolution.resolved}`,
      agentName: resolution.label,
      status: 'running',
      output: `${providerNote} | Processing ${rawPrompt.trim().split(/\s+/).length} words...`,
    });

    addChange({
      type: 'prompt_enhanced',
      description: 'Prompt enhancement started',
      agentName: resolution.label,
      details: providerNote,
    });

    try {
      const { result, latencyMs } = await runEnhancement(rawPrompt, enhanceProvider);

      setEnhancedResult(result);
      setEnhancedPrompt(result.fullText);
      setIsEnhancing(false);
      setPromptStatus('enhanced');

      updateAction(enhanceAction.id, {
        status: 'complete',
        output: [
          providerNote,
          `Latency: ${latencyMs}ms`,
          `Objective: ${result.objective.slice(0, 100)}`,
        ].join(' | '),
      });

      addChange({
        type: 'prompt_enhanced',
        description: 'Prompt enhanced successfully',
        agentName: resolution.label,
        details: result.objective,
      });

      const route = await routePrompt(result.fullText);
      setRouteDecision(route);
      setPromptStatus('routed');

      addAction({
        type: 'route',
        description: `Routed to ${route.target}: ${route.reason}`,
        agentId: 'system',
        agentName: 'Massa Router',
        status: 'complete',
        output: `Target: ${route.target} | Confidence: ${route.confidence}`,
      });

      addChange({
        type: 'agent_assigned',
        description: `Task routed to ${route.target}`,
        agentName: 'Massa Router',
        details: route.reason,
      });

      persistMemory({ enhanced: result, route });
    } catch (err) {
      setIsEnhancing(false);
      setPromptStatus('error');
      const msg = err instanceof Error ? err.message : 'Enhancement failed';
      setError(msg);

      updateAction(enhanceAction.id, {
        status: 'failed',
        output: `${providerNote} | Error: ${msg}`,
      });
    }
  }, [rawPrompt, enhanceProvider, addAction, updateAction, addChange, persistMemory]);

  // ── Approve & Plan ────────────────────────────────────────────────────────

  const approvePrompt = useCallback(async () => {
    setPromptStatus('planning');
    setIsPlanning(true);
    setError(null);
    setPlanningSkipReason(null);

    addChange({
      type: 'phase_advanced',
      description: 'Prompt approved — starting planning phase',
      agentName: 'System',
    });

    if (routeDecision?.target !== 'claude') {
      setPromptStatus('planned');
      setIsPlanning(false);
      setPlanningSkipReason(`Task routed to ${routeDecision?.target ?? 'unknown'} — Claude planning not applicable`);
      addAction({
        type: 'plan',
        description: `Task queued for ${routeDecision?.target ?? 'processing'} (planning skipped)`,
        agentId: 'system',
        agentName: 'System',
        status: 'complete',
        output: 'Non-Claude route — planning stage deferred',
      });
      persistMemory();
      return;
    }

    if (!isAnthropicKeySet()) {
      setPromptStatus('planned');
      setIsPlanning(false);
      const skipMsg = 'Anthropic key not configured — add it in Settings to enable planning';
      setPlanningSkipReason(skipMsg);
      addAction({
        type: 'plan',
        description: 'Planning skipped — Anthropic not configured',
        agentId: 'system',
        agentName: 'System',
        status: 'complete',
        output: skipMsg,
      });
      addChange({
        type: 'phase_advanced',
        description: 'Planning skipped — Anthropic not available',
        agentName: 'System',
        details: 'Enhanced prompt and route decision preserved',
      });
      persistMemory();
      return;
    }

    const planAction = addAction({
      type: 'plan',
      description: 'Generating implementation plan via Claude',
      agentId: 'agent-claude',
      agentName: 'Claude',
      status: 'running',
      output: 'Analyzing specification and designing architecture...',
    });

    try {
      const plan = await planWithClaude(enhancedPrompt, activeProject);
      setPlanResult(plan);
      setIsPlanning(false);
      setPromptStatus('planned');

      updateAction(planAction.id, {
        status: 'complete',
        output: `Plan: ${plan.implementationPlan.length} steps, ${plan.componentSuggestions.length} components suggested`,
      });

      addChange({
        type: 'phase_advanced',
        description: 'Implementation plan generated',
        agentName: 'Claude',
        details: plan.recommendedNextAction,
      });

      persistMemory({ plan });
    } catch (err) {
      setIsPlanning(false);
      setPromptStatus('routed');
      const msg = err instanceof Error ? err.message : 'Planning failed';
      setError(msg);

      updateAction(planAction.id, {
        status: 'failed',
        output: msg,
      });
    }
  }, [enhancedPrompt, routeDecision, addAction, updateAction, addChange, persistMemory]);

  // ── Generate Build Packet ─────────────────────────────────────────────────

  const generateBuildPacket = () => {
    if (!enhancedResult && !rawPrompt.trim()) return;

    const packet = generatePacketFn({
      projectId: activeProjectId,
      agentId: activeAgent?.id ?? null,
      rawPrompt,
      enhancedResult,
      routeDecision,
      planResult,
      target: buildTarget,
    });

    setBuildPacket(packet);

    addAction({
      type: 'packet',
      description: `Build Packet generated for ${buildTarget.toUpperCase()}`,
      agentId: 'system',
      agentName: 'Massa Builder',
      status: 'complete',
      output: [
        `Target: ${buildTarget}`,
        `Title: ${packet.title.slice(0, 80)}`,
        `Steps: ${packet.implementationSteps.length}`,
        `Files: ${packet.fileSuggestions.length}`,
      ].join(' | '),
    });

    addChange({
      type: 'phase_advanced',
      description: `Build Packet generated — target: ${buildTarget}`,
      agentName: 'Massa Builder',
      details: packet.objective.slice(0, 100),
    });

    persistMemory({ packet });
  };

  // ── Build ─────────────────────────────────────────────────────────────────

  const startBuild = useCallback(() => {
    if (promptStatus !== 'planned') return;
    setIsBuilding(true);
    setPromptStatus('building');
    setError(null);

    const payload = prepareBuildPayload(enhancedResult, planResult, routeDecision);
    setBuildPayload(payload);
    setIsBuilding(false);
    setPromptStatus('built');

    addAction({
      type: 'build',
      description: `Build payload prepared — recommended tool: ${getToolDisplayName(payload.recommendedTool)}`,
      agentId: 'system',
      agentName: 'Massa Builder',
      status: 'complete',
      output: `Goal: ${payload.goal.slice(0, 80)} | ${payload.steps.length} steps | ${payload.files.length} files`,
    });

    addChange({
      type: 'phase_advanced',
      description: 'Build payload prepared — ready for dispatch',
      agentName: 'Massa Builder',
      details: `Recommended: ${getToolDisplayName(payload.recommendedTool)}`,
    });

    persistMemory({ build: payload });
  }, [promptStatus, enhancedResult, planResult, routeDecision, addAction, addChange, persistMemory]);

  // ── Dispatch ──────────────────────────────────────────────────────────────

  const dispatchTo = useCallback(async (tool: BuildTool) => {
    if (!buildPayload || promptStatus !== 'built') return;
    setIsDispatching(true);
    setPromptStatus('dispatching');
    setError(null);

    const toolName = getToolDisplayName(tool);

    const dispatchAction = addAction({
      type: 'deploy',
      description: `Dispatching to ${toolName}...`,
      agentId: `agent-${tool}`,
      agentName: toolName,
      status: 'running',
      output: `Sending build payload to ${toolName} for execution`,
    });

    addChange({
      type: 'agent_assigned',
      description: `Task dispatched to ${toolName}`,
      agentName: 'Massa Dispatcher',
      details: buildPayload.goal.slice(0, 80),
    });

    try {
      const result = await simulateDispatch(buildPayload, tool);
      setBuildResult(result);
      setIsDispatching(false);
      setPromptStatus('complete');

      updateAction(dispatchAction.id, {
        status: 'complete',
        description: `Executed via ${toolName}`,
        output: result.resultSummary,
      });

      addChange({
        type: 'deployed',
        description: `Execution complete via ${toolName}`,
        agentName: toolName,
        details: result.resultSummary.split('\n')[0],
      });

      addChange({
        type: 'phase_advanced',
        description: 'Pipeline complete — full lifecycle finished',
        agentName: 'System',
      });

      persistMemory({ result });
    } catch (err) {
      setIsDispatching(false);
      setPromptStatus('built');
      const msg = err instanceof Error ? err.message : 'Dispatch failed';
      setError(msg);

      updateAction(dispatchAction.id, {
        status: 'failed',
        output: msg,
      });
    }
  }, [buildPayload, promptStatus, addAction, updateAction, addChange, persistMemory]);

  // ── Reset ─────────────────────────────────────────────────────────────────

  const resetPrompt = useCallback(() => {
    setRawPrompt('');
    setEnhancedPrompt('');
    setPromptStatus('idle');
    setEnhancedResult(null);
    setRouteDecision(null);
    setPlanResult(null);
    setIsPlanning(false);
    setBuildPayload(null);
    setBuildResult(null);
    setBuildPacket(null);
    setIsBuilding(false);
    setIsDispatching(false);
    setError(null);
    setResolvedProvider(null);
    setPlanningSkipReason(null);
    setLiveActions([]);
    setLiveChanges([]);
  }, []);

  // ── Derived state ─────────────────────────────────────────────────────────

  const packetStatus: PacketStatus = buildPacket
    ? 'generated'
    : enhancedResult
      ? 'ready'
      : 'not_ready';

  const pipeline = makePipeline(promptStatus);
  const actions = [...liveActions, ...activeProject.actions];
  const changes = [...liveChanges, ...activeProject.changes];

  const mergedHistory = activeProject.history.concat(
    persistedHistory.filter(
      (ph) => !activeProject.history.some((h) => h.id === ph.id)
    )
  );
  const projectWithHistory = { ...activeProject, history: mergedHistory };

  return (
    <ProjectContext.Provider
      value={{
        projects,
        activeProject: projectWithHistory,
        activeAgent,
        setActiveProjectId,
        setActiveAgentId,
        rawPrompt,
        setRawPrompt,
        enhancedPrompt,
        setEnhancedPrompt,
        isEnhancing,
        promptStatus,
        enhancedResult,
        routeDecision,
        planResult,
        isPlanning,
        error,
        enhanceProvider,
        setEnhanceProvider,
        resolvedProvider,
        planningSkipReason,
        buildTarget,
        setBuildTarget,
        buildPacket,
        packetStatus,
        generateBuildPacket,
        buildPayload,
        buildResult,
        isBuilding,
        isDispatching,
        enhancePrompt,
        approvePrompt,
        startBuild,
        dispatchTo,
        resetPrompt,
        pipeline,
        actions,
        changes,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}
