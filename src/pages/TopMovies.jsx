import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './List.css'

const API_KEY = '5ec279387e9aa9488ef4d00b22acc451'
const IMG = 'https://image.tmdb.org/t/p'

export default function TopMovies() {
  const navigate = useNavigate()
  const [movies, setMovies] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => { fetchMovies(1) }, [])

  async function fetchMovies(p) {
    setLoading(true)
    try {
      const res = await axios.get(`https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&sort_by=vote_average.desc&vote_count.gte=1000&page=${p}`)
      if (p === 1) setMovies(res.data.results)
      else setMovies(prev => [...prev, ...res.data.results])
      setTotalPages(res.data.total_pages)
      setPage(p)
    } catch (e) { console.log(e) }
    finally { setLoading(false) }
  }

  return (
    <div className="page container">
      <h1 className="page-title">🏆 Top Movies</h1>
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
            <button className="btn btn-primary load-more" onClick={() => fetchMovies(page + 1)}>Load More</button>
          )}
        </>
      }
    </div>
  )
}