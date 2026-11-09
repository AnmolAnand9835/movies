import { useMemo } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Bookmark, Sparkles } from 'lucide-react';
import HeroSection from '../components/hero/HeroSection';
import MediaRow from '../components/movies/MediaRow';
import { PosterImage } from '../components/common/PosterImage';
import { useWatchlist } from '../hooks/useWatchlist';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getTrending } from '../api/trending.api';
import { getPopularMovies } from '../api/movies.api';
import { getPopularTV } from '../api/tv.api';
import { getAnimeList } from '../api/anime.api';
import { getMovieGenres, getTVGenres } from '../api/genres.api';
import { queryKeys } from '../utils/queryKeys';
import { flattenPages, getNextPageParam } from '../utils/pagination';
import {
  formatRating,
  getDetailPath,
  getMediaType,
  getYear,
} from '../utils/formatters';

const Home = () => {
  useDocumentTitle();
  const { items: watchlistItems } = useWatchlist();

  const trendingQuery = useInfiniteQuery({
    queryKey: queryKeys.trending('week'),
    queryFn: ({ pageParam = 1, signal }) =>
      getTrending({ page: pageParam, timeWindow: 'week', signal }),
    initialPageParam: 1,
    getNextPageParam,
  });

  const popularMoviesQuery = useInfiniteQuery({
    queryKey: queryKeys.movieList('popular'),
    queryFn: ({ pageParam = 1, signal }) =>
      getPopularMovies({ page: pageParam, signal }),
    initialPageParam: 1,
    getNextPageParam,
  });

  const popularTVQuery = useInfiniteQuery({
    queryKey: queryKeys.tvList('popular'),
    queryFn: ({ pageParam = 1, signal }) => getPopularTV({ page: pageParam, signal }),
    initialPageParam: 1,
    getNextPageParam,
  });

  const animeQuery = useInfiniteQuery({
    queryKey: queryKeys.animeList('popular'),
    queryFn: ({ pageParam = 1, signal }) =>
      getAnimeList({ type: 'popular', page: pageParam, signal }),
    initialPageParam: 1,
    getNextPageParam,
  });

  const movieGenresQuery = useQuery({
    queryKey: queryKeys.movieGenres,
    queryFn: ({ signal }) => getMovieGenres({ signal }),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const tvGenresQuery = useQuery({
    queryKey: queryKeys.tvGenres,
    queryFn: ({ signal }) => getTVGenres({ signal }),
    staleTime: 24 * 60 * 60 * 1000,
  });

  const genreLookup = useMemo(() => {
    const movieMap = new Map(
      (movieGenresQuery.data || []).map((genre) => [genre.id, genre.name])
    );
    const tvMap = new Map(
      (tvGenresQuery.data || []).map((genre) => [genre.id, genre.name])
    );

    return (item) => {
      const ids = Array.isArray(item?.genre_ids) ? item.genre_ids : [];
      const map = getMediaType(item) === 'tv' ? tvMap : movieMap;
      return ids.map((id) => map.get(id)).filter(Boolean);
    };
  }, [movieGenresQuery.data, tvGenresQuery.data]);

  const trendingItems = flattenPages(trendingQuery.data).filter(
    (item) => getMediaType(item) !== 'person'
  );
  const popularMovieItems = flattenPages(popularMoviesQuery.data);
  const popularTVItems = flattenPages(popularTVQuery.data);
  const animeItems = flattenPages(animeQuery.data);

  return (
    <div>
      <HeroSection
        items={trendingItems.slice(0, 5)}
        isLoading={trendingQuery.isLoading}
        error={trendingQuery.error}
        onRetry={() => trendingQuery.refetch()}
        getGenres={genreLookup}
      />

      <div className="mx-auto max-w-[1500px] space-y-14 px-5 pb-16 pt-7 sm:space-y-16 sm:px-8 sm:pt-9 xl:px-12">
        <MediaRow
          title="Trending This Week"
          eyebrow="What everyone is watching"
          actionTo="/trending"
          items={trendingItems}
          isLoading={trendingQuery.isLoading}
          error={trendingQuery.error}
          onRetry={() => trendingQuery.refetch()}
          ranked
          limit={12}
          emptyMessage="Trending titles will appear here when the feed has data."
        />

        <MediaRow
          title="Popular Movies"
          eyebrow="Big screen favourites"
          actionTo="/movies"
          items={popularMovieItems}
          isLoading={popularMoviesQuery.isLoading}
          error={popularMoviesQuery.error}
          onRetry={() => popularMoviesQuery.refetch()}
          limit={10}
          emptyMessage="Popular movies are unavailable right now."
        />

        <MediaRow
          title="Popular Series"
          eyebrow="Shows worth settling in for"
          actionTo="/tv"
          items={popularTVItems}
          isLoading={popularTVQuery.isLoading}
          error={popularTVQuery.error}
          onRetry={() => popularTVQuery.refetch()}
          limit={10}
          emptyMessage="Popular series are unavailable right now."
        />

        <MediaRow
          title="Anime Spotlight"
          eyebrow="Animation with a point of view"
          actionTo="/anime"
          items={animeItems}
          isLoading={animeQuery.isLoading}
          error={animeQuery.error}
          onRetry={() => animeQuery.refetch()}
          limit={10}
          emptyMessage="Anime discovery results are unavailable right now."
        />

        <section
          className="noise relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[linear-gradient(120deg,#172337,#111b2b)] p-5 sm:p-7"
          aria-labelledby="watchlist-preview-title"
        >
          <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="mb-1 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-muted">
                <Bookmark className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                Keep your next watch close
              </p>
              <h2
                id="watchlist-preview-title"
                className="text-[21px] font-semibold tracking-[-0.035em] text-mist"
              >
                Your watchlist
              </h2>
              <p className="mt-1 text-xs text-muted">
                Saved on this device. Not synced to an account.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-fit rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-white/70">
                {watchlistItems.length}{' '}
                {watchlistItems.length === 1 ? 'title saved' : 'titles saved'}
              </span>
              <Link
                to="/my-list"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted transition hover:text-white"
              >
                Open list
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          {watchlistItems.length ? (
            <div className="relative mt-5 flex gap-3 overflow-x-auto pb-1 scroll-row">
              {watchlistItems.slice(0, 8).map((item) => (
                <Link
                  key={`${item.mediaType}-${item.id}`}
                  to={getDetailPath(item)}
                  className="group w-[120px] shrink-0"
                >
                  <div className="aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-panel">
                    <PosterImage
                      path={item.posterPath}
                      title={item.title}
                      className="transition duration-500 group-hover:scale-105"
                    />
                  </div>
                  <p className="mt-2 truncate text-xs font-semibold text-mist">
                    {item.title}
                  </p>
                  <p className="mt-0.5 flex items-center justify-between text-[10px] text-muted">
                    <span>{item.year || 'Year TBA'}</span>
                    <span className="text-gold">{formatRating(item.rating)}</span>
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="relative mt-5 flex flex-col gap-4 rounded-2xl border border-dashed border-white/[0.12] bg-white/[0.015] p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-accent">
                  <Sparkles className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-mist">Your list is empty for now.</p>
                  <p className="mt-1 text-xs leading-5 text-muted">
                    Use the bookmark button on any title to save it here.
                  </p>
                </div>
              </div>
              <Link
                to="/movies"
                className="inline-flex h-10 w-fit shrink-0 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.05] px-4 text-xs font-semibold text-white transition hover:bg-white/10"
              >
                Browse movies
                <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Home;
