import { createContext, useContext, useState, type ReactNode } from 'react'
import type { SecretTab } from '../types'

interface UIState {
  activeTab: SecretTab
  setActiveTab: (tab: SecretTab) => void
  killSwitchOpen: boolean
  setKillSwitchOpen: (open: boolean) => void
}

const UIContext = createContext<UIState | null>(null)

export function UIProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<SecretTab>('dashboard')
  const [killSwitchOpen, setKillSwitchOpen] = useState(false)

  return (
    <UIContext.Provider value={{ activeTab, setActiveTab, killSwitchOpen, setKillSwitchOpen }}>
      {children}
    </UIContext.Provider>
  )
}

export function useUI() {
  const ctx = useContext(UIContext)
  if (!ctx) throw new Error('useUI must be inside UIProvider')
  return ctx
}
