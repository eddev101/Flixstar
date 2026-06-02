import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import './List.css'

const API_KEY = '5ec279387e9aa9488ef4d00b22acc451'
const IMG = 'https://image.tmdb.org/t/p'

export default function People() {
  const navigate = useNavigate()
  const [people, setPeople] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => { fetchPeople(1) }, [])

  async function fetchPeople(p) {
    setLoading(true)
    try {
      const res = await axios.get(`https://api.themoviedb.org/3/person/popular?api_key=${API_KEY}&page=${p}`)
      if (p === 1) setPeople(res.data.results)
      else setPeople(prev => [...prev, ...res.data.results])
      setTotalPages(res.data.total_pages)
      setPage(p)
    } catch (e) { console.log(e) }
    finally { setLoading(false) }
  }

  return (
    <div className="page container">
      <h1 className="page-title">Popular People</h1>
      {loading && page === 1
        ? <div className="loader"><div className="spinner" /></div>
        : <>
          <div className="person-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 16 }}>
            {people.map(p => (
              <div key={p.id} onClick={() => navigate(`/person/${p.id}`)} style={{ cursor: 'pointer', textAlign: 'center' }}>
                <img src={p.profile_path ? `${IMG}/w185${p.profile_path}` : 'https://eddev101.github.io/flixstar-app/images/default.webp'} alt={p.name}
                  style={{ width: '100%', aspectRatio: '1', borderRadius: '50%', objectFit: 'cover', background: 'var(--card-bg)' }} />
                <div style={{ fontSize: '0.82rem', fontWeight: 600, marginTop: 8 }}>{p.name}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>{p.known_for_department}</div>
              </div>
            ))}
          </div>
          {page < totalPages && (
            <button className="btn btn-primary load-more" onClick={() => fetchPeople(page + 1)}>Load More</button>
          )}
        </>
      }
    </div>
  )
}