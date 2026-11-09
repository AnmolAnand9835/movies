import { fetchFromTMDB } from '../services/tmdb.service.js';
import { CACHE_TTL } from '../config/tmdb.js';
import { sendControllerError } from '../utils/Response.utils.js';

const parsePage = (value) => {
  const page = parseInt(value, 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
};

const sendPage = (res, data, page) => {
  res.json({
    success: true,
    data,
    pagination: {
      page,
      total_pages: data.total_pages,
      total_results: data.total_results,
    },
  });
};

const getTVList = async (req, res, endpoint, fallbackMessage) => {
  try {
    const page = parsePage(req.query.page);
    const data = await fetchFromTMDB(endpoint, { page }, CACHE_TTL.POPULAR);
    sendPage(res, data, page);
  } catch (error) {
    sendControllerError(res, error, fallbackMessage);
  }
};

export const getPopularTV = (req, res) =>
  getTVList(req, res, '/tv/popular', 'Failed to fetch popular TV shows');

export const getTopRatedTV = (req, res) =>
  getTVList(req, res, '/tv/top_rated', 'Failed to fetch top-rated TV shows');

export const getOnTheAirTV = (req, res) =>
  getTVList(req, res, '/tv/on_the_air', 'Failed to fetch currently airing TV shows');

export const getAiringTodayTV = (req, res) =>
  getTVList(req, res, '/tv/airing_today', 'Failed to fetch TV shows airing today');

export const getTVById = async (req, res) => {
  try {
    const includeCredits = req.query.includeCredits !== 'false';
    const includeVideos = req.query.includeVideos !== 'false';

    const tv = await fetchFromTMDB(
      `/tv/${req.params.id}`,
      {},
      CACHE_TTL.DETAILS
    );

    const [credits, videos] = await Promise.all([
      includeCredits
        ? fetchFromTMDB(
            `/tv/${req.params.id}/credits`,
            {},
            CACHE_TTL.DETAILS
          ).catch(() => null)
        : null,
      includeVideos
        ? fetchFromTMDB(
            `/tv/${req.params.id}/videos`,
            {},
            CACHE_TTL.DETAILS
          ).catch(() => null)
        : null,
    ]);

    res.json({
      success: true,
      data: {
        ...tv,
        credits,
        videos,
      },
    });
  } catch (error) {
    sendControllerError(res, error, 'Failed to fetch TV show details');
  }
};

export const getTVCredits = async (req, res) => {
  try {
    const credits = await fetchFromTMDB(
      `/tv/${req.params.id}/credits`,
      {},
      CACHE_TTL.DETAILS
    );
    res.json({ success: true, data: credits });
  } catch (error) {
    sendControllerError(res, error, 'Failed to fetch TV show credits');
  }
};

export const getTVVideos = async (req, res) => {
  try {
    const videos = await fetchFromTMDB(
      `/tv/${req.params.id}/videos`,
      {},
      CACHE_TTL.DETAILS
    );
    res.json({ success: true, data: videos });
  } catch (error) {
    sendControllerError(res, error, 'Failed to fetch TV show videos');
  }
};

export const getTVSimilar = async (req, res) => {
  try {
    const page = parsePage(req.query.page);
    const data = await fetchFromTMDB(
      `/tv/${req.params.id}/similar`,
      { page },
      CACHE_TTL.POPULAR
    );
    sendPage(res, data, page);
  } catch (error) {
    sendControllerError(res, error, 'Failed to fetch similar TV shows');
  }
};

export const getTVRecommendations = async (req, res) => {
  try {
    const page = parsePage(req.query.page);
    const data = await fetchFromTMDB(
      `/tv/${req.params.id}/recommendations`,
      { page },
      CACHE_TTL.POPULAR
    );
    sendPage(res, data, page);
  } catch (error) {
    sendControllerError(res, error, 'Failed to fetch TV show recommendations');
  }
};

export const getTVSeason = async (req, res) => {
  try {
    const season = await fetchFromTMDB(
      `/tv/${req.params.id}/season/${req.params.seasonNumber}`,
      {},
      CACHE_TTL.DETAILS
    );
    res.json({ success: true, data: season });
  } catch (error) {
    sendControllerError(res, error, 'Failed to fetch TV show season');
  }
};

export const getTVExternalIds = async (req, res) => {
  try {
    const externalIds = await fetchFromTMDB(
      `/tv/${req.params.id}/external_ids`,
      {},
      CACHE_TTL.DETAILS
    );
    res.json({ success: true, data: externalIds });
  } catch (error) {
    sendControllerError(res, error, 'Failed to fetch TV show external IDs');
  }
};
