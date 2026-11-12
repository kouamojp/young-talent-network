import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import { ThemeProvider } from './hooks/useTheme.tsx'
import { initI18n } from './i18n'

// Unregister any previously installed service workers and clear caches.
// This fixes stale content when opening the preview in a new tab.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((r) => r.unregister());
  }).catch(() => {});
  if (typeof caches !== 'undefined') {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k))).catch(() => {});
  }
}

// The translations of the active language must be loaded before any module of
// the app is evaluated: some of them translate constants at import time.
// So the app bundle is only imported (and evaluated) once i18n is ready.
async function bootstrap() {
  await initI18n();
  const { default: App } = await import('./App.tsx');
  createRoot(document.getElementById("root")!).render(
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  );
}

bootstrap();
