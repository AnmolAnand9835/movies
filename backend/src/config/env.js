
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Load environment variables
const envPath = fileURLToPath(new URL("../../.env", import.meta.url));
dotenv.config({ path: envPath });

// Environment validation
const requiredEnvVars = ["PORT", "NODE_ENV", "FRONTEND_URL"];

const missingVars = requiredEnvVars.filter(
  (key) => !process.env[key]
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

// CORS configuration
const configuredOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

const developmentOrigins =
  process.env.NODE_ENV === "production"
    ? []
    : [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
        process.env.FRONTEND_URL,
        process.env.FRONTEND_URL_DEVLOPEMENT,
        process.env.FRONTEND_URL_BRANCH
      ];

const allowedOrigins = new Set([
  ...configuredOrigins,
  ...developmentOrigins,
]);

export const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without an Origin header (e.g. server-to-server)
    if (!origin || allowedOrigins.has(origin) || isAllowedVercelPreview(origin)) {
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

// HTTP timeout configuration
export const httpTimeout = {
  response: 10000,
  connect: 5000,
};

// API configuration
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

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PER_PAGE: 20,
  MAX_PER_PAGE: 20,
};

// Error messages
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
