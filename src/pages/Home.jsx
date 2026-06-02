import { useEffect, useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Home.css'

const API_KEY = '5ec279387e9aa9488ef4d00b22acc451'
const IMG = 'https://image.tmdb.org/t/p'

export default function Home() {
  const [slider, setSlider] = useState([])
  const [sliderIndex, setSliderIndex] = useState(0)
  const [trending, setTrending] = useState([])
  const [nowPlaying, setNowPlaying] = useState([])
  const [topRated, setTopRated] = useState([])
  const [trendingShows, setTrendingShows] = useState([])
  const [popShows, setPopShows] = useState([])
  const [continueWatching, setContinueWatching] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchAll()
    loadContinueWatching()
  }, [])

  useEffect(() => {
    if (slider.length === 0) return
    const timer = setInterval(() => {
      setSliderIndex(i => (i + 1) % slider.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slider])

  async function fetchAll() {
    try {
      const [t, n, tr, ts, ps] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/trending/movie/day?api_key=${API_KEY}`),
        axios.get(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}`),
        axios.get(`https://api.themoviedb.org/3/movie/top_rated?api_key=${API_KEY}`),
        axios.get(`https://api.themoviedb.org/3/trending/tv/week?api_key=${API_KEY}`),
        axios.get(`https://api.themoviedb.org/3/trending/tv/day?api_key=${API_KEY}`),
      ])
      const movies = t.data.results
      const tvs = ts.data.results
      const combined = [...movies, ...tvs].sort(() => Math.random() - 0.5).slice(0, 6)
      setSlider(combined)
      setTrending(t.data.results.slice(0, 20))
      setNowPlaying(n.data.results.slice(0, 20))
      setTopRated(tr.data.results.slice(0, 20))
      setTrendingShows(ts.data.results.slice(0, 20))
      setPopShows(ps.data.results.slice(0, 20))
    } catch (e) { console.log(e) }
    finally { setLoading(false) }
  }

  async function loadContinueWatching() {
    const raw = localStorage.getItem('continueWatching')
    const list = raw ? JSON.parse(raw) : []
    if (!list.length) return
    try {
      const fetched = await Promise.all(list.map(async item => {
        const url = item.type === 'movie'
          ? `https://api.themoviedb.org/3/movie/${item.id}?api_key=${API_KEY}`
          : `https://api.themoviedb.org/3/tv/${item.id}?api_key=${API_KEY}`
        const res = await axios.get(url)
        return { ...res.data, type: item.type, season: item.season, episode: item.episode }
      }))
      setContinueWatching(fetched)
    } catch (e) { console.log(e) }
  }

  function removeContinueWatching(id, type) {
  const raw = localStorage.getItem('continueWatching')
  let list = raw ? JSON.parse(raw) : []
  list = list.filter(i => !(String(i.id) === String(id) && i.type === type))
  localStorage.setItem('continueWatching', JSON.stringify(list))
  setContinueWatching(prev => prev.filter(i => !(String(i.id) === String(id) && i.type === type)))
}

  function goTo(id, type) {
    if (type === 'movie' || !type) navigate(`/movie/${id}`)
    else navigate(`/tv/${id}`)
  }

  const slide = slider[sliderIndex]
  const isMovie = slide?.media_type === 'movie' || slide?.title

  if (loading) return <div className="loader"><div className="spinner" /></div>

  return (
    <div className="home-page">
      {/* Hero Slider */}
      {slide && (
        <div className="hero" style={{ backgroundImage: `url(${IMG}/original${slide.backdrop_path})` }}>
          <div className="hero-gradient">
            <div className="hero-content">
              <div className="hero-badges">
                <span className="badge badge-dark">{(slide.release_date || slide.first_air_date || '').slice(0, 4)}</span>
                <span className="badge badge-yellow">{slide.vote_average?.toFixed(1)}</span>
                <span className="badge badge-blue">{isMovie ? 'Movie' : 'TV Show'}</span>
              </div>
              <h1 className="hero-title">{slide.title || slide.name}</h1>
              <p className="hero-overview">{slide.overview?.slice(0, 150)}...</p>
              <div className="hero-buttons">
                <button className="btn btn-primary" onClick={() => goTo(slide.id, slide.media_type)}>▶ Play</button>
                <button className="btn btn-secondary" onClick={() => goTo(slide.id, slide.media_type)}>+ My List</button>
              </div>
            </div>
            <div className="hero-dots">
              {slider.map((_, i) => (
                <div key={i} className={`dot ${i === sliderIndex ? 'active' : ''}`} onClick={() => setSliderIndex(i)} />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="container">
        {/* Continue Watching */}
        {continueWatching.length > 0 && (
          <div className="section">
            <div className="section-header">
              <h2 className="section-title">▶ Continue Watching</h2>
            </div>
            <div className="cards-row">
              {continueWatching.map(item => (
               <div key={item.id} className="movie-card" style={{ position: 'relative' }}>
              <div className="card-wrap" onClick={() => goTo(item.id, item.type)} style={{ cursor: 'pointer' }}>
                <img src={`${IMG}/w342${item.poster_path}`} alt={item.title || item.name} />
                <span className="rating-badge">⭐ {item.vote_average?.toFixed(1)}</span>
              </div>
              {/* Remove button */}
              <button
                onClick={() => removeContinueWatching(item.id, item.type)}
                style={{
                  position: 'absolute', top: 6, left: 6,
                  background: 'rgba(0,0,0,0.75)', border: 'none',
                  color: '#fff', width: 24, height: 24, borderRadius: '50%',
                  cursor: 'pointer', fontSize: '0.75rem', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', zIndex: 2
                }}
              >✕</button>
              <div className="card-title" style={{ cursor: 'pointer' }} onClick={() => goTo(item.id, item.type)}>
                {item.title || item.name}
              </div>
              <div className="card-meta">
                <span style={{ color: 'var(--blue)' }}>
                  {item.type === 'tv' ? `S${item.season} E${item.episode}` : 'Continue'}
                </span>
              </div>
            </div>
              ))}
            </div>
          </div>
        )}

        <Section title="Now Playing" data={nowPlaying} type="movie" viewAll="/movies" />
        <Section title="🔥 Trending Movies" data={trending} type="movie" viewAll="/movies" />
        <Section title="⭐ Top Rated Movies" data={topRated} type="movie" viewAll="/movies" />
        <TVSection title="📺 Today's Top TV Shows" data={popShows} viewAll="/tvshows" />
        <TVSection title="🌟 This Week's Top TV Shows" data={trendingShows} viewAll="/tvshows" />
      </div>
    </div>
  )
}

function Section({ title, data, type, viewAll }) {
  const navigate = useNavigate()
  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        <Link to={viewAll} className="view-all">View All →</Link>
      </div>
      <div className="cards-row">
        {data.map(item => (
          <div key={item.id} className="movie-card" onClick={() => navigate(type === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`)}>
            <div className="card-wrap">
              <img src={item.poster_path ? `${IMG}/w342${item.poster_path}` : 'https://eddev101.github.io/flixstar-app/images/default.webp'} alt={item.title || item.name} />
              <span className="rating-badge">⭐ {item.vote_average?.toFixed(1)}</span>
            </div>
            <div className="card-title">{item.title || item.name}</div>
            <div className="card-meta">
              <span>{(item.release_date || item.first_air_date || '').slice(0, 4)}</span>
              <span>{type === 'movie' ? 'Movie' : 'TV'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TVSection({ title, data, viewAll }) {
  const navigate = useNavigate()
  return (
    <div className="section">
      <div className="section-header">
        <h2 className="section-title">{title}</h2>
        <Link to={viewAll} className="view-all">View All →</Link>
      </div>
      <div className="cards-row">
        {data.map(item => (
          <div key={item.id} className="movie-card" onClick={() => navigate(`/tv/${item.id}`)}>
            <div className="card-wrap">
              <img src={item.poster_path ? `${IMG}/w342${item.poster_path}` : 'https://eddev101.github.io/flixstar-app/images/default.webp'} alt={item.title || item.name} />
              <span className="rating-badge">⭐ {item.vote_average?.toFixed(1)}</span>
            </div>
            <div className="card-title">{item.name}</div>
            <div className="card-meta">
              <span>{(item.first_air_date || '').slice(0, 4)}</span>
              <span>TV Show</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}