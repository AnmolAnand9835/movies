import { Link } from 'react-router-dom';
import { ArrowUpRight, UserRound } from 'lucide-react';
import { ProfileImage } from '../common/PosterImage';
import { getInitials, getProfilePath } from '../../utils/formatters';
import { cn } from '../../utils/cn';

export const PersonCard = ({ item, className }) => {
  const name = item?.name || 'Unknown person';
  const department = item?.known_for_department || 'Film & television';
  const knownFor = Array.isArray(item?.known_for)
    ? item.known_for
        .map((credit) => credit?.title || credit?.name)
        .filter(Boolean)
        .slice(0, 2)
        .join(', ')
    : '';

  return (
    <article
      className={cn(
        'poster-card group relative overflow-hidden rounded-2xl border',
        className
      )}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-raised">
        <ProfileImage
          path={getProfilePath(item)}
          name={name}
          size="h632"
          className="transition duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#07101d]/88 via-transparent to-black/5" />
        <span className="pointer-events-none absolute left-2.5 top-2.5 z-20 inline-flex items-center gap-1 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.12em] text-white/85 backdrop-blur-md">
          <UserRound className="h-3 w-3" aria-hidden="true" />
          Person
        </span>
        <div className="pointer-events-none absolute inset-x-3 bottom-3 z-20 translate-y-2 opacity-0 transition duration-200 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
          <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-black/55 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-md">
            View profile
            <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
          </span>
        </div>
      </div>

      <div className="p-3">
        <h3 className="truncate text-sm font-semibold text-mist">{name}</h3>
        <p className="mt-1 truncate text-[10px] text-muted">{department}</p>
        {knownFor ? (
          <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-muted/75">
            Known for {knownFor}
          </p>
        ) : (
          <p className="mt-1 text-[10px] text-muted/60">{getInitials(name) || '—'}</p>
        )}
      </div>

      <Link
        to={`/person/${item?.id || ''}`}
        className="absolute inset-0 z-10 rounded-2xl"
        aria-label={`View profile for ${name}`}
      >
        <span className="sr-only">View profile for {name}</span>
      </Link>
    </article>
  );
};

export default PersonCard;
