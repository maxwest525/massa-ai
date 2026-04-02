import { UIProvider } from './context/UIContext'
import Sidebar from './components/layout/Sidebar'
import TopNav from './components/layout/TopNav'
import KillSwitchModal from './components/layout/KillSwitchModal'
import XeroxBotDashboard from './components/secret/XeroxBotDashboard'

export default function App() {
  return (
    <UIProvider>
      <div className="flex h-screen bg-[var(--color-bg)]">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-[220px]">
          <TopNav />
          <XeroxBotDashboard />
        </div>
        <KillSwitchModal />
      </div>
    </UIProvider>
  )
}
