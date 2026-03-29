import { AppShell } from './components/layout/AppShell';
import { RawPromptInput } from './components/prompt/RawPromptInput';
import { EnhanceButton } from './components/prompt/EnhanceButton';
import { OptimizedPreview } from './components/prompt/OptimizedPreview';
import { PipelineView } from './components/pipeline/PipelineView';
import { PlanPanel } from './components/pipeline/PlanPanel';
import { BuildPanel } from './components/pipeline/BuildPanel';
import { ActionsPanel } from './components/dashboard/ActionsPanel';
import { HistoryPanel } from './components/dashboard/HistoryPanel';
import { ChangesActivity } from './components/dashboard/ChangesActivity';
import { AutomationsPanel } from './components/placeholders/AutomationsPanel';
import { DeployPanel } from './components/placeholders/DeployPanel';

export default function App() {
  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-5">
        {/* Prompt Section */}
        <section className="space-y-3">
          <RawPromptInput />
          <EnhanceButton />
          <OptimizedPreview />
        </section>

        {/* Pipeline */}
        <section>
          <PipelineView />
        </section>

        {/* Plan Output */}
        <section>
          <PlanPanel />
        </section>

        {/* Build & Dispatch */}
        <section>
          <BuildPanel />
        </section>

        {/* Actions & History — side by side */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="min-h-[280px]">
            <ActionsPanel />
          </div>
          <div className="min-h-[280px]">
            <HistoryPanel />
          </div>
        </section>

        {/* Changes */}
        <section>
          <ChangesActivity />
        </section>

        {/* Placeholder sections */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <AutomationsPanel />
          <DeployPanel />
        </section>
      </div>
    </AppShell>
  );
}
