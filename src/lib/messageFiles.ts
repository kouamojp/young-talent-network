import { supabase } from '@/integrations/supabase/client';

/**
 * Message attachments live in the private `message-files` bucket, under
 * <conversation_id>/<sender_id>/<file>. `messages.media_url` stores a reference
 * ("private:<path>") instead of a public link; it is turned into a short-lived
 * signed URL when displayed. Older messages still hold a plain public URL.
 */
const BUCKET = 'message-files';
const PREFIX = 'private:';
const SIGNED_URL_TTL = 60 * 60; // seconds

export const isPrivateMediaRef = (value?: string | null): value is string => !!value && value.startsWith(PREFIX);

const safeName = (name: string) => name.normalize('NFD').replace(/[^\w.-]+/g, '_').slice(-80) || 'file';

/** Uploads a file into a conversation and returns the reference to store in `media_url`. */
export async function uploadMessageFile(conversationId: string, senderId: string, file: File): Promise<string> {
  const path = `${conversationId}/${senderId}/${Date.now()}-${safeName(file.name)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, { contentType: file.type || undefined });
  if (error) throw error;
  return PREFIX + path;
}

/**
 * Copies an attachment into another conversation (forwarding): members of the
 * target conversation cannot read files of the source one.
 */
export async function copyMessageFile(ref: string, targetConversationId: string, senderId: string): Promise<string> {
  if (!isPrivateMediaRef(ref)) return ref;
  const source = ref.slice(PREFIX.length);
  const target = `${targetConversationId}/${senderId}/${Date.now()}-${source.split('/').pop()}`;
  const { error } = await supabase.storage.from(BUCKET).copy(source, target);
  if (error) throw error;
  return PREFIX + target;
}

const cache = new Map<string, { url: string; expiresAt: number }>();

/** Displayable URL for a `media_url` value (signed for private files, unchanged otherwise). */
export async function resolveMessageMediaUrl(value: string): Promise<string | null> {
  if (!isPrivateMediaRef(value)) return value;
  const hit = cache.get(value);
  if (hit && hit.expiresAt > Date.now()) return hit.url;
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(value.slice(PREFIX.length), SIGNED_URL_TTL);
  if (error || !data?.signedUrl) return null;
  cache.set(value, { url: data.signedUrl, expiresAt: Date.now() + (SIGNED_URL_TTL - 300) * 1000 });
  return data.signedUrl;
}
