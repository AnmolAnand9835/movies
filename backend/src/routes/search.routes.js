import {
  searchMovies,
  searchTV,
  searchPeople,
  searchMulti,
} from '../controllers/search.controller.js';

const searchRoutes = (app) => {
  app.get('/api/v1/search/movies', searchMovies);
  app.get('/api/v1/search/tv', searchTV);
  app.get('/api/v1/search/people', searchPeople);
  app.get('/api/v1/search/multi', searchMulti);
};

export default searchRoutes;
