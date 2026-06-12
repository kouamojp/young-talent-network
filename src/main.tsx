
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from './hooks/useTheme.tsx'

// Throttle history.replaceState to avoid Safari's "more than 100 calls per 10s"
// SecurityError caused by the preview tracker mirroring rapid route changes.
if (typeof window !== 'undefined' && window.history && !(window.history as any).__replaceThrottled) {
  const orig = window.history.replaceState.bind(window.history);
  const times: number[] = [];
  let lastUrl: string | null = null;
  (window.history as any).replaceState = function (state: any, title: string, url?: string | URL | null) {
    try {
      const urlStr = url == null ? window.location.href : String(url);
      const now = Date.now();
      // Drop duplicates targeting the same URL (no-op anyway).
      if (urlStr === lastUrl) return;
      // Throttle bursts: keep a rolling 10s window, cap at 80 calls.
      while (times.length && now - times[0] > 10000) times.shift();
      if (times.length >= 80) return;
      times.push(now);
      lastUrl = urlStr;
      return orig(state, title, url as any);
    } catch (e) {
      // Swallow SecurityError so it doesn't crash React rendering.
      console.warn('replaceState throttled:', e);
    }
  };
  (window.history as any).__replaceThrottled = true;
}

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


createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </BrowserRouter>
);
