import {
  FolderOpen,
  Bot,
  LayoutDashboard,
  Clock,
  Workflow,
  Rocket,
  ChevronRight,
} from 'lucide-react';
import { useProject } from '../../hooks/useProject';
import { useUI, type AppView } from '../../context/UIContext';

interface NavItem {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: string;
  onClick?: () => void;
}

function NavButton({ icon, label, active, badge, onClick }: NavItem) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
        active
          ? 'bg-masa-accent/10 text-masa-accent-light'
          : 'text-masa-text-dim hover:text-masa-text hover:bg-masa-card'
      }`}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-masa-accent/20 text-masa-accent-light font-medium">
          {badge}
        </span>
      )}
    </button>
  );
}

export function Sidebar() {
  const { projects, activeProject, setActiveProjectId, activeAgent, setActiveAgentId } = useProject();
  const { currentView, setCurrentView } = useUI();

  const nav: { id: AppView; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard',   label: 'Dashboard',   icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'history',     label: 'History',     icon: <Clock           className="w-4 h-4" />, badge: activeProject.history.length > 0 ? String(activeProject.history.length) : undefined },
    { id: 'automations', label: 'Automations', icon: <Workflow        className="w-4 h-4" /> },
    { id: 'deploy',      label: 'Deploy',      icon: <Rocket          className="w-4 h-4" /> },
  ];

  return (
    <aside className="w-60 border-r border-masa-border bg-masa-surface flex flex-col shrink-0 overflow-hidden">
      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* Projects */}
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-masa-text-muted px-3 mb-2">
            Projects
          </h3>
          <div className="space-y-0.5">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => setActiveProjectId(project.id)}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  project.id === activeProject.id
                    ? 'bg-masa-accent/10 text-masa-accent-light'
                    : 'text-masa-text-dim hover:text-masa-text hover:bg-masa-card'
                }`}
              >
                <FolderOpen className="w-4 h-4 shrink-0" />
                <span className="truncate flex-1 text-left">{project.name}</span>
                {project.id === activeProject.id && (
                  <ChevronRight className="w-3 h-3 shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Agents */}
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-masa-text-muted px-3 mb-2">
            Agents
          </h3>
          <div className="space-y-0.5">
            {activeProject.agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() =>
                  setActiveAgentId(agent.id === activeAgent?.id ? null : agent.id)
                }
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  agent.id === activeAgent?.id
                    ? 'bg-masa-accent/10 text-masa-accent-light'
                    : 'text-masa-text-dim hover:text-masa-text hover:bg-masa-card'
                }`}
              >
                <div className="relative shrink-0">
                  <Bot className="w-4 h-4" />
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-masa-surface ${
                      agent.status === 'active'
                        ? 'bg-masa-success'
                        : agent.status === 'busy'
                          ? 'bg-masa-warning'
                          : agent.status === 'error'
                            ? 'bg-masa-danger'
                            : 'bg-masa-text-muted'
                    }`}
                  />
                </div>
                <span className="truncate flex-1 text-left">{agent.name}</span>
                <span className="text-[10px] text-masa-text-muted">{agent.provider}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-wider text-masa-text-muted px-3 mb-2">
            Navigation
          </h3>
          <div className="space-y-0.5">
            {nav.map(({ id, label, icon, badge }) => (
              <NavButton
                key={id}
                icon={icon}
                label={label}
                active={currentView === id}
                badge={badge}
                onClick={() => setCurrentView(id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-masa-border">
        <div className="px-3 py-2 rounded-lg bg-masa-card/50 text-xs text-masa-text-muted">
          <div className="font-medium text-masa-text-dim mb-1">Active Project</div>
          <div className="text-masa-text truncate">{activeProject.name}</div>
          <div className="mt-1">{activeProject.agents.length} agents assigned</div>
        </div>
      </div>
    </aside>
  );
}
