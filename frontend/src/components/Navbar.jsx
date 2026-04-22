import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/navbar.css';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMenu}>
          <img src="/hafi_hub_logo.svg" alt="HafiHub Logo" className="logo-img" />
        </Link>

        {/* Hamburger Menu Button */}
        <button 
          className={`hamburger ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
          <span className="hamburger-line"></span>
        </button>

        <div className={`nav-links ${isMenuOpen ? 'mobile-active' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeMenu}>
            Home
          </Link>
          <Link to="/events" className="nav-link" onClick={closeMenu}>
            Events
          </Link>
          <Link to="/news" className="nav-link" onClick={closeMenu}>
            News
          </Link>
          <Link to="/search" className="nav-link" onClick={closeMenu}>
            Search
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/create-post" className="nav-link btn-primary" onClick={closeMenu}>
                + Create Post
              </Link>
              {user && user.id && (
                <>
                  <Link to={`/host/events`} className="nav-link" onClick={closeMenu}>
                    My Events
                  </Link>
                  <div className="profile-section">
                    <Link to={`/profile/${user.id}`} className="profile-link" onClick={closeMenu}>
                      <div className="profile-avatar">
                        {user.profilePictureUrl ? (
                          <img src={user.profilePictureUrl} alt={user.name} />
                        ) : (
                          <div className="avatar-initials">{getInitials(user.name)}</div>
                        )}
                      </div>
                      <span className="profile-name">{user.name}</span>
                    </Link>
                  </div>
                </>
              )}
              <button onClick={handleLogout} className="nav-link logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link" onClick={closeMenu}>
                Login
              </Link>
              <Link to="/register" className="nav-link btn-primary" onClick={closeMenu}>
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
