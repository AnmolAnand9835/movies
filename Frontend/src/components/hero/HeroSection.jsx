import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Bookmark,
  BookmarkCheck,
  ChevronLeft,
  ChevronRight,
  Info,
  Play,
  Star,
} from 'lucide-react';
import { BackdropImage } from '../common/PosterImage';
import ErrorState from '../common/ErrorState';
import EmptyState from '../common/EmptyState';
import { SkeletonHero } from '../common/Skeleton';
import TrailerModal from '../common/TrailerModal';
import { useWatchlist } from '../../hooks/useWatchlist';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery';
import { getMovieVideos } from '../../api/movies.api';
import { getTVVideos } from '../../api/tv.api';
import {
  formatRating,
  getBackdropPath,
  getDetailPath,
  getEpisodeLabel,
  getMediaLabel,
  getMediaType,
  getRating,
  getTitle,
  getTrailer,
  getYear,
} from '../../utils/formatters';
import { cn } from '../../utils/cn';

export const HeroSection = ({
  items = [],
  isLoading = false,
  error = null,
  onRetry,
  getGenres,
}) => {
  const slides = items.filter((item) => getMediaType(item) !== 'person');
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [trailerKey, setTrailerKey] = useState(null);
  const reduceMotion = usePrefersReducedMotion();
  const { isSaved, toggle } = useWatchlist();
  const slideCountRef = useRef(slides.length);

  slideCountRef.current = slides.length;

  useEffect(() => {
    if (!slides.length) {
      setIndex(0);
      return;
    }
    setIndex((current) => (current >= slides.length ? 0 : current));
  }, [slides.length]);

  const active = slides[index] || null;

  useEffect(() => {
    if (slides.length <= 1 || paused || reduceMotion) return undefined;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slideCountRef.current);
    }, 9000);

    return () => window.clearInterval(timer);
  }, [paused, reduceMotion, slides.length]);

  const activeType = getMediaType(active);

  const { data: videos } = useQuery({
    queryKey: ['hero-videos', activeType, active?.id],
    queryFn: ({ signal }) =>
      activeType === 'movie'
        ? getMovieVideos({ id: active.id, signal })
        : getTVVideos({ id: active.id, signal }),
    enabled: Boolean(active?.id) && (activeType === 'movie' || activeType === 'tv'),
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });

  const trailer = getTrailer(videos?.results);
  const genres = active && getGenres ? getGenres(active).slice(0, 2) : [];
  const saved = active ? isSaved(active) : false;

  if (isLoading) return <SkeletonHero />;

  if (error) {
    return (
      <section className="relative border-b border-line px-5 py-24 sm:px-8 xl:px-12">
        <div className="mx-auto max-w-[1500px]">
          <ErrorState error={error} onRetry={onRetry} />
        </div>
      </section>
    );
  }

  if (!active) {
    return (
      <section className="relative border-b border-line px-5 py-24 sm:px-8 xl:px-12">
        <div className="mx-auto max-w-[1500px]">
          <EmptyState
            title="Nothing is trending right now"
            message="The discovery feed is empty. Try refreshing in a moment."
            action={
              onRetry ? (
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex h-10 items-center rounded-xl border border-white/15 bg-white/[0.05] px-4 text-xs font-semibold text-white hover:bg-white/10"
                >
                  Refresh
                </button>
              ) : null
            }
          />
        </div>
      </section>
    );
  }

  const goTo = (nextIndex) => {
    const total = slides.length;
    setIndex(((nextIndex % total) + total) % total);
  };

  return (
    <section
      className="noise relative flex min-h-[clamp(560px,48vw,720px)] items-end overflow-hidden border-b border-line"
      aria-label="Featured trending titles"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <div className="absolute inset-0">
        <BackdropImage
          key={active.id}
          path={getBackdropPath(active)}
          title={getTitle(active)}
          className="hero-fade object-[58%_center] sm:object-center"
        />
      </div>
      <div className="backdrop-scrim pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-ink to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-[1500px] px-5 pb-14 pt-28 sm:px-8 sm:pb-16 xl:px-12">
        <div className="max-w-[620px]">
          <div className="mb-5 flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-[0.32em] text-[#B8C7F3]">
            <span className="h-px w-7 bg-accent" />
            Featured this week
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] text-white/65">
            <span>{getMediaLabel(active)}</span>
            {getYear(active) ? (
              <>
                <span className="text-white/25">•</span>
                <span>{getYear(active)}</span>
              </>
            ) : null}
            {genres.length ? (
              <>
                <span className="text-white/25">•</span>
                <span>{genres.join(' / ')}</span>
              </>
            ) : null}
            {getMediaType(active) === 'tv' && getEpisodeLabel(active) ? (
              <>
                <span className="text-white/25">•</span>
                <span>{getEpisodeLabel(active)}</span>
              </>
            ) : null}
          </div>

          <h1 className="max-w-[620px] text-[40px] font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl xl:text-[72px]">
            {getTitle(active)}
          </h1>

          <p className="mt-4 line-clamp-3 max-w-[500px] text-sm leading-6 text-white/80 sm:text-[15px] sm:leading-7">
            {active.overview || 'No overview is available for this title yet.'}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-white/65">
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-gold text-gold" aria-hidden="true" />
              <strong className="font-semibold text-white">
                {formatRating(getRating(active))}
              </strong>
              / 10
            </span>
            <span className="h-4 w-px bg-white/25" />
            <span className="text-white/60">Metadata by TMDB</span>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            <Link
              to={getDetailPath(active)}
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-accent px-6 text-sm font-bold text-[#111B2A] shadow-soft-accent transition hover:-translate-y-0.5 hover:bg-accent-strong"
            >
              <Info className="h-4 w-4" aria-hidden="true" />
              View details
            </Link>

            {trailer ? (
              <button
                type="button"
                onClick={() => setTrailerKey(trailer.key)}
                className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/35 bg-black/25 px-5 text-sm font-semibold text-white backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white hover:bg-white/10"
              >
                <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                Watch trailer
              </button>
            ) : null}

            <button
              type="button"
              onClick={() => toggle(active)}
              className={cn(
                'inline-flex h-12 items-center gap-2 rounded-xl border px-4 text-sm font-semibold backdrop-blur-md transition hover:-translate-y-0.5',
                saved
                  ? 'border-accent/45 bg-accent/15 text-accent-strong'
                  : 'border-white/25 bg-black/20 text-white/85 hover:border-white hover:bg-white/10'
              )}
              aria-label={`${saved ? 'Remove' : 'Add'} ${getTitle(active)} ${saved ? 'from' : 'to'} My List`}
            >
              {saved ? (
                <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Bookmark className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="hidden sm:inline">My List</span>
            </button>
          </div>

          {slides.length > 1 ? (
            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center gap-2" aria-label="Featured title slides">
                {slides.map((slide, slideIndex) => (
                  <button
                    key={`${getMediaType(slide)}-${slide.id}`}
                    type="button"
                    onClick={() => goTo(slideIndex)}
                    className={cn(
                      'h-1.5 rounded-full transition-all duration-300',
                      slideIndex === index
                        ? 'w-7 bg-accent'
                        : 'w-1.5 bg-white/35 hover:bg-white/60'
                    )}
                    aria-label={`Show featured title ${slideIndex + 1}: ${getTitle(slide)}`}
                    aria-current={slideIndex === index ? 'true' : undefined}
                  />
                ))}
              </div>
              <span className="text-[10px] font-semibold tracking-[0.18em] text-white/45">
                {String(index + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
              </span>
            </div>
          ) : null}
        </div>
      </div>

      {slides.length > 1 ? (
        <div className="absolute bottom-14 right-5 z-20 hidden items-center gap-2 sm:right-8 sm:flex xl:right-12">
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/30 text-white/80 backdrop-blur-md transition hover:border-white/40 hover:bg-white/10 hover:text-white"
            aria-label="Previous featured title"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-black/30 text-white/80 backdrop-blur-md transition hover:border-white/40 hover:bg-white/10 hover:text-white"
            aria-label="Next featured title"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <div className="sr-only" aria-live="polite">
        Featured title {index + 1} of {slides.length}: {getTitle(active)}
      </div>

      <TrailerModal
        videoKey={trailerKey}
        title={getTitle(active)}
        onClose={() => setTrailerKey(null)}
      />
    </section>
  );
};

export default HeroSection;
