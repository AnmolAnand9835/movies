import { apiRequest } from './client';
import { normalizeDetail, normalizePage } from './normalize';

const tvList = (path) => ({ page = 1, signal } = {}) =>
  apiRequest(path, { params: { page }, signal }).then((payload) =>
    normalizePage(payload, { mediaType: 'tv' })
  );

export const getPopularTV = tvList('/tv/popular');

export const getTopRatedTV = tvList('/tv/top-rated');

export const getOnTheAirTV = tvList('/tv/on-the-air');

export const getAiringTodayTV = tvList('/tv/airing-today');

export const getTVDetails = ({
  id,
  signal,
  includeCredits,
  includeVideos,
} = {}) =>
  apiRequest(`/tv/${id}`, {
    params: { includeCredits, includeVideos },
    signal,
  }).then(normalizeDetail);

export const getTVSeason = ({ id, seasonNumber, signal } = {}) =>
  apiRequest(`/tv/${id}/season/${seasonNumber}`, { signal }).then((payload) => {
    const season = normalizeDetail(payload);
    if (!Array.isArray(season?.episodes)) {
      throw new Error('The TV season response did not include an episodes array.');
    }
    return season;
  });

export const getTVVideos = ({ id, signal } = {}) =>
  apiRequest(`/tv/${id}/videos`, { signal }).then((payload) => payload?.data ?? null);


export const getTVSimilar = ({ id, page = 1, signal } = {}) =>
  apiRequest(`/tv/${id}/similar`, { params: { page }, signal }).then((payload) =>
    normalizePage(payload, { mediaType: 'tv' })
  );

export const getTVRecommendations = ({ id, page = 1, signal } = {}) =>
  apiRequest(`/tv/${id}/recommendations`, { params: { page }, signal }).then((payload) =>
    normalizePage(payload, { mediaType: 'tv' })
  );
