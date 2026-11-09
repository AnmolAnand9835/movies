import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

import { corsOptions } from './config/env.js';
import errorMiddleware from './middleware/error.middleware.js';
import notFoundMiddleware from './middleware/notFound.middleware.js';

import trendingRoutes from './routes/trending.routes.js';
import movieRoutes from './routes/movie.routes.js';
import tvRoutes from './routes/tv.routes.js';
import animeRoutes from './routes/anime.routes.js';
import searchRoutes from './routes/search.routes.js';
import genreRoutes from './routes/genre.routes.js';
import personRoutes from './routes/person.routes.js';
import watchRoutes from './routes/watch.routes.js';

const app = express();

app.use(express.json());
app.use(helmet());
app.use(cors(corsOptions));

trendingRoutes(app);
movieRoutes(app);
tvRoutes(app);
animeRoutes(app);
searchRoutes(app);
genreRoutes(app);
personRoutes(app);
watchRoutes(app);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;

let server;

export const startServer = () => {
  server = app.listen(PORT, () => {
    console.log(`CineAtlas backend running on port ${PORT}`);
    console.log(`API base: http://localhost:${PORT}/api/v1`);
    console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
  });

  return server;
};

export const stopServer = () => {
  if (server) server.close();
};

export default app;
