const IMAGE_BASE = 'https://image.tmdb.org/t/p';

const buildUrl = (path, size) => (path ? `${IMAGE_BASE}/${size}${path}` : null);

export const posterUrl = (path, size = 'w342') => buildUrl(path, size);

export const posterSrcSet = (path) => {
  if (!path) return undefined;
  return `${buildUrl(path, 'w342')} 342w, ${buildUrl(path, 'w500')} 500w, ${buildUrl(path, 'w780')} 780w`;
};

export const backdropUrl = (path, size = 'w1280') => buildUrl(path, size);

export const backdropSrcSet = (path) => {
  if (!path) return undefined;
  return `${buildUrl(path, 'w780')} 780w, ${buildUrl(path, 'w1280')} 1280w, ${buildUrl(path, 'original')} 1920w`;
};

export const profileUrl = (path, size = 'w185') => buildUrl(path, size);

export const profileSrcSet = (path) => {
  if (!path) return undefined;
  return `${buildUrl(path, 'w185')} 185w, ${buildUrl(path, 'h632')} 632w`;
};
