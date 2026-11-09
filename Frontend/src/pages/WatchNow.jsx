import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, Clock3, Star } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { BackdropImage, PosterImage } from '../components/common/PosterImage';
import MediaRow from '../components/movies/MediaRow';
import VideoPlayer from '../components/common/VideoPlayer';
import { getMovieDetails, getMovieRecommendations } from '../api/movies.api';
import { queryKeys } from '../utils/queryKeys';
import {
  formatDate,
  formatRating,
  formatRuntime,
  getBackdropPath,
  getPosterPath,
  getTitle,
  getYear,
} from '../utils/formatters';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const WatchNow = () => {
  const { id } = useParams();
  const location = useLocation();
  const detailsPath =
    location.state?.from === `/anime/movie/${id}`
      ? location.state.from
      : `/movie/${id}`;
  const detailsQuery = useQuery({
    queryKey: queryKeys.movieDetails(id),
    queryFn: ({ signal }) => getMovieDetails({ id, signal }),
    enabled: Boolean(id),
  });
  const recommendationsQuery = useQuery({
    queryKey: queryKeys.movieRecommendations(id),
    queryFn: ({ signal }) => getMovieRecommendations({ id, page: 1, signal }),
    enabled: Boolean(id && detailsQuery.data),
  });

  const media = detailsQuery.data;
  const title = getTitle(media);
  const year = getYear(media);
  const genres = Array.isArray(media?.genres) ? media.genres : [];
  const imdbRating = Number(media?.imdb_rating ?? media?.external_ids?.imdb_rating);
  const hasImdbRating = Number.isFinite(imdbRating) && imdbRating > 0;
  const rating = hasImdbRating ? imdbRating : Number(media?.vote_average);
  const ratingLabel = hasImdbRating ? 'IMDb' : 'TMDB';

  useDocumentTitle(media ? `Watch ${title}` : 'Watch Now');

  if (detailsQuery.isLoading) {
    return (
      <main className="mx-auto min-h-screen max-w-[1500px] px-5 py-10 sm:px-8 xl:px-12">
        <div className="skeleton aspect-video w-full rounded-2xl" aria-label="Loading movie" />
      </main>
    );
  }

  if (detailsQuery.error) {
    return (
      <main className="mx-auto min-h-screen max-w-[1500px] px-5 py-8 sm:px-8 xl:px-12">
        <Link
          to={id ? detailsPath : '/movies'}
          className="mb-6 inline-flex items-center gap-2 rounded-lg py-2 text-sm font-semibold text-white/75 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Details
        </Link>
        <ErrorState error={detailsQuery.error} onRetry={() => detailsQuery.refetch()} />
      </main>
    );
  }

  if (!media) {
    return (
      <main className="mx-auto min-h-screen max-w-[1500px] px-5 py-8 sm:px-8 xl:px-12">
        <Link to={id ? detailsPath : '/movies'} className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/75 hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Movies
        </Link>
        <EmptyState title="Movie not found" message="This movie could not be loaded." />
      </main>
    );
  }

  return (
    <article className="min-h-screen">
      <div className="relative border-b border-line">
        <div className="absolute inset-0 overflow-hidden">
          <BackdropImage
            path={getBackdropPath(media)}
            title={title}
            className="opacity-35"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-ink/60 via-ink/85 to-ink" />
        <header className="relative mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-5 sm:px-8 xl:px-12">
          <Link
            to={detailsPath}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Details
          </Link>
          <span className="truncate text-right text-xs font-medium text-white/50">
            {year || 'Movie'}
          </span>
        </header>

        <main className="relative mx-auto max-w-[1500px] px-5 pb-10 pt-2 sm:px-8 xl:px-12">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-accent">
                Now watching
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-4xl">
                {title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/65">
                {year ? (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
                    {year}
                  </span>
                ) : null}
                {media.runtime ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                    {formatRuntime(media.runtime)}
                  </span>
                ) : null}
                {Number.isFinite(rating) && rating > 0 ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Star className="h-3.5 w-3.5 fill-current text-gold" aria-hidden="true" />
                    {formatRating(rating)} <span className="text-white/40">{ratingLabel}</span>
                  </span>
                ) : null}
              </div>
            </div>
            {media.release_date ? (
              <span className="text-xs text-white/45">{formatDate(media.release_date)}</span>
            ) : null}
          </div>

          <VideoPlayer
            imdbId={media.external_ids?.imdb_id || media.imdb_id}
            title={title}
          />

          <section className="mt-8 grid gap-6 sm:grid-cols-[140px_1fr] lg:grid-cols-[180px_1fr]">
            <div className="aspect-[2/3] w-32 overflow-hidden rounded-xl border border-white/10 bg-raised sm:w-full">
              <PosterImage path={getPosterPath(media)} title={title} size="w500" />
            </div>
            <div className="min-w-0 py-1">
              <h2 className="text-sm font-semibold text-white">About this movie</h2>
              {genres.length ? (
                <ul className="mt-3 flex flex-wrap gap-2" aria-label="Genres">
                  {genres.map((genre) => (
                    <li
                      key={genre.id || genre.name}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] font-medium text-white/70"
                    >
                      {genre.name}
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="mt-4 max-w-3xl text-sm leading-7 text-white/65">
                {media.overview || 'No description is available for this movie.'}
              </p>
            </div>
          </section>

          <MediaRow
            className="mt-12"
            title="More like this"
            eyebrow="Recommended"
            items={recommendationsQuery.data?.items || []}
            isLoading={recommendationsQuery.isLoading}
            error={recommendationsQuery.error}
            onRetry={() => recommendationsQuery.refetch()}
            limit={10}
            emptyMessage="No recommendations were found."
          />
        </main>
      </div>
    </article>
  );
};

export default WatchNow;
