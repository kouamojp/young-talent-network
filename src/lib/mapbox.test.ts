import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { geocodePlaces } from './mapbox';

const store = new Map<string, string>();

beforeEach(() => {
  store.clear();
  vi.stubGlobal('localStorage', {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => { store.set(k, v); },
    removeItem: (k: string) => { store.delete(k); },
  });
});
afterEach(() => vi.unstubAllGlobals());

const mapboxReply = (center: [number, number] | null) =>
  ({ ok: true, json: async () => ({ features: center ? [{ center }] : [] }) }) as Response;

describe('geocodePlaces', () => {
  it('geocodes each distinct place once and caches hits and misses', async () => {
    const fetchMock = vi.fn(async (url: string) =>
      url.includes(encodeURIComponent('Lyon')) ? mapboxReply([4.83, 45.76]) : mapboxReply(null));
    vi.stubGlobal('fetch', fetchMock);

    const first = await geocodePlaces(['Lyon', ' Lyon ', 'Nulle-part']);
    expect(first).toEqual({ Lyon: [4.83, 45.76], 'Nulle-part': null });
    expect(fetchMock).toHaveBeenCalledTimes(2);

    const second = await geocodePlaces(['Lyon', 'Nulle-part']);
    expect(second).toEqual(first);
    expect(fetchMock).toHaveBeenCalledTimes(2); // served from cache
  });

  it('does not cache failed requests, so they are retried', async () => {
    const fetchMock = vi.fn(async () => ({ ok: false }) as Response);
    vi.stubGlobal('fetch', fetchMock);

    expect(await geocodePlaces(['Paris'])).toEqual({ Paris: null });
    await geocodePlaces(['Paris']);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
