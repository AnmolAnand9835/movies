import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Bookmark,
  BookmarkCheck,
  CalendarDays,
  Clock3,
  ExternalLink,
  Film,
  Play,
  Star,
  Users,
} from 'lucide-react';
import { BackdropImage, PosterImage, ProfileImage } from '../components/common/PosterImage';
import TrailerModal from '../components/common/TrailerModal';
import MediaRow from '../components/movies/MediaRow';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import SectionHeader from '../components/common/SectionHeader';
import Skeleton, { SkeletonDetails } from '../components/common/Skeleton';
import { useWatchlist } from '../hooks/useWatchlist';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  getMovieCredits,
  getMovieDetails,
  getMovieRecommendations,
  getMovieSimilar,
  getMovieVideos,
} from '../api/movies.api';
import {
  getTVDetails,
  getTVRecommendations,
  getTVSimilar,
} from '../api/tv.api';
import { queryKeys } from '../utils/queryKeys';
import {
  formatCount,
  formatCurrency,
  formatDate,
  formatRating,
  formatRuntime,
  getBackdropPath,
  getCountryName,
  getEpisodeLabel,
  getLanguageName,
  getMediaLabel,
  getPosterPath,
  getProfilePath,
  getRating,
  getTitle,
  getTrailer,
  getYear,
} from '../utils/formatters';
import { cn } from '../utils/cn';

