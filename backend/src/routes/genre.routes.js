import { getMovieGenres, getTVGenres } from '../controllers/genre.controller.js';

const genreRoutes = (app) => {
  app.get('/api/v1/genres/movies', getMovieGenres);
  app.get('/api/v1/genres/tv', getTVGenres);
};

export default genreRoutes;
