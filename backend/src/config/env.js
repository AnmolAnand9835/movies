import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const envPath = fileURLToPath(new URL('../../.env', import.meta.url));
dotenv.config({ path: envPath });

const requiredEnvVars = ['PORT', 'NODE_ENV', 'FRONTEND_URL'];

const missingVars = requiredEnvVars.filter((key) => !process.env[key]);
const hasTmdbCredential = Boolean(
  process.env.TMDB_API_READ_ACCESS_TOKEN || process.env.TMDB_APIKEY
);

if (missingVars.length > 0) {
  console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
  console.error('Please check your .env file and ensure all required variables are set.');
}

if (!hasTmdbCredential) {
  console.error('Missing TMDB credential: set TMDB_API_READ_ACCESS_TOKEN or TMDB_APIKEY.');
}

export const validateEnv = () =>
  missingVars.length === 0 && hasTmdbCredential;

const configuredOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
const developmentOrigins =
  process.env.NODE_ENV === 'production'
    ? []
    : [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:4173',
        'http://127.0.0.1:4173',
        process.env.FRONTEND_URL
      ];
const allowedOrigins = new Set([...configuredOrigins, ...developmentOrigins]);

export const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error('Origin not allowed by CORS'));
  },
  methods: ['GET', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Retry-After'],
  credentials: true,
  maxAge: 86400,
};

export const httpTimeout = {
  response: 10000,
  connect: 5000,
};

export const API_VERSION = '/api/v1';

export const TMDB_ENDPOINTS = {
  TRENDING: '/trending',
  SEARCH: '/search',
  GENRES: '/genre',
  MOVIE: '/movie',
  TV: '/tv',
  PERSON: '/person',
  CONFIGURATION: '/configuration',
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PER_PAGE: 20,
  MAX_PER_PAGE: 20,
};

export const ERROR_MESSAGES = {
  TMDB_AUTHENTICATION: 'TMDB authentication failed. Please check your API token.',
  TMDB_REQUEST_FAILED: 'Failed to fetch data from TMDB.',
  TMDB_RATE_LIMIT: 'TMDB rate limit exceeded.',
  VALIDATION_ERROR: 'Invalid request parameters.',
  NOT_FOUND: 'Resource not found.',
};
