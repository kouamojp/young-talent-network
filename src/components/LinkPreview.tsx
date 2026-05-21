import React, { useEffect, useState } from 'react';
import { ExternalLink, Link as LinkIcon } from 'lucide-react';

interface LinkPreviewProps {
  url: string;
}

interface PreviewData {
  title?: string;
  description?: string;
  image?: string;
  publisher?: string;
  url?: string;
}

const cache = new Map<string, PreviewData>();

const LinkPreview: React.FC<LinkPreviewProps> = ({ url }) => {
  const [data, setData] = useState<PreviewData | null>(cache.get(url) || null);
  const [loading, setLoading] = useState(!cache.has(url));
  const [error, setError] = useState(false);

  useEffect(() => {
    if (cache.has(url)) {
      setData(cache.get(url)!);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`https://api.microlink.io/?url=${encodeURIComponent(url)}`);
        const json = await res.json();
        if (cancelled) return;
        if (json.status === 'success' && json.data) {
          const preview: PreviewData = {
            title: json.data.title,
            description: json.data.description,
            image: json.data.image?.url,
            publisher: json.data.publisher,
            url: json.data.url || url,
          };
          cache.set(url, preview);
          setData(preview);
        } else {
          setError(true);
        }
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [url]);

  let host = '';
  try { host = new URL(url).hostname.replace(/^www\./, ''); } catch {}

  if (loading) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className="block border border-border rounded-lg p-3 bg-muted/40 animate-pulse">
        <div className="h-3 w-24 bg-muted rounded mb-2" />
        <div className="h-4 w-3/4 bg-muted rounded" />
      </a>
    );
  }

  if (error || !data) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer"
         className="flex items-center gap-2 border border-border rounded-lg p-3 bg-muted/30 hover:bg-muted/50 transition-colors text-sm">
        <LinkIcon className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="truncate text-primary">{host || url}</span>
        <ExternalLink className="h-3.5 w-3.5 ml-auto text-muted-foreground shrink-0" />
      </a>
    );
  }

  return (
    <a href={data.url || url} target="_blank" rel="noopener noreferrer"
       className="block border border-border rounded-lg overflow-hidden hover:bg-muted/40 transition-colors">
      {data.image && (
        <img src={data.image} alt="" className="w-full max-h-64 object-cover" loading="lazy" />
      )}
      <div className="p-3">
        <div className="text-[11px] uppercase tracking-wide text-muted-foreground truncate">
          {data.publisher || host}
        </div>
        {data.title && (
          <div className="text-[15px] font-semibold leading-snug mt-0.5 line-clamp-2">{data.title}</div>
        )}
        {data.description && (
          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">{data.description}</div>
        )}
        <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
          Ouvrir <ExternalLink className="h-3 w-3" />
        </div>
      </div>
    </a>
  );
};

export default LinkPreview;
