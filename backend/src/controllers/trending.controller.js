import { fetchFromTMDB } from '../services/tmdb.service.js';
import { CACHE_TTL } from '../config/tmdb.js';
import { sendControllerError } from '../utils/Response.utils.js';

const parsePage = (value) => {
  const page = parseInt(value, 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
};

const paginatedResponse = (data, page) => ({
  success: true,
  data,
  pagination: {
    page,
    total_pages: data.total_pages,
    total_results: data.total_results,
  },
});

const getTrending = async (req, res, mediaType = 'all') => {
  try {
    const page = parsePage(req.query.page);
    const timeWindow = req.query.time_window === 'day' ? 'day' : 'week';
    const endpoint = `/trending/${mediaType}/${timeWindow}`;

    const data = await fetchFromTMDB(
      endpoint,
      { page },
      CACHE_TTL.TRENDING
    );

    res.json(paginatedResponse(data, page));
  } catch (error) {
    sendControllerError(res, error, 'Failed to fetch trending content');
  }
};

export const getTrendingAll = (req, res) => getTrending(req, res, 'all');

export const getTrendingMovies = (req, res) => getTrending(req, res, 'movie');

export const getTrendingTV = (req, res) => getTrending(req, res, 'tv');

export const getTrendingPeople = (req, res) => getTrending(req, res, 'person');
