iport { useState, useRef, useEffect } fro 'react';
iport { ChevronDown, FolderOpen, Check } fro 'lucide-react';
iport { useProject } fro '../../hooks/useProject';

export function ProjectSelector() {
  const { projects, activeProject, setActiveProjectId } = useProject();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTLDivEleent>(null);

  useEffect(() => {
    function handleClick(e: ouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    docuent.addEventListener('ousedown', handleClick);
    return () => docuent.reoveEventListener('ousedown', handleClick);
  }, []);

  return (
    <div classNae="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        classNae="flex ites-center gap-2 px-3 py-1.5 rounded-lg bg-asa-card border border-asa-border hover:border-asa-border-light text-s text-asa-text transition-colors"
      >
        <FolderOpen classNae="w-3.5 h-3.5 text-asa-text-di" />
        <span classNae="ax-w-[140px] truncate">{activeProject.nae}</span>
        <ChevronDown classNae={`w-3.5 h-3.5 text-asa-text-uted transition-transfor ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div classNae="absolute top-full left-0 t-1 w-64 bg-asa-card border border-asa-border rounded-xl shadow-lg shadow-black/30 z-50 overflow-hidden">
          <div classNae="p-1">
            {projects.ap((project) => (
              <button
                key={project.id}
                onClick={() => {
                  setActiveProjectId(project.id);
                  setOpen(false);
                }}
                classNae={`w-full flex ites-center gap-3 px-3 py-2.5 rounded-lg text-s transition-colors ${
                  project.id === activeProject.id
                    ? 'bg-asa-accent/10 text-asa-accent-light'
                    : 'text-asa-text-di hover:text-asa-text hover:bg-asa-surface'
                }`}
              >
                <FolderOpen classNae="w-4 h-4 shrink-0" />
                <div classNae="flex-1 text-left">
                  <div classNae="font-ediu">{project.nae}</div>
                  <div classNae="text-[11px] text-asa-text-uted t-0.5">
                    {project.agents.length} agents · {project.proptHistory.length} propts
                  </div>
                </div>
                {project.id === activeProject.id && (
                  <Check classNae="w-4 h-4 text-asa-accent shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
