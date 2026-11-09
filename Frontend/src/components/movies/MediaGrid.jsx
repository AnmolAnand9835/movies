import { Film, SearchX } from 'lucide-react';
import MediaCard from './MediaCard';
import PersonCard from './PersonCard';
import EmptyState from '../common/EmptyState';
import ErrorState from '../common/ErrorState';
import { SkeletonGrid } from '../common/Skeleton';
import { getMediaType } from '../../utils/formatters';
import { cn } from '../../utils/cn';

export const MediaGrid = ({
  items = [],
  loading = false,
  error = null,
  onRetry,
  skeletonCount = 10,
  emptyIcon = Film,
  emptyTitle = 'No titles found',
  emptyMessage = 'Try a different filter or check back soon.',
  emptyAction = null,
  className,
}) => {
  if (loading && items.length === 0) {
    return <SkeletonGrid count={skeletonCount} className={className} />;
  }

  if (error && items.length === 0) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  if (!items.length) {
    return (
      <EmptyState
        icon={emptyIcon === 'search' ? SearchX : emptyIcon}
        title={emptyTitle}
        message={emptyMessage}
        action={emptyAction}
      />
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-x-2 gap-y-4 sm:grid-cols-3 sm:gap-x-3 sm:gap-y-6 md:grid-cols-4 lg:grid-cols-5',
        className
      )}
      aria-busy={loading}
    >
      {items.map((item) => {
        const key = `${getMediaType(item) || 'title'}-${item.id}`;
        if (getMediaType(item) === 'person') {
          return <PersonCard key={key} item={item} />;
        }
        return <MediaCard key={key} item={item} />;
      })}
    </div>
  );
};

export default MediaGrid;
