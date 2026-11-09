import { useInfiniteQuery } from '@tanstack/react-query';
import { Flame } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import MediaGrid from '../components/movies/MediaGrid';
import Pagination from '../components/common/Pagination';
import ErrorState from '../components/common/ErrorState';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getTrending } from '../api/trending.api';
import { queryKeys } from '../utils/queryKeys';
import { flattenPages, getNextPageParam, getTotalResults } from '../utils/pagination';
import { getMediaType } from '../utils/formatters';

const Trending = () => {
  useDocumentTitle('Trending');

  const query = useInfiniteQuery({
    queryKey: queryKeys.trending('week'),
    queryFn: ({ pageParam = 1, signal }) =>
      getTrending({ page: pageParam, timeWindow: 'week', signal }),
    initialPageParam: 1,
    getNextPageParam,
  });

  const items = flattenPages(query.data).filter(
    (item) => getMediaType(item) !== 'person'
  );
  const total = getTotalResults(query.data);

  return (
    <div className="mx-auto max-w-[1500px] space-y-8 px-5 pb-20 pt-6 sm:px-8 xl:px-12">
      <PageHeader
        eyebrow="Weekly pulse"
        title="Trending This Week"
        description="Movies and TV series ranked by what the world is watching and talking about right now. Results come directly from the CineAtlas trending feed."
        icon={Flame}
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs text-muted">
          <p className="font-semibold text-white">TMDB weekly feed</p>
          <p className="mt-0.5">Movies + TV · 20 results per page</p>
        </div>
      </PageHeader>

      <MediaGrid
        items={items}
        loading={query.isLoading}
        error={query.error}
        onRetry={() => query.refetch()}
        emptyTitle="No trending titles"
        emptyMessage="The trending feed returned no titles. Try refreshing in a moment."
        skeletonCount={15}
      />

      {query.error && items.length ? (
        <ErrorState
          error={query.error}
          onRetry={() => query.fetchNextPage()}
          compact
        />
      ) : null}

      <Pagination
        hasNextPage={Boolean(query.hasNextPage)}
        isLoading={query.isFetchingNextPage}
        onLoadMore={() => query.fetchNextPage()}
        shown={items.length}
        total={total}
      />
    </div>
  );
};

export default Trending;
