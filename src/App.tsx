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
import { MarketplacePanel } from './components/placeholders/MarketplacePanel';
import { MyProductsPanel } from './components/placeholders/MyProductsPanel';
import { useUI } from './context/UIContext';

export default function App() {
  const { currentView } = useUI();

  if (currentView === 'marketplace') {
    return (
      <AppShell>
        <div className="max-w-6xl mx-auto">
          <MarketplacePanel />
        </div>
      </AppShell>
    );
  }

  if (currentView === 'my_products') {
    return (
      <AppShell>
        <div className="max-w-6xl mx-auto">
          <MyProductsPanel />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-5">

        {currentView === 'dashboard' && (
          <>
            <section className="space-y-3">
              <RawPromptInput />
              <EnhanceButton />
              <OptimizedPreview />
            </section>
            <section>
              <PipelineView />
            </section>
            <section>
              <PlanPanel />
            </section>
            <section>
              <BuildPanel />
            </section>
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="min-h-[280px]"><ActionsPanel /></div>
              <div className="min-h-[280px]"><HistoryPanel /></div>
            </section>
            <section>
              <ChangesActivity />
            </section>
          </>
        )}

        {currentView === 'history' && (
          <section className="min-h-[400px]">
            <HistoryPanel />
          </section>
        )}

        {currentView === 'automations' && (
          <section>
            <AutomationsPanel />
          </section>
        )}

        {currentView === 'deploy' && (
          <section>
            <DeployPanel />
          </section>
        )}

      </div>
    </AppShell>
  );
}
