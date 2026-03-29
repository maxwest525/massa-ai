import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Bot, Check } from 'lucide-react';
import { useProject } from '../../hooks/useProject';

export function AgentSelector() {
  const { activeProject, activeAgent, setActiveAgentId } = useProject();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const statusColor = {
    idle: 'bg-masa-text-muted',
    active: 'bg-masa-success',
    busy: 'bg-masa-warning',
    error: 'bg-masa-danger',
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-masa-card border border-masa-border hover:border-masa-border-light text-sm text-masa-text transition-colors"
      >
        <Bot className="w-3.5 h-3.5 text-masa-text-dim" />
        <span className="max-w-[120px] truncate">
          {activeAgent?.name ?? 'All Agents'}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-masa-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-masa-card border border-masa-border rounded-xl shadow-lg shadow-black/30 z-50 overflow-hidden">
          <div className="p-1">
            <button
              onClick={() => {
                setActiveAgentId(null);
                setOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                !activeAgent
                  ? 'bg-masa-accent/10 text-masa-accent-light'
                  : 'text-masa-text-dim hover:text-masa-text hover:bg-masa-surface'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span className="flex-1 text-left">All Agents</span>
              {!activeAgent && <Check className="w-4 h-4 text-masa-accent" />}
            </button>

            {activeProject.agents.map((agent) => (
              <button
                key={agent.id}
                onClick={() => {
                  setActiveAgentId(agent.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  agent.id === activeAgent?.id
                    ? 'bg-masa-accent/10 text-masa-accent-light'
                    : 'text-masa-text-dim hover:text-masa-text hover:bg-masa-surface'
                }`}
              >
                <div className="relative shrink-0">
                  <Bot className="w-4 h-4" />
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-masa-card ${statusColor[agent.status]}`}
                  />
                </div>
                <div className="flex-1 text-left">
                  <div>{agent.name}</div>
                  <div className="text-[10px] text-masa-text-muted">{agent.role}</div>
                </div>
                {agent.id === activeAgent?.id && (
                  <Check className="w-4 h-4 text-masa-accent" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
