import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Clapperboard, MapPin, UserRound } from 'lucide-react';
import MediaGrid from '../components/movies/MediaGrid';
import MediaRow from '../components/movies/MediaRow';
import Tabs from '../components/common/Tabs';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import Skeleton from '../components/common/Skeleton';
import { ProfileImage } from '../components/common/PosterImage';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getPerson, getPersonCredits } from '../api/people.api';
import { queryKeys } from '../utils/queryKeys';
import { formatDate, getProfilePath } from '../utils/formatters';

const dedupeCredits = (credits = []) => {
  const seen = new Set();
  return credits.filter((credit) => {
    if (!credit?.id || !credit?.media_type) return false;
    if (credit.media_type !== 'movie' && credit.media_type !== 'tv') return false;
    const key = `${credit.media_type}:${credit.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const byPopularity = (a, b) =>
  (Number(b.popularity) || 0) - (Number(a.popularity) || 0) ||
  (Number(b.vote_count) || 0) - (Number(a.vote_count) || 0);

const byNewest = (a, b) =>
  String(b.release_date || b.first_air_date || '').localeCompare(
    String(a.release_date || a.first_air_date || '')
  );

const Person = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [bioExpanded, setBioExpanded] = useState(false);
  const [creditType, setCreditType] = useState('acting');
  const [showAllCredits, setShowAllCredits] = useState(false);

  const personQuery = useQuery({
    queryKey: queryKeys.person(id),
    queryFn: ({ signal }) => getPerson({ id, signal }),
    enabled: Boolean(id),
  });

  const creditsQuery = useQuery({
    queryKey: queryKeys.personCredits(id),
    queryFn: ({ signal }) => getPersonCredits({ id, signal }),
    enabled: Boolean(id) && Boolean(personQuery.data),
  });

  const person = personQuery.data;
  useDocumentTitle(person?.name || 'Person');

  const acting = useMemo(
    () => dedupeCredits(creditsQuery.data?.cast).sort(byNewest),
    [creditsQuery.data]
  );
  const crew = useMemo(
    () => dedupeCredits(creditsQuery.data?.crew).sort(byNewest),
    [creditsQuery.data]
  );
  const knownFor = useMemo(
    () => dedupeCredits([...(creditsQuery.data?.cast || []), ...(creditsQuery.data?.crew || [])])
      .sort(byPopularity)
      .slice(0, 12),
    [creditsQuery.data]
  );

  if (personQuery.isLoading) {
    return (
      <div className="mx-auto max-w-[1500px] px-5 pb-20 pt-6 sm:px-8 xl:px-12">
        <div className="grid gap-6 rounded-3xl border border-line bg-panel p-6 sm:grid-cols-[220px_1fr] sm:p-8">
          <Skeleton className="aspect-[3/4] w-full max-w-[220px] rounded-2xl" />
          <div className="space-y-4 pt-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-3 w-56" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      </div>
    );
  }

  if (personQuery.error) {
    return (
      <div className="mx-auto max-w-[1500px] px-5 pb-20 pt-10 sm:px-8 xl:px-12">
        <ErrorState
          error={personQuery.error}
          onRetry={() => personQuery.refetch()}
        />
      </div>
    );
  }

  if (!person) {
    return (
      <div className="mx-auto max-w-[1500px] px-5 pb-20 pt-10 sm:px-8 xl:px-12">
        <EmptyState
          icon={UserRound}
          title="Person not found"
          message="This profile could not be loaded from the CineAtlas API."
        />
      </div>
    );
  }

  const biography = person.biography || '';
  const creditTabs = [
    { value: 'acting', label: `Acting · ${acting.length}` },
    ...(crew.length ? [{ value: 'crew', label: `Crew · ${crew.length}` }] : []),
  ];
  const activeCreditType = creditTabs.some((tab) => tab.value === creditType)
    ? creditType
    : 'acting';
  const activeCredits = activeCreditType === 'acting' ? acting : crew;
  const visibleCredits = showAllCredits ? activeCredits : activeCredits.slice(0, 20);

  const handleCreditTypeChange = (type) => {
    setCreditType(type);
    setShowAllCredits(false);
  };

  return (
    <div className="mx-auto max-w-[1500px] space-y-12 px-5 pb-20 pt-5 sm:px-8 xl:px-12">
      <div>
        <button
          type="button"
          onClick={() => navigate(location.key === 'default' ? '/' : -1)}
          className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-muted transition hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back
        </button>

        <section className="noise relative mt-4 overflow-hidden rounded-3xl border border-line bg-[linear-gradient(125deg,#172438,#0e1724)] p-5 sm:p-8">
          <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl" />
          <div className="relative grid gap-6 sm:grid-cols-[180px_1fr] lg:grid-cols-[230px_1fr] lg:gap-9">
            <div className="w-[140px] sm:w-full">
              <div className="aspect-[3/4] overflow-hidden rounded-2xl border border-white/[0.12] bg-raised shadow-2xl">
                <ProfileImage
                  path={getProfilePath(person)}
                  name={person.name}
                  size="h632"
                />
              </div>
            </div>

            <div className="min-w-0 self-center">
              <p className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.26em] text-accent/85">
                <Clapperboard className="h-3.5 w-3.5" aria-hidden="true" />
                {person.known_for_department || 'Film & television'}
              </p>
              <h1 className="text-3xl font-semibold tracking-[-0.05em] text-white sm:text-4xl lg:text-5xl">
                {person.name}
              </h1>

              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[11px] text-muted">
                {person.birthday ? (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 text-accent/70" aria-hidden="true" />
                    {formatDate(person.birthday)}
                    {person.deathday ? ` — ${formatDate(person.deathday)}` : ''}
                  </span>
                ) : null}
                {person.place_of_birth ? (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-accent/70" aria-hidden="true" />
                    {person.place_of_birth}
                  </span>
                ) : null}
              </div>

              {biography ? (
                <div className="mt-5">
                  <p
                    className={`max-w-3xl text-xs leading-6 text-muted sm:text-sm ${
                      bioExpanded ? '' : 'line-clamp-5'
                    }`}
                  >
                    {biography}
                  </p>
                  {biography.length > 420 ? (
                    <button
                      type="button"
                      onClick={() => setBioExpanded((value) => !value)}
                      className="mt-2 text-[11px] font-semibold text-accent transition hover:text-accent-strong"
                      aria-expanded={bioExpanded}
                    >
                      {bioExpanded ? 'Show less' : 'Read full biography'}
                    </button>
                  ) : null}
                </div>
              ) : (
                <p className="mt-5 max-w-xl text-xs leading-6 text-muted">
                  A biography is not available for this person yet.
                </p>
              )}

              {person.also_known_as?.length ? (
                <p className="mt-4 text-[10px] leading-5 text-muted/65">
                  Also known as {person.also_known_as.slice(0, 3).join(', ')}
                </p>
              ) : null}
            </div>
          </div>
        </section>
      </div>

      {knownFor.length ? (
        <MediaRow
          title="Known For"
          eyebrow="Signature work"
          items={knownFor}
          limit={12}
          emptyMessage="No notable credits are available."
        />
      ) : creditsQuery.isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="aspect-[2/3] rounded-2xl" />
            ))}
          </div>
        </div>
      ) : null}

      <section aria-label="Filmography">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-muted">
              Complete filmography
            </p>
            <h2 className="mt-1 text-[21px] font-semibold tracking-[-0.035em] text-mist sm:text-[25px]">
              Credits
            </h2>
          </div>
          {creditTabs.length > 0 ? (
            <Tabs
              options={creditTabs}
              value={activeCreditType}
              onChange={handleCreditTypeChange}
              ariaLabel="Credit types"
            />
          ) : null}
        </div>

        {creditsQuery.error ? (
          <ErrorState
            error={creditsQuery.error}
            onRetry={() => creditsQuery.refetch()}
            compact
          />
        ) : creditsQuery.isLoading ? (
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="aspect-[2/3] rounded-2xl" />
                <Skeleton className="h-3 w-4/5" />
                <Skeleton className="h-2.5 w-1/2" />
              </div>
            ))}
          </div>
        ) : activeCredits.length ? (
          <>
            <MediaGrid items={visibleCredits} />
            <div className="mt-7 flex flex-col items-center gap-2">
              {activeCredits.length > 20 ? (
                <button
                  type="button"
                  onClick={() => setShowAllCredits((value) => !value)}
                  className="inline-flex h-10 items-center rounded-xl border border-white/15 bg-white/[0.045] px-5 text-xs font-semibold text-white transition hover:bg-white/[0.08]"
                >
                  {showAllCredits
                    ? 'Show fewer credits'
                    : `Show all ${activeCredits.length} credits`}
                </button>
              ) : null}
              <p className="text-[11px] text-muted" aria-live="polite">
                Showing {visibleCredits.length} of {activeCredits.length}{' '}
                {activeCreditType === 'acting' ? 'acting' : 'crew'} credits
              </p>
            </div>
          </>
        ) : (
          <EmptyState
            icon={UserRound}
            title="No credits available"
            message="The credits feed did not return any film or television titles for this person."
          />
        )}
      </section>
    </div>
  );
};

export default Person;
