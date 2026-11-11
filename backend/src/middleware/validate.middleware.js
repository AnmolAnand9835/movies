import { z } from 'zod';

const formatIssue = (issue) => ({
  field: issue.path.join('.') || 'value',
  message: issue.message,
});

export const validateMiddleware = (schema) => (req, res, next) => {
  const payload = {
    body: req.body ?? {},
    query: req.query ?? {},
    params: req.params ?? {},
  };

  const result = schema.safeParse(payload);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: {
        code: 'VALIDATION_ERROR',
        details: result.error.issues.map(formatIssue),
      },
    });
  }

  if (result.data.body) req.body = result.data.body;
  if (result.data.query) req.query = result.data.query;
  if (result.data.params) req.params = result.data.params;

  next();
};

const positiveInteger = (fieldName) =>
  z.coerce
    .number({ invalid_type_error: `${fieldName} must be a number` })
    .int(`${fieldName} must be a whole number`)
    .positive(`${fieldName} must be greater than zero`);

const nonNegativeInteger = (fieldName) =>
  z.coerce
    .number({ invalid_type_error: `${fieldName} must be a number` })
    .int(`${fieldName} must be a whole number`)
    .min(0, `${fieldName} must be 0 or greater`);

export const validateRequest = validateMiddleware;

export const validateMovieId = validateMiddleware(
  z.object({
    params: z.object({
      id: positiveInteger('Movie ID'),
    }),
  })
);

export const validateTVId = validateMiddleware(
  z.object({
    params: z.object({
      id: positiveInteger('TV ID'),
    }),
  })
);

export const validatePage = validateMiddleware(
  z.object({
    query: z.object({
      page: z.coerce
        .number({ invalid_type_error: 'Page must be a number' })
        .int('Page must be a whole number')
        .min(1, 'Page must be at least 1')
        .optional(),
    }).passthrough(),
  })
);

export const validateSearchQuery = validateMiddleware(
  z.object({
    query: z.object({
      query: z.string({ invalid_type_error: 'Search query must be a string' })
        .trim()
        .min(1, 'Search query must be a non-empty string')
        .optional(),
    }).passthrough(),
  })
);

export const validateAnimeFilters = validateMiddleware(
  z.object({
    query: z.object({
      language: z.enum(['ja', 'en']).optional(),
      genre: positiveInteger('Genre ID').optional(),
    }).passthrough(),
  })
);

export const validateAnimeDetails = validateMiddleware(
  z.object({
    query: z.object({
      animeId: positiveInteger('animeId'),
      page: z.coerce
        .number({ invalid_type_error: 'Page must be a number' })
        .int('Page must be a whole number')
        .min(1, 'Page must be at least 1')
        .optional(),
    }).passthrough(),
  })
);

export const validateAnimeSeason = validateMiddleware(
  z.object({
    query: z.object({
      animeId: positiveInteger('animeId'),
      seasonNumber: nonNegativeInteger('seasonNumber'),
    }).passthrough(),
  })
);

export default validateMiddleware;