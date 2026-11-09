/**
 * AutoEmbed Provider for CineAtlas
 * Free movie/TV show embed API using IMDb or TMDB IDs
 * No API key required - completely free
 */

const AUTOEMBED_BASE = 'https://autoembed.me';

export const fetchAutoEmbedByImdbId = async (imdbId) => {
  try {
    const response = await fetch(`${AUTOEMBED_BASE}/movie/imdb/${imdbId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AutoEmbed API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('AutoEmbed fetch error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Get streaming providers/watchers info for a movie by TMDB ID
 * Uses the IMDb ID from TMDB external IDs to query AutoEmbed
 */
export const fetchAutoEmbedByTmdbId = async (tmdbId) => {
  try {
    const response = await fetch(`${AUTOEMBED_BASE}/movie/tmdb/${tmdbId}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AutoEmbed API failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error('AutoEmbed fetch error:', error.message);
    return {
      success: false,
      error: error.message,
    };
  }
};