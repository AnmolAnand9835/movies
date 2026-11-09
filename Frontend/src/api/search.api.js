import { apiRequest } from './client';
import { normalizePage } from './normalize';

const searchEndpoints = {
  multi: { path: '/search/multi', mediaType: null },
  movies: { path: '/search/movies', mediaType: 'movie' },
  tv: { path: '/search/tv', mediaType: 'tv' },
  people: { path: '/search/people', mediaType: 'person' },
};

export const search = ({ type = 'multi', query, page = 1, signal } = {}) => {
  const endpoint = searchEndpoints[type] ?? searchEndpoints.multi;

  return apiRequest(endpoint.path, {
    params: { query, page },
    signal,
  }).then((payload) => normalizePage(payload, { mediaType: endpoint.mediaType }));
};
