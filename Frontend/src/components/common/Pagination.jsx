import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatCount } from '../../utils/formatters';

export const Pagination = ({
  hasNextPage,
  isLoading,
  onLoadMore,
  shown = 0,
  total = 0,
  className,
}) => {
  if (!hasNextPage && shown === 0) return null;

  return (
    <div className={cn('flex flex-col items-center gap-2 pt-8', className)}>
      {hasNextPage ? (
        <button
          type="button"
          onClick={onLoadMore}
          disabled={isLoading}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.045] px-6 text-xs font-semibold text-white transition hover:-translate-y-0.5 hover:border-accent/40 hover:bg-white/[0.08] disabled:translate-y-0 disabled:opacity-60"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
          {isLoading ? 'Loading more' : 'Load more'}
        </button>
      ) : (
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted/70">
          You have reached the end
        </p>
      )}
      <p className="text-[11px] text-muted" aria-live="polite">
        Showing {formatCount(shown)}
        {total ? ` of ${formatCount(total)}` : ''} titles
      </p>
    </div>
  );
};

export default Pagination;
