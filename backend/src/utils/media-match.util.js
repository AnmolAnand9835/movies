/**
 * Media Matching Module
 * Connects TMDB metadata with playback availability from providers.
 */

import { InternetArchiveProvider } from '../providers/internet-archive.provider';
import { InternetArchiveProvider as JellyfinProvider } from '../providers/jellyfin.provider';

// Match TMDB item with Archive search results
export const matchWithArchive = async (tmdbItem) => {
  const { title, release_date, external_ids } = tmdbItem;
  let query = title;
  if (release_date) query += ` ${release_date.slice(0, 4)}`;

  const provider = new InternetArchiveProvider();
  const results = await provider.search(query, 1, 3);

  if (results.success && results.results?.length > 0) {
    const item = results.results[0];
    return {
      available: item.available && item.playback_url,
      playback_url: item.playback_url,
      format: item.format,
      title: item.title,
      license: item.license,
      match_method: 'archive_search',
    };
  }

  return { available: false, match_method: 'archive_search' };
};

/**
 * Check playback availability for TMDB item
 * @param {Object} tmdbItem - TMDB movie/TV item
 * @returns {Promise<Object>} Playback availability
 */
export const checkAvailability = async (tmdbItem) => {
  // Try Archive first
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

  // Check Jellyfin if configured
  if (process.env.JELLYFIN_BASE_URL && process.env.JELLYFIN_USERNAME) {
    // Would need auth token - skip for now
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