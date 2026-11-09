import { ERROR_MESSAGES } from '../config/env.js';

const errorMiddleware = (err, req, res, next) => {
  console.error('Error:', err.message);

  let statusCode = 500;
  let message = ERROR_MESSAGES.TMDB_REQUEST_FAILED;
  let errorCode = 'TMDB_REQUEST_FAILED';

  if (err.message.includes('authentication')) {
    statusCode = 401;
    message = ERROR_MESSAGES.TMDB_AUTHENTICATION;
    errorCode = 'TMDB_AUTH';
  } else if (err.message.includes('rate limit')) {
    statusCode = 429;
    message = 'TMDB rate limit exceeded';
    errorCode = 'RATE_LIMIT';
  } else if (err.message === 'Search query is required') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
  } else if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: {
      code: errorCode,
    },
  });
};

export default errorMiddleware;
