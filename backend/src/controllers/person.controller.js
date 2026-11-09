import { fetchFromTMDB } from '../services/tmdb.service.js';
import { CACHE_TTL } from '../config/tmdb.js';
import { sendControllerError } from '../utils/Response.utils.js';

export const getPersonById = async (req, res) => {
  try {
    const person = await fetchFromTMDB(
      `/person/${req.params.id}`,
      {},
      CACHE_TTL.DETAILS
    );
    res.json({ success: true, data: person });
  } catch (error) {
    sendControllerError(res, error, 'Failed to fetch person details');
  }
};

export const getPersonCredits = async (req, res) => {
  try {
    const credits = await fetchFromTMDB(
      `/person/${req.params.id}/credits`,
      {},
      CACHE_TTL.DETAILS
    );
    res.json({ success: true, data: credits });
  } catch (error) {
    sendControllerError(res, error, 'Failed to fetch person credits');
  }
};

export const getPersonExternalIds = async (req, res) => {
  try {
    const externalIds = await fetchFromTMDB(
      `/person/${req.params.id}/external_ids`,
      {},
      CACHE_TTL.DETAILS
    );
    res.json({ success: true, data: externalIds });
  } catch (error) {
    sendControllerError(res, error, 'Failed to fetch person external IDs');
  }
};
