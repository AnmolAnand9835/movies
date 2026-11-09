import { apiRequest } from './client';
import { normalizePage } from './normalize';

const animeEndpoints = {
  popular: { path: '/anime/popular', mediaType: 'movie' },
  movies: { path: '/anime/movies', mediaType: 'movie' },
  tv: { path: '/anime/tv', mediaType: 'tv' },
  'top-rated': { path: '/anime/top-rated', mediaType: 'movie' },
};

export const getAnimeList = ({ type = 'popular', page = 1, signal } = {}) => {
  const endpoint = animeEndpoints[type] ?? animeEndpoints.popular;

  return apiRequest(endpoint.path, { params: { page }, signal }).then((payload) =>
    normalizePage(payload, { mediaType: endpoint.mediaType, source: 'anime' })
  );
};
