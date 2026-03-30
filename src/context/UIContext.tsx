import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Theme = 'dark' | 'light';

export type AppView = 'dashboard' | 'history' | 'automations' | 'deploy';

interface UIContextValue {
  theme: Theme;
  toggleTheme: () => void;
  previewOpen: boolean;
  togglePreview: () => void;
  setPreviewOpen: (open: boolean) => void;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
}

/** Used when `useUI()` runs outside `UIProvider` (tests, Storybook). No-ops avoid crashes. */
const UI_OUTSIDE_PROVIDER_FALLBACK: UIContextValue = {
  theme: 'dark',
  toggleTheme: () => {},
  previewOpen: false,
  togglePreview: () => {},
  setPreviewOpen: () => {},
  currentView: 'dashboard',
  setCurrentView: () => {},
};

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('masa-theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  const [previewOpen, setPreviewOpen] = useState(() => {
    return localStorage.getItem('masa-preview-open') === 'true';
  });

  const [currentView, setCurrentView] = useState<AppView>('dashboard');

  // Apply theme class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => {
      const next: Theme = t === 'dark' ? 'light' : 'dark';
      localStorage.setItem('masa-theme', next);
      return next;
    });
  };

  const togglePreview = () => {
    setPreviewOpen((prev) => {
      const next = !prev;
      localStorage.setItem('masa-preview-open', String(next));
      return next;
    });
  };

  const handleSetPreviewOpen = (open: boolean) => {
    localStorage.setItem('masa-preview-open', String(open));
    setPreviewOpen(open);
  };

  return (
    <UIContext.Provider
      value={{
        theme,
        toggleTheme,
        previewOpen,
        togglePreview,
        setPreviewOpen: handleSetPreviewOpen,
        currentView,
        setCurrentView,
      }}
    >
      {children}
    </UIContext.Provider>
  );
}

/**
 * Returns UI state from the nearest `UIProvider`.
 * If called outside a provider (e.g. tests, Storybook), returns safe no-op fallbacks — never `null`.
 */
export function useUI(): UIContextValue {
  const ctx = useContext(UIContext);
  if (ctx !== null) {
    return ctx;
  }
  if (import.meta.env.DEV) {
    console.warn(
      '[useUI] No UIProvider found — using no-op fallbacks. Wrap the tree with <UIProvider> in main.tsx for real state.',
    );
  }
  return UI_OUTSIDE_PROVIDER_FALLBACK;
}
