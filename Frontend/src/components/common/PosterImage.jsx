import { useEffect, useState } from 'react';
import { Film, ImageOff, UserRound } from 'lucide-react';
import { posterSrcSet, posterUrl, backdropSrcSet, backdropUrl, profileSrcSet, profileUrl } from '../../utils/image';
import { getInitials } from '../../utils/formatters';
import { cn } from '../../utils/cn';

export const PosterImage = ({
  path,
  title,
  className,
  size = 'w342',
  loading = 'lazy',
  fetchPriority,
}) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [path]);

  if (!path || failed) {
    return (
      <div
        role="img"
        aria-label={`${title || 'Title'} poster unavailable`}
        className={cn(
          'flex h-full w-full flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_50%_30%,#26364d,#111b2a)] text-muted',
          className
        )}
      >
        <Film className="h-8 w-8 opacity-45" aria-hidden="true" />
        <span className="max-w-[80%] truncate text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">
          {title || 'No artwork'}
        </span>
      </div>
    );
  }

  return (
    <img
      src={posterUrl(path, size)}
      srcSet={posterSrcSet(path)}
      sizes="(min-width: 1280px) 18vw, (min-width: 768px) 23vw, 44vw"
      alt={`${title} poster`}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
      className={cn('h-full w-full object-cover', className)}
    />
  );
};

export const BackdropImage = ({
  path,
  title,
  className,
  loading = 'eager',
  fetchPriority = 'high',
}) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [path]);

  if (!path || failed) {
    return (
      <div
        role="img"
        aria-label={`${title || 'Title'} backdrop unavailable`}
        className={cn(
          'h-full w-full bg-[radial-gradient(circle_at_70%_20%,rgba(89,115,177,.28),transparent_45%),linear-gradient(135deg,#1b2a40,#0a101b)]',
          className
        )}
      >
        <div className="flex h-full w-full items-center justify-center">
          <ImageOff className="h-10 w-10 text-white/10" aria-hidden="true" />
        </div>
      </div>
    );
  }

  return (
    <img
      src={backdropUrl(path)}
      srcSet={backdropSrcSet(path)}
      sizes="100vw"
      alt={`${title} backdrop`}
      loading={loading}
      fetchPriority={fetchPriority}
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
      className={cn('h-full w-full object-cover', className)}
    />
  );
};

export const ProfileImage = ({ path, name, className, size = 'w185' }) => {
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [path]);

  if (!path || failed) {
    return (
      <div
        role="img"
        aria-label={`${name || 'Person'} portrait unavailable`}
        className={cn(
          'flex h-full w-full items-center justify-center bg-[linear-gradient(135deg,#2b3d57,#141f30)] text-sm font-bold text-white/60',
          className
        )}
      >
        {name ? getInitials(name) : <UserRound className="h-6 w-6 opacity-50" />}
      </div>
    );
  }

  return (
    <img
      src={profileUrl(path, size)}
      srcSet={profileSrcSet(path)}
      sizes="96px"
      alt={`${name} portrait`}
      loading="lazy"
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
      className={cn('h-full w-full object-cover', className)}
    />
  );
};
