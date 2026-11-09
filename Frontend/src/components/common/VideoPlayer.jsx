
import { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  LoaderCircle,
  RefreshCw
} from 'lucide-react';

const PLAYER_BASE_URL =
  'https://autoembed.me/movie/imdb/';

const PLAYER_LOAD_TIMEOUT_MS = 20000;

export default function VideoPlayer({ imdbId, title }) {
  const [status, setStatus] = useState('loading');
  const [attempt, setAttempt] = useState(0);
  const timeoutRef = useRef(null);

  const playerUrl = imdbId
    ? `${PLAYER_BASE_URL}${imdbId}`
    : null;

  useEffect(() => {
    if (!playerUrl) {
      setStatus('error');
      return;
    }

    setStatus('loading');

    timeoutRef.current = window.setTimeout(() => {
      setStatus(current =>
        current === 'loading' ? 'slow' : current
      );
    }, PLAYER_LOAD_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timeoutRef.current);
    };
  }, [playerUrl, attempt]);

  const retry = () => {
    window.clearTimeout(timeoutRef.current);
    setAttempt(value => value + 1);
  };

  if (!playerUrl || status === 'error') {
    return (
      <div className="flex aspect-video w-full flex-col
        items-center justify-center rounded-2xl
        border border-white/10 bg-black p-6 text-center">

        <AlertTriangle className="h-8 w-8 text-white/60" />

        <p className="mt-3 font-semibold text-white">
          Unable to load player
        </p>

        <button
          onClick={retry}
          className="mt-4 rounded-xl border border-white/20
            px-4 py-2 text-white"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden
      rounded-2xl border border-white/10 bg-black">

      {(status === 'loading' || status === 'slow') && (
        <div className="absolute inset-0 z-10 flex flex-col
          items-center justify-center gap-3 bg-black">

          <LoaderCircle className="h-8 w-8 animate-spin text-white" />

          <p className="text-sm text-white/70">
            {status === 'slow'
              ? 'Player is taking longer than expected...'
              : 'Loading player...'}
          </p>

          {status === 'slow' && (
            <button
              onClick={retry}
              className="flex items-center gap-2 rounded-lg
                border border-white/20 px-4 py-2 text-white"
            >
              <RefreshCw size={15} />
              Retry
            </button>
          )}
        </div>
      )}

      <iframe
        key={`${imdbId}-${attempt}`}
        src={playerUrl}
        title={`${title || 'Movie'} streaming player`}
        className="absolute inset-0 h-full w-full border-0"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        onLoad={() => {
          window.clearTimeout(timeoutRef.current);
          setStatus('loaded');
        }}
        onError={() => {
          window.clearTimeout(timeoutRef.current);
          setStatus('error');
        }}
      />
    </div>
  );
}
