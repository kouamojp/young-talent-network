import { supabase } from '@/integrations/supabase/client';

/**
 * Calls an Edge Function and returns `{ data, error }` where `error` is the
 * human-readable message from the function's JSON body (`{ error: "..." }`),
 * even on non-2xx responses, where supabase-js only exposes a generic error.
 */
export async function invokeFunction<T = any>(name: string, body: unknown): Promise<{ data: T | null; error: string | null }> {
  const { data, error } = await supabase.functions.invoke(name, { body });
  if (!error) {
    if (data && typeof data === 'object' && 'error' in data && (data as any).error) {
      return { data: null, error: String((data as any).error) };
    }
    return { data: data as T, error: null };
  }
  try {
    const payload = await (error as any).context?.json?.();
    if (payload?.error) return { data: null, error: String(payload.error) };
  } catch {
    // body was not JSON
  }
  return { data: null, error: error.message || 'Erreur réseau' };
}
