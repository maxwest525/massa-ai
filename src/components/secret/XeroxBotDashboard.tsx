import { useUI } from '../../context/UIContext'
import DashboardTab from './DashboardTab'
import TradesTab from './TradesTab'
import BacktestTab from './BacktestTab'
import StrategiesTab from './StrategiesTab'
import ConnectionsTab from './ConnectionsTab'
import KnowledgeTab from './KnowledgeTab'
import NewsTab from './NewsTab'
import ScraperTab from './ScraperTab'
import YoloTab from './YoloTab'

export default function XeroxBotDashboard() {
  const { activeTab } = useUI()

  const tabs: Record<string, React.ComponentType> = {
    'dashboard': DashboardTab,
    'trades': TradesTab,
    'backtest': BacktestTab,
    'strategies': StrategiesTab,
    'strategy-vault': StrategiesTab,
    'connections': ConnectionsTab,
    'knowledge': KnowledgeTab,
    'news': NewsTab,
    'scraper': ScraperTab,
    'yolo': YoloTab,
  }

  const TabComponent = tabs[activeTab] || DashboardTab

  return (
    <div className="flex-1 overflow-y-auto">
      <TabComponent />
    </div>
  )
}
