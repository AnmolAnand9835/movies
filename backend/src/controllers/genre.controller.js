import { fetchGenres } from '../services/tmdb.service.js';
import { sendControllerError } from '../utils/Response.utils.js';

export const getMovieGenres = async (req, res) => {
  try {
    const data = await fetchGenres('movies');
    res.json({ success: true, data: data.genres });
  } catch (error) {
    sendControllerError(res, error, 'Failed to fetch movie genres');
  }
};

export const getTVGenres = async (req, res) => {
  try {
    const data = await fetchGenres('tv');
    res.json({ success: true, data: data.genres });
  } catch (error) {
    sendControllerError(res, error, 'Failed to fetch TV genres');
  }
};
