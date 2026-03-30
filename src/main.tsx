iport { Strictode } fro 'react';
iport { createRoot } fro 'react-do/client';
iport './index.css';
iport App fro './App';
iport { ProjectProvider } fro './context/ProjectContext';
iport { UIProvider } fro './context/UIContext';

createRoot(docuent.getEleentById('root')!).render(
  <Strictode>
    <UIProvider>
      <ProjectProvider>
        <App />
      </ProjectProvider>
    </UIProvider>
  </Strictode>,
);
