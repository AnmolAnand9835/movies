
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const envPath = fileURLToPath(new URL("../../.env", import.meta.url));
dotenv.config({ path: envPath });

const requiredEnvVars = ["PORT", "NODE_ENV", "FRONTEND_URL"];

const normalizeOrigin = (value) => {
  if (!value) return "";
  return String(value).trim().replace(/\/+$/, "");
};

const collectOrigins = (...values) => values
  .flatMap((entry) => {
    if (!entry) return [];
    return String(entry)
      .split(/[\s,]+/)
      .map(normalizeOrigin)
      .filter(Boolean);
  });

const missingVars = requiredEnvVars.filter(
  (key) => !process.env[key]?.trim()
);

const hasTmdbCredential = Boolean(
  process.env.TMDB_API_READ_ACCESS_TOKEN ||
  process.env.TMDB_APIKEY
);

if (missingVars.length > 0) {
  console.error(
    `Missing required environment variables: ${missingVars.join(", ")}`
  );
}

if (!hasTmdbCredential) {
  console.error(
    "Missing TMDB credential: set TMDB_API_READ_ACCESS_TOKEN or TMDB_APIKEY."
  );
}

export const validateEnv = () =>
  missingVars.length === 0 && hasTmdbCredential;

export const isAllowedVercelPreview = (origin) => {
  if (!origin || typeof origin !== "string") return false;

  try {
    const hostname = new URL(origin).hostname.toLowerCase();
    return hostname === "vercel.app" || hostname.endsWith(".vercel.app");
  } catch {
    return false;
  }
};

export const isAllowedNetlifyPreview = (origin) => {
  if (!origin || typeof origin !== "string") return false;

  try {
    const hostname = new URL(origin).hostname.toLowerCase();
    return hostname === "netlify.app" || hostname.endsWith(".netlify.app");
  } catch {
    return false;
  }
};

const configuredOrigins = collectOrigins(
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_DEVELOPMENT,
  process.env.FRONTEND_URL_BRANCH,
  process.env.CORS_ALLOWED_ORIGINS
);

const developmentOrigins =
  process.env.NODE_ENV === "production"
    ? []
    : [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        ...configuredOrigins,
      ];

const allowedOrigins = new Set([
  ...configuredOrigins,
  ...developmentOrigins,
]);

export const corsOptions = {
  origin: (origin, callback) => {
    const isAllowed =
      !origin ||
      allowedOrigins.has(origin) ||
      isAllowedVercelPreview(origin) ||
      isAllowedNetlifyPreview(origin);

    if (isAllowed) {
      return callback(null, true);
    }

    console.warn(`CORS blocked origin: ${origin}`);
    return callback(null, false);
  },

  methods: ["GET", "HEAD", "OPTIONS", "POST", "PUT", "PATCH", "DELETE"],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],

  exposedHeaders: ["Retry-After"],

  credentials: true,

  maxAge: 86400,
};

export const httpTimeout = {
  response: 10000,
  connect: 5000,
};

export const API_VERSION = "/api/v1";

export const TMDB_ENDPOINTS = {
  TRENDING: "/trending",
  SEARCH: "/search",
  GENRES: "/genre",
  MOVIE: "/movie",
  TV: "/tv",
  PERSON: "/person",
  CONFIGURATION: "/configuration",
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PER_PAGE: 20,
  MAX_PER_PAGE: 20,
};

export const ERROR_MESSAGES = {
  TMDB_AUTHENTICATION:
    "TMDB authentication failed. Please check your API token.",
  TMDB_REQUEST_FAILED:
    "Failed to fetch data from TMDB.",
  TMDB_RATE_LIMIT:
    "TMDB rate limit exceeded.",
  VALIDATION_ERROR:
    "Invalid request parameters.",
  NOT_FOUND:
    "Resource not found.",
};
