
import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  LoaderCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

const AUTOEMBED_BASE_URL = "https://autoembed.me";
const PLAYER_LOAD_TIMEOUT_MS = 50000;

const getPlayerUrl = ({ imdbId, mediaType, seasonNumber, episodeNumber }) => {
  if (!imdbId) return null;

  const encodedId = encodeURIComponent(imdbId);

  if (mediaType === "tv") {
    if (
      seasonNumber === null ||
      seasonNumber === undefined ||
      seasonNumber === "" ||
      episodeNumber === null ||
      episodeNumber === undefined ||
      episodeNumber === ""
    ) {
      return null;
    }

    const season = Number(seasonNumber);
    const episode = Number(episodeNumber);
    if (
      !Number.isInteger(season) ||
      season < 0 ||
      !Number.isInteger(episode) ||
      episode < 1
    ) {
      return null;
    }

    return `${AUTOEMBED_BASE_URL}/tv/imdb/${encodedId}-${season}-${episode}`;
  }

  if (mediaType !== "movie") return null;
  return `${AUTOEMBED_BASE_URL}/movie/imdb/${encodedId}`;
};

export default function VideoPlayer({
  imdbId,
  title,
  mediaType = "movie",
  seasonNumber,
  episodeNumber,
}) {
  const [status, setStatus] = useState("loading");
  const [attempt, setAttempt] = useState(0);
  const timeoutRef = useRef(null);

  const playerUrl = getPlayerUrl({
    imdbId,
    mediaType,
    seasonNumber,
    episodeNumber,
  });

  useEffect(() => {
    if (!playerUrl) {
      setStatus("error");
      return;
    }

    setStatus("loading");

    timeoutRef.current = window.setTimeout(() => {
      setStatus((current) =>
        current === "loading" ? "slow" : current
      );
    }, PLAYER_LOAD_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timeoutRef.current);
    };
  }, [playerUrl, attempt]);

  const retry = () => {
    window.clearTimeout(timeoutRef.current);
    setStatus("loading");
    setAttempt((value) => value + 1);
  };

  const handleLoad = () => {
    window.clearTimeout(timeoutRef.current);
    setStatus("frame-loaded");
  };

  const handleError = () => {
    window.clearTimeout(timeoutRef.current);
    setStatus("error");
  };

  if (!playerUrl || status === "error") {
    return (
      <div className="relative flex aspect-video w-full min-w-0 max-w-full flex-col items-center justify-center rounded-xl border border-white/10 bg-black p-6 text-center">
        <AlertTriangle className="h-8 w-8 text-white/60" />

        <p className="mt-3 font-semibold text-white">
          Unable to load player
        </p>

        <p className="mt-1 text-sm text-white/50">
          The video provider may be unavailable.
        </p>

        <button
          type="button"
          onClick={retry}
          className="mt-4 flex min-h-11 items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-white"
        >
          <RefreshCw size={15} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 max-w-full">
      <div className="relative aspect-video w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-white/10 bg-black">
        {(status === "loading" || status === "slow") && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-black p-4 text-center">
            {status === "loading" ? (
              <LoaderCircle className="h-8 w-8 animate-spin text-white" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
            )}

            <p className="text-sm text-white/70">
              {status === "slow"
                ? "Player page is taking longer to load."
                : "Loading player page..."}
            </p>

            {status === "slow" && (
              <button
                type="button"
                onClick={retry}
                className="flex min-h-11 items-center gap-2 rounded-lg border border-white/20 px-4 py-2 text-white"
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
          title={`${title || (mediaType === "tv" ? "TV episode" : "Movie")} streaming player`}
          className="absolute inset-0 h-full w-full min-w-0 max-w-full border-0"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          onLoad={handleLoad}
          onError={handleError}
        />
      </div>

      {status === "frame-loaded" && (
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className="min-w-0 text-xs text-white/40">
            Player page loaded. Playback availability is controlled by AutoEmbed and its providers.
          </p>

          <a
            href={playerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 items-center gap-1 text-xs text-white/60 hover:text-white"
          >
            Open player
            <ExternalLink size={12} />
          </a>
        </div>
      )}
    </div>
  );
}
