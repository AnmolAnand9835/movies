import { ERROR_MESSAGES } from '../config/env.js';

export const successResponse = (data, message = 'Success', pagination = null) => {
  const response = {
    success: true,
    data,
    message,
  };

  if (pagination) {
    response.pagination = {
      page: pagination.page,
      total_pages: pagination.total_pages,
      total_results: pagination.total_results,
    };
  }

  return response;
};

export const errorResponse = (message, errorCode = 'UNKNOWN_ERROR', statusCode = 500) => ({
  success: false,
  message,
  error: {
    code: errorCode,
    statusCode,
  },
});

export const notFoundResponse = (message = 'Resource not found') => ({
  success: false,
  message,
  error: {
    code: 'NOT_FOUND',
  },
});

export const sendControllerError = (res, error, fallbackMessage) => {
  const message = error?.message || fallbackMessage;
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('authentication')) {
    return res.status(401).json(errorResponse(message, 'TMDB_AUTH', 401));
  }

  if (lowerMessage.includes('rate limit')) {
    return res.status(429).json(errorResponse(message, 'RATE_LIMIT', 429));
  }

  return res
    .status(500)
    .json(errorResponse(message || ERROR_MESSAGES.TMDB_REQUEST_FAILED, 'TMDB_REQUEST_FAILED', 500));
};
