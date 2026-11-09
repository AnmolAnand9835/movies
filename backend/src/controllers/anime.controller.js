import { fetchAnimeContent, fetchFromTMDB } from '../services/tmdb.service.js';
import { sendControllerError } from '../utils/Response.utils.js';

const parsePage = (value) => {
  const page = parseInt(value, 10);
  return Number.isFinite(page) && page > 0 ? page : 1;
};

const sendAnimePage = async (res, type, page, sortBy, fallbackMessage) => {
  try {
    const data = await fetchAnimeContent(type, page, sortBy);
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

export const getAnimeMovies = (req, res) =>
  sendAnimePage(
    res,
    'movies',
    parsePage(req.query.page),
    'popularity.desc',
    'Failed to fetch anime movies'
  );

export const getAnimeTV = (req, res) =>
  sendAnimePage(
    res,
    'tv',
    parsePage(req.query.page),
    'popularity.desc',
    'Failed to fetch anime series'
  );

export const getAnimeSeason = async (req, res) => {
  try {
    const { animeId, seasonNumber } = req.query;
    if (!seasonNumber) {
      return res.status(400).json({ success: false, message: 'seasonNumber is required' });
    }

    // Fetch the requested TMDB season
    const season = await fetchFromTMDB(
      `/tv/${animeId}/season/${seasonNumber}`,
      {},
      CACHE_TTL.DETAILS
    );

    // Normalize episodes from the season
    const episodes = season.episodes || [];

    const normalizedEpisodes = episodes.map((episode) => ({
      episode_number: episode.episode_number,
      title: episode.name || '',
      overview: episode.overview || '',
      runtime: episode.runtime || 0,
      thumbnail: episode.still_path ? `https://image.tmdb.org/t/p/w500${episode.still_path}` : '',
    }));

    res.json({
      success: true,
      season_number: Number(seasonNumber),
      episodes: normalizedEpisodes,
      episode_count: episodes.length,
    });
  } catch (error) {
    sendControllerError(res, error, 'Failed to fetch anime season');
  }
};

export const getAnimePopular = (req, res) =>
  sendAnimePage(
    res,
    'movies',
    parsePage(req.query.page),
    'popularity.desc',
    'Failed to fetch popular anime'
  );

export const getAnimeTopRated = (req, res) =>
  sendAnimePage(
    res,
    'movies',
    parsePage(req.query.page),
    'vote_average.desc',
    'Failed to fetch top-rated anime'
  );

export const getAnimeDetails = async (req, res) => {
  const animeId = req.query.animeId;
  if (!animeId) {
    return res.status(400).json({ success: false, message: 'animeId is required' });
  }
  try {
    // Fetch TMDB TV series details using the anime ID (which is a TMDB TV show ID)
    const data = await fetchFromTMDB(`/tv/${animeId}`, {}, CACHE_TTL.DETAILS);

    // Normalize the response to include seasons and episodes information
    // TMDB TV details include a seasons array with basic info
    const seasons = data.seasons || [];

    // Normalize seasons to include episode counts and other useful info
    const normalizedSeasons = seasons.map((season) => ({
      season_number: season.season_number,
      name: season.name || `Season ${season.season_number}`,
      episode_count: season.episode_count || 0,
      air_date: season.air_date || null,
      poster_path: season.poster_path || null,
    }));

    const normalized = {
      success: true,
      animeId,
      // Include the full details for the series
      title: data.name || data.original_name || 'Unknown Title',
      original_name: data.original_name || '',
      first_air_date: data.first_air_date || '',
      overview: data.overview || '',
      poster_path: data.poster_path || '',
      backdrop_path: data.backdrop_path || '',
      seasons: normalizedSeasons,
    };

    res.json({
      success: true,
      data: {
        animeId,
        // Include the full details for the series
        title: data.name || data.original_name || 'Unknown Title',
        original_name: data.original_name || '',
        first_air_date: data.first_air_date || '',
        overview: data.overview || '',
        poster_path: data.poster_path || '',
        backdrop_path: data.backdrop_path || '',
        seasons: normalizedSeasons,
      },
    });
  } catch (error) {
    sendControllerError(res, error, 'Failed to fetch anime details');
  }
};
