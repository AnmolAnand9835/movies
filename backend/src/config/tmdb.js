import axios from 'axios';
import dns from 'dns';
import https from 'https';

dns.setDefaultResultOrder('ipv4first');

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
const DEFAULT_TIMEOUT = 10000;

export const CACHE_TTL = {
  TRENDING: 600,
  POPULAR: 900,
  GENRES: 86400,
  DETAILS: 1800,
  SEARCH: 300,
};

export const tmdb = axios.create({
  baseURL: TMDB_BASE_URL,
  timeout: DEFAULT_TIMEOUT,
  httpsAgent: new https.Agent({
    keepAlive: true,
    family: 4,
    maxSockets: 8,
  }),
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

const getCredential = () => {
  const credential =
    process.env.TMDB_API_READ_ACCESS_TOKEN || process.env.TMDB_APIKEY || '';
  return credential.trim();
};

tmdb.interceptors.request.use(
  (config) => {
    const credential = getCredential();
    if (!credential) return config;

    if (credential.includes('.')) {
      config.headers.Authorization = `Bearer ${credential}`;
    } else {
      config.params = { ...config.params, api_key: credential };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const getImageUrl = (imagePath, size = 'w500') => {
  if (!imagePath) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${imagePath}`;
};

export const fetchImageConfig = async () => {
  try {
    const response = await tmdb.get('/configuration');
    return {
      baseUrl: TMDB_IMAGE_BASE_URL,
      ...response.data.images,
    };
  } catch (error) {
    console.error('Failed to fetch TMDB image config:', error.message);
    return null;
  }
};

export default tmdb;
