import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { tr } from '@/i18n';

const isVideo = (url: string) => /\.(mp4|webm|mov|m4v|ogv)(\?|#|$)/i.test(url);

/** Tailwind classes per tile for 1 to 5 media, on a 6-column grid. */
const LAYOUTS: Record<number, string[]> = {
  1: ['col-span-6'],
  2: ['col-span-3 aspect-square', 'col-span-3 aspect-square'],
  3: ['col-span-6 aspect-[2/1]', 'col-span-3 aspect-square', 'col-span-3 aspect-square'],
  4: ['col-span-3 aspect-square', 'col-span-3 aspect-square', 'col-span-3 aspect-square', 'col-span-3 aspect-square'],
  5: ['col-span-3 aspect-[4/3]', 'col-span-3 aspect-[4/3]', 'col-span-2 aspect-square', 'col-span-2 aspect-square', 'col-span-2 aspect-square'],
};

/**
 * Images and videos attached to a post: a grid adapted to the number of media
 * (up to 5 shown, "+N" on the last tile beyond that) and a full-screen viewer.
 */
const PostMediaGallery: React.FC<{ urls: string[] }> = ({ urls }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  if (!urls.length) return null;

  const shown = urls.slice(0, 5);
  const layout = LAYOUTS[shown.length];
  const extra = urls.length - shown.length;
  const go = (delta: number) => setOpenIndex(i => (i === null ? i : (i + delta + urls.length) % urls.length));

  return (
    <>
      <div className="grid grid-cols-6 gap-1 px-1 pb-2">
        {shown.map((url, i) => (
          <button
            key={url + i}
            type="button"
            onClick={() => setOpenIndex(i)}
            aria-label={tr('postMediaGallery.openMedia', { n: i + 1, total: urls.length })}
            className={`relative overflow-hidden rounded-md bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${layout[i]}`}
          >
            {isVideo(url) ? (
              <video src={url} muted playsInline preload="metadata" className="h-full w-full object-cover" />
            ) : (
              <img src={url} alt="" loading="lazy" className={shown.length === 1 ? 'w-full max-h-[500px] object-cover' : 'h-full w-full object-cover'} />
            )}
            {extra > 0 && i === shown.length - 1 && (
              <span className="absolute inset-0 flex items-center justify-center bg-black/55 text-2xl font-semibold text-white">+{extra}</span>
            )}
          </button>
        ))}
      </div>

      <Dialog open={openIndex !== null} onOpenChange={(o) => { if (!o) setOpenIndex(null); }}>
        <DialogContent className="max-w-4xl border-0 bg-black/95 p-2 sm:p-4">
          <DialogTitle className="sr-only">{tr('postMediaGallery.viewer')}</DialogTitle>
          {openIndex !== null && (
            <div
              className="relative flex items-center justify-center"
              onKeyDown={(e) => { if (e.key === 'ArrowLeft') go(-1); if (e.key === 'ArrowRight') go(1); }}
              tabIndex={0}
            >
              {isVideo(urls[openIndex]) ? (
                <video src={urls[openIndex]} controls autoPlay className="max-h-[80vh] max-w-full rounded" />
              ) : (
                <img src={urls[openIndex]} alt="" className="max-h-[80vh] max-w-full rounded object-contain" />
              )}
              {urls.length > 1 && (
                <>
                  <button type="button" onClick={() => go(-1)} aria-label={tr('common.previous')}
                    className="absolute left-1 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white hover:bg-white/30">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button type="button" onClick={() => go(1)} aria-label={tr('common.next')}
                    className="absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-2 text-white hover:bg-white/30">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2.5 py-0.5 text-xs text-white tabular-nums">
                    {openIndex + 1} / {urls.length}
                  </span>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PostMediaGallery;
