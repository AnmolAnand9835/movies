import { getImageUrl, fetchImageConfig } from '../config/tmdb.js';

export const getPosterUrl = (path, size = 'w500') => getImageUrl(path, size);

export const getBackdropUrl = (path, size = 'w780') => getImageUrl(path, size);

export const getProfileUrl = (path, size = 'w45') => getImageUrl(path, size);

export const getStillUrl = (path, size = 'w300') => getImageUrl(path, size);

export const getOriginalUrl = (path) => getImageUrl(path, 'original');

export const fetchAvailableSizes = async () => {
  try {
    const config = await fetchImageConfig();
    return config?.available_sizes || [
      'w92',
      'w154',
      'w185',
      'w342',
      'w500',
      'w780',
      'original',
    ];
  } catch (error) {
    console.error('Failed to fetch TMDB image config:', error.message);
    return ['w92', 'w154', 'w185', 'w342', 'w500', 'w780', 'original'];
  }
};

export const getDefaultSize = (type = 'poster') => {
  const sizes = {
    poster: 'w500',
    backdrop: 'w780',
    profile: 'w45',
    still: 'w300',
  };

  return sizes[type] || 'w500';
};
