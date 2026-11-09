export const getTitle = (item) =>
  item?.title ||
  item?.name ||
  item?.original_title ||
  item?.original_name ||
  'Untitled';

export const getMediaType = (item) => item?.media_type || item?.mediaType || null;

export const getReleaseDate = (item) =>
  item?.release_date || item?.first_air_date || item?.releaseDate || '';

export const getYear = (item) => {
  if (item?.year) return String(item.year);
  const date = getReleaseDate(item);
  return date ? String(date).slice(0, 4) : '';
};

export const getRating = (item) => {
  const rating = Number(item?.vote_average ?? item?.rating);
  return Number.isFinite(rating) ? rating : 0;
};

export const formatRating = (value) => {
  const rating = Number(value);
  return Number.isFinite(rating) && rating > 0 ? rating.toFixed(1) : '—';
};

export const formatRuntime = (minutes) => {
  const value = Number(minutes);
  if (!Number.isFinite(value) || value <= 0) return '';
  const hours = Math.floor(value / 60);
  const remainder = value % 60;
  if (!hours) return `${remainder}m`;
  return remainder ? `${hours}h ${String(remainder).padStart(2, '0')}m` : `${hours}h`;
};

export const formatDate = (date, options = {}) => {
  if (!date) return '';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '';
  return new Intl.DateTimeFormat('en', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(parsed);
};

export const formatCount = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return '0';
  return new Intl.NumberFormat('en', { notation: number > 9999 ? 'compact' : 'standard' }).format(
    number
  );
};

export const formatCurrency = (value, currency = 'USD') => {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return '';
  return new Intl.NumberFormat('en', {
    style: 'currency',
    currency,
    notation: number > 999999 ? 'compact' : 'standard',
    maximumFractionDigits: number > 999999 ? 1 : 0,
  }).format(number);
};

export const getLanguageName = (code) => {
  if (!code) return '';
  try {
    return new Intl.DisplayNames(['en'], { type: 'language' }).of(code) || code;
  } catch {
    return code;
  }
};

export const getCountryName = (code) => {
  if (!code) return '';
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code;
  } catch {
    return code;
  }
};

export const getMediaLabel = (item) => {
  const mediaType = getMediaType(item);
  if (mediaType === 'person') return 'Person';
  if (mediaType === 'tv') {
    return item?.source === 'anime' ? 'Anime Series' : 'TV Series';
  }
  if (mediaType === 'movie') {
    return item?.source === 'anime' ? 'Anime Movie' : 'Movie';
  }
  return 'Title';
};

export const getDetailPath = (item) => {
  if (!item?.id) return '/';
  const mediaType = getMediaType(item);

  if (mediaType === 'person') return `/person/${item.id}`;
  if (item.source === 'anime' && (mediaType === 'movie' || mediaType === 'tv')) {
    return `/anime/${mediaType}/${item.id}`;
  }
  if (mediaType === 'movie' || mediaType === 'tv') {
    return `/${mediaType}/${item.id}`;
  }
  return '/';
};

export const getPosterPath = (item) => item?.poster_path || item?.posterPath || null;

export const getProfilePath = (item) => item?.profile_path || null;

export const getBackdropPath = (item) => item?.backdrop_path || null;

export const getTrailer = (videos = []) => {
  if (!Array.isArray(videos) || videos.length === 0) return null;
  const youtubeVideos = videos.filter(
    (video) => video?.site === 'YouTube' && video?.key
  );
  return (
    youtubeVideos.find((video) => video.type === 'Trailer') ||
    youtubeVideos.find((video) => video.type === 'Teaser') ||
    null
  );
};

export const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

export const getEpisodeLabel = (item) => {
  if (!item) return '';
  const seasons = Number(item.number_of_seasons);
  const episodes = Number(item.number_of_episodes);
  if (!seasons && !episodes) return '';
  const seasonLabel = seasons ? `${seasons} ${seasons === 1 ? 'season' : 'seasons'}` : '';
  const episodeLabel = episodes ? `${episodes} episodes` : '';
  return [seasonLabel, episodeLabel].filter(Boolean).join(' · ');
};

export const getWatchlistKey = (item) => {
  const mediaType = getMediaType(item);
  const id = item?.id;
  if (!mediaType || !id) return '';
  return `${mediaType}:${id}`;
};
