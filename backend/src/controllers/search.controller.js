import { fetchFromTMDB } from '../services/tmdb.service.js';
import { CACHE_TTL } from '../config/tmdb.js';
import { sendControllerError } from '../utils/Response.utils.js';

const parsePage = (value) => {
  const page = parseInt(value, 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
};

const getSearchResults = async (req, res, endpoint, fallbackMessage) => {
  try {
    const query = typeof req.query.query === 'string' ? req.query.query.trim() : '';

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
        error: { code: 'VALIDATION_ERROR' },
      });
    }

    const page = parsePage(req.query.page);
    const data = await fetchFromTMDB(
      endpoint,
      { query, page, include_adult: false },
      CACHE_TTL.SEARCH
    );

    res.json({
      success: true,
      data,
      pagination: {
        page,
        total_pages: data.total_pages,
        total_results: data.total_results,
      },
    });
  } catch (error) {
    sendControllerError(res, error, fallbackMessage);
  }
};

export const searchMovies = (req, res) =>
  getSearchResults(req, res, '/search/movie', 'Failed to search movies');

export const searchTV = (req, res) =>
  getSearchResults(req, res, '/search/tv', 'Failed to search TV shows');

export const searchPeople = (req, res) =>
  getSearchResults(req, res, '/search/person', 'Failed to search people');

export const searchMulti = (req, res) =>
  getSearchResults(req, res, '/search/multi', 'Failed to search');
