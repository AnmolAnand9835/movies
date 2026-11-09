import { createPortal } from 'react-dom';
import { Play, X } from 'lucide-react';
import { useDialog } from '../../hooks/useDialog';

export const TrailerModal = ({ videoKey, title = 'Official trailer', onClose }) => {
  const containerRef = useDialog(Boolean(videoKey), onClose);

  if (!videoKey) return null;

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-[#03070e]/85 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="trailer-modal-title"
        className="animate-fade-up relative w-full max-w-5xl overflow-hidden rounded-2xl border border-white/15 bg-raised shadow-2xl"
      >
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent/15 text-accent">
              <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted">
                Official trailer
              </p>
              <h2
                id="trailer-modal-title"
                className="truncate text-sm font-semibold text-mist"
              >
                {title}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-autofocus
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/15 bg-white/[0.04] text-white transition hover:bg-white/10"
            aria-label="Close trailer"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="aspect-video w-full bg-black">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoKey}?autoplay=1&rel=0&modestbranding=1`}
            title={`${title} trailer`}
            loading="lazy"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TrailerModal;