const AutoEmbed = ({ autoEmbed }) => {
  if (!autoEmbed?.success || !autoEmbed.data) return null;

  const { data } = autoEmbed;

  return (
    <section className="my-8 rounded-2xl border border-white/[0.08] bg-white/[0.023] p-5">
      <h2 className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-muted">
        <Film className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
        Auto-Embed Stream
      </h2>
      <div className="space-y-4">
        {data.iframe_code ? (
          <iframe
            src={data.iframe_code}
            title="Auto-Embed stream"
            width="100%"
            height="400"
            allowFullScreen
            className="w-full rounded-lg border border-white/[0.08] bg-white/[0.023]"
          />
        ) : null}
        {data.direct_link ? (
          <a
            href={data.direct_link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.023] p-2 text-xs font-semibold text-muted transition hover:border-white/20 hover:text-white"
          >
            Watch Now
            <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
          </a>
        ) : null}
        {data.providers && Object.keys(data.providers).length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(data.providers).map(([key, provider]) => (
              <div
                key={key}
                className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.023] px-3 py-1"
              >
                <span className="text-[9px] text-muted/70">{key}</span>
                <span className="text-[9px] font-medium">
                  {provider.name || provider.label || key}
                </span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
};

const Fact = ({ label, children }) => {
  if (!children) return null;
  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <dt className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted/70">
        {label}
      </dt>
      <dd className="mt-1 break-words text-[11px] font-medium leading-5 text-white/80">
        {children}
      </dd>
    </div>
  );
};

const CastCard = ({ person }) => {
  const character = person.character || person.roles?.[0]?.character || '';

  return (
    <Link
      to={`/person/${person.id}`}
      className="group block w-[92px] shrink-0 text-center"
      aria-label={`View profile for ${person.name}`}
    >
      <div className="mx-auto h-[76px] w-[76px] overflow-hidden rounded-full border border-white/[0.12] bg-raised shadow-lg transition group-hover:border-white/30">
        <ProfileImage
          path={getProfilePath(person)}
          name={person.name}
          size="h632"
          className="transition duration-500 group-hover:scale-105"
        />
      </div>
      <p className="mt-2 line-clamp-2 text-[11px] font-semibold leading-4 text-mist transition group-hover:text-white">
        {person.name}
      </p>
      {character ? (
        <p className="mt-0.5 line-clamp-2 text-[9px] leading-4 text-muted">{character}</p>
      ) : null}
    </Link>
  );
};

const Details = ({ mediaType = 'movie', isAnime = false }) => {
  const { id } = useParams();
  const isTV = mediaType === 'tv';
  const [trailerKey, setTrailerKey] = useState(null);
  const { isSaved, toggle } = useWatchlist();

  const detailsQuery = useQuery({
    queryKey: isTV ? queryKeys.tvDetails(id) : queryKeys.movieDetails(id),
    queryFn: ({ signal }) =>
      isTV ? getTVDetails({ id, signal }) : getMovieDetails({ id, signal }),
    enabled: Boolean(id),
  });

  const details = detailsQuery.data;
  const extrasEnabled = Boolean(details);

  const creditsQuery = useQuery({
    queryKey: queryKeys.movieCredits(id),
    queryFn: ({ signal }) => getMovieCredits({ id, signal }),
    enabled: !isTV && extrasEnabled,
  });

  const videosQuery = useQuery({
    queryKey: queryKeys.movieVideos(id),
    queryFn: ({ signal }) => getMovieVideos({ id, signal }),
    enabled: !isTV && extrasEnabled,
  });

  const similarQuery = useQuery({
    queryKey: isTV ? queryKeys.tvSimilar(id) : queryKeys.movieSimilar(id),
    queryFn: ({ signal }) =>
      isTV
        ? getTVSimilar({ id, page: 1, signal })
        : getMovieSimilar({ id, page: 1, signal }),
    enabled: extrasEnabled,
  });

  const recommendationsQuery = useQuery({
    queryKey: isTV
      ? queryKeys.tvRecommendations(id)
      : queryKeys.movieRecommendations(id),
    queryFn: ({ signal }) =>
      isTV
        ? getTVRecommendations({ id, page: 1, signal })
        : getMovieRecommendations({ id, page: 1, signal }),
    enabled: extrasEnabled,
  });

  const media = details
    ? { ...details, media_type: mediaType, source: isAnime ? 'anime' : null }
    : null;

  useDocumentTitle(media ? getTitle(media) : 'Details');

  useEffect(() => {
    setTrailerKey(null);
  }, [id, mediaType]);

  if (detailsQuery.isLoading) return <SkeletonDetails />;

  const backTo = isAnime ? '/anime' : isTV ? '/tv' : '/movies';
  const backLabel = isAnime ? 'Back to anime' : isTV ? 'Back to TV shows' : 'Back to movies';

  if (detailsQuery.error) {
    return (
      <div className="mx-auto max-w-[1500px] px-5 pb-20 pt-8 sm:px-8 xl:px-12">
        <Link
          to={backTo}
          className="mb-5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted transition hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          {backLabel}
        </Link>
        <ErrorState
          error={detailsQuery.error}
          onRetry={() => detailsQuery.refetch()}
        />
      </div>
    );
  }

  if (!media) {
    return (
      <div className="mx-auto max-w-[1500px] px-5 pb-20 pt-8 sm:px-8 xl:px-12">
        <Link
          to={backTo}
          className="mb-5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted transition hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          {backLabel}
        </Link>
        <EmptyState
          icon={Film}
          title="Title not found"
          message="This title could not be loaded from the CineAtlas API."
        />
      </div>
    );
  }

  const title = getTitle(media);
  const year = getYear(media);
  const rating = getRating(media);
  const mediaLabel = getMediaLabel(media);
  const genres = Array.isArray(media.genres) ? media.genres : [];
  const cast = isTV ? details?.credits?.cast || [] : creditsQuery.data?.cast || [];
  const crew = isTV ? details?.credits?.crew || [] : creditsQuery.data?.crew || [];
  const videos = isTV ? details?.videos : videosQuery.data;
  const trailer = getTrailer(videos?.results);
  const saved = isSaved(media);
  const runtimeText = isTV ? getEpisodeLabel(media) : formatRuntime(media.runtime);
  const releaseDate = isTV ? media.first_air_date : media.release_date;

  const countries = (
    Array.isArray(media.production_countries) && media.production_countries.length
      ? media.production_countries.map((country) => country.name || getCountryName(country.iso_3166_1))
      : (media.origin_country || []).map(getCountryName)
  ).filter(Boolean);

  const companies = (media.production_companies || [])
    .map((company) => company.name)
    .filter(Boolean);
  const networks = (media.networks || []).map((network) => network.name).filter(Boolean);
  const creatorNames = Array.from(
    new Set((media.created_by || []).map((creator) => creator.name).filter(Boolean))
  );
  const directorNames = Array.from(
    new Set(
      crew
        .filter((member) => member.job === 'Director')
        .map((member) => member.name)
        .filter(Boolean)
    )
  );
  const writerNames = Array.from(
    new Set(
      crew
        .filter((member) => ['Writer', 'Screenplay', 'Story'].includes(member.job))
        .map((member) => member.name)
        .filter(Boolean)
    )
  ).slice(0, 4);

  const similarItems = similarQuery.data?.items || [];
  const recommendationItems = recommendationsQuery.data?.items || [];
  const showCastSkeleton = !isTV && creditsQuery.isLoading;
  const showCastSection =
    cast.length > 0 || showCastSkeleton || (!isTV && Boolean(creditsQuery.error));

  return (
    <article>
      <section className="relative overflow-hidden border-b border-line">
        <div className="absolute inset-0">
          <BackdropImage
            path={getBackdropPath(media)}
            title={title}
            className="object-[55%_center] sm:object-center"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(10,16,27,0.98)_0%,rgba(10,16,27,0.84)_38%,rgba(10,16,27,0.25)_78%,rgba(10,16,27,0.5)_100%)]" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/40" />

        <div className="relative mx-auto flex min-h-[560px] max-w-[1500px] flex-col px-5 pb-10 pt-5 sm:px-8 sm:pb-12 xl:px-12">
          <Link
            to={backTo}
            className="inline-flex w-fit items-center gap-1.5 rounded-lg py-1 text-[11px] font-semibold text-white/60 transition hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {backLabel}
          </Link>

          <div className="mt-auto grid gap-6 pt-12 sm:grid-cols-[160px_1fr] lg:grid-cols-[230px_1fr] lg:gap-9">
            <div className="w-[130px] sm:w-full">
              <div className="aspect-[2/3] overflow-hidden rounded-2xl border border-white/15 bg-raised shadow-[0_24px_70px_rgba(0,0,0,0.45)]">
                <PosterImage
                  path={getPosterPath(media)}
                  title={title}
                  size="w500"
                  loading="eager"
                  fetchPriority="high"
                />
              </div>
            </div>

            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-accent/85">
                <span>{mediaLabel}</span>
                {year ? (
                  <>
                    <span className="text-white/25">/</span>
                    <span>{year}</span>
                  </>
                ) : null}
              </div>

              <h1 className="max-w-3xl text-3xl font-semibold leading-[1.02] tracking-[-0.055em] text-white sm:text-5xl lg:text-6xl">
                {title}
              </h1>

              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] font-medium text-white/65">
                <span className="inline-flex items-center gap-1.5 text-gold">
                  <Star className="h-4 w-4 fill-current" aria-hidden="true" />
                  <strong className="font-semibold text-white">{formatRating(rating)}</strong>
                  <span className="font-normal text-white/45">
                    ({formatCount(media.vote_count || 0)} votes)
                  </span>
                </span>
                {runtimeText ? (
                  <>
                    <span className="h-3.5 w-px bg-white/25" />
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 className="h-3.5 w-3.5 text-white/45" aria-hidden="true" />
                      {runtimeText}
                    </span>
                  </>
                ) : null}
                {releaseDate ? (
                  <>
                    <span className="h-3.5 w-px bg-white/25" />
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5 text-white/45" aria-hidden="true" />
                      {formatDate(releaseDate)}
                    </span>
                  </>
                ) : null}
              </div>

              {genres.length ? (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {genres.slice(0, 5).map((genre) =>
                    isTV ? (
                      <span
                        key={genre.id}
                        className="rounded-full border border-white/[0.12] bg-white/[0.055] px-3 py-1 text-[10px] font-semibold text-white/70 backdrop-blur-md"
                      >
                        {genre.name}
                      </span>
                    ) : (
                      <Link
                        key={genre.id}
                        to={`/movies?genre=${genre.id}`}
                        className="rounded-full border border-white/[0.12] bg-white/[0.055] px-3 py-1 text-[10px] font-semibold text-white/70 backdrop-blur-md transition hover:border-white/30 hover:text-white"
                      >
                        {genre.name}
                      </Link>
                    )
                  )}
                </div>
              ) : null}

              {media.tagline ? (
                <p className="mt-4 max-w-2xl text-sm italic leading-6 text-white/55">
                  “{media.tagline}”
                </p>
              ) : null}

              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                {!isTV ? (
                  <Link
                    to={`/watch-now/${media.id}`}
                    state={{ from: isAnime ? `/anime/movie/${id}` : `/movie/${id}` }}
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-5 text-xs font-bold text-[#111B2A] shadow-soft-accent transition hover:-translate-y-0.5 hover:bg-accent-strong focus-visible:outline-offset-4"
                  >
                    <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                    Watch now
                  </Link>
                ) : null}

                {trailer ? (
                  <button
                    type="button"
                    onClick={() => setTrailerKey(trailer.key)}
                    className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent px-5 text-xs font-bold text-[#111B2A] shadow-soft-accent transition hover:-translate-y-0.5 hover:bg-accent-strong"
                  >
                    <Play className="h-4 w-4 fill-current" aria-hidden="true" />
                    Watch trailer
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={() => toggle(media)}
                  className={cn(
                    'inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-xs font-semibold backdrop-blur-md transition hover:-translate-y-0.5',
                    saved
                      ? 'border-accent/45 bg-accent/15 text-accent-strong'
                      : 'border-white/20 bg-black/25 text-white/85 hover:border-white/40 hover:bg-white/10'
                  )}
                  aria-label={`${saved ? 'Remove' : 'Add'} ${title} ${saved ? 'from' : 'to'} My List`}
                >
                  {saved ? (
                    <BookmarkCheck className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Bookmark className="h-4 w-4" aria-hidden="true" />
                  )}
                  {saved ? 'In My List' : 'Add to My List'}
                </button>

                {media.homepage ? (
                  <a
                    href={media.homepage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-black/20 px-4 text-xs font-semibold text-white/75 backdrop-blur-md transition hover:border-white/30 hover:text-white"
                  >
                    Official site
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1500px] px-5 pb-20 pt-9 sm:px-8 xl:px-12">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_330px] xl:gap-14">
          <div className="min-w-0 space-y-12">
            <section aria-labelledby="storyline-title">
              <SectionHeader eyebrow="The story" title="Storyline" id="storyline-title" />
              <p className="max-w-3xl text-sm leading-7 text-muted">
                {media.overview || 'No overview is available for this title yet.'}
              </p>
            </section>

            {showCastSection ? (
              <section aria-labelledby="cast-title">
                <SectionHeader
                  eyebrow="Performers"
                  title="Top Cast"
                  id="cast-title"
                />
                {creditsQuery.error && !isTV ? (
                  <ErrorState
                    error={creditsQuery.error}
                    onRetry={() => creditsQuery.refetch()}
                    compact
                  />
                ) : showCastSkeleton ? (
                  <div className="scroll-row flex gap-4 overflow-hidden">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <div key={index} className="w-[92px] shrink-0 space-y-2 text-center">
                        <Skeleton className="mx-auto h-[76px] w-[76px] rounded-full" />
                        <Skeleton className="mx-auto h-2.5 w-16" />
                        <Skeleton className="mx-auto h-2 w-12" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <ul className="scroll-row flex gap-4 overflow-x-auto pb-2">
                    {cast.slice(0, 14).map((member) => (
                      <li key={`${member.credit_id || member.id}-${member.character || ''}`}>
                        <CastCard person={member} />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ) : null}

            {similarQuery.isLoading ||
            similarQuery.error ||
            similarItems.length ? (
              <MediaRow
                title="More Like This"
                eyebrow="Close in spirit"
                items={similarItems}
                isLoading={similarQuery.isLoading}
                error={similarQuery.error}
                onRetry={() => similarQuery.refetch()}
                limit={10}
                emptyMessage="No similar titles were returned."
              />
            ) : null}

            {recommendationsQuery.isLoading ||
            recommendationsQuery.error ||
            recommendationItems.length ? (
              <MediaRow
                title="Recommended Next"
                eyebrow="From the same orbit"
                items={recommendationItems}
                isLoading={recommendationsQuery.isLoading}
                error={recommendationsQuery.error}
                onRetry={() => recommendationsQuery.refetch()}
                limit={10}
                emptyMessage="No recommendations were returned."
              />
            ) : null}
          </div>

          <aside className="space-y-4 self-start">
            <section
              className="rounded-2xl border border-white/[0.08] bg-white/[0.023] p-5"
              aria-labelledby="details-facts-title"
            >
              <h2
                id="details-facts-title"
                className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted"
              >
                Details
              </h2>
              <dl className="mt-4 divide-y divide-white/[0.055]">
                <Fact label="Status">{media.status}</Fact>
                <Fact label={isTV ? 'First aired' : 'Release date'}>
                  {formatDate(releaseDate)}
                </Fact>
                <Fact label="Original language">
                  {getLanguageName(media.original_language)}
                </Fact>
                <Fact label="Country">{countries.join(', ')}</Fact>
                {isTV ? (
                  <>
                    <Fact label="Seasons">
                      {media.number_of_seasons
                        ? `${media.number_of_seasons} ${
                            media.number_of_seasons === 1 ? 'season' : 'seasons'
                          }`
                        : ''}
                    </Fact>
                    <Fact label="Episodes">
                      {media.number_of_episodes
                        ? formatCount(media.number_of_episodes)
                        : ''}
                    </Fact>
                    <Fact label="Networks">{networks.join(', ')}</Fact>
                    <Fact label="Format">{media.type}</Fact>
                  </>
                ) : (
                  <>
                    <Fact label="Runtime">{formatRuntime(media.runtime)}</Fact>
                    <Fact label="Budget">
                      {formatCurrency(media.budget, 'USD')}
                    </Fact>
                    <Fact label="Revenue">
                      {formatCurrency(media.revenue, 'USD')}
                    </Fact>
                  </>
                )}
                <Fact label="Production">
                  {companies.slice(0, 5).join(', ')}
                </Fact>
              </dl>
            </section>

            {(isTV ? creatorNames.length : directorNames.length || writerNames.length) ? (
              <section
                className="rounded-2xl border border-white/[0.08] bg-white/[0.023] p-5"
                aria-labelledby="key-crew-title"
              >
                <h2
                  id="key-crew-title"
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.24em] text-muted"
                >
                  <Users className="h-3.5 w-3.5 text-accent" aria-hidden="true" />
                  Key credits
                </h2>
                <dl className="mt-4 divide-y divide-white/[0.055]">
                  {isTV ? <Fact label="Created by">{creatorNames.join(', ')}</Fact> : null}
                  {!isTV ? <Fact label="Director">{directorNames.join(', ')}</Fact> : null}
                  {!isTV ? <Fact label="Writers">{writerNames.join(', ')}</Fact> : null}
                </dl>
              </section>
            ) : null}

            {media.homepage ? (
              <a
                href={media.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.023] p-4 text-xs font-semibold text-muted transition hover:border-white/20 hover:text-white"
              >
                Visit the official website
                <ExternalLink className="h-4 w-4 shrink-0" aria-hidden="true" />
              </a>
            ) : null}
            {media.auto_embed && (
              <AutoEmbed autoEmbed={media.auto_embed} />
            )}
            {/* Direct Watch Now button */}
            {media.auto_embed && media.auto_embed.success && media.auto_embed.data.direct_link && (
              <a
                href={media.auto_embed.data.direct_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 rounded-2xl border border-primary bg-primary/10 text-primary p-3 text-xs font-semibold font-bold text-primary transition border-primary/50 hover:border-primary hover:text-primary w-full mb-4"
              >
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-primary" aria-hidden="true" />
                  <span>Watch Now on AutoEmbed</span>
                </div>
                <ExternalLink className="h-4 w-4 shrink-0 opacity-60" aria-hidden="true" />
              </a>
            )}
          </aside>
        </div>
      </div>

      <TrailerModal
        videoKey={trailerKey}
        title={title}
        onClose={() => setTrailerKey(null)}
      />
    </article>
  );
};

export default Details;
