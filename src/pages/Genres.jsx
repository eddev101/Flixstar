import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_KEY = '5ec279387e9aa9488ef4d00b22acc451'
const IMG = 'https://image.tmdb.org/t/p'

export default function Genres() {
  const navigate = useNavigate()
  const [movieGenres, setMovieGenres] = useState([])
  const [tvGenres, setTvGenres] = useState([])
  const [tab, setTab] = useState('movie')
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchGenres() }, [])

  async function fetchGenres() {
    setLoading(true)
    try {
      const [mg, tg] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}`),
        axios.get(`https://api.themoviedb.org/3/genre/tv/list?api_key=${API_KEY}`),
      ])
      const withBg = async (genres, type) => Promise.all(genres.map(async g => {
        const res = await axios.get(`https://api.themoviedb.org/3/discover/${type}?api_key=${API_KEY}&with_genres=${g.id}&sort_by=popularity.desc`)
        const first = res.data.results[0]
        return { ...g, backdrop: first?.backdrop_path ? `${IMG}/w500${first.backdrop_path}` : null }
      }))
      const [mgBg, tgBg] = await Promise.all([withBg(mg.data.genres, 'movie'), withBg(tg.data.genres, 'tv')])
      setMovieGenres(mgBg)
      setTvGenres(tgBg)
    } catch (e) { console.log(e) }
    finally { setLoading(false) }
  }

  const data = tab === 'movie' ? movieGenres : tvGenres

  if (loading) return <div className="loader"><div className="spinner" /></div>

  return (
    <div className="page container">
      <h1 className="page-title">Genres</h1>
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <button className={`chip ${tab === 'movie' ? 'active' : ''}`} onClick={() => setTab('movie')}>Movies</button>
        <button className={`chip ${tab === 'tv' ? 'active' : ''}`} onClick={() => setTab('tv')}>TV Shows</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {data.map(g => (
          <div
            key={g.id}
            onClick={() => navigate(`/genre/${g.id}/${tab}/${g.name}`)}
            style={{
              height: 120, borderRadius: 12, overflow: 'hidden', cursor: 'pointer', position: 'relative',
              backgroundImage: g.backdrop ? `url(${g.backdrop})` : 'none',
              backgroundColor: 'var(--card-bg)', backgroundSize: 'cover', backgroundPosition: 'center'
            }}
          >
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: 14 }}>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{g.name}</div>
              <div style={{ color: 'var(--blue)', fontSize: '0.8rem', marginTop: 4 }}>View {tab === 'movie' ? 'Movies' : 'Shows'} →</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}