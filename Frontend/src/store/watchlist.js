import { getMediaType, getPosterPath, getRating, getTitle, getYear } from '../utils/formatters';

const STORAGE_KEY = 'cineatlas-watchlist-v1';
const listeners = new Set();

const loadItems = () => {
  if (typeof window === 'undefined') return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item) =>
        item &&
        item.id !== undefined &&
        (item.mediaType === 'movie' || item.mediaType === 'tv')
    );
  } catch {
    return [];
  }
};

let items = loadItems();
let snapshot = items;

const persist = () => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    return;
  }
};

const emit = () => {
  snapshot = items;
  listeners.forEach((listener) => listener());
};

export const watchlistKey = (item) => {
  const mediaType = getMediaType(item);
  const id = item?.id;
  return mediaType && id !== undefined ? `${mediaType}:${id}` : '';
};

export const toWatchlistItem = (item) => ({
  id: Number(item.id),
  mediaType: getMediaType(item),
  title: getTitle(item),
  posterPath: getPosterPath(item),
  year: getYear(item),
  rating: getRating(item),
  source: item.source === 'anime' ? 'anime' : null,
  addedAt: Date.now(),
});

export const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const getSnapshot = () => snapshot;

export const isInWatchlist = (item) => {
  const key = watchlistKey(item);
  return Boolean(key) && items.some((entry) => `${entry.mediaType}:${entry.id}` === key);
};

export const addToWatchlist = (item) => {
  const mediaType = getMediaType(item);
  if (mediaType !== 'movie' && mediaType !== 'tv') return false;
  if (isInWatchlist(item)) return true;

  items = [toWatchlistItem(item), ...items];
  persist();
  emit();
  return true;
};

export const removeFromWatchlist = (item) => {
  const key = watchlistKey(item);
  const next = items.filter((entry) => `${entry.mediaType}:${entry.id}` !== key);
  if (next.length === items.length) return false;

  items = next;
  persist();
  emit();
  return true;
};

export const toggleWatchlist = (item) => {
  if (isInWatchlist(item)) {
    removeFromWatchlist(item);
    return false;
  }

  addToWatchlist(item);
  return true;
};

export const clearWatchlist = () => {
  items = [];
  persist();
  emit();
};

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key !== STORAGE_KEY) return;
    items = loadItems();
    emit();
  });
}
