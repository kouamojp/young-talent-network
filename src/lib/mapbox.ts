/**
 * Mapbox configuration shared by every map of the app.
 *
 * VITE_MAPBOX_TOKEN is a *public* token (pk.…): restrict it to your domains in
 * the Mapbox dashboard (URL restrictions). The fallback is the demo token that
 * was hard-coded in the Events page; replace it with your own.
 */
const LEGACY_DEMO_TOKEN = 'pk.eyJ1IjoibG92YWJsZSIsImEiOiJjbHRpY3B2MG0wMXVjMmtwNjlzOHV5dGxzIn0.a_bGOwlDWjFEeSbQ1SInjQ';

export const MAPBOX_TOKEN: string = (import.meta.env.VITE_MAPBOX_TOKEN as string | undefined) || LEGACY_DEMO_TOKEN;

export type LngLat = [number, number];

const CACHE_KEY = 'yat-geocode-cache-v1';

const readCache = (): Record<string, LngLat | null> => {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}'); } catch { return {}; }
};
const writeCache = (cache: Record<string, LngLat | null>) => {
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)); } catch { /* storage full or blocked */ }
};

/**
 * Turns free-text places ("Lyon, France") into coordinates with the Mapbox
 * geocoding API. Results (including misses) are cached in localStorage so each
 * address is looked up once per browser.
 */
export async function geocodePlaces(places: string[]): Promise<Record<string, LngLat | null>> {
  const cache = readCache();
  const wanted = [...new Set(places.map(p => p.trim()).filter(Boolean))];
  const missing = wanted.filter(p => !(p in cache)).slice(0, 40); // keep API usage bounded

  await Promise.all(missing.map(async (place) => {
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(place)}.json?limit=1&access_token=${MAPBOX_TOKEN}`
      );
      if (!res.ok) return; // not cached: retried next time
      const json = await res.json();
      const center = json?.features?.[0]?.center;
      cache[place] = Array.isArray(center) && center.length === 2 ? [Number(center[0]), Number(center[1])] : null;
    } catch { /* network error: retried next time */ }
  }));

  writeCache(cache);
  return Object.fromEntries(wanted.map(p => [p, cache[p] ?? null]));
}
