import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'
import './PersonDetail.css'

const API_KEY = '5ec279387e9aa9488ef4d00b22acc451'
const IMG = 'https://image.tmdb.org/t/p'

export default function PersonDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [person, setPerson] = useState(null)
  const [credits, setCredits] = useState({ cast: [], crew: [] })
  const [loading, setLoading] = useState(true)
  const [showFullBio, setShowFullBio] = useState(false)

  useEffect(() => { fetchPerson(); window.scrollTo(0, 0) }, [id])

  async function fetchPerson() {
    setLoading(true)
    try {
      const [p, c] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/person/${id}?api_key=${API_KEY}`),
        axios.get(`https://api.themoviedb.org/3/person/${id}/combined_credits?api_key=${API_KEY}`),
      ])
      setPerson(p.data)
      setCredits({
        cast: c.data.cast.filter(i => !i.adult),
        crew: c.data.crew.filter(i => !i.adult),
      })
    } catch (e) { console.log(e) }
    finally { setLoading(false) }
  }

  if (loading) return <div className="loader"><div className="spinner" /></div>
  if (!person) return null

  const bio = person.biography || 'No biography available.'
  const shortBio = bio.length > 400 ? bio.slice(0, 400) + '...' : bio

  return (
    <div className="page container">
      <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

      <div className="person-header">
        <img
          src={person.profile_path ? `${IMG}/w500${person.profile_path}` : 'https://eddev101.github.io/flixstar-app/images/default.webp'}
          alt={person.name}
          className="person-img"
        />
        <div className="person-info">
          <h1 className="person-name">{person.name}</h1>
          <div className="person-facts">
            <div className="fact-row"><span className="fact-label">Birthday:</span><span>{person.birthday || 'N/A'}</span></div>
            <div className="fact-row"><span className="fact-label">Birthplace:</span><span>{person.place_of_birth || 'N/A'}</span></div>
            <div className="fact-row"><span className="fact-label">Known For:</span><span>{person.known_for_department || 'N/A'}</span></div>
          </div>
          <div className="person-bio">
            <h3>Biography</h3>
            <p>{showFullBio ? bio : shortBio}</p>
            {bio.length > 400 && (
              <button className="read-more" onClick={() => setShowFullBio(!showFullBio)}>
                {showFullBio ? 'Show Less' : 'Read More'}
              </button>
            )}
          </div>
        </div>
      </div>

      {credits.cast.length > 0 && (
        <div className="section">
          <h2 className="section-title">Known For (Acting)</h2>
          <div className="cards-row">
            {credits.cast.map((item, i) => (
              <Link to={item.media_type === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`} key={`${item.id}-${i}`} className="movie-card">
                <div className="card-wrap">
                  <img src={item.poster_path ? `${IMG}/w342${item.poster_path}` : 'https://eddev101.github.io/flixstar-app/images/default.webp'} alt={item.title || item.name} />
                  <span className="rating-badge">⭐ {item.vote_average?.toFixed(1)}</span>
                </div>
                <div className="card-title">{item.title || item.name}</div>
                <div className="card-meta"><span>{item.media_type === 'movie' ? 'Movie' : 'TV'}</span></div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {credits.crew.length > 0 && (
  <div className="section">
    <h2 className="section-title">Behind the Camera</h2>
    <div className="cards-row">
      {credits.crew.map((item, i) => (
        <Link
          to={item.media_type === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`}
          key={`crew-${item.id}-${i}`}
          className="movie-card"
        >
          <div className="card-wrap">
            <img
              src={item.poster_path ? `${IMG}/w342${item.poster_path}` : 'https://eddev101.github.io/flixstar-app/images/default.webp'}
              alt={item.title || item.name}
            />
            <span className="rating-badge">⭐ {item.vote_average?.toFixed(1)}</span>
          </div>
          <div className="card-title">{item.title || item.name}</div>
          <div className="card-meta">
            <span style={{ color: 'var(--blue)' }}>{item.job}</span>
            <span>{(item.release_date || item.first_air_date || '').slice(0, 4)}</span>
          </div>
        </Link>
      ))}
    </div>
  </div>
)}
    </div>
  )
}