import {
  getTrendingAll,
  getTrendingMovies,
  getTrendingTV,
  getTrendingPeople,
} from '../controllers/trending.controller.js';

const trendingRoutes = (app) => {
  app.get('/api/v1/trending/all', getTrendingAll);
  app.get('/api/v1/trending/movies', getTrendingMovies);
  app.get('/api/v1/trending/tv', getTrendingTV);
  app.get('/api/v1/trending/people', getTrendingPeople);
};

export default trendingRoutes;
