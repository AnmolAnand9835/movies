import {
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
  getMovieById,
  getMovieCredits,
  getMovieVideos,
  getMovieSimilar,
  getMovieRecommendations,
  getMoviesByGenre,
  getMoviesByFilter,
} from '../controllers/movie.controller.js';

const movieRoutes = (app) => {
  app.get('/api/v1/movies', getPopularMovies);
  app.get('/api/v1/movies/popular', getPopularMovies);
  app.get('/api/v1/movies/top-rated', getTopRatedMovies);
  app.get('/api/v1/movies/now-playing', getNowPlayingMovies);
  app.get('/api/v1/movies/upcoming', getUpcomingMovies);
  app.get('/api/v1/movies/filter', getMoviesByFilter);
  app.get('/api/v1/movies/genre/:genreId', getMoviesByGenre);
  app.get('/api/v1/movies/:id', getMovieById);
  app.get('/api/v1/movies/:id/credits', getMovieCredits);
  app.get('/api/v1/movies/:id/videos', getMovieVideos);
  app.get('/api/v1/movies/:id/similar', getMovieSimilar);
  app.get('/api/v1/movies/:id/recommendations', getMovieRecommendations);
};

export default movieRoutes;
