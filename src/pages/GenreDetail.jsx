import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './List.css'

const API_KEY = '5ec279387e9aa9488ef4d00b22acc451'
const IMG = 'https://image.tmdb.org/t/p'

export default function GenreDetail() {
  const { id, type, name } = useParams()
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => { fetchItems(1) }, [id])

  async function fetchItems(p) {
    setLoading(true)
    try {
      const res = await axios.get(`https://api.themoviedb.org/3/discover/${type}?api_key=${API_KEY}&with_genres=${id}&sort_by=popularity.desc&page=${p}`)
      if (p === 1) setItems(res.data.results)
      else setItems(prev => [...prev, ...res.data.results])
      setTotalPages(res.data.total_pages)
      setPage(p)
    } catch (e) { console.log(e) }
    finally { setLoading(false) }
  }

  return (
    <div className="page container">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
      <h1 className="page-title">{name}</h1>
      {loading && page === 1
        ? <div className="loader"><div className="spinner" /></div>
        : <>
          <div className="grid-3">
            {items.map(item => (
              <div key={item.id} className="movie-card" onClick={() => navigate(type === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`)}>
                <div className="card-wrap">
                  <img src={`${IMG}/w342${item.poster_path}`} alt={item.title || item.name} />
                  <span className="rating-badge">⭐ {item.vote_average?.toFixed(1)}</span>
                </div>
                <div className="card-title">{item.title || item.name}</div>
                <div className="card-meta"><span>{(item.release_date || item.first_air_date || '').slice(0, 4)}</span></div>
              </div>
            ))}
          </div>
          {page < totalPages && (
            <button className="btn btn-primary load-more" onClick={() => fetchItems(page + 1)}>Load More</button>
          )}
        </>
      }
    </div>
  )
}