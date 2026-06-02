import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Search.css'

const API_KEY = '5ec279387e9aa9488ef4d00b22acc451'
const IMG = 'https://image.tmdb.org/t/p'

export default function Watchlist() {
  const navigate = useNavigate()
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchWatchlist() }, [])

  async function fetchWatchlist() {
    setLoading(true)
    const raw = localStorage.getItem('watchlist')
    const list = raw ? JSON.parse(raw) : []
    if (!list.length) { setLoading(false); return }
    try {
      const fetched = await Promise.all(list.map(async item => {
        const url = item.type === 'movie'
          ? `https://api.themoviedb.org/3/movie/${item.id}?api_key=${API_KEY}`
          : `https://api.themoviedb.org/3/tv/${item.id}?api_key=${API_KEY}`
        const res = await axios.get(url)
        return { ...res.data, type: item.type }
      }))
      setItems(fetched)
    } catch (e) { console.log(e) }
    finally { setLoading(false) }
  }

  function remove(id, type) {
    const raw = localStorage.getItem('watchlist')
    let list = raw ? JSON.parse(raw) : []
    list = list.filter(i => !(String(i.id) === String(id) && i.type === type))
    localStorage.setItem('watchlist', JSON.stringify(list))
    setItems(prev => prev.filter(i => !(String(i.id) === String(id) && i.type === type)))
  }

  if (loading) return <div className="loader"><div className="spinner" /></div>

  return (
    <div className="page container">
      <h1 className="page-title">🔖 My Watchlist</h1>
      {items.length === 0
        ? <div style={{ textAlign: 'center', color: 'var(--text-dim)', marginTop: 60, fontSize: '1.1rem' }}>Your watchlist is empty</div>
        : <div className="search-results">
          {items.map(item => {
            const title = item.title || item.name
            const year = (item.release_date || item.first_air_date || '').slice(0, 4)
            return (
              <div key={item.id} className="result-row">
                <img src={item.poster_path ? `${IMG}/w185${item.poster_path}` : 'https://eddev101.github.io/flixstar-app/images/default.webp'} alt={title} onClick={() => navigate(item.type === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`)} style={{ cursor: 'pointer' }} />
                <div className="result-info" style={{ flex: 1, cursor: 'pointer' }} onClick={() => navigate(item.type === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`)}>
                  <div className="result-title">{title}</div>
                  <div className="result-meta">
                    <span className="result-type">{item.type === 'movie' ? '🎬 Movie' : '📺 TV Show'}</span>
                    <span>{year}</span>
                  </div>
                  <div className="result-rating">⭐ {item.vote_average?.toFixed(1)}</div>
                </div>
                <button onClick={() => remove(item.id, item.type)} style={{ background: 'none', border: 'none', color: '#e50914', fontSize: '1.3rem', cursor: 'pointer', padding: '0 16px' }}>✕</button>
              </div>
            )
          })}
        </div>
      }
    </div>
  )
}