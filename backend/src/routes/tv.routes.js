import {
  getPopularTV,
  getTopRatedTV,
  getOnTheAirTV,
  getAiringTodayTV,
  getTVById,
  getTVCredits,
  getTVVideos,
  getTVSimilar,
  getTVRecommendations,
  getTVSeason,
  getTVExternalIds,
} from '../controllers/tv.controller.js';

const tvRoutes = (app) => {
  app.get('/api/v1/tv', getPopularTV);
  app.get('/api/v1/tv/popular', getPopularTV);
  app.get('/api/v1/tv/top-rated', getTopRatedTV);
  app.get('/api/v1/tv/on-the-air', getOnTheAirTV);
  app.get('/api/v1/tv/airing-today', getAiringTodayTV);
  app.get('/api/v1/tv/:id', getTVById);
  app.get('/api/v1/tv/:id/credits', getTVCredits);
  app.get('/api/v1/tv/:id/videos', getTVVideos);
  app.get('/api/v1/tv/:id/similar', getTVSimilar);
  app.get('/api/v1/tv/:id/recommendations', getTVRecommendations);
  app.get('/api/v1/tv/:id/season/:seasonNumber', getTVSeason);
  app.get('/api/v1/tv/:id/external-ids', getTVExternalIds);
};

export default tvRoutes;
