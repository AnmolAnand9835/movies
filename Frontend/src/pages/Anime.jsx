import { useMemo, useState } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  ChevronDown,
  ExternalLink,
  Info,
  Play,
  RefreshCw,
  Sparkles,
  Star,
} from 'lucide-react';

import Pagination from '../components/common/Pagination';
import ErrorState from '../components/common/ErrorState';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getAnimeList } from '../api/anime.api';
import { getTVDetails, getTVSeason } from '../api/tv.api';
import { queryKeys } from '../utils/queryKeys';
import {
  flattenPages,
  getNextPageParam,
  getTotalResults,
} from '../utils/pagination';
import { formatCount } from '../utils/formatters';

const tabs = [
  { value: 'popular', label: 'Popular' },
  { value: 'movies', label: 'Anime movies' },
  { value: 'tv', label: 'Anime series' },
  { value: 'top-rated', label: 'Top rated' },
];

const emptyCopy = {
  popular: 'No popular anime titles were returned. Try refreshing in a moment.',
  movies: 'No anime movies were returned for this discovery collection.',
  tv: 'No anime series were returned for this discovery collection.',
  'top-rated': 'No top-rated anime titles were returned right now.',
};

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p';
const ANIMEDEKHO_BASE = 'https://animedekho.tv/embed';

// The anime list itself comes from your existing backend (getAnimeList).
// Season/episode metadata now comes from your own backend API instead of TMDB directly.

function getMediaType(item) {
  const explicitType = String(item?.media_type || item?.type || '').toLowerCase();
  if (explicitType === 'tv') return 'tv';
  if (explicitType === 'movie') return 'movie';
  return null;
}

function buildMovieUrl(movieId) {
  return movieId
    ? `${ANIMEDEKHO_BASE}/${encodeURIComponent(movieId)}`
    : '';
}

function buildEpisodeUrl(seriesId, seasonNumber, episodeNumber) {
  return seriesId && seasonNumber != null && episodeNumber != null
    ? `${ANIMEDEKHO_BASE}/${encodeURIComponent(seriesId)}/${seasonNumber}-${episodeNumber}`
    : '';
}

function getTitle(item) {
  return (
    item?.title ||
    item?.name ||
    item?.original_title ||
    item?.original_name ||
    'Untitled anime'
  );
}

function getYear(item) {
  const date = item?.release_date || item?.first_air_date || item?.year;
  if (!date) return '';
  return String(date).slice(0, 4);
}

