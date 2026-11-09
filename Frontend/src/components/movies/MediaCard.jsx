import { Bookmark, BookmarkCheck, Play, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { PosterImage } from '../common/PosterImage';
import { useWatchlist } from '../../hooks/useWatchlist';
import {
  formatRating,
  getDetailPath,
  getMediaLabel,
  getMediaType,
  getPosterPath,
  getRating,
  getTitle,
  getYear,
} from '../../utils/formatters';
import { cn } from '../../utils/cn';

export const MediaCard = ({ item, rank = null, className, priority = false }) => {
  const navigate = useNavigate();
  const { isSaved, toggle } = useWatchlist();
  const saved = isSaved(item);
  const title = getTitle(item);
  const path = getDetailPath(item);
  const rating = getRating(item);
  const year = getYear(item);
  const mediaLabel = getMediaLabel(item);
  const mediaType = getMediaType(item);
  const isMovie = mediaType === 'movie';
  const isTV = mediaType === 'tv';

  const handleWatchNow = () => {
    if (!item.id) return;
    navigate(`/watch-now/${item.id}`, { state: { from: path } });
  };

  const handleWatchEpisodes = () => {
    if (!item.id) return;
    navigate(`/watch-now/tv/${item.id}`, { state: { from: path } });
  };

  return (
    <article
      className={cn(
        'poster-card group relative overflow-hidden rounded-2xl border',
        className
      )}>
      <div className="relative aspect-[2/3] overflow-hidden bg-raised">
        <PosterImage
          path={getPosterPath(item)}
          title={title}
          loading={priority ? 'eager' : 'lazy'}
          className="card-image"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#07101d]/80 via-transparent to-black/10" />

        {isMovie ? (
          <div className="pointer-events-none absolute inset-0 z-30">
            <button
              type="button"
              onClick={handleWatchNow}
              className="pointer-events-auto absolute left-3 top-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-md transition hover:border-white/40 hover:bg-black/70"
              aria-label={`Watch ${title} now`}
              title="Watch Now"
            >
              <Play className="h-4 w-4" aria-hidden="true" />
              Watch Now
            </button>
          </div>
        ) : null}

        {isTV ? (
          <div className="pointer-events-none absolute inset-0 z-30">
            <button
              type="button"
              onClick={handleWatchEpisodes}
              className="pointer-events-auto absolute left-3 top-3 inline-flex min-h-9 items-center gap-2 rounded-full border border-white/20 bg-black/65 px-3 py-1.5 text-[10px] font-semibold text-white opacity-100 backdrop-blur-md transition hover:border-violet-300/50 hover:bg-black/80 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
              aria-label={`Watch episodes of ${title}`}
              title="Watch episodes"
            >
              <Play className="h-4 w-4 fill-current" aria-hidden="true" />
              Watch episodes
            </button>
          </div>
        ) : null}

        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 translate-y-2 opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
          <span className="inline-flex items-center rounded-full border border-white/25 bg-black/55 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-md">
            View details
          </span>
        </div>
      </div>

      <div className="p-2.5 sm:p-3">
        <h3 className="truncate text-sm font-semibold tracking-[-0.01em] text-mist">
          {title}
        </h3>
        <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-muted">
          <span className="truncate">
            {year || 'Year TBA'}
            <span className="mx-1 text-white/25">·</span>
            {mediaLabel}
          </span>
          <span
            className={cn(
              'inline-flex shrink-0 items-center gap-1 font-semibold',
              rating > 0 ? 'text-gold' : 'text-muted/60'
            )}
          >
            <Star
              className={cn('h-3 w-3', rating > 0 ? 'fill-current' : '')}
              aria-hidden="true"
            />
            {formatRating(rating)}
          </span>
        </div>
      </div>

      <Link
        to={path}
        className="absolute inset-0 z-10 rounded-2xl"
        aria-label={`View details for ${title}`}
      >
        <span className="sr-only">View details for {title}</span>
      </Link>
    </article>
  );
};

export default MediaCard;