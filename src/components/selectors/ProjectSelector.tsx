import { useState, useRef, useEffect } from 'react';
import { ChevronDown, FolderOpen, Check } from 'lucide-react';
import { useProject } from '../../hooks/useProject';

export function ProjectSelector() {
  const { projects, activeProject, setActiveProjectId } = useProject();
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

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-masa-card border border-masa-border hover:border-masa-border-light text-sm text-masa-text transition-colors"
      >
        <FolderOpen className="w-3.5 h-3.5 text-masa-text-dim" />
        <span className="max-w-[140px] truncate">{activeProject.name}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-masa-text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-masa-card border border-masa-border rounded-xl shadow-lg shadow-black/30 z-50 overflow-hidden">
          <div className="p-1">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => {
                  setActiveProjectId(project.id);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  project.id === activeProject.id
                    ? 'bg-masa-accent/10 text-masa-accent-light'
                    : 'text-masa-text-dim hover:text-masa-text hover:bg-masa-surface'
                }`}
              >
                <FolderOpen className="w-4 h-4 shrink-0" />
                <div className="flex-1 text-left">
                  <div className="font-medium">{project.name}</div>
                  <div className="text-[11px] text-masa-text-muted mt-0.5">
                    {project.agents.length} agents · {project.promptHistory.length} prompts
                  </div>
                </div>
                {project.id === activeProject.id && (
                  <Check className="w-4 h-4 text-masa-accent shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
