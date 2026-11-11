/**
 * Media Matching Module
 * Connects TMDB metadata with playback availability from providers.
 */

import { InternetArchiveProvider } from '../providers/internet-archive.provider.js';
import { getJellyfinStatus } from '../providers/jellyfin.provider.js';

const getQueryString = (tmdbItem = {}) => {
  const { title, release_date } = tmdbItem;
  let query = title || '';

  if (release_date) {
    query = `${query} ${String(release_date).slice(0, 4)}`.trim();
  }

  return query.trim();
};

export const matchWithArchive = async (tmdbItem = {}) => {
  const query = getQueryString(tmdbItem);

  if (!query) {
    return { available: false, match_method: 'archive_search' };
  }

  const provider = new InternetArchiveProvider();
  const results = await provider.search(query, 1, 3);

  if (results.success && results.results?.length > 0) {
    const item = results.results[0];
    return {
      available: Boolean(item.available && item.playback_url),
      playback_url: item.playback_url || null,
      format: item.format || null,
      title: item.title || query,
      license: item.license || null,
      match_method: 'archive_search',
    };
  }

  return { available: false, match_method: 'archive_search' };
};

export const checkAvailability = async (tmdbItem = {}) => {
  const archiveMatch = await matchWithArchive(tmdbItem);

  if (archiveMatch.available) {
    return {
      success: true,
      data: {
        has_playback: true,
        provider: 'internet-archive',
        playback_url: archiveMatch.playback_url,
        format: archiveMatch.format,
        display_message: 'Watch Now',
      },
    };
  }

  const jellyfinStatus = getJellyfinStatus();
  if (jellyfinStatus.available) {
    return {
      success: true,
      data: {
        has_playback: false,
        provider: 'jellyfin',
        playback_url: null,
        display_message: 'Jellyfin server is configured but the requested title is unavailable.',
      },
    };
  }

  return {
    success: true,
    data: {
      has_playback: false,
      provider: null,
      playback_url: null,
      display_message: 'Not available for playback',
    },
  };
};

export default {
  matchWithArchive,
  checkAvailability,
};