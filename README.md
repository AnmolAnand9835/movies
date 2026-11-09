# CineAtlas

CineAtlas is a movie, television, and anime discovery app built with React and Express. Browse popular, trending, and genre-based titles; search for movies, series, and people; view title details; and explore anime seasons and episodes.

The React frontend talks to the local Express API, which retrieves catalogue metadata from [TMDB](https://www.themoviedb.org/). Watchlist data is stored locally in the browser. Playback links are provided by third-party embeds and depend on those providers' availability.

## Features

- Browse movies, TV shows, anime movies, and anime series.
- Explore trending titles, genres, cast, related titles, and search results.
- View TV and anime seasons and episodes, including episode artwork and metadata.
- Select episodes to update the series player URL; movies use a movie URL.
- Keep a device-local watchlist.
- Responsive interface built with React, Vite, Tailwind CSS, and React Query.

## Requirements

- Node.js 18 or later
- npm
- A TMDB API key or API Read Access Token

## Getting started

Install dependencies in each application directory:

```powershell
cd backend
npm install

cd ..\Frontend
npm install
```

Create `backend/.env` with the backend settings and TMDB credential:

```dotenv
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
TMDB_API_READ_ACCESS_TOKEN=your_tmdb_read_access_token
```

Alternatively, use `TMDB_APIKEY=your_tmdb_api_key` instead of the read access token. Do not commit credentials.

Start the backend and frontend in separate terminals:

```powershell
# Terminal 1
cd backend
npm run dev
```

```powershell
# Terminal 2
cd Frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite proxies `/api` requests to `http://localhost:5000`; `FRONTEND_URL` must allow the origin you use in your browser.

## Commands

### Backend

Run these commands from `backend/`:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the API with Nodemon |
| `npm start` | Start the API |
| `npm test` | Run the Node.js test runner |

### Frontend

Run these commands from `Frontend/`:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build in `Frontend/dist/` |
| `npm run preview` | Preview the production build |

The frontend API base can be overridden with `VITE_API_BASE_URL`, for example `http://localhost:5000/api/v1`. In development, it defaults to the Vite `/api/v1` proxy.

## API overview

The backend serves JSON under `/api/v1`. Common routes include:

| Area | Routes |
| --- | --- |
| Movies | `/movies`, `/movies/popular`, `/movies/top-rated`, `/movies/now-playing`, `/movies/upcoming`, `/movies/:id` |
| TV | `/tv`, `/tv/popular`, `/tv/top-rated`, `/tv/:id`, `/tv/:id/season/:seasonNumber` |
| Anime | `/anime`, `/anime/popular`, `/anime/movies`, `/anime/tv`, `/anime/top-rated` |
| Search | `/search/movies`, `/search/tv`, `/search/people`, `/search/multi` |
| Trending | `/trending/all`, `/trending/movies`, `/trending/tv`, `/trending/people` |
| Genres | `/genres/movies`, `/genres/tv` |
| People | `/people/:id`, `/people/:id/credits` |

List routes generally accept a `page` query parameter. See `backend/src/routes/` for the complete route definitions.

## Project layout

```text
backend/   Express API, TMDB integration, and provider routes
Frontend/  React application, API clients, and Vite configuration
```

## Data and third-party services

CineAtlas uses TMDB for catalogue metadata and artwork. It is not endorsed or certified by TMDB. Playback embeds link to external services; CineAtlas does not host video content and cannot guarantee third-party availability.

## License

This project is distributed under the MIT License. See [LICENSE](./LICENSE).