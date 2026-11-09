import { useEffect, useRef, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { Link, useSearchParams } from 'react-router-dom';
import { Compass, Search as SearchIcon, SearchX, Sparkles } from 'lucide-react';
import PageHeader from '../components/layout/PageHeader';
import SearchBar from '../components/search/SearchBar';
import MediaGrid from '../components/movies/MediaGrid';
import Tabs from '../components/common/Tabs';
import Pagination from '../components/common/Pagination';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useToast } from '../providers/ToastProvider';
import { search } from '../api/search.api';
import { queryKeys } from '../utils/queryKeys';
import {
  flattenPages,
  getNextPageParam,
  getTotalResults,
} from '../utils/pagination';
import { formatCount } from '../utils/formatters';

const searchTabs = [
  { value: 'multi', label: 'All' },
  { value: 'movies', label: 'Movies' },
  { value: 'tv', label: 'TV' },
  { value: 'people', label: 'People' },
];

const examples = ['Dune', 'Severance', 'Hayao Miyazaki'];

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const qParam = searchParams.get('q') || '';
  const rawType = searchParams.get('type');
  const activeType = searchTabs.some((tab) => tab.value === rawType) ? rawType : 'multi';
  const [input, setInput] = useState(qParam);
  const [committedQuery, setCommittedQuery] = useState(qParam);
  const lastUrlQueryRef = useRef(qParam);
  const qParamRef = useRef(qParam);
  const debounceTimerRef = useRef(null);
  const { notify } = useToast();
  qParamRef.current = qParam;

  useEffect(() => {
    if (qParam === lastUrlQueryRef.current) return;
    lastUrlQueryRef.current = qParam;
    window.clearTimeout(debounceTimerRef.current);
    setInput(qParam);
    setCommittedQuery(qParam);
  }, [qParam]);

  useEffect(
    () => () => {
      window.clearTimeout(debounceTimerRef.current);
    },
    []
  );

  const effectiveQuery = committedQuery.length >= 2 ? committedQuery : '';

  useDocumentTitle(effectiveQuery ? `Search: ${effectiveQuery}` : 'Search');

  useEffect(() => {
    if (qParamRef.current === effectiveQuery) return;

    lastUrlQueryRef.current = effectiveQuery;
    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        if (effectiveQuery) next.set('q', effectiveQuery);
        else next.delete('q');
        return next;
      },
      { replace: true }
    );
  }, [effectiveQuery, setSearchParams]);

  const query = useInfiniteQuery({
    queryKey: queryKeys.search(activeType, effectiveQuery),
    queryFn: ({ pageParam = 1, signal }) =>
      search({
        type: activeType,
        query: effectiveQuery,
        page: pageParam,
        signal,
      }),
    initialPageParam: 1,
    getNextPageParam,
    enabled: effectiveQuery.length >= 2,
  });

  const items = flattenPages(query.data);
  const total = getTotalResults(query.data);

  const handleInputChange = (value) => {
    setInput(value);
    window.clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = window.setTimeout(() => {
      setCommittedQuery(value.trim());
    }, 450);
  };

  const navigateWithQuery = (rawQuery, type = activeType) => {
    const nextQuery = rawQuery.trim();
    const nextEffectiveQuery = nextQuery.length >= 2 ? nextQuery : '';

    window.clearTimeout(debounceTimerRef.current);
    setCommittedQuery(nextEffectiveQuery);
    lastUrlQueryRef.current = nextEffectiveQuery;

    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      if (type === 'multi') next.delete('type');
      else next.set('type', type);

      if (nextEffectiveQuery) next.set('q', nextEffectiveQuery);
      else next.delete('q');

      return next;
    });
  };

  const submitSearch = () => {
    const nextQuery = input.trim();
    if (nextQuery.length < 2) {
      notify('Enter at least 2 characters to search.', 'default');
      return;
    }
    navigateWithQuery(nextQuery);
  };

  const clearSearch = () => {
    window.clearTimeout(debounceTimerRef.current);
    setInput('');
    setCommittedQuery('');
    lastUrlQueryRef.current = '';

    setSearchParams(
      (current) => {
        const next = new URLSearchParams(current);
        next.delete('q');
        return next;
      },
      { replace: true }
    );

    window.setTimeout(() => document.getElementById('search-page-input')?.focus(), 0);
  };

  const handleTabChange = (type) => {
    if (type === activeType) return;
    navigateWithQuery(input, type);
  };

  const handleExample = (value) => {
    setInput(value);
    navigateWithQuery(value);
  };

  const showSearchResults = effectiveQuery.length >= 2;
  const isLoadingResults = showSearchResults && query.isLoading;
  const typeLabel =
    searchTabs.find((tab) => tab.value === activeType)?.label || 'All';

  return (
    <div className="mx-auto max-w-[1500px] space-y-7 px-5 pb-20 pt-6 sm:px-8 xl:px-12">
      <PageHeader
        eyebrow="Search the atlas"
        title="Find your next watch"
        description="Search across movies, TV series, anime titles and the people behind them. Results update as you type and the query stays in the URL."
        icon={SearchIcon}
      >
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs text-muted">
          <p className="font-semibold text-white">{showSearchResults ? typeLabel : 'Ready'}</p>
          <p className="mt-0.5">
            {showSearchResults
              ? query.isLoading
                ? 'Searching TMDB'
                : query.error
                  ? 'Search unavailable'
                  : `${formatCount(total)} matches`
              : 'Minimum 2 characters'}
          </p>
        </div>
      </PageHeader>

      <SearchBar
        value={input}
        onChange={handleInputChange}
        onSubmit={submitSearch}
        onClear={clearSearch}
      />

      <div className="flex flex-col gap-3 border-b border-white/[0.07] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          options={searchTabs}
          value={activeType}
          onChange={handleTabChange}
          ariaLabel="Search result types"
        />
        <p className="text-[10px] leading-5 text-muted/70">
          Searches run after a short pause to keep the catalogue responsive.
        </p>
      </div>

      {!showSearchResults ? (
        <div className="space-y-6">
          <EmptyState
            icon={Compass}
            title={input.trim().length === 1 ? 'Keep typing' : 'What are you in the mood for?'}
            message={
              input.trim().length === 1
                ? 'Enter at least two characters before results appear.'
                : 'Search by title, person or franchise. Pick a suggestion below to get moving.'
            }
          />

          <div className="flex flex-wrap items-center justify-center gap-2">
            {examples.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => handleExample(example)}
                className="inline-flex items-center gap-2 rounded-full border border-white/[0.13] bg-white/[0.035] px-4 py-2 text-[11px] font-semibold text-muted transition hover:border-accent/40 hover:text-white"
              >
                <Sparkles className="h-3 w-3 text-accent/80" aria-hidden="true" />
                {example}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { to: '/movies', label: 'Browse movies', copy: 'Popularity-ranked films' },
              { to: '/tv', label: 'Browse TV', copy: 'Airing and all-time favourites' },
              { to: '/anime', label: 'Browse anime', copy: 'Films and series in one lane' },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-4 transition hover:border-white/20 hover:bg-white/[0.04]"
              >
                <p className="text-sm font-semibold text-mist">{link.label}</p>
                <p className="mt-1 text-[11px] text-muted">{link.copy}</p>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <section aria-label="Search results" aria-busy={isLoadingResults}>
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted">
                {typeLabel} results
              </p>
              <h2 className="mt-1 max-w-[700px] truncate text-[21px] font-semibold tracking-[-0.035em] text-mist sm:text-[25px]">
                “{effectiveQuery}”
              </h2>
            </div>
            <p className="hidden text-right text-[11px] leading-5 text-muted sm:block">
              {items.length ? `${formatCount(items.length)} loaded` : 'Searching the catalogue'}
              {total ? ` · ${formatCount(total)} total` : ''}
            </p>
          </div>

          <MediaGrid
            items={items}
            loading={isLoadingResults}
            error={query.error}
            onRetry={() => query.refetch()}
            emptyIcon={SearchX}
            emptyTitle="No matches found"
            emptyMessage="Nothing matched this query in the selected category. Try a shorter phrase or switch result types."
            skeletonCount={10}
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
      )}
    </div>
  );
};

export default Search;
