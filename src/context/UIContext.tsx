import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Theme = 'dark' | 'light';

interface UIContextValue {
  theme: Theme;
  toggleTheme: () => void;
  previewOpen: boolean;
  togglePreview: () => void;
  setPreviewOpen: (open: boolean) => void;
}

const UIContext = createContext<UIContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
  previewOpen: false,
  togglePreview: () => {},
  setPreviewOpen: () => {},
});

export function UIProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('masa-theme');
    return saved === 'light' ? 'light' : 'dark';
  });

  const [previewOpen, setPreviewOpen] = useState(() => {
    return localStorage.getItem('masa-preview-open') === 'true';
  });

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
    <UIContext.Provider value={{ theme, toggleTheme, previewOpen, togglePreview, setPreviewOpen: handleSetPreviewOpen }}>
      {children}
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);
