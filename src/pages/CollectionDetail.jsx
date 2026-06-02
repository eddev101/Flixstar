import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const API_KEY = '5ec279387e9aa9488ef4d00b22acc451'
const IMG = 'https://image.tmdb.org/t/p'

export default function CollectionDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [collection, setCollection] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchCollection(); window.scrollTo(0, 0) }, [id])

  async function fetchCollection() {
    setLoading(true)
    try {
      const res = await axios.get(`https://api.themoviedb.org/3/collection/${id}?api_key=${API_KEY}`)
      setCollection(res.data)
    } catch (e) { console.log(e) }
    finally { setLoading(false) }
  }

  if (loading) return <div className="loader"><div className="spinner" /></div>
  if (!collection) return null

  return (
    <div className="detail-page">
      <div className="detail-hero" style={{ backgroundImage: `url(${IMG}/original${collection.backdrop_path})` }}>
        <div className="detail-hero-gradient">
          <div className="container">
            <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
            <div className="detail-top">
              <img src={`${IMG}/w342${collection.poster_path}`} alt={collection.name} className="detail-poster" />
              <div className="detail-info">
                <h1 className="detail-title">{collection.name}</h1>
                <div className="detail-meta-row">
                  <span className="badge badge-blue">🎞️ Collection</span>
                  <span className="badge badge-dark">{collection.parts?.length} Movies</span>
                </div>
                {collection.overview && <p className="detail-overview">{collection.overview}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="section">
          <h2 className="section-title">Movies in Collection</h2>
          <div className="grid-3">
            {collection.parts?.map(item => (
              <Link to={`/movie/${item.id}`} key={item.id} className="movie-card">
                <div className="card-wrap">
                  <img src={`${IMG}/w342${item.poster_path}`} alt={item.title} />
                  <span className="rating-badge">⭐ {item.vote_average?.toFixed(1)}</span>
                </div>
                <div className="card-title">{item.title}</div>
                <div className="card-meta"><span>{item.release_date?.slice(0, 4)}</span></div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}