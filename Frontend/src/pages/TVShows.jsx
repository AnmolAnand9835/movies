import { useInfiniteQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { Tv } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import MediaGrid from '../components/movies/MediaGrid';
import Tabs from '../components/common/Tabs';
import Pagination from '../components/common/Pagination';
import ErrorState from '../components/common/ErrorState';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  getAiringTodayTV,
  getOnTheAirTV,
  getPopularTV,
  getTopRatedTV,
} from '../api/tv.api';
import { queryKeys } from '../utils/queryKeys';
import {
  flattenPages,
  getNextPageParam,
  getTotalResults,
} from '../utils/pagination';
import { formatCount } from '../utils/formatters';

const tabs = [
  { value: 'popular', label: 'Popular' },
  { value: 'top-rated', label: 'Top rated' },
  { value: 'on-the-air', label: 'On the air' },
  { value: 'airing-today', label: 'Airing today' },
];

const loaders = {
  popular: getPopularTV,
  'top-rated': getTopRatedTV,
  'on-the-air': getOnTheAirTV,
  'airing-today': getAiringTodayTV,
};

const emptyCopy = {
  popular: 'No popular series were returned. Try refreshing in a moment.',
  'top-rated': 'No top-rated series were returned right now.',
  'on-the-air': 'No currently airing series were returned right now.',
  'airing-today': 'No series are listed as airing today in the current feed.',
};

const TVShows = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = searchParams.get('tab');
  const activeTab = tabs.some((tab) => tab.value === rawTab) ? rawTab : 'popular';
  const activeLabel = tabs.find((tab) => tab.value === activeTab)?.label || 'Popular';

  useDocumentTitle(activeTab === 'popular' ? 'TV Shows' : `TV Shows · ${activeLabel}`);

  const query = useInfiniteQuery({
    queryKey: queryKeys.tvList(activeTab),
    queryFn: ({ pageParam = 1, signal }) =>
      loaders[activeTab]({ page: pageParam, signal }),
    initialPageParam: 1,
    getNextPageParam,
  });

  const items = flattenPages(query.data);
  const total = getTotalResults(query.data);

  const handleTabChange = (tab) => {
    const next = new URLSearchParams(searchParams);
    if (tab === 'popular') next.delete('tab');
    else next.set('tab', tab);
    setSearchParams(next);
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-7 px-5 pb-20 pt-6 sm:px-8 xl:px-12">
      <PageHeader
        eyebrow="Serialised stories"
        title="TV Shows"
        description="From returning favourites to series airing today, follow the small-screen titles people are watching. Open any show for cast, seasons, trailers and related picks."
        icon={Tv}
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs text-muted">
          <p className="font-semibold text-white">{activeLabel}</p>
          <p className="mt-0.5">
            {query.isLoading ? 'Loading series' : `${formatCount(total)} shows`} · TMDB
          </p>
        </div>
      </PageHeader>

      <div className="flex flex-col gap-3 border-b border-white/[0.07] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          options={tabs}
          value={activeTab}
          onChange={handleTabChange}
          ariaLabel="TV show collections"
        />
        <p className="text-[10px] leading-5 text-muted/70">
          Airing schedules follow TMDB&apos;s regional timezone data.
        </p>
      </div>

      <section aria-label={`${activeLabel} TV shows`}>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted">
              Series collection
            </p>
            <h2 className="mt-1 text-[21px] font-semibold tracking-[-0.035em] text-mist sm:text-[25px]">
              {activeLabel}
            </h2>
          </div>
          <p className="hidden text-right text-[11px] leading-5 text-muted sm:block">
            {items.length ? `${formatCount(items.length)} loaded` : 'Fetching the schedule'}
            {total ? ` · ${formatCount(total)} available` : ''}
          </p>
        </div>

        <MediaGrid
          items={items}
          loading={query.isLoading}
          error={query.error}
          onRetry={() => query.refetch()}
          emptyTitle={`No ${activeLabel.toLowerCase()} shows`}
          emptyMessage={emptyCopy[activeTab]}
        />

        {query.error && items.length ? (
          <div className="mt-5">
            <ErrorState
              error={query.error}
              onRetry={() => query.refetch()}
              compact
            />
          </div>
        ) : null}

        <Pagination
          hasNextPage={Boolean(query.hasNextPage)}
          isLoading={query.isFetchingNextPage}
          onLoadMore={() => query.fetchNextPage()}
          shown={items.length}
          total={total}
        />
      </section>
    </div>
  );
};

export default TVShows;
