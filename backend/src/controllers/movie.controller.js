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

export const getPopularMovies = async (req, res) => {
  try {
    const page = parsePage(req.query.page);
    const data = await fetchFromTMDB('/movie/popular', { page }, CACHE_TTL.POPULAR);
    sendPage(res, data, page);
  } catch (error) {
    sendControllerError(res, error, 'Failed to fetch popular movies');
  }
};

export const getTopRatedMovies = async (req, res) => {
  try {
    const page = parsePage(req.query.page);
    const data = await fetchFromTMDB('/movie/top_rated', { page }, CACHE_TTL.POPULAR);
    sendPage(res, data, page);
  } catch (error) {
    sendControllerError(res, error, 'Failed to fetch top-rated movies');
  }
};

export const getNowPlayingMovies = async (req, res) => {
  try {
    const page = parsePage(req.query.page);
    const data = await fetchFromTMDB('/movie/now_playing', { page }, CACHE_TTL.POPULAR);
    sendPage(res, data, page);
  } catch (error) {
    sendControllerError(res, error, 'Failed to fetch now-playing movies');
  }
};

export const getUpcomingMovies = async (req, res) => {
  try {
    const page = parsePage(req.query.page);
    const data = await fetchFromTMDB('/movie/upcoming', { page }, CACHE_TTL.POPULAR);
    sendPage(res, data, page);
  } catch (error) {
    sendControllerError(res, error, 'Failed to fetch upcoming movies');
  }
};

export const getMovieById = async (req, res) => {
  try {
    const [movie, externalIds] = await Promise.all([
      fetchFromTMDB(`/movie/${req.params.id}`, {}, CACHE_TTL.DETAILS),
      fetchFromTMDB(
        `/movie/${req.params.id}/external_ids`,
        {},
        CACHE_TTL.DETAILS
      ).catch((error) => {
        console.error(`Failed to fetch external IDs for movie ${req.params.id}:`, error.message);
        return null;
      }),
    ]);

    res.json({
      success: true,
      data: {
        ...movie,
        external_ids: externalIds || movie.external_ids || null,
      },
    });
  } catch (error) {
    sendControllerError(res, error, 'Failed to fetch movie details');
  }
};

export const getMovieCredits = async (req, res) => {
  try {
    const credits = await fetchFromTMDB(
      `/movie/${req.params.id}/credits`,
      {},
      CACHE_TTL.DETAILS
    );
    res.json({ success: true, data: credits });
  } catch (error) {
    sendControllerError(res, error, 'Failed to fetch movie credits');
  }
};

export const getMovieVideos = async (req, res) => {
  try {
    const videos = await fetchFromTMDB(
      `/movie/${req.params.id}/videos`,
      {},
      CACHE_TTL.DETAILS
    );
    res.json({ success: true, data: videos });
  } catch (error) {
    sendControllerError(res, error, 'Failed to fetch movie videos');
  }
};

export const getMovieSimilar = async (req, res) => {
  try {
    const page = parsePage(req.query.page);
    const data = await fetchFromTMDB(
      `/movie/${req.params.id}/similar`,
      { page },
      CACHE_TTL.POPULAR
    );
    sendPage(res, data, page);
  } catch (error) {
    sendControllerError(res, error, 'Failed to fetch similar movies');
  }
};

export const getMovieRecommendations = async (req, res) => {
  try {
    const page = parsePage(req.query.page);
    const data = await fetchFromTMDB(
      `/movie/${req.params.id}/recommendations`,
      { page },
      CACHE_TTL.POPULAR
    );
    sendPage(res, data, page);
  } catch (error) {
    sendControllerError(res, error, 'Failed to fetch movie recommendations');
  }
};

export const getMoviesByGenre = async (req, res) => {
  try {
    const page = parsePage(req.query.page);
    const data = await fetchFromTMDB(
      '/discover/movie',
      {
        with_genres: req.params.genreId,
        page,
        sort_by: 'popularity.desc',
        include_adult: false,
      },
      CACHE_TTL.POPULAR
    );
    sendPage(res, data, page);
  } catch (error) {
    sendControllerError(res, error, 'Failed to fetch movies by genre');
  }
};

export const getMoviesByFilter = async (req, res) => {
  try {
    const page = parsePage(req.query.page);
    const {
      language,
      'release_date.gte': releaseDateGte,
      'release_date.lte': releaseDateLte,
      'with_runtime.gte': minRuntime,
      'with_runtime.lte': maxRuntime,
      'vote_average.gte': minRating,
      'vote_count.gte': minVoteCount,
    } = req.query;

    const params = {
      page,
      sort_by: 'popularity.desc',
      include_adult: false,
    };

    if (language) params.with_original_language = language;
    if (releaseDateGte) params['release_date.gte'] = releaseDateGte;
    if (releaseDateLte) params['release_date.lte'] = releaseDateLte;
    if (minRuntime) params['with_runtime.gte'] = parseInt(minRuntime, 10);
    if (maxRuntime) params['with_runtime.lte'] = parseInt(maxRuntime, 10);
    if (minRating) params['vote_average.gte'] = parseFloat(minRating);
    if (minVoteCount) params['vote_count.gte'] = parseInt(minVoteCount, 10);

    const data = await fetchFromTMDB('/discover/movie', params, CACHE_TTL.POPULAR);
    sendPage(res, data, page);
  } catch (error) {
    sendControllerError(res, error, 'Failed to fetch movies with filters');
  }
};
