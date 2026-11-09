import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Film, SlidersHorizontal } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import MediaGrid from '../components/movies/MediaGrid';
import GenreFilter from '../components/common/GenreFilter';
import Pagination from '../components/common/Pagination';
import ErrorState from '../components/common/ErrorState';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getMoviesByGenre, getPopularMovies } from '../api/movies.api';
import { getMovieGenres } from '../api/genres.api';
import { queryKeys } from '../utils/queryKeys';
import {
  flattenPages,
  getNextPageParam,
  getTotalResults,
} from '../utils/pagination';
import { formatCount } from '../utils/formatters';

const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawGenre = searchParams.get('genre');
  const selectedGenre = rawGenre && /^\d+$/.test(rawGenre) ? rawGenre : 'all';

  const genresQuery = useQuery({
    queryKey: queryKeys.movieGenres,
    queryFn: ({ signal }) => getMovieGenres({ signal }),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const activeGenreName =
    selectedGenre === 'all'
      ? null
      : genresQuery.data?.find((genre) => String(genre.id) === selectedGenre)?.name ||
        'Selected genre';

  useDocumentTitle(activeGenreName ? `Movies · ${activeGenreName}` : 'Movies');

  const moviesQuery = useInfiniteQuery({
    queryKey:
      selectedGenre === 'all'
        ? queryKeys.movieList('popular')
        : queryKeys.movieGenre(selectedGenre),
    queryFn: ({ pageParam = 1, signal }) =>
      selectedGenre === 'all'
        ? getPopularMovies({ page: pageParam, signal })
        : getMoviesByGenre({ genreId: selectedGenre, page: pageParam, signal }),
    initialPageParam: 1,
    getNextPageParam,
  });

  const items = flattenPages(moviesQuery.data);
  const total = getTotalResults(moviesQuery.data);

  const handleGenreChange = (genre) => {
    const next = new URLSearchParams(searchParams);
    if (genre === 'all') next.delete('genre');
    else next.set('genre', genre);
    setSearchParams(next);
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-7 px-5 pb-20 pt-6 sm:px-8 xl:px-12">
      <PageHeader
        eyebrow="Feature presentation"
        title="Movies"
        description="Explore the films in demand right now, then narrow the programme by genre. Every title opens into full cast, trailer and recommendation details."
        icon={Film}
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs text-muted">
          <p className="font-semibold text-white">{activeGenreName || 'All movies'}</p>
          <p className="mt-0.5">Popularity ordering · TMDB catalogue</p>
        </div>
      </PageHeader>

      <section
        aria-label="Movie filters"
        className="rounded-2xl border border-white/[0.08] bg-white/[0.022] p-4 sm:p-5"
      >
        <div className="mb-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-muted">
            <SlidersHorizontal className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
            Filter by genre
          </div>
          <p className="text-[10px] text-muted/70" aria-live="polite">
            {moviesQuery.isLoading ? 'Loading catalogue' : `${formatCount(total)} titles`}
          </p>
        </div>
        <GenreFilter
          genres={genresQuery.data || []}
          activeGenre={selectedGenre}
          onChange={handleGenreChange}
          loading={genresQuery.isLoading}
        />
        {genresQuery.error ? (
          <p className="mt-3 text-[11px] text-rose-200/80">
            Genre filters could not be loaded. You can still browse the full catalogue.
          </p>
        ) : null}
      </section>

      <section aria-label="Movie results">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted">
              {activeGenreName ? 'Filtered collection' : 'Popular right now'}
            </p>
            <h2 className="mt-1 text-[21px] font-semibold tracking-[-0.035em] text-mist sm:text-[25px]">
              {activeGenreName || 'All movies'}
            </h2>
          </div>
          <p className="hidden text-right text-[11px] leading-5 text-muted sm:block">
            {items.length ? `${formatCount(items.length)} loaded` : 'Fetching the reel'}
            {total ? ` · ${formatCount(total)} available` : ''}
          </p>
        </div>

        <MediaGrid
          items={items}
          loading={moviesQuery.isLoading}
          error={moviesQuery.error}
          onRetry={() => moviesQuery.refetch()}
          emptyTitle={activeGenreName ? `No ${activeGenreName} movies` : 'No movies found'}
          emptyMessage={
            activeGenreName
              ? 'This genre returned no titles. Clear the filter to return to the full catalogue.'
              : 'The movie catalogue returned no titles. Try refreshing in a moment.'
          }
          emptyAction={
            activeGenreName ? (
              <button
                type="button"
                onClick={() => handleGenreChange('all')}
                className="inline-flex h-10 items-center rounded-xl border border-white/15 bg-white/[0.05] px-4 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                Clear genre filter
              </button>
            ) : null
          }
        />

        {moviesQuery.error && items.length ? (
          <div className="mt-5">
            <ErrorState
              error={moviesQuery.error}
              onRetry={() => moviesQuery.refetch()}
              compact
            />
          </div>
        ) : null}

        <Pagination
          hasNextPage={Boolean(moviesQuery.hasNextPage)}
          isLoading={moviesQuery.isFetchingNextPage}
          onLoadMore={() => moviesQuery.fetchNextPage()}
          shown={items.length}
          total={total}
        />
      </section>
    </div>
  );
};

export default Movies;
