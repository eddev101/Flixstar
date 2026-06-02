import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import './Search.css'

const API_KEY = '5ec279387e9aa9488ef4d00b22acc451'
const IMG = 'https://image.tmdb.org/t/p'

export default function Search() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const q = searchParams.get('q') || ''
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState(q)

  useEffect(() => { if (q) doSearch(q) }, [q])

  async function doSearch(text) {
  setLoading(true)
  try {
    const res = await axios.get(`https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(text)}`)
    const results = res.data.results

    // Filter out adult content same way as collections
    const filtered = results.filter(item => {
      // Remove items marked as adult by TMDB
      if (item.adult === true) return false
      // Filter people known only for adult content
      if (item.media_type === 'person' && item.known_for_department === 'Adult') return false
      // Filter by title/name keywords
      const title = (item.title || item.name || '').toLowerCase()
      const nsfw = ['porn', 'xxx', 'anal', 'nude', 'hentai', 'erotic', 'explicit', 'nsfw', 'sex tape', 'hardcore']
      if (nsfw.some(word => title.includes(word))) return false
      return true
    })

    setResults(filtered)
  } catch (e) { console.log(e) }
  finally { setLoading(false) }
}

  function handleSubmit(e) {
    e.preventDefault()
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  function goTo(item) {
    if (item.media_type === 'movie') navigate(`/movie/${item.id}`)
    else if (item.media_type === 'tv') navigate(`/tv/${item.id}`)
    else if (item.media_type === 'person') navigate(`/person/${item.id}`)
  }

  return (
    <div className="page container">
      <h1 className="page-title">Search</h1>
      <form onSubmit={handleSubmit} className="search-form">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search movies, TV shows, people..."
          className="search-input"
          autoFocus
        />
        <button type="submit" className="btn btn-primary">🔍 Search</button>
      </form>

      {loading && <div className="loader"><div className="spinner" /></div>}

      <div className="search-results">
        {results.map(item => {
          const title = item.title || item.name
          const year = (item.release_date || item.first_air_date || '').slice(0, 4)
          const img = item.poster_path || item.profile_path
          const type = item.media_type === 'movie' ? '🎬 Movie' : item.media_type === 'tv' ? '📺 TV Show' : '👤 Person'
          return (
            <div key={item.id} className="result-row" onClick={() => goTo(item)}>
              <img src={img ? `${IMG}/w185${img}` : 'https://eddev101.github.io/flixstar-app/images/default.webp'} alt={title} className={item.media_type === 'person' ? 'person-img' : ''} />
              <div className="result-info">
                <div className="result-title">{title}</div>
                <div className="result-meta">
                  <span className="result-type">{type}</span>
                  {year && <span>{year}</span>}
                </div>
                {item.vote_average > 0 && <div className="result-rating">⭐ {item.vote_average?.toFixed(1)}</div>}
                {item.known_for_department && <div className="result-dept">Known for {item.known_for_department}</div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}