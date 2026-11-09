import { Route, Routes } from 'react-router-dom';
import Home from '../pages/Home';
import Movies from '../pages/Movies';
import TVShows from '../pages/TVShows';
import Anime from '../pages/Anime';
import Trending from '../pages/Trending';
import Search from '../pages/Search';
import MyList from '../pages/MyList';
import Details from '../pages/Details';
import WatchNow from '../pages/WatchNow';
import WatchTVNow from '../pages/WatchTVNow';
import Person from '../pages/Person';
import NotFound from '../pages/NotFound';

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/movies" element={<Movies />} />
    <Route path="/tv" element={<TVShows />} />
    <Route path="/anime" element={<Anime />} />
    <Route path="/trending" element={<Trending />} />
    <Route path="/search" element={<Search />} />
    <Route path="/my-list" element={<MyList />} />
    <Route path="/movie/:id" element={<Details mediaType="movie" />} />
    <Route path="/tv/:id" element={<Details mediaType="tv" />} />
    <Route path="/anime/movie/:id" element={<Details mediaType="movie" isAnime />} />
    <Route path="/anime/tv/:id" element={<Details mediaType="tv" isAnime />} />
    <Route path="/person/:id" element={<Person />} />
    <Route path="watch-now/tv/:id" element={<WatchTVNow />} />
    <Route path="watch-now/:id" element={<WatchNow />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRoutes;
