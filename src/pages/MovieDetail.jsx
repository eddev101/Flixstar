import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import './Detail.css'

const API_KEY = '5ec279387e9aa9488ef4d00b22acc451'
const IMG = 'https://image.tmdb.org/t/p'

export default function MovieDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [movie, setMovie] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeServer, setActiveServer] = useState(null)
  const [showPlayer, setShowPlayer] = useState(false)
  const [activeTrailer, setActiveTrailer] = useState(null)
  const [showTrailer, setShowTrailer] = useState(false)

  useEffect(() => {
    setShowPlayer(false)
    setShowTrailer(false)
    fetchMovie()
    window.scrollTo(0, 0)
  }, [id])

  async function fetchMovie() {
    setLoading(true)
    try {
      const res = await axios.get(
        `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&append_to_response=credits,videos,recommendations,external_ids`
      )
      setMovie(res.data)
      const imdbId = res.data.external_ids?.imdb_id
      setActiveServer(imdbId
        ? `https://streamimdb.ru/embed/movie/${imdbId}`
        : `https://player.videasy.net/movie/${id}`
      )
    } catch (e) { console.log(e) }
    finally { setLoading(false) }
  }

  function saveContinueWatching() {
    const raw = localStorage.getItem('continueWatching')
    let list = raw ? JSON.parse(raw) : []
    list = list.filter(i => !(String(i.id) === String(id) && i.type === 'movie'))
    list.unshift({ id: String(id), type: 'movie', updatedAt: Date.now() })
    localStorage.setItem('continueWatching', JSON.stringify(list.slice(0, 10)))
  }

  function addToWatchlist() {
    const raw = localStorage.getItem('watchlist')
    const list = raw ? JSON.parse(raw) : []
    if (!list.some(i => i.id === String(id) && i.type === 'movie')) {
      list.push({ id: String(id), type: 'movie' })
      localStorage.setItem('watchlist', JSON.stringify(list))
      alert('Added to watchlist!')
    } else alert('Already in watchlist!')
  }

  function addToFavorites() {
    const raw = localStorage.getItem('favorites')
    const list = raw ? JSON.parse(raw) : []
    if (!list.some(i => i.id === String(id) && i.type === 'movie')) {
      list.push({ id: String(id), type: 'movie' })
      localStorage.setItem('favorites', JSON.stringify(list))
      alert('Added to favorites!')
    } else alert('Already in favorites!')
  }

  function downloadMovie() {
    window.open(`https://1337x.to/search/${encodeURIComponent(movie.title)}/1/`, '_blank')
  }

  if (loading) return <div className="loader"><div className="spinner" /></div>
  if (!movie) return null

  const director = movie.credits?.crew?.find(c => c.job === 'Director')
  const trailers = movie.videos?.results?.filter(v => v.type === 'Trailer' && v.site === 'YouTube') || []
  const imdbId = movie.external_ids?.imdb_id

  const servers = [
    { name: 'StreamIMDB', url: imdbId ? `https://streamimdb.ru/embed/movie/${imdbId}` : null },
    { name: 'Videasy', url: `https://player.videasy.net/movie/${id}` },
    { name: 'Vidsrc', url: `https://vidsrc.me/embed/${id}` },
    { name: '2Embed', url: `https://hnembed.cc/embed/movie/${id}` },
    { name: 'SuperEmbed', url: `https://multiembed.mov/?video_id=${id}&tmdb=1` },
    { name: 'Vidplus', url: `https://player.vidplus.to/embed/movie/${id}` },
  ].filter(s => s.url)

  return (
    <div className="detail-page">
      {/* Hero */}
      <div className="detail-hero" style={{ backgroundImage: `url(${IMG}/original${movie.backdrop_path})` }}>
        <div className="detail-hero-gradient">
          <div className="container detail-hero-content">
            <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

             {/* Player */}
        {showPlayer && (
          <div className="player-section">
            <div className="servers-row">
              {servers.map(s => (
                <button
                  key={s.name}
                  className={`server-btn ${activeServer === s.url ? 'active' : ''}`}
                  onClick={() => setActiveServer(s.url)}
                >▶ {s.name}</button>
              ))}
            </div>
            <div className="player-wrap">
              <iframe src={activeServer} allowFullScreen allow="autoplay; fullscreen" />
            </div>
            <button className="btn btn-dark close-btn" onClick={() => setShowPlayer(false)}>✕ Close Player</button>
          </div>
        )}


            
            <div className="detail-top">
              <img src={movie.poster_path ? `${IMG}/w342${movie.poster_path}` : 'https://eddev101.github.io/flixstar-app/images/default.webp'} alt={movie.title} className="detail-poster" />
              <div className="detail-info">
                <h1 className="detail-title">{movie.title}</h1>
                <div className="detail-meta-row">
                  <span className="badge badge-dark">{movie.release_date?.slice(0, 4)}</span>
                  <span className="badge badge-yellow">⭐ {movie.vote_average?.toFixed(1)}</span>
                  <span className="badge badge-dark">{movie.runtime} min</span>
                </div>
                <div className="detail-facts">
                  <div className="fact-row"><span className="fact-label">Genres:</span><span>{movie.genres?.map(g => g.name).join(', ')}</span></div>
                  {director && <div className="fact-row"><span className="fact-label">Director:</span><span>{director.name}</span></div>}
                  <div className="fact-row"><span className="fact-label">Status:</span><span>{movie.status}</span></div>
                </div>
                <div className="detail-actions">
                  <button className="btn btn-primary" onClick={() => { saveContinueWatching(); setShowPlayer(true); window.scrollTo(0, 0) }}>▶ Watch Now</button>
                  <button className="btn btn-dark" onClick={downloadMovie}>⬇ Download</button>
                  <button className="btn btn-dark" onClick={addToWatchlist}>🔖 Watchlist</button>
                  <button className="btn btn-dark" onClick={addToFavorites}>❤️ Favorites</button>
                </div>
              </div>
            </div>
            <p className="detail-overview">{movie.overview}</p>
          </div>
        </div>
      </div>

      <div className="container">
       
        {/* Trailers */}
        {trailers.length > 0 && (
          <div className="section">
            <h2 className="section-title">Trailers</h2>
            <div className="cards-row">
              {trailers.map(t => (
                <div key={t.key} className="trailer-card" onClick={() => { setActiveTrailer(t.key); setShowTrailer(true) }}>
                  <img src={`https://img.youtube.com/vi/${t.key}/hqdefault.jpg`} alt={t.name} />
                  <div className="trailer-overlay">▶</div>
                  <div className="trailer-name">{t.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trailer Modal */}
        {showTrailer && activeTrailer && (
          <div className="modal-overlay" onClick={() => setShowTrailer(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowTrailer(false)}>✕</button>
              <iframe
                src={`https://www.youtube.com/embed/${activeTrailer}?autoplay=1`}
                allowFullScreen
                allow="autoplay; fullscreen"
                className="modal-player"
              />
            </div>
          </div>
        )}

        {/* Cast */}
        <div className="section">
          <h2 className="section-title">Cast</h2>
          <div className="cards-row">
            {movie.credits?.cast?.slice(0, 15).map(person => (
              <Link to={`/person/${person.id}`} key={person.id} className="cast-card">
                <img
                  src={person.profile_path ? `${IMG}/w185${person.profile_path}` : 'https://eddev101.github.io/flixstar-app/images/default.webp'}
                  alt={person.name}
                />
                <div className="cast-name">{person.name}</div>
                <div className="cast-char">{person.character}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {movie.recommendations?.results?.length > 0 && (
          <div className="section">
            <h2 className="section-title">More Like This</h2>
            <div className="cards-row">
              {movie.recommendations.results.slice(0, 20).map(item => (
                <Link to={`/movie/${item.id}`} key={item.id} className="movie-card">
                  <div className="card-wrap">
                    <img src={item.poster_path ? `${IMG}/w342${item.poster_path}` : 'https://eddev101.github.io/flixstar-app/images/default.webp'} alt={item.title} />
                    <span className="rating-badge">⭐ {item.vote_average?.toFixed(1)}</span>
                  </div>
                  <div className="card-title">{item.title}</div>
                  <div className="card-meta"><span>{item.release_date?.slice(0, 4)}</span></div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
