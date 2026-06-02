import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './Navbar.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
  const check = () => setIsMobile(window.innerWidth <= 768)
  check()
  window.addEventListener('resize', check)
  return () => window.removeEventListener('resize', check)
}, [])


  function handleSearch(e) {
    e.preventDefault()
    const q = e.target.q.value.trim()
    if (q) { navigate(`/search?q=${encodeURIComponent(q)}`); closeAll() }
  }

  function closeAll() {
    setMenuOpen(false)
    setMoreOpen(false)
    setUserOpen(false)
  }

  return (
    <nav className="navbar">
      <div className="nav-inner">
        <Link to="/" className="nav-logo" onClick={closeAll}>FLIXSTAR</Link>

        {/* Desktop nav */}
        {!isMobile && (
          <div className="nav-links">
            <Link to="/" onClick={closeAll}>Home</Link>
            <Link to="/movies" onClick={closeAll}>Movies</Link>
            <Link to="/tvshows" onClick={closeAll}>TV Shows</Link>

            {/* More - hover on desktop */}
            <div className="dropdown"
              onMouseEnter={() => setMoreOpen(true)}
              onMouseLeave={() => setMoreOpen(false)}
            >
              <span className="dropdown-trigger">More ▾</span>
              {moreOpen && (
                <div className="dropdown-menu">
                  <Link to="/genres" onClick={closeAll}>🎭 Genres</Link>
                  <Link to="/collections" onClick={closeAll}>🎞️ Collections</Link>
                  <Link to="/people" onClick={closeAll}>👤 People</Link>
                  <Link to="/videos" onClick={closeAll}>🎬 Videos</Link>
                  <Link to="/top-movies" onClick={closeAll}>🏆 Top Movies</Link>
                  <Link to="/top-tvshows" onClick={closeAll}>📺 Top TV Series</Link>
                </div>
              )}
            </div>

            {/* User - hover on desktop */}
            <div className="dropdown"
              onMouseEnter={() => setUserOpen(true)}
              onMouseLeave={() => setUserOpen(false)}
            >
              <span className="dropdown-trigger">👤 User ▾</span>
              {userOpen && (
                <div className="dropdown-menu">
                  <Link to="/watchlist" onClick={closeAll}>🔖 Watchlist</Link>
                  <Link to="/favorites" onClick={closeAll}>❤️ Favorites</Link>
                </div>
              )}
            </div>

            <form onSubmit={handleSearch} className="nav-search">
              <input name="q" placeholder="Search..." />
              <button type="submit">🔍</button>
            </form>
          </div>
        )}

        {/* Mobile hamburger */}
        {isMobile && (
          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        )}
      </div>

      {/* Mobile menu — completely separate from desktop */}
      {isMobile && menuOpen && (
        <div className="mobile-menu">
          <Link to="/" onClick={closeAll}>Home</Link>
          <Link to="/movies" onClick={closeAll}>Movies</Link>
          <Link to="/tvshows" onClick={closeAll}>TV Shows</Link>

          {/* More section */}
          <div className="mobile-section-header" onClick={() => setMoreOpen(!moreOpen)}>
            More {moreOpen ? '▲' : '▼'}
          </div>
          {moreOpen && (
            <div className="mobile-submenu">
              <Link to="/genres" onClick={closeAll}>🎭 Genres</Link>
              <Link to="/collections" onClick={closeAll}>🎞️ Collections</Link>
              <Link to="/people" onClick={closeAll}>👤 People</Link>
              <Link to="/videos" onClick={closeAll}>🎬 Videos</Link>
              <Link to="/top-movies" onClick={closeAll}>🏆 Top Movies</Link>
              <Link to="/top-tvshows" onClick={closeAll}>📺 Top TV Series</Link>
            </div>
          )}

          {/* User section */}
          <div className="mobile-section-header" onClick={() => setUserOpen(!userOpen)}>
            👤 User {userOpen ? '▲' : '▼'}
          </div>
          {userOpen && (
            <div className="mobile-submenu">
              <Link to="/watchlist" onClick={closeAll}>🔖 Watchlist</Link>
              <Link to="/favorites" onClick={closeAll}>❤️ Favorites</Link>
            </div>
          )}

          <form onSubmit={handleSearch} className="nav-search mobile-search">
            <input name="q" placeholder="Search..." />
            <button type="submit">🔍</button>
          </form>
        </div>
      )}
    </nav>
  )
}