import {
  getAnimeMovies,
  getAnimeTV,
  getAnimePopular,
  getAnimeTopRated,
  getAnimeDetails,
  getAnimeSeason,
} from '../controllers/anime.controller.js';
import {
  validateAnimeDetails,
  validateAnimeSeason,
  validatePage,
} from '../middleware/validate.middleware.js';

const animeRoutes = (app) => {
  app.get('/api/v1/anime', validatePage, getAnimeMovies);
  app.get('/api/v1/anime/movies', validatePage, getAnimeMovies);
  app.get('/api/v1/anime/tv', validatePage, getAnimeTV);
  app.get('/api/v1/anime/season', validateAnimeSeason, getAnimeSeason);
  app.get('/api/v1/anime/popular', validatePage, getAnimePopular);
  app.get('/api/v1/anime/top-rated', validatePage, getAnimeTopRated);
  app.get('/api/v1/anime/details', validateAnimeDetails, getAnimeDetails);
};

export default animeRoutes;
