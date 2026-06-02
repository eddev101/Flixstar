import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import './Detail.css'

const API_KEY = '5ec279387e9aa9488ef4d00b22acc451'
const IMG = 'https://image.tmdb.org/t/p'

export default function TVShowDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [show, setShow] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeServer, setActiveServer] = useState(null)
  const [showPlayer, setShowPlayer] = useState(false)
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [selectedEpisode, setSelectedEpisode] = useState(1)
  const [episodes, setEpisodes] = useState([])
  const [activeTrailer, setActiveTrailer] = useState(null)
  const [showTrailer, setShowTrailer] = useState(false)

  useEffect(() => {
    setShowPlayer(false)
    setShowTrailer(false)
    fetchShow()
    window.scrollTo(0, 0)
  }, [id])

  useEffect(() => { if (show) fetchEpisodes(selectedSeason) }, [selectedSeason, show])

  async function fetchShow() {
    setLoading(true)
    try {
      const res = await axios.get(
        `https://api.themoviedb.org/3/tv/${id}?api_key=${API_KEY}&append_to_response=credits,videos,recommendations,external_ids`
      )
      setShow(res.data)
      const imdbId = res.data.external_ids?.imdb_id;
      setActiveServer(imdbId
        ? `https://streamimdb.ru/embed/tv/${imdbId}`
        : `https://player.videasy.net/tv/${id}`
      )
    } catch (e) { console.log(e) }
    finally { setLoading(false) }
  }

  async function fetchEpisodes(season) {
    try {
      const res = await axios.get(`https://api.themoviedb.org/3/tv/${id}/season/${season}?api_key=${API_KEY}`)
      setEpisodes(res.data.episodes || [])
    } catch (e) { console.log(e) }
  }

  function saveContinueWatching(season, episode) {
    const raw = localStorage.getItem('continueWatching')
    let list = raw ? JSON.parse(raw) : []
    list = list.filter(i => !(String(i.id) === String(id) && i.type === 'tv'))
    list.unshift({ id: String(id), type: 'tv', season, episode, updatedAt: Date.now() })
    localStorage.setItem('continueWatching', JSON.stringify(list.slice(0, 10)))
  }

  function playEpisode(season, episode) {
    setSelectedSeason(season)
    setSelectedEpisode(episode)
    setActiveServer(
      imdbId
      ? `https://streamimdb.ru/embed/tv/${imdbId}/${season}/${episode}`
      : `https://player.videasy.net/tv/${id}/${season}/${episode}`
  )
    saveContinueWatching(season, episode)
    setShowPlayer(true)
    window.scrollTo(0, 0)
  }

  function addToWatchlist() {
    const raw = localStorage.getItem('watchlist')
    const list = raw ? JSON.parse(raw) : []
    if (!list.some(i => i.id === String(id) && i.type === 'tv')) {
      list.push({ id: String(id), type: 'tv' })
      localStorage.setItem('watchlist', JSON.stringify(list))
      alert('Added to watchlist!')
    } else alert('Already in watchlist!')
  }

  function addToFavorites() {
  const raw = localStorage.getItem('favorites')
  const list = raw ? JSON.parse(raw) : []
  if (!list.some(i => i.id === String(id) && i.type === 'tv')) {
    list.push({ id: String(id), type: 'tv' })
    localStorage.setItem('favorites', JSON.stringify(list))
    alert('Added to favorites!')
  } else alert('Already in favorites!')
}


  function downloadEpisode() {
    window.open(`https://1337x.to/category-search/${show.name.replace(/\s+/g, '+')}/TV/1/`, '_blank')
  }

  if (loading) return <div className="loader"><div className="spinner" /></div>
  if (!show) return null

  const trailers = show.videos?.results?.filter(v => v.type === 'Trailer' && v.site === 'YouTube') || []
  const imdbId = show.external_ids?.imdb_id

  const servers = [
    { name: 'StreamIMDB', url: imdbId ? `https://streamimdb.ru/embed/tv/${imdbId}/${selectedSeason}/${selectedEpisode}` : null },
    { name: 'Videasy', url: `https://player.videasy.net/tv/${id}/${selectedSeason}/${selectedEpisode}` },
    { name: 'Vidsrc', url: `https://vidsrc.me/embed/tv?tmdb=${id}&season=${selectedSeason}&episode=${selectedEpisode}` },
    { name: '2Embed', url: `https://hnembed.cc/embed/tv/${id}/${selectedSeason}/${selectedEpisode}` },
    { name: 'SuperEmbed', url: `https://multiembed.mov?video_id=${id}&tmdb=1&s=${selectedSeason}&e=${selectedEpisode}` },
  ]

  return (
    <div className="detail-page">
      <div className="detail-hero" style={{ backgroundImage: `url(${IMG}/original${show.backdrop_path})` }}>
        <div className="detail-hero-gradient">
          <div className="container detail-hero-content">
            <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
            <div className="detail-top">
              <img src={show.poster_path ? `${IMG}/w342${show.poster_path}` : 'https://eddev101.github.io/flixstar-app/images/default.webp'} alt={show.name} className="detail-poster" />
              <div className="detail-info">
                <h1 className="detail-title">{show.name}</h1>
                <div className="detail-meta-row">
                  <span className="badge badge-dark">{show.first_air_date?.slice(0, 4)}</span>
                  <span className="badge badge-yellow">⭐ {show.vote_average?.toFixed(1)}</span>
                  <span className="badge badge-dark">{show.number_of_seasons} Seasons</span>
                </div>
                <div className="detail-facts">
                  <div className="fact-row"><span className="fact-label">Genres:</span><span>{show.genres?.map(g => g.name).join(', ')}</span></div>
                  {show.created_by?.length > 0 && <div className="fact-row"><span className="fact-label">Created By:</span><span>{show.created_by.map(c => c.name).join(', ')}</span></div>}
                  <div className="fact-row"><span className="fact-label">Status:</span><span>{show.status}</span></div>
                </div>
                <div className="detail-actions">
                  <button className="btn btn-primary" onClick={() => { saveContinueWatching(1, 1); setShowPlayer(true); window.scrollTo(0, 0) }}>▶ Watch Now</button>
                  <button className="btn btn-dark" onClick={downloadEpisode}>⬇ Download</button>
                  <button className="btn btn-dark" onClick={addToWatchlist}>🔖 Watchlist</button>
                  <button className="btn btn-dark" onClick={addToFavorites}>❤️ Favorites</button>
                </div>
              </div>
            </div>
            <p className="detail-overview">{show.overview}</p>
          </div>
        </div>
      </div>

      <div className="container">
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

        {/* Seasons */}
        <div className="section">
          <h2 className="section-title">Seasons</h2>
          <div className="seasons-row">
            {show.seasons?.map(s => (
              <button
                key={s.season_number}
                className={`season-btn ${selectedSeason === s.season_number ? 'active' : ''}`}
                onClick={() => setSelectedSeason(s.season_number)}
              >S{s.season_number}</button>
            ))}
          </div>

          <h2 className="section-title">Episodes — Season {selectedSeason}</h2>
          {episodes.map(ep => (
            <div key={ep.episode_number} className="episode-row" onClick={() => playEpisode(selectedSeason, ep.episode_number)}>
              <img
                src={ep.still_path ? `${IMG}/w300${ep.still_path}` : 'https://eddev101.github.io/flixstar-app/images/default.webp'}
                alt={ep.name}
              />
              <div className="episode-info">
                <div className="episode-title">E{ep.episode_number}. {ep.name}</div>
                <div className="episode-overview">{ep.overview}</div>
                <div className="episode-play">▶ Play Episode</div>
              </div>
            </div>
          ))}
        </div>

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

        {showTrailer && activeTrailer && (
          <div className="modal-overlay" onClick={() => setShowTrailer(false)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <button className="modal-close" onClick={() => setShowTrailer(false)}>✕</button>
              <iframe src={`https://www.youtube.com/embed/${activeTrailer}?autoplay=1`} allowFullScreen allow="autoplay; fullscreen" className="modal-player" />
            </div>
          </div>
        )}

        {/* Cast */}
        <div className="section">
          <h2 className="section-title">Cast</h2>
          <div className="cards-row">
            {show.credits?.cast?.slice(0, 15).map(person => (
              <Link to={`/person/${person.id}`} key={person.id} className="cast-card">
                <img src={person.profile_path ? `${IMG}/w185${person.profile_path}` : 'https://eddev101.github.io/flixstar-app/images/default.webp'} alt={person.name} />
                <div className="cast-name">{person.name}</div>
                <div className="cast-char">{person.character}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {show.recommendations?.results?.length > 0 && (
          <div className="section">
            <h2 className="section-title">More Like This</h2>
            <div className="cards-row">
              {show.recommendations.results.slice(0, 20).map(item => (
                <Link to={`/tv/${item.id}`} key={item.id} className="movie-card">
                  <div className="card-wrap">
                    <img src={item.poster_path ? `${IMG}/w342${item.poster_path}` : 'https://eddev101.github.io/flixstar-app/images/default.webp'} alt={item.name} />
                    <span className="rating-badge">⭐ {item.vote_average?.toFixed(1)}</span>
                  </div>
                  <div className="card-title">{item.name}</div>
                  <div className="card-meta"><span>{item.first_air_date?.slice(0, 4)}</span></div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}