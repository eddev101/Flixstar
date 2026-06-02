import { useEffect, useState } from 'react'
import axios from 'axios'
import './Search.css'

const API_KEY = '5ec279387e9aa9488ef4d00b22acc451'
const IMG = 'https://image.tmdb.org/t/p'

export default function Videos() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [trailers, setTrailers] = useState([])
  const [activeTrailer, setActiveTrailer] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [modalTitle, setModalTitle] = useState('')

  useEffect(() => { fetchVideos(1, '') }, [])

  async function fetchVideos(p, q) {
    setLoading(true)
    try {
      const url = q
        ? `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(q)}&page=${p}`
        : `https://api.themoviedb.org/3/trending/all/day?api_key=${API_KEY}&page=${p}`
      const res = await axios.get(url)
      const filtered = res.data.results.filter(r => r.media_type === 'movie' || r.media_type === 'tv')
      setItems(filtered)
      setTotalPages(res.data.total_pages)
      setPage(p)
    } catch (e) { console.log(e) }
    finally { setLoading(false) }
  }

  async function openTrailers(id, type, title) {
    try {
      const url = type === 'movie'
        ? `https://api.themoviedb.org/3/movie/${id}/videos?api_key=${API_KEY}`
        : `https://api.themoviedb.org/3/tv/${id}/videos?api_key=${API_KEY}`
      const res = await axios.get(url)
      const vids = res.data.results.filter(v => v.site === 'YouTube')
      if (!vids.length) { alert('No trailers available.'); return }
      setTrailers(vids)
      setActiveTrailer(vids[0].key)
      setModalTitle(title)
      setShowModal(true)
    } catch (e) { console.log(e) }
  }

  function handleSearch(e) {
    e.preventDefault()
    fetchVideos(1, query)
  }

  return (
    <div className="page container">
      <h1 className="page-title">🎬 Videos</h1>
      <form onSubmit={handleSearch} className="search-form">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search for trailers..." className="search-input" />
        <button type="submit" className="btn btn-primary">🔍 Search</button>
      </form>

      {loading
        ? <div className="loader"><div className="spinner" /></div>
        : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {items.map(item => (
            <div key={item.id} onClick={() => openTrailers(item.id, item.media_type, item.title || item.name)}
              style={{ cursor: 'pointer', borderRadius: 10, overflow: 'hidden', background: 'var(--card-bg)', border: '1px solid var(--border)' }}>
              <div style={{ position: 'relative' }}>
                <img src={`${IMG}/w500${item.backdrop_path || item.poster_path}`} alt={item.title || item.name}
                  style={{ width: '100%', height: 160, objectFit: 'cover', background: '#0a0f1e' }} />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)', fontSize: '2.5rem', color: '#fff' }}>▶</div>
              </div>
              <div style={{ padding: '10px 14px' }}>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{item.title || item.name}</div>
                <div style={{ color: 'var(--blue)', fontSize: '0.78rem', marginTop: 4 }}>{item.media_type === 'movie' ? 'Movie' : 'TV Show'}</div>
              </div>
            </div>
          ))}
        </div>
      }

      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 24 }}>
        <button className="btn btn-dark" disabled={page === 1} onClick={() => fetchVideos(page - 1, query)}>← Prev</button>
        <span style={{ padding: '10px', color: 'var(--text-dim)' }}>Page {page}</span>
        <button className="btn btn-dark" disabled={page === totalPages} onClick={() => fetchVideos(page + 1, query)}>Next →</button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 900 }}>
            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            <iframe src={`https://www.youtube.com/embed/${activeTrailer}?autoplay=1`} allowFullScreen allow="autoplay; fullscreen" className="modal-player" />
            {trailers.length > 1 && (
              <div style={{ display: 'flex', gap: 10, padding: 12, overflowX: 'auto' }}>
                {trailers.map(t => (
                  <div key={t.key} onClick={() => setActiveTrailer(t.key)} style={{ flexShrink: 0, cursor: 'pointer', opacity: activeTrailer === t.key ? 1 : 0.6, border: activeTrailer === t.key ? '2px solid var(--blue)' : '2px solid transparent', borderRadius: 6 }}>
                    <img src={`https://img.youtube.com/vi/${t.key}/hqdefault.jpg`} alt={t.name} style={{ width: 140, height: 80, objectFit: 'cover', borderRadius: 4 }} />
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginTop: 4, width: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.name}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}