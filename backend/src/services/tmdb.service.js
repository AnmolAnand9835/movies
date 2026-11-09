import tmdb, { CACHE_TTL } from '../config/tmdb.js';

const cache = new Map();

const setCache = (key, value, ttl) => {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttl * 1000,
  });
};

const getCache = (key) => {
  const cached = cache.get(key);
  if (!cached) return null;
  if (cached.expiresAt < Date.now()) {
    cache.delete(key);
    return null;
  }
  return cached.value;
};

const normalizeParams = (endpoint, params = {}) => {
  const sortedParams = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== '')
    .sort()
    .reduce((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});

  return `${endpoint}:${JSON.stringify(sortedParams)}`;
};

const RETRYABLE_NETWORK_CODES = new Set([
  'ECONNRESET',
  'ECONNABORTED',
  'ETIMEDOUT',
  'EPIPE',
  'EAI_AGAIN',
  'ENOTFOUND',
]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const requestWithRetry = async (endpoint, params) => {
  let lastError;

  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await tmdb.get(endpoint, { params });
      return response.data;
    } catch (error) {
      lastError = error;
      const retryable =
        !error.response && RETRYABLE_NETWORK_CODES.has(error.code);

      if (!retryable || attempt === 3) break;
      await sleep(350 * attempt);
    }
  }

  throw lastError;
};

export const fetchFromTMDB = async (endpoint, params = {}, ttl = 300) => {
  const cacheKey = normalizeParams(endpoint, params);
  const cached = getCache(cacheKey);
  if (cached) return cached;

  try {
    const data = await requestWithRetry(endpoint, params);

    if (ttl > 0) setCache(cacheKey, data, ttl);

    return data;
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) throw new Error('TMDB authentication failed');
      if (status === 429) throw new Error('TMDB rate limit exceeded');
      throw new Error(data?.message || 'Failed to fetch data from TMDB');
    }
    if (error.request) throw new Error('No response received from TMDB');
    throw new Error(error.message || 'Failed to fetch data from TMDB');
  }
};

export const fetchGenres = async (type = 'movies') => {
  const endpoint = type === 'tv' ? '/genre/tv/list' : '/genre/movie/list';
  return fetchFromTMDB(endpoint, {}, CACHE_TTL.GENRES);
};

export const fetchAnimeContent = async (
  type = 'movies',
  page = 1,
  sortBy = 'popularity.desc'
) => {
  const endpoint = type === 'tv' ? '/discover/tv' : '/discover/movie';

  return fetchFromTMDB(
    endpoint,
    {
      with_genres: 16,
      with_original_language: 'ja',
      sort_by: sortBy,
      include_adult: false,
      page,
    },
    CACHE_TTL.POPULAR
  );
};
