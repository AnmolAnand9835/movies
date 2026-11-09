/**
 * Jellyfin Provider for CineAtlas
 * Optional integration for user's self-hosted Jellyfin media server.
 * 
 * Configuration required in .env:
 * JELLYFIN_BASE_URL=
 * JELLYFIN_USERNAME=
 * JELLYFIN_PASSWORD=
 */

const JELLYFIN_BASE_PATH = '/Users/Shared/Jellyfin';
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'X-Emby-Token': '',
};

// Check if Jellyfin is configured
const isJellyfinConfigured = () => {
  return !!(
    process.env.JELLYFIN_BASE_URL &&
    process.env.JELLYFIN_USERNAME
  );
};

export const getJellyfinStatus = () => {
  if (!isJellyfinConfigured()) {
    return {
      configured: false,
      available: false,
      description: 'Jellyfin not configured - set JELLYFIN_BASE_URL and JELLYFIN_USERNAME in .env',
    };
  }
  return {
    configured: true,
    available: true,
    description: 'Jellyfin media server is configured',
  };
};

/**
 * Authenticate with Jellyfin and get access token
 * @param {string} baseUrl - Jellyfin server base URL
 * @param {string} username - Jellyfin username
 * @param {string} password - Jellyfin password
 * @returns {Promise<string|boolean>} Access token or false on failure
 */
export const authenticateJellyfin = async (baseUrl, username, password) => {
  try {
    const authUrl = `${baseUrl}/Users/AuthenticateByName`;
    const response = await fetch(authUrl, {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      body: JSON.stringify({ Name: username, Password: password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Jellyfin auth error:', errorData);
      return false;
    }

    const data = await response.json();
    return data.AccessToken || false;
  } catch (error) {
    console.error('Jellyfin authentication exception:', error);
    return false;
  }
};

/**
 * Get media library from Jellyfin
 * @param {string} accessToken - Jellyfin access token
 * @returns {Promise<Object>} Media library structure
 */
export const getJellyfinLibrary = async (accessToken) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'X-Emby-Token': accessToken,
    };

    const seriesUrl = `${process.env.JELLYFIN_BASE_URL}/Library/Series?Recursive=true&IncludeItemCount=true`;
    const moviesUrl = `${process.env.JELLYFIN_BASE_URL}/Library/Movies?Recursive=true&IncludeItemCount=true`;

    const [seriesResponse, moviesResponse] = await Promise.all([
      fetch(seriesUrl, { headers }),
      fetch(moviesUrl, { headers }),
    ]);

    const seriesData = await seriesResponse.json();
    const moviesData = await moviesResponse.json();

    return {
      success: true,
      data: {
        movies: moviesData.Items || [],
        series: seriesData.Items || [],
      },
    };
  } catch (error) {
    console.error('Jellyfin library fetch error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get media items by type from Jellyfin
 * @param {string} accessToken - Jellyfin access token
 * @param {string} type - 'movies' or 'series'
 * @returns {Promise<Object>} Media items
 */
export const getJellyfinMedia = async (accessToken, type = 'movies') => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'X-Emby-Token': accessToken,
    };

    let url;
    if (type === 'movies') {
      url = `${process.env.JELLYFIN_BASE_URL}/Library/Movies?Recursive=true`;
    } else {
      url = `${process.env.JELLYFIN_BASE_URL}/Library/Series?Recursive=true`;
    }

    const response = await fetch(url, { headers });
    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.Message || 'Failed to fetch Jellyfin media' };
    }

    const data = await response.json();
    return {
      success: true,
      data: data.Items || [],
    };
  } catch (error) {
    console.error('Jellyfin media fetch error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get item metadata from Jellyfin
 * @param {string} accessToken - Jellyfin access token
 * @param {number} itemId - Jellyfin item ID
 * @returns {Promise<Object>} Item metadata
 */
export const getJellyfinItemMetadata = async (accessToken, itemId) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'X-Emby-Token': accessToken,
    };

    const url = `${process.env.JELLYFIN_BASE_URL}/Items/${itemId}?ImageTypeLimit=3`;
    const response = await fetch(url, { headers });

    if (!response.ok) {
      return { success: false, error: 'Failed to fetch Jellyfin item metadata' };
    }

    const data = await response.json();
    return {
      success: true,
      data: data,
    };
  } catch (error) {
    console.error('Jellyfin item metadata error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Check if Jellyfin playback is available for an item
 * @param {string} accessToken - Jellyfin access token
 * @param {number} itemId - Jellyfin item ID
 * @returns {Promise<Object>} Playback availability
 */
export const checkJellyfinPlayback = async (accessToken, itemId) => {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'X-Emby-Token': accessToken,
    };

    const url = `${process.env.JELLYFIN_BASE_URL}/Items/${itemId}/ViewDetails`;
    const response = await fetch(url, { headers });

    if (!response.ok) {
      return { success: false, error: 'Failed to check Jellyfin playback' };
    }

    const data = await response.json();
    return {
      success: true,
      data: {
        hasFile: data.Media && data.Media.some(m => m.File && m.File.length > 0),
        videoDirectories: data.Media?.map(m => m.File?.[0]?.Path).filter(Boolean) || [],
      },
    };
  } catch (error) {
    console.error('Jellyfin playback check error:', error);
    return { success: false, error: error.message };
  }
};