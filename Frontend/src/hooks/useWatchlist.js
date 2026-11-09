import { useCallback, useMemo, useSyncExternalStore } from 'react';
import {
  clearWatchlist,
  getSnapshot,
  isInWatchlist,
  subscribe,
  toggleWatchlist,
  watchlistKey,
} from '../store/watchlist';
import { getTitle } from '../utils/formatters';
import { useToast } from '../providers/ToastProvider';

export const useWatchlist = () => {
  const items = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  const { notify } = useToast();

  const savedKeys = useMemo(
    () => new Set(items.map((item) => `${item.mediaType}:${item.id}`)),
    [items]
  );

  const isSaved = useCallback(
    (item) => savedKeys.has(watchlistKey(item)),
    [savedKeys]
  );

  const toggle = useCallback(
    (item) => {
      const wasSaved = isInWatchlist(item);
      const saved = toggleWatchlist(item);

      if (saved) notify(`${getTitle(item)} added to My List`, 'success');
      else if (wasSaved) notify(`${getTitle(item)} removed from My List`, 'default');
    },
    [notify]
  );

  const clear = useCallback(() => {
    clearWatchlist();
    notify('My List cleared', 'default');
  }, [notify]);

  return {
    items,
    count: items.length,
    isSaved,
    toggle,
    clear,
  };
};
