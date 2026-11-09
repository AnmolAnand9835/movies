import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, ChevronDown, ExternalLink, Info, Play } from 'lucide-react';
import { Link, useLocation, useParams } from 'react-router-dom';
import EmptyState from '../components/common/EmptyState';
import ErrorState from '../components/common/ErrorState';
import VideoPlayer from '../components/common/VideoPlayer';
import { BackdropImage, PosterImage } from '../components/common/PosterImage';
import { getTVDetails, getTVExternalIds, getTVSeason } from '../api/tv.api';
import { queryKeys } from '../utils/queryKeys';
import { formatDate, getBackdropPath, getPosterPath, getTitle, getYear } from '../utils/formatters';
import { posterUrl } from '../utils/image';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

const SeasonEpisodeGroup = ({
  showId,
  season,
  isOpen,
  selectedSeasonNumber,
  selectedEpisodeNumber,
  onToggle,
  onSelectEpisode,
  fallbackPoster,
}) => {
  const seasonNumber = Number(season.season_number ?? 0);
  const episodesQuery = useQuery({
    queryKey: queryKeys.tvSeason(showId, seasonNumber),
    queryFn: ({ signal }) => getTVSeason({ id: showId, seasonNumber, signal }),
    enabled: Boolean(isOpen && showId),
    staleTime: 30 * 60 * 1000,
  });
  const episodes = Array.isArray(episodesQuery.data?.episodes)
    ? episodesQuery.data.episodes
    : [];
  const seasonPoster = posterUrl(season.poster_path, 'w185');

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
          {episodesQuery.isLoading ? (
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
          ) : episodesQuery.error ? (
            <div className="p-2">
              <ErrorState
                error={episodesQuery.error}
                onRetry={() => episodesQuery.refetch()}
                compact
              />
            </div>
          ) : episodes.length ? (
            <div className="space-y-1">
              {episodes.map((episode) => {
                const episodeNumber = Number(episode.episode_number);
                const isActive =
                  Number(selectedSeasonNumber) === seasonNumber &&
                  Number(selectedEpisodeNumber) === episodeNumber;
                const thumbnail = posterUrl(episode.still_path, 'w300') || fallbackPoster;

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
                        <img src={thumbnail} alt="" loading="lazy" className="h-full w-full object-cover" />
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
                        {episode.name || `Episode ${episodeNumber}`}
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
};

const WatchTVNow = () => {
  const { id } = useParams();
  const location = useLocation();
  const [selectedSeasonNumber, setSelectedSeasonNumber] = useState(null);
  const [selectedEpisodeNumber, setSelectedEpisodeNumber] = useState(null);
  const [expandedSeasons, setExpandedSeasons] = useState({});

  const detailsQuery = useQuery({
    queryKey: queryKeys.tvDetails(id),
    queryFn: ({ signal }) => getTVDetails({ id, signal }),
    enabled: Boolean(id),
  });
  const externalIdsQuery = useQuery({
    queryKey: queryKeys.tvExternalIds(id),
    queryFn: ({ signal }) => getTVExternalIds({ id, signal }),
    enabled: Boolean(id && detailsQuery.data),
  });

  const media = detailsQuery.data;
  const title = getTitle(media);
  const seasons = Array.isArray(media?.seasons) ? media.seasons : [];
  const defaultSeason =
    seasons.find((season) => Number(season.season_number) === 1) ||
    seasons.find((season) => Number(season.season_number ?? 0) > 0) ||
    seasons[0];
  const seasonNumber =
    selectedSeasonNumber ?? (defaultSeason ? Number(defaultSeason.season_number ?? 0) : null);
  const episodeNumber = selectedEpisodeNumber ?? 1;
  const imdbId = externalIdsQuery.data?.imdb_id || media?.external_ids?.imdb_id;
  const playerUrl =
    imdbId && seasonNumber !== null
      ? `https://autoembed.me/tv/imdb/${encodeURIComponent(imdbId)}-${seasonNumber}-${episodeNumber}`
      : null;
  const detailsPath =
    location.state?.from === `/anime/tv/${id}` ? location.state.from : `/tv/${id}`;

  useDocumentTitle(media ? `${title} · Watch TV` : 'Watch TV');

  if (detailsQuery.isLoading) {
    return (
      <main className="mx-auto min-h-screen max-w-[1600px] px-4 py-10 sm:px-7 xl:px-10">
        <div className="skeleton aspect-video w-full rounded-2xl" aria-label="Loading TV show" />
      </main>
    );
  }

  if (detailsQuery.error) {
    return (
      <main className="mx-auto min-h-screen max-w-[1600px] px-4 py-8 sm:px-7 xl:px-10">
        <Link to={detailsPath} className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-white/75 hover:bg-white/10 hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to show
        </Link>
        <ErrorState error={detailsQuery.error} onRetry={() => detailsQuery.refetch()} />
      </main>
    );
  }

  if (!media) {
    return (
      <main className="mx-auto min-h-screen max-w-[1600px] px-4 py-8 sm:px-7 xl:px-10">
        <Link to="/tv" className="mb-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-xs font-semibold text-white/75 hover:bg-white/10 hover:text-white">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to TV shows
        </Link>
        <EmptyState title="TV show not found" message="This TV show could not be loaded." />
      </main>
    );
  }

  const poster = getPosterPath(media);
  const activeSeason = seasons.find((season) => Number(season.season_number) === seasonNumber);

  return (
    <div className="mx-auto min-h-screen max-w-[1600px] space-y-6 px-4 pb-20 pt-6 text-white sm:px-7 xl:px-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to={detailsPath}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/75 transition hover:bg-white/10 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to show
        </Link>
        {playerUrl ? (
          <a
            href={playerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-xs font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            Open provider <ExternalLink className="h-3.5 w-3.5" />
          </a>
        ) : null}
      </div>

      <div className={`grid min-w-0 grid-cols-1 items-start gap-6 ${seasons.length ? 'xl:grid-cols-[minmax(0,1fr)_390px]' : ''}`}>
        <main className="min-w-0">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl shadow-black/30">
            {externalIdsQuery.isLoading && !imdbId ? (
              <div className="skeleton aspect-video w-full" aria-label="Loading show ID" />
            ) : externalIdsQuery.error && !imdbId ? (
              <div className="p-4">
                <ErrorState
                  error={externalIdsQuery.error}
                  onRetry={() => externalIdsQuery.refetch()}
                  compact
                />
              </div>
            ) : (
              <VideoPlayer
                imdbId={imdbId}
                title={`${title} · S${seasonNumber ?? 1}E${episodeNumber}`}
                mediaType="tv"
                seasonNumber={seasonNumber}
                episodeNumber={episodeNumber}
              />
            )}
          </div>

          <div className="mt-5">
            <h1 className="break-words text-2xl font-bold tracking-tight text-white sm:text-3xl">
              {title}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/50">
              {getYear(media) ? <span>{getYear(media)}</span> : null}
              <span>TV series</span>
              {seasonNumber !== null ? (
                <span>
                  Season {seasonNumber} · Episode {episodeNumber}
                </span>
              ) : null}
              {activeSeason?.air_date ? <span>{String(activeSeason.air_date).slice(0, 4)}</span> : null}
            </div>

            <section className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
              {getBackdropPath(media) ? (
                <div className="relative h-28 sm:h-40">
                  <BackdropImage
                    path={getBackdropPath(media)}
                    title={title}
                    className="opacity-40"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101014] to-black/10" />
                </div>
              ) : null}
              <div className="flex gap-4 p-4 sm:p-5">
                {poster ? (
                  <div className="hidden h-28 w-20 shrink-0 overflow-hidden rounded-lg sm:block">
                    <PosterImage path={poster} title={title} size="w342" />
                  </div>
                ) : null}
                <div className="min-w-0">
                  <h2 className="text-sm font-semibold text-white">About this show</h2>
                  <p className="mt-2 whitespace-pre-line text-sm leading-6 text-white/55">
                    {media.overview || 'No description is available for this show yet.'}
                  </p>
                  {Array.isArray(media.genres) && media.genres.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {media.genres.map((genre) => (
                        <span
                          key={genre.id || genre.name}
                          className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/50"
                        >
                          {genre.name}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </section>

            <div className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-white/40">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              If the embedded player is blank or blocked, use “Open provider”. Playback availability is controlled by AutoEmbed and its providers.
            </div>
          </div>
        </main>

        {seasons.length ? (
          <aside className="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
            <div className="border-b border-white/10 p-4">
              <h2 className="font-semibold text-white">Seasons & episodes</h2>
              <p className="mt-1 text-[11px] text-white/40">
                {seasons.length} seasons · choose an episode to play
              </p>
            </div>
            <div className="max-h-[760px] space-y-2 overflow-y-auto p-2">
              {seasons.map((season) => {
                const seasonValue = Number(season.season_number ?? 0);
                const isOpen =
                  expandedSeasons[seasonValue] ?? seasonValue === seasonNumber;

                return (
                  <SeasonEpisodeGroup
                    key={season.id || seasonValue}
                    showId={id}
                    season={season}
                    isOpen={isOpen}
                    selectedSeasonNumber={seasonNumber}
                    selectedEpisodeNumber={episodeNumber}
                    fallbackPoster={poster ? posterUrl(poster, 'w300') : null}
                    onToggle={() =>
                      setExpandedSeasons((previous) => ({
                        ...previous,
                        [seasonValue]: !isOpen,
                      }))
                    }
                    onSelectEpisode={(nextSeasonNumber, nextEpisodeNumber) => {
                      setSelectedSeasonNumber(nextSeasonNumber);
                      setSelectedEpisodeNumber(nextEpisodeNumber);
                      setExpandedSeasons((previous) => ({
                        ...previous,
                        [nextSeasonNumber]: true,
                      }));
                    }}
                  />
                );
              })}
            </div>
          </aside>
        ) : (
          <EmptyState
            title="No seasons available"
            message="No season information is available for this show."
          />
        )}
      </div>
    </div>
  );
};

export default WatchTVNow;
