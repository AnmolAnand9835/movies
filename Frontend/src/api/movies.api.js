import { apiRequest } from './client';
import { normalizeDetail, normalizePage } from './normalize';

const movieList = (path, mediaType = 'movie') => ({ page = 1, signal } = {}) =>
  apiRequest(path, { params: { page }, signal }).then((payload) =>
    normalizePage(payload, { mediaType })
  );

export const getPopularMovies = movieList('/movies/popular');

export const getTopRatedMovies = movieList('/movies/top-rated');

export const getNowPlayingMovies = movieList('/movies/now-playing');

export const getUpcomingMovies = movieList('/movies/upcoming');

export const getMoviesByGenre = ({ genreId, page = 1, signal } = {}) =>
  apiRequest(`/movies/genre/${genreId}`, {
    params: { page },
    signal,
  }).then((payload) => normalizePage(payload, { mediaType: 'movie' }));

export const getMovieDetails = ({ id, signal } = {}) =>
  apiRequest(`/movies/${id}`, { signal }).then(normalizeDetail);

export const getMovieCredits = ({ id, signal } = {}) =>
  apiRequest(`/movies/${id}/credits`, { signal }).then((payload) => payload?.data ?? null);

export const getMovieVideos = ({ id, signal } = {}) =>
  apiRequest(`/movies/${id}/videos`, { signal }).then((payload) => payload?.data ?? null);

export const getMovieSimilar = ({ id, page = 1, signal } = {}) =>
  apiRequest(`/movies/${id}/similar`, { params: { page }, signal }).then((payload) =>
    normalizePage(payload, { mediaType: 'movie' })
  );

export const getMovieRecommendations = ({ id, page = 1, signal } = {}) =>
  apiRequest(`/movies/${id}/recommendations`, { params: { page }, signal }).then(
    (payload) => normalizePage(payload, { mediaType: 'movie' })
  );
