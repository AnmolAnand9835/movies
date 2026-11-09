import { cn } from '../../utils/cn';

export const GenreFilter = ({
  genres = [],
  activeGenre = 'all',
  onChange,
  loading = false,
  className,
}) => {
  if (loading) {
    return (
      <div className={cn('flex flex-wrap gap-2', className)} aria-hidden="true">
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="skeleton h-8 w-20 rounded-full" />
        ))}
      </div>
    );
  }

  if (!genres.length) return null;

  return (
    <div
      className={cn('scroll-row flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible', className)}
      role="group"
      aria-label="Filter by genre"
    >
      <button
        type="button"
        onClick={() => onChange('all')}
        aria-pressed={activeGenre === 'all'}
        className={cn(
          'shrink-0 rounded-full border px-4 py-2 text-[11px] font-semibold transition',
          activeGenre === 'all'
            ? 'border-accent bg-accent text-[#121B2B]'
            : 'border-white/[0.16] bg-white/[0.018] text-muted hover:border-white/35 hover:text-mist'
        )}
      >
        All
      </button>
      {genres.map((genre) => (
        <button
          key={genre.id}
          type="button"
          onClick={() => onChange(String(genre.id))}
          aria-pressed={activeGenre === String(genre.id)}
          className={cn(
            'shrink-0 rounded-full border px-4 py-2 text-[11px] font-semibold transition',
            activeGenre === String(genre.id)
              ? 'border-accent bg-accent text-[#121B2B]'
              : 'border-white/[0.16] bg-white/[0.018] text-muted hover:border-white/35 hover:text-mist'
          )}
        >
          {genre.name}
        </button>
      ))}
    </div>
  );
};

export default GenreFilter;
