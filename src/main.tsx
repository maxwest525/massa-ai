import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ProjectProvider } from './context/ProjectContext';
import { UIProvider } from './context/UIContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <UIProvider>
      <ProjectProvider>
        <App />
      </ProjectProvider>
    </UIProvider>
  </StrictMode>,
);