function imageUrl(path, size = 'w500') {
  if (!path) return '';
  if (/^https?:\/\//i.test(path)) return path;
  return `${TMDB_IMAGE_BASE}/${size}${path.startsWith('/') ? path : `/${path}`}`;
}

function getEmbeddedSeasons(item) {
  if (Array.isArray(item?.seasons)) return item.seasons;
  if (Array.isArray(item?.details?.seasons)) return item.details.seasons;
  return [];
}

function getEmbeddedEpisodes(item, seasonNumber) {
  if (Array.isArray(item?.episodes)) {
    return item.episodes.filter(
      (episode) =>
        Number(episode.season_number ?? episode.seasonNumber ?? 1) ===
        Number(seasonNumber)
    );
  }
  // If item doesn't have episodes (e.g., from getAnimeList), return empty array
  // The actual episodes will be fetched via React Query
  return [];
}

function SeasonEpisodeGroup({
  animeId,
  mediaType,
  season,
  isOpen,
  onToggle,
  selectedSeasonNumber,
  selectedEpisodeNumber,
  onSelectEpisode,
  fallbackPoster,
  embeddedEpisodes,
}) {
  const seasonNumber = Number(season.season_number ?? 0);
  const embeddedSeasonEpisodes =
    Array.isArray(season.episodes) && season.episodes.length
      ? season.episodes
      : embeddedEpisodes;
  const hasMeaningfulEpisodeData = Array.isArray(embeddedSeasonEpisodes) && embeddedSeasonEpisodes.length > 0;

  const episodesQuery = useQuery({
    queryKey: queryKeys.tvSeason(animeId, seasonNumber),
    enabled: Boolean(isOpen && animeId && mediaType === 'tv' && !hasMeaningfulEpisodeData),
    queryFn: ({ signal }) => getTVSeason({ id: animeId, seasonNumber, signal }),
    staleTime: 30 * 60 * 1000,
  });

  const episodes = hasMeaningfulEpisodeData
    ? embeddedSeasonEpisodes
    : episodesQuery.data?.episodes || [];
  const seasonPoster = imageUrl(season.poster_path, 'w185');

  return (
    <section className="overflow-hidden rounded-xl border border-white/10 bg-black/20">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-white/[0.05]"
      >
        {seasonPoster ? (
          <img
            src={seasonPoster}
            alt=""
            loading="lazy"
            className="h-12 w-9 shrink-0 rounded object-cover"
          />
        ) : null}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-white">
            {season.name || (seasonNumber === 0 ? 'Specials' : `Season ${seasonNumber}`)}
          </span>
          <span className="mt-1 block text-[10px] text-white/40">
            {season.episode_count != null
              ? `${season.episode_count} episodes`
              : episodes.length
                ? `${episodes.length} episodes`
                : 'Open to load episodes'}
            {season.air_date ? ` · ${String(season.air_date).slice(0, 4)}` : ''}
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-white/50 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen ? (
        <div className="border-t border-white/[0.07] p-2">
          {episodesQuery.isLoading && !hasMeaningfulEpisodeData ? (
            <div className="space-y-3 p-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="flex animate-pulse gap-3">
                  <div className="aspect-video w-28 shrink-0 rounded-lg bg-white/[0.07]" />
                  <div className="flex-1 py-2">
                    <div className="h-3 w-4/5 rounded bg-white/[0.07]" />
                    <div className="mt-2 h-3 w-2/5 rounded bg-white/[0.05]" />
                  </div>
                </div>
              ))}
            </div>
          ) : episodesQuery.error && !episodes.length ? (
            <div className="p-3 text-xs leading-5 text-rose-300">
              {episodesQuery.error.message}
            </div>
          ) : episodes.length ? (
            <div className="space-y-1">
              {episodes.map((episode) => {
                const episodeNumber = Number(
                  episode.episode_number ?? episode.episodeNumber ?? episode.number
                );
                const isActive =
                  Number(selectedSeasonNumber) === seasonNumber &&
                  Number(selectedEpisodeNumber) === episodeNumber;
                const thumbnail = imageUrl(
                  episode.still_path || episode.thumbnail || episode.image,
                  'w300'
                ) || fallbackPoster;

                return (
                  <button
                    key={episode.id || `${seasonNumber}-${episodeNumber}`}
                    type="button"
                    onClick={() => onSelectEpisode(seasonNumber, episodeNumber)}
                    className={`flex w-full gap-3 rounded-lg p-2 text-left transition ${
                      isActive
                        ? 'bg-violet-500/15 ring-1 ring-violet-400/30'
                        : 'hover:bg-white/[0.06]'
                    }`}
                  >
                    <span className="relative aspect-video w-28 shrink-0 overflow-hidden rounded-lg bg-white/[0.07] sm:w-32">
                      {thumbnail ? (
                        <img
                          src={thumbnail}
                          alt=""
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                      <span className="absolute bottom-1 left-1 rounded bg-black/75 px-1.5 py-0.5 text-[9px] text-white">
                        E{episodeNumber}
                      </span>
                      {isActive ? (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/35 text-white">
                          <Play className="h-5 w-5 fill-current" />
                        </span>
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1 py-0.5">
                      <span className="line-clamp-2 block text-xs font-semibold text-white">
                        {episode.name || episode.title || `Episode ${episodeNumber}`}
                      </span>
                      <span className="mt-1 block text-[10px] text-white/40">
                        S{seasonNumber} · E{episodeNumber}
                      </span>
                      {episode.runtime ? (
                        <span className="mt-1 block text-[10px] text-white/30">
                          {episode.runtime} min
                        </span>
                      ) : null}
                      {episode.air_date ? (
                        <span className="mt-1 block text-[10px] text-white/30">
                          {episode.air_date}
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="p-3 text-xs text-white/40">No episodes found in this season.</p>
          )}
        </div>
      ) : null}
    </section>
  );
}

const Anime = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState(null);
  const [selectedEpisodeNumber, setSelectedEpisodeNumber] = useState(null);
  const [expandedSeasons, setExpandedSeasons] = useState({});

  const rawTab = searchParams.get('tab');
  const activeTab = tabs.some((tab) => tab.value === rawTab) ? rawTab : 'popular';
  const activeLabel = tabs.find((tab) => tab.value === activeTab)?.label || 'Popular';

  // IMPORTANT: this is your existing backend data. No second anime catalogue is created.
  const listQuery = useInfiniteQuery({
    queryKey: queryKeys.animeList(activeTab),
    queryFn: ({ pageParam = 1, signal }) =>
      getAnimeList({ type: activeTab, page: pageParam, signal }),
    initialPageParam: 1,
    getNextPageParam,
  });

  const items = flattenPages(listQuery.data);
  const total = getTotalResults(listQuery.data);
  const selectedMediaType = selectedAnime ? getMediaType(selectedAnime) : null;
  const embeddedSeasons = useMemo(
    () => getEmbeddedSeasons(selectedAnime),
    [selectedAnime]
  );

  const detailsQuery = useQuery({
    queryKey: queryKeys.tvDetails(selectedAnime?.id),
    enabled: Boolean(selectedAnime?.id && selectedMediaType === 'tv'),
    queryFn: async ({ signal }) => {
      const details = await getTVDetails({
        id: selectedAnime.id,
        includeCredits: false,
        includeVideos: false,
        signal,
      });
      if (import.meta.env.DEV) {
        console.debug('Anime TV details response structure', {
          fields: Object.keys(details || {}),
          seasonCount: Array.isArray(details?.seasons) ? details.seasons.length : null,
        });
      }
      return details;
    },
    staleTime: 30 * 60 * 1000,
  });

  const seasons = embeddedSeasons.length
    ? embeddedSeasons
    : detailsQuery.data?.seasons || [];

  const defaultSeason =
    seasons.find((season) => Number(season.season_number) === 1) ||
    seasons.find((season) => Number(season.season_number ?? 0) > 0) ||
    seasons[0];
  const activeSeasonNumber =
    selectedSeasonNumber ??
    (defaultSeason ? Number(defaultSeason.season_number ?? 0) : null);

  const seriesProviderId =
    detailsQuery.data?.provider_id ||
    detailsQuery.data?.providerId ||
    selectedAnime?.provider_id ||
    selectedAnime?.providerId ||
    selectedAnime?.id;
  const playerUrl =
    selectedMediaType === 'movie'
      ? buildMovieUrl(selectedAnime?.id)
      : selectedMediaType === 'tv'
        ? buildEpisodeUrl(seriesProviderId, activeSeasonNumber, selectedEpisodeNumber ?? 1)
        : '';

  useDocumentTitle(
    selectedAnime
      ? `${getTitle(selectedAnime)} · Watch Anime`
      : activeTab === 'popular'
        ? 'Anime'
        : `Anime · ${activeLabel}`
  );

  const resetWatchState = () => {
    setSelectedAnime(null);
    setSelectedSeasonNumber(null);
    setSelectedEpisodeNumber(null);
    setExpandedSeasons({});
  };

  const handleTabChange = (tab) => {
    resetWatchState();
    const next = new URLSearchParams(searchParams);
    if (tab === 'popular') next.delete('tab');
    else next.set('tab', tab);
    setSearchParams(next);
  };

  const handleSelectAnime = (anime) => {
    setSelectedAnime(anime);
    setSelectedSeasonNumber(null);
    setSelectedEpisodeNumber(null);
    setExpandedSeasons({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectEpisode = (seasonNumber, episodeNumber) => {
    setSelectedSeasonNumber(Number(seasonNumber));
    setSelectedEpisodeNumber(Number(episodeNumber));
    setExpandedSeasons((previous) => ({ ...previous, [seasonNumber]: true }));
  };

  const handleToggleSeason = (seasonNumber) => {
    setExpandedSeasons((previous) => {
      const currentlyOpen = previous[seasonNumber] ?? seasonNumber === activeSeasonNumber;
      return { ...previous, [seasonNumber]: !currentlyOpen };
    });
  };

  const renderAnimeGrid = () => (
    <>
      <header className="flex flex-col gap-5 border-b border-white/[0.07] pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-violet-300">
            <Sparkles className="h-3.5 w-3.5" /> Animation, worldwide
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Anime</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/55">
            Browse anime from your connected catalogue. Select a title to open its player,
            details and season-wise episode list.
          </p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-xs text-white/55">
          <p className="font-semibold text-white">{activeLabel}</p>
          <p className="mt-1">
            {listQuery.isLoading ? 'Loading anime…' : `${formatCount(total)} titles`}
          </p>
        </div>
      </header>

      <nav
        aria-label="Anime collections"
        className="flex gap-2 overflow-x-auto border-b border-white/[0.07] pb-4"
      >
        {tabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleTabChange(tab.value)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition ${
              activeTab === tab.value
                ? 'bg-violet-500 text-white'
                : 'border border-white/10 bg-white/[0.035] text-white/60 hover:bg-white/10 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section aria-label={`${activeLabel} anime`}>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/35">
              Anime collection
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
              {activeLabel}
            </h2>
          </div>
          <p className="hidden text-right text-[11px] text-white/40 sm:block">
            {items.length ? `${formatCount(items.length)} loaded` : 'Fetching collection'}
            {total ? ` · ${formatCount(total)} available` : ''}
          </p>
        </div>

        {listQuery.isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[2/3] rounded-xl bg-white/[0.07]" />
                <div className="mt-3 h-3 w-4/5 rounded bg-white/[0.07]" />
                <div className="mt-2 h-3 w-2/5 rounded bg-white/[0.05]" />
              </div>
            ))}
          </div>
        ) : listQuery.error && !items.length ? (
          <ErrorState error={listQuery.error} onRetry={() => listQuery.refetch()} />
        ) : items.length ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 2xl:grid-cols-6">
            {items.map((item) => {
              const title = getTitle(item);
              const poster = imageUrl(item.poster_path || item.poster, 'w342');
              const year = getYear(item);
              const mediaType = getMediaType(item);
              return (
                <button
                  key={`${mediaType}-${item.id}`}
                  type="button"
                  onClick={() => handleSelectAnime(item)}
                  className="group min-w-0 text-left"
                  aria-label={`Watch ${title}`}
                >
                  <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-white/[0.06] ring-1 ring-white/10">
                    {poster ? (
                      <img
                        src={poster}
                        alt={title}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105 group-hover:brightness-75"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-white/35">
                        No poster
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/25">
                      <span className="flex h-12 w-12 scale-90 items-center justify-center rounded-full bg-violet-500 text-white opacity-0 shadow-xl transition group-hover:scale-100 group-hover:opacity-100">
                        <Play className="ml-0.5 h-5 w-5 fill-current" />
                      </span>
                    </div>
                    {item.vote_average ? (
                      <span className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/75 px-2 py-1 text-[10px] font-semibold text-white backdrop-blur">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {Number(item.vote_average).toFixed(1)}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm font-semibold text-white transition group-hover:text-violet-300">
                    {title}
                  </p>
                  <p className="mt-1 text-[11px] text-white/40">
                    {year || 'Anime'} · {mediaType === 'tv' ? 'Series' : mediaType === 'movie' ? 'Movie' : 'Unknown type'}
                  </p>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-12 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-violet-300" />
            <h3 className="mt-3 font-semibold text-white">No {activeLabel.toLowerCase()} titles</h3>
            <p className="mt-2 text-sm text-white/45">{emptyCopy[activeTab]}</p>
            <button
              type="button"
              onClick={() => listQuery.refetch()}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/15"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
          </div>
        )}

        {listQuery.error && items.length > 0 ? (
          <div className="mt-5">
            <ErrorState error={listQuery.error} onRetry={() => listQuery.refetch()} compact />
          </div>
        ) : null}

        <Pagination
          hasNextPage={Boolean(listQuery.hasNextPage)}
          isLoading={listQuery.isFetchingNextPage}
          onLoadMore={() => listQuery.fetchNextPage()}
          shown={items.length}
          total={total}
        />
      </section>
    </>
  );

  const renderWatchPage = () => {
    const title = getTitle(selectedAnime);
    const poster = imageUrl(selectedAnime.poster_path || selectedAnime.poster, 'w500');
    const backdrop = imageUrl(selectedAnime.backdrop_path || selectedAnime.backdrop, 'w1280');
    const year = getYear(selectedAnime);
    const isTv = selectedMediaType === 'tv';
    const activeEpisode = isTv
      ? getEmbeddedEpisodes(selectedAnime, activeSeasonNumber).find(
      (episode) =>
        Number(episode.episode_number ?? episode.episodeNumber ?? episode.number) ===
        selectedEpisodeNumber
      )
      : null;

    return (
      <>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={resetWatchState}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to anime
          </button>
          {playerUrl ? (
            <a
              href={playerUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
            >
              Open provider <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>

        <div className={`grid grid-cols-1 items-start gap-6 ${isTv ? 'xl:grid-cols-[minmax(0,1fr)_390px]' : ''}`}>
          <main className="min-w-0">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl shadow-black/30">
              <div className="relative aspect-video w-full">
                {playerUrl ? (
                  <iframe
                    key={playerUrl}
                    src={playerUrl}
                    title={`${title} player`}
                    className="absolute inset-0 h-full w-full border-0"
                    allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-white/50">
                    {isTv
                      ? detailsQuery.isLoading
                        ? 'Loading series seasons…'
                        : 'No season is available for playback.'
                      : 'No movie provider ID is available for playback.'}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5">
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                {title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/50">
                {year ? <span>{year}</span> : null}
                <span>
                  {isTv ? 'Anime series' : selectedMediaType === 'movie' ? 'Anime movie' : 'Anime'}
                </span>
                {selectedAnime.vote_average ? (
                  <span className="inline-flex items-center gap-1 text-yellow-300">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {Number(selectedAnime.vote_average).toFixed(1)} / 10
                  </span>
                ) : null}
                {isTv && activeSeasonNumber !== null && selectedEpisodeNumber !== null ? (
                  <span>
                    Season {activeSeasonNumber} · Episode {selectedEpisodeNumber}
                    {activeEpisode?.name ? ` — ${activeEpisode.name}` : ''}
                  </span>
                ) : null}
              </div>

              <section className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
                {backdrop ? (
                  <div className="relative h-28 sm:h-40">
                    <img src={backdrop} alt="" className="h-full w-full object-cover opacity-40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#101014] to-black/10" />
                  </div>
                ) : null}
                <div className="flex gap-4 p-4 sm:p-5">
                  {poster ? (
                    <img
                      src={poster}
                      alt=""
                      className="hidden h-28 w-20 rounded-lg object-cover sm:block"
                    />
                  ) : null}
                  <div className="min-w-0">
                    <h2 className="text-sm font-semibold text-white">About this anime</h2>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-white/55">
                      {selectedAnime.overview || selectedAnime.description ||
                        'No description is available for this title yet.'}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Array.isArray(selectedAnime.genre_names)
                        ? selectedAnime.genre_names.map((genre) => (
                            <span
                              key={genre}
                              className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/50"
                            >
                              {genre}
                            </span>
                          ))
                        : null}
                    </div>
                    <p className="mt-3 text-[10px] text-white/30">
                      {selectedAnime.source ? `Catalogue: ${selectedAnime.source}` : 'Anime catalogue'}
                    </p>
                  </div>
                </div>
              </section>

              <div className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-white/40">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                If the embedded player is blank or blocked, use “Open provider”. Some streaming
                providers do not permit playback inside another website.
              </div>
            </div>
          </main>

          {isTv ? (
            <aside className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
              <div className="border-b border-white/10 p-4">
                <h2 className="font-semibold text-white">Seasons & episodes</h2>
                <p className="mt-1 text-[11px] text-white/40">
                  {`${seasons.length} seasons · choose an episode to p
                  lay`}
                </p>S
              </div>

              <div className="max-h-[760px] space-y-2 overflow-y-auto p-2">
                {detailsQuery.isLoading && !embeddedSeasons.length ? (
                  <div className="space-y-3 p-3 text-xs text-white/45">
                    Loading season list…
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="h-12 animate-pulse rounded-lg bg-white/[0.06]" />
                    ))}
                  </div>
                ) : detailsQuery.error && !embeddedSeasons.length ? (
                  <div className="p-4 text-xs leading-5 text-rose-300">
                    {detailsQuery.error.message}
                  </div>
                ) : seasons.length ? (
                  seasons.map((season) => {
                    const seasonNumber = Number(season.season_number ?? 0);
                    const localEpisodes = getEmbeddedEpisodes(selectedAnime, seasonNumber);
                    const isOpen =
                      expandedSeasons[seasonNumber] ?? seasonNumber === activeSeasonNumber;
                    return (
                      <SeasonEpisodeGroup
                        key={season.id || seasonNumber}
                        animeId={selectedAnime.id}
                        mediaType={selectedMediaType}
                        season={season}
                        isOpen={isOpen}
                        onToggle={() => handleToggleSeason(seasonNumber)}
                        selectedSeasonNumber={activeSeasonNumber}
                        selectedEpisodeNumber={selectedEpisodeNumber}
                        onSelectEpisode={handleSelectEpisode}
                        fallbackPoster={poster}
                        embeddedEpisodes={localEpisodes.length ? localEpisodes : undefined}
                      />
                    );
                  })
                ) : (
                  <p className="p-4 text-xs leading-5 text-white/45">
                    No season data was returned for this series. Playback is unavailable until
                    season metadata is provided.
                  </p>
                )}
              </div>
              </aside>
          ) : null}
        </div>
      </>
    );
  };

  return (
    <div className="mx-auto min-h-screen max-w-[1600px] space-y-7 px-4 pb-20 pt-6 text-white sm:px-7 xl:px-10">
      {selectedAnime ? renderWatchPage() : renderAnimeGrid()}
    </div>
  );
};

export default Anime;
