import type { ReactNode } from 'react';
import { TopNav } from './TopNav';
import { Sidebar } from './Sidebar';
import { PreviewPanel } from './PreviewPanel';
import { useUI } from '../../context/UIContext';
import { DebugPanel } from '../dev/DebugPanel';

export function AppShell({ children }: { children: ReactNode }) {
  const { previewOpen } = useUI();

  return (
    <div className="h-screen flex flex-col bg-masa-bg overflow-hidden">
      <TopNav />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6 min-w-0">
          {children}
        </main>
        {previewOpen && <PreviewPanel />}
      </div>
      {import.meta.env.DEV && <DebugPanel />}
    </div>
  );
}
