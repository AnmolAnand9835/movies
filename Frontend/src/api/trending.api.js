import { apiRequest } from './client';
import { normalizePage } from './normalize';

export const getTrending = ({ page = 1, timeWindow = 'week', signal } = {}) =>
  apiRequest('/trending/all', {
    params: { time_window: timeWindow, page },
    signal,
  }).then((payload) => normalizePage(payload));

export const getTrendingMovies = ({ page = 1, timeWindow = 'week', signal } = {}) =>
  apiRequest('/trending/movies', {
    params: { time_window: timeWindow, page },
    signal,
  }).then((payload) => normalizePage(payload, { mediaType: 'movie' }));

export const getTrendingTV = ({ page = 1, timeWindow = 'week', signal } = {}) =>
  apiRequest('/trending/tv', {
    params: { time_window: timeWindow, page },
    signal,
  }).then((payload) => normalizePage(payload, { mediaType: 'tv' }));
