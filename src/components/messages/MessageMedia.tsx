import React, { useEffect, useState } from 'react';
import { Loader2, Paperclip } from 'lucide-react';
import { resolveMessageMediaUrl } from '@/lib/messageFiles';
import { tr } from '@/i18n';

interface MessageMediaProps {
  mediaUrl?: string | null;
  mediaType?: string | null;
  fileName?: string | null;
  /** Smaller rendering for the compact messaging tab. */
  compact?: boolean;
}

/** Attachment of a message. Private files are shown through a temporary signed URL. */
const MessageMedia: React.FC<MessageMediaProps> = ({ mediaUrl, mediaType, fileName, compact }) => {
  const [url, setUrl] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setUrl(null);
    setFailed(false);
    if (!mediaUrl) return;
    resolveMessageMediaUrl(mediaUrl).then(resolved => {
      if (cancelled) return;
      if (resolved) setUrl(resolved); else setFailed(true);
    });
    return () => { cancelled = true; };
  }, [mediaUrl]);

  if (!mediaUrl) return null;
  if (failed) return <p className="mt-1 text-xs italic opacity-70">{tr('messageMedia.unavailable')}</p>;
  if (!url) return <Loader2 className="mt-1 h-4 w-4 animate-spin opacity-60" />;

  const size = compact ? 'max-h-48' : 'max-h-64';
  // Older messages have no media_type: fall back to the file extension.
  const type = mediaType || (/\.(png|jpe?g|gif|webp|avif)(\?|$)/i.test(url) ? 'image' : 'file');
  if (type === 'image') return <img src={url} alt="" className={`rounded-lg max-w-full ${size} mt-1`} />;
  if (type === 'video') return <video src={url} controls className={`rounded-lg max-w-full ${size} mt-1`} />;
  if (type === 'audio') return <audio src={url} controls className="mt-1 w-full" />;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="mt-1 flex items-center gap-1 text-xs underline">
      <Paperclip className="h-3 w-3" /> {fileName || tr('messages.file')}
    </a>
  );
};

export default MessageMedia;
