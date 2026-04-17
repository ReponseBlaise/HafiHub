import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import '../styles/navbar.css';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <img src="/hafi_hub_logo.svg" alt="HafiHub Logo" className="logo-img" />
        </Link>

        <div className="nav-links">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to="/events" className="nav-link">
            Events
          </Link>
          <Link to="/news" className="nav-link">
            News
          </Link>
          <Link to="/search" className="nav-link">
            Search
          </Link>

          {isAuthenticated ? (
            <>
              <Link to="/create-post" className="nav-link btn-primary">
                + Create Post
              </Link>
              {user && user.id && (
                <>
                  <Link to={`/host/events`} className="nav-link">
                    My Events
                  </Link>
                  <Link to={`/profile/${user.id}`} className="nav-link">
                    Profile
                  </Link>
                </>
              )}
              <button onClick={handleLogout} className="nav-link logout-btn">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link btn-primary">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
