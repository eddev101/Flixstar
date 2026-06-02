import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './Search.css'

const API_KEY = '5ec279387e9aa9488ef4d00b22acc451'
const IMG = 'https://image.tmdb.org/t/p'
const COLLECTION_IDS = [1241, 86311, 448150, 10, 263, 119, 121938, 295, 328, 531241, 748, 2344, 645, 8651, 9485, 87096, 528, 324552, 131635, 268, 137697, 87, 210511, 10194, 230, 36694, 152495, 8091, 261694, 8350]

export default function Collections() {
  const navigate = useNavigate()
  const [collections, setCollections] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => { loadCollections() }, [])

 async function loadCollections() {
  setLoading(true)
  const results = await Promise.all(
    COLLECTION_IDS.map(async id => {
      try {
        const res = await axios.get(`https://api.themoviedb.org/3/collection/${id}?api_key=${API_KEY}&language=en-US`)
        const nonAdult = res.data.parts.filter(movie => !movie.adult)
        return nonAdult.length > 0 ? res.data : null
      } catch { return null }
    })
  )
  setCollections(results.filter(Boolean))
  setLoading(false)
}

  async function searchCollections(e) {
  e.preventDefault()
  if (!query.trim()) { loadCollections(); return }
  setLoading(true)
  try {
    const res = await axios.get(`https://api.themoviedb.org/3/search/collection?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(query)}`)
    const collections = res.data.results

    // Check each collection's parts for adult content — same as your original site
    const filtered = await Promise.all(
      collections.map(async c => {
        try {
          const details = await axios.get(`https://api.themoviedb.org/3/collection/${c.id}?api_key=${API_KEY}&language=en-US`)
          const nonAdult = details.data.parts.filter(movie => !movie.adult)
          return nonAdult.length > 0 ? c : null
        } catch { return null }
      })
    )
    setCollections(filtered.filter(Boolean))
  } catch (e) { console.log(e) }
  finally { setLoading(false) }
}

  if (loading) return <div className="loader"><div className="spinner" /></div>

  return (
    <div className="page container">
      <h1 className="page-title">Collections</h1>
      <form onSubmit={searchCollections} className="search-form">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search collections..." className="search-input" />
        <button type="submit" className="btn btn-primary">🔍 Search</button>
      </form>
      <div className="search-results">
        {collections.map(c => (
          <div key={c.id} className="result-row" onClick={() => navigate(`/collection/${c.id}`)}>
            <img src={c.poster_path ? `${IMG}/w185${c.poster_path}` : 'https://eddev101.github.io/flixstar-app/images/default.webp'} alt={c.name} />
            <div className="result-info">
              <div className="result-title">{c.name}</div>
              <div className="result-meta"><span className="result-type">🎞️ Collection</span></div>
              {c.parts && <div style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>{c.parts.length} movies</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}