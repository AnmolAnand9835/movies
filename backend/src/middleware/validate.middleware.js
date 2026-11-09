import { body, param, query, validationResult } from 'express-validator';

const validateMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      error: { code: 'VALIDATION_ERROR', details: errors.array() },
    });
  }
  next();
};

const validateMovieId = [
  param('id').isInt({ min: 1 }).withMessage('Movie ID must be a positive integer'),
];

const validateTVId = [
  param('id').isInt({ min: 1 }).withMessage('TV ID must be a positive integer'),
];

const validatePage = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
];

const validateSearchQuery = [
  query('query').optional().isString().isLength({ min: 1 }).withMessage('Search query must be a non-empty string'),
];

const validateAnimeFilters = [
  query('language').optional().isIn(['ja', 'en']).withMessage('Language must be ja or en'),
  query('genre').optional().isInt({ min: 1 }).withMessage('Genre ID must be a positive integer'),
];

export { validateMiddleware, validateMovieId, validateTVId, validatePage, validateSearchQuery, validateAnimeFilters };