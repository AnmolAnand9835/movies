const DEFAULT_DEVELOPMENT_BASE_URL = '/api/v1';
const DEFAULT_PRODUCTION_BASE_URL = 'https://movies-ivmx.onrender.com/api/v1';

const resolveApiBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/+$/, '');
  }

  if (import.meta.env.DEV) {
    return DEFAULT_DEVELOPMENT_BASE_URL;
  }

  console.error(
    'Missing VITE_API_BASE_URL in production. Falling back to the expected Render endpoint: ' + DEFAULT_PRODUCTION_BASE_URL
  );

  return DEFAULT_PRODUCTION_BASE_URL;
};

const API_BASE_URL = resolveApiBaseUrl();

const DEFAULT_TIMEOUT = 40000;

export class ApiError extends Error {
  constructor(message, { status = 0, code = 'REQUEST_FAILED', retryAfter = null } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.retryAfter = retryAfter;
  }
}

const parseRetryAfter = (response) => {
  const retryAfter = response.headers.get('Retry-After');
  const rateLimitReset = response.headers.get('RateLimit-Reset');
  const value = Number(retryAfter ?? rateLimitReset);
  return Number.isFinite(value) && value > 0 ? Math.ceil(value) : 0;
};

const parseBody = async (response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

const buildUrl = (path, params) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const url = new URL(
    `${API_BASE_URL}${normalizedPath}`,
    typeof window !== 'undefined' ? window.location.origin : 'http://localhost'
  );

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    url.searchParams.set(key, String(value));
  });

  return url.toString();
};

export const apiRequest = async (path, { params, signal, timeout = DEFAULT_TIMEOUT } = {}) => {
  const controller = new AbortController();
  let timedOut = false;

  const abortFromCaller = () => controller.abort(signal?.reason);

  if (signal) {
    if (signal.aborted) abortFromCaller();
    else signal.addEventListener('abort', abortFromCaller, { once: true });
  }

  const timeoutId = window.setTimeout(() => {
    timedOut = true;
    controller.abort(new DOMException('Request timed out', 'TimeoutError'));
  }, timeout);

  try {
    const response = await fetch(buildUrl(path, params), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    const body = await parseBody(response);

    if (!response.ok || body?.success === false) {
      throw new ApiError(
        body?.message || `The CineAtlas API returned HTTP ${response.status}.`,
        {
          status: response.status,
          code: body?.error?.code || 'HTTP_ERROR',
          retryAfter: response.status === 429 ? parseRetryAfter(response) || 60 : null,
        }
      );
    }

    return body;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (timedOut) {
      throw new ApiError('The CineAtlas API took too long to respond.', {
        code: 'TIMEOUT',
      });
    }

    if (error?.name === 'AbortError' || error?.name === 'TimeoutError') {
      throw error;
    }

    throw new ApiError(
      `We couldn't reach the CineAtlas API at ${API_BASE_URL}. Make sure the backend is running.`,
      { code: 'NETWORK_ERROR' }
    );
  } finally {
    window.clearTimeout(timeoutId);
    signal?.removeEventListener('abort', abortFromCaller);
  }
};

export const getApiErrorMessage = (error) => {
  if (!error) return 'Something went wrong.';
  if (error.status === 429) {
    const seconds = error.retryAfter ? `${error.retryAfter} seconds` : 'a moment';
    return `The API rate limit was reached. Please wait ${seconds} and try again.`;
  }
  if (error.status === 401 || error.status === 403) {
    return 'The backend could not authenticate with its data source. Check the backend credentials.';
  }
  if (error.status === 404) {
    return 'That title could not be found.';
  }
  if (error.status >= 500) {
    return 'CineAtlas could not reach its data source. Please try again in a moment.';
  }
  return error.message || 'Something went wrong while loading CineAtlas.';
};

export { API_BASE_URL };
