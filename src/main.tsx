import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './theme/theme.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Ontwikkelhulp: de store bekijken vanuit de browserconsole (alleen in dev).
if (import.meta.env.DEV) {
  void import('./state/store').then(({ useAppStore }) => {
    (window as unknown as { __store: typeof useAppStore }).__store = useAppStore;
  });
}
