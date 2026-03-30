import { useState, useEffect } from 'react';
import { Zap, Settings, Bell, Sun, Moon, PanelRight } from 'lucide-react';
import { ProjectSelector } from '../selectors/ProjectSelector';
import { AgentSelector } from '../selectors/AgentSelector';
import { SettingsPanel } from './SettingsPanel';
import { getKeyStatus } from '../../services/config';
import { useUI } from '../../context/UIContext';

export function TopNav() {
  const { theme, toggleTheme, previewOpen, togglePreview } = useUI();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [keysSet, setKeysSet] = useState(() => getKeyStatus().allSet);

  useEffect(() => {
    if (!settingsOpen) {
      queueMicrotask(() => setKeysSet(getKeyStatus().allSet));
    }
  }, [settingsOpen]);

  return (
    <>
      <header className="h-14 border-b border-masa-border bg-masa-surface flex items-center justify-between px-4 shrink-0 relative z-30">
        {/* Left — logo + selectors */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-masa-text tracking-tight">
              MASA <span className="text-masa-accent-light">AI</span>
            </span>
          </div>

          <div className="w-px h-6 bg-masa-border mx-2" />

          <ProjectSelector />
          <AgentSelector />
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-1">
          {/* Notifications */}
          <button className="p-2 rounded-lg text-masa-text-dim hover:text-masa-text hover:bg-masa-card transition-colors">
            <Bell className="w-4 h-4" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg text-masa-text-dim hover:text-masa-text hover:bg-masa-card transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Preview panel toggle */}
          <button
            onClick={togglePreview}
            className={`p-2 rounded-lg transition-colors ${
              previewOpen
                ? 'text-masa-accent-light bg-masa-accent/10 hover:bg-masa-accent/15'
                : 'text-masa-text-dim hover:text-masa-text hover:bg-masa-card'
            }`}
            title={previewOpen ? 'Close preview panel' : 'Open preview panel'}
          >
            <PanelRight className="w-4 h-4" />
          </button>

          {/* Settings gear */}
          <button
            onClick={() => setSettingsOpen(true)}
            className="relative p-2 rounded-lg text-masa-text-dim hover:text-masa-text hover:bg-masa-card transition-colors"
            title="Settings"
          >
            <Settings className="w-4 h-4" />
            {!keysSet && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-masa-surface" />
            )}
          </button>

          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-xs font-semibold text-white ml-1">
            M
          </div>
        </div>
      </header>

      <SettingsPanel isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}
