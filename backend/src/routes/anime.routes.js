import {
  getAnimeMovies,
  getAnimeTV,
  getAnimePopular,
  getAnimeTopRated,
  getAnimeDetails,
  getAnimeSeason,
} from '../controllers/anime.controller.js';

const animeRoutes = (app) => {
  app.get('/api/v1/anime', getAnimeMovies);
  app.get('/api/v1/anime/movies', getAnimeMovies);
  app.get('/api/v1/anime/tv', getAnimeTV);
  app.get('/api/v1/anime/season', getAnimeSeason);
  app.get('/api/v1/anime/popular', getAnimePopular);
  app.get('/api/v1/anime/top-rated', getAnimeTopRated);
  app.get('/api/v1/anime/details', getAnimeDetails);
};

export default animeRoutes;
