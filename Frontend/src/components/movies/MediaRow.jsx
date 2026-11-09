import { useRef } from 'react';
import { ChevronLeft, ChevronRight, Film } from 'lucide-react';
import MediaCard from './MediaCard';
import SectionHeader from '../common/SectionHeader';
import EmptyState from '../common/EmptyState';
import ErrorState from '../common/ErrorState';
import { SkeletonRow } from '../common/Skeleton';
import { usePrefersReducedMotion } from '../../hooks/useMediaQuery';
import { getMediaType } from '../../utils/formatters';
import { cn } from '../../utils/cn';

export const MediaRow = ({
  title,
  eyebrow,
  description,
  actionTo,
  actionLabel,
  items = [],
  isLoading = false,
  error = null,
  onRetry,
  ranked = false,
  limit = 12,
  skeletonCount = 6,
  emptyMessage = 'Nothing to show here yet.',
  className,
}) => {
  const scrollerRef = useRef(null);
  const reduceMotion = usePrefersReducedMotion();
  const visibleItems = items.slice(0, limit);

  const scroll = (direction) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const amount = Math.max(320, scroller.clientWidth * 0.82);
    scroller.scrollBy({
      left: direction * amount,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };

  const controls = (
    <div className="hidden items-center gap-1.5 md:flex">
      <button
        type="button"
        onClick={() => scroll(-1)}
        aria-label={`Scroll ${title} backwards`}
        className="grid h-8 w-8 place-items-center rounded-full border border-white/[0.12] bg-white/[0.03] text-muted transition hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => scroll(1)}
        aria-label={`Scroll ${title} forwards`}
        className="grid h-8 w-8 place-items-center rounded-full border border-white/[0.12] bg-white/[0.03] text-muted transition hover:border-white/25 hover:bg-white/[0.08] hover:text-white"
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );

  return (
    <section className={cn('min-w-0', className)} aria-label={title}>
      <SectionHeader
        eyebrow={eyebrow}
        title={title}
        description={description}
        actionTo={actionTo}
        actionLabel={actionLabel}
        actions={controls}
      />

      {isLoading ? (
        <SkeletonRow count={skeletonCount} />
      ) : error ? (
        <ErrorState error={error} onRetry={onRetry} compact />
      ) : visibleItems.length === 0 ? (
        <EmptyState
          icon={Film}
          title="No titles yet"
          message={emptyMessage}
          className="py-10"
        />
      ) : (
        <ul
          ref={scrollerRef}
          className="scroll-row -mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2"
          aria-label={`${title} carousel`}
        >
          {visibleItems.map((item, index) => (
            <li
              key={`${getMediaType(item) || 'title'}-${item.id}-${index}`}
              className="w-[150px] shrink-0 snap-start sm:w-[170px] md:w-[185px]"
            >
              <MediaCard item={item} rank={ranked ? index + 1 : null} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default MediaRow;
