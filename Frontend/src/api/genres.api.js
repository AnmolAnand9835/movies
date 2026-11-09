import { apiRequest } from './client';

export const getMovieGenres = ({ signal } = {}) =>
  apiRequest('/genres/movies', { signal }).then((payload) =>
    Array.isArray(payload?.data) ? payload.data : []
  );

export const getTVGenres = ({ signal } = {}) =>
  apiRequest('/genres/tv', { signal }).then((payload) =>
    Array.isArray(payload?.data) ? payload.data : []
  );
