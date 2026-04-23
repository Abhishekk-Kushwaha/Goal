import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const GOALFORGE_CACHE_PREFIX = 'goalforge-';

async function clearGoalforgeServiceWorkerState() {
  const registrations = await navigator.serviceWorker.getRegistrations();
  await Promise.all(registrations.map((registration) => registration.unregister()));

  if (!('caches' in window)) return;

  const cacheKeys = await caches.keys();
  await Promise.all(
    cacheKeys
      .filter((key) => key.startsWith(GOALFORGE_CACHE_PREFIX))
      .map((key) => caches.delete(key)),
  );
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    if (import.meta.env.DEV) {
      void clearGoalforgeServiceWorkerState().catch((error) => {
        console.error('Service worker cleanup failed:', error);
      });
      return;
    }

    navigator.serviceWorker
      .register(`/sw.js?v=${encodeURIComponent(__APP_VERSION__)}`)
      .then((registration) => registration.update())
      .catch((error) => {
        console.error("Service worker registration failed:", error);
      });
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
