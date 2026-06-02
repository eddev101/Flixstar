import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './List.css'

const API_KEY = '5ec279387e9aa9488ef4d00b22acc451'
const IMG = 'https://image.tmdb.org/t/p'

const SORT_OPTIONS = [
  { label: 'Popularity', value: 'popularity.desc' },
  { label: 'Rating', value: 'vote_average.desc' },
  { label: 'Newest', value: 'primary_release_date.desc' },
  { label: 'Oldest', value: 'primary_release_date.asc' },
  { label: 'Title A-Z', value: 'original_title.asc' },
]
const PROVIDERS = [
  { label: 'Any', value: '' }, { label: 'Netflix', value: '8' },
  { label: 'Amazon', value: '9' }, { label: 'Disney+', value: '337' },
  { label: 'Apple TV', value: '2' }, { label: 'Hulu', value: '15' },
]
const RATINGS = [
  { label: 'Any', value: '0' }, { label: '6+', value: '6' },
  { label: '7+', value: '7' }, { label: '8+', value: '8' }, { label: '9+', value: '9' },
]
const currentYear = new Date().getFullYear()
const YEARS = [{ label: 'Any', value: '' }, ...Array.from({ length: currentYear - 1949 }, (_, i) => {
  const y = currentYear - i; return { label: String(y), value: String(y) }
})]




export default function Movies() {
  const [showFilters, setShowFilters] = useState(false)
  const navigate = useNavigate()
  const [movies, setMovies] = useState([])
  const [genres, setGenres] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState({ genre: '', year: '', sort: 'popularity.desc', provider: '', rating: '0' })

  useEffect(() => { fetchGenres() }, [])
  useEffect(() => { fetchMovies(1) }, [filters])

  async function fetchGenres() {
    const res = await axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`)
    setGenres(res.data.genres)
  }

  async function fetchMovies(p) {
    setLoading(true)
    try {
      let url = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&page=${p}&sort_by=${filters.sort}`
      if (filters.genre) url += `&with_genres=${filters.genre}`
      if (filters.year) url += `&primary_release_year=${filters.year}`
      if (filters.provider) url += `&watch_region=US&with_watch_providers=${filters.provider}`
      if (filters.rating !== '0') url += `&vote_average.gte=${filters.rating}`
      const res = await axios.get(url)
      if (p === 1) setMovies(res.data.results)
      else setMovies(prev => [...prev, ...res.data.results])
      setTotalPages(res.data.total_pages)
      setPage(p)
    } catch (e) { console.log(e) }
    finally { setLoading(false) }
  }

  const activeCount = Object.entries(filters).filter(([k, v]) =>
  k === 'sort' ? v !== 'popularity.desc' : v !== '' && v !== '0'
).length

function resetFilters() {
  setFilters({ genre: '', year: '', sort: 'popularity.desc', provider: '', rating: '0' })
}


 function FilterChips({ label, options, field }) {
    return (
      <div className="filter-group">
        <span className="filter-label">{label}</span>
        <div className="filter-chips">
          {options.map(opt => (
            <button
              key={opt.value}
              className={`chip ${filters[field] === opt.value ? 'active' : ''}`}
              onClick={() => setFilters(f => ({ ...f, [field]: opt.value }))}
            >{opt.label}</button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="page container">
      <h1 className="page-title">Movies</h1>

      <div className="filter-toggle-bar">
        <button
          className={`filter-toggle-btn ${showFilters ? 'active' : ''}`}
          onClick={() => setShowFilters(!showFilters)}
        >
          ⚙ Filters {activeCount > 0 ? `(${activeCount})` : ''}
          <span>{showFilters ? '▲' : '▼'}</span>
        </button>
        {activeCount > 0 && (
          <button className="filter-reset-btn" onClick={resetFilters}>✕ Clear</button>
        )}
      </div>

      {showFilters && (
        <div className="filters">
          <FilterChips label="Genre" options={[{ label: 'Any', value: '' }, ...genres.map(g => ({ label: g.name, value: String(g.id) }))]} field="genre" />
          <FilterChips label="Sort" options={SORT_OPTIONS} field="sort" />
          <FilterChips label="Year" options={YEARS} field="year" />
          <FilterChips label="Provider" options={PROVIDERS} field="provider" />
          <FilterChips label="Min Rating" options={RATINGS} field="rating" />
        </div>
      )}

      {loading && page === 1
        ? <div className="loader"><div className="spinner" /></div>
        : <>
          <div className="grid-3">
            {movies.map(item => (
              <div key={item.id} className="movie-card" onClick={() => navigate(`/movie/${item.id}`)}>
                <div className="card-wrap">
                  <img src={item.poster_path ? `${IMG}/w342${item.poster_path}` : 'https://eddev101.github.io/flixstar-app/images/default.webp'} alt={item.title} />
                  <span className="rating-badge">⭐ {item.vote_average?.toFixed(1)}</span>
                </div>
                <div className="card-title">{item.title}</div>
                <div className="card-meta"><span>{item.release_date?.slice(0, 4)}</span></div>
              </div>
            ))}
          </div>
          {page < totalPages && (
            <button className="btn btn-primary load-more" onClick={() => fetchMovies(page + 1)}>
              {loading ? 'Loading...' : 'Load More'}
            </button>
          )}
        </>
      }
    </div>
  )
}