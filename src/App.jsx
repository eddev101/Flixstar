import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Movies from './pages/Movies'
import TVShows from './pages/TVShows'
import Search from './pages/Search'
import MovieDetail from './pages/MovieDetail'
import TVShowDetail from './pages/TVShowDetail'
import PersonDetail from './pages/PersonDetail'
import Genres from './pages/Genres'
import GenreDetail from './pages/GenreDetail'
import Collections from './pages/Collections'
import CollectionDetail from './pages/CollectionDetail'
import People from './pages/People'
import TopMovies from './pages/TopMovies'
import TopTVShows from './pages/TopTVShows'
import Videos from './pages/Videos'
import Watchlist from './pages/Watchlist'
import Favorites from './pages/Favorites'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/tvshows" element={<TVShows />} />
        <Route path="/search" element={<Search />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/tv/:id" element={<TVShowDetail />} />
        <Route path="/person/:id" element={<PersonDetail />} />
        <Route path="/genres" element={<Genres />} />
        <Route path="/genre/:id/:type/:name" element={<GenreDetail />} />
        <Route path="/collections" element={<Collections />} />
        <Route path="/collection/:id" element={<CollectionDetail />} />
        <Route path="/people" element={<People />} />
        <Route path="/top-movies" element={<TopMovies />} />
        <Route path="/top-tvshows" element={<TopTVShows />} />
        <Route path="/videos" element={<Videos />} />
        <Route path="/watchlist" element={<Watchlist />} />
        <Route path="/favorites" element={<Favorites />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App