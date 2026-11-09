import { notFoundResponse } from '../utils/Response.utils.js';

const notFoundMiddleware = (req, res) => {
  res.status(404).json(notFoundResponse('Route not found'));
};

export default notFoundMiddleware;
