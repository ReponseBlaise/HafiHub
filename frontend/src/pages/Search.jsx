import React, { useState } from 'react';
import { api } from '../services/api';
import PostCard from '../components/PostCard';
import '../styles/search.css';

export default function Search() {
  const [searchType, setSearchType] = useState('posts'); // posts or users
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    location: '',
  });

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError('Please enter a search term');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let response;

      if (searchType === 'posts') {
        response = await api.searchPosts({
          search: query,
          category: filters.category,
          location: filters.location,
        });
        setResults(response.posts);
      } else {
        response = await api.searchUsers(query);
        setResults(response.data);
      }
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <h1>Search</h1>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-group">
          <input
            type="text"
            placeholder={
              searchType === 'posts'
                ? 'Search posts...'
                : 'Search users...'
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>

        <div className="search-tabs">
          <button
            type="button"
            className={`tab ${searchType === 'posts' ? 'active' : ''}`}
            onClick={() => {
              setSearchType('posts');
              setResults([]);
            }}
          >
            Posts
          </button>
          <button
            type="button"
            className={`tab ${searchType === 'users' ? 'active' : ''}`}
            onClick={() => {
              setSearchType('users');
              setResults([]);
            }}
          >
            Users
          </button>
        </div>

        {searchType === 'posts' && (
          <div className="search-filters">
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters({ ...filters, category: e.target.value })
              }
              className="filter-select"
            >
              <option value="">All Categories</option>
              <option value="job">Job</option>
              <option value="quick_job">Quick Job</option>
              <option value="product">Product</option>
              <option value="event">Event</option>
            </select>

            <input
              type="text"
              placeholder="Filter by location..."
              value={filters.location}
              onChange={(e) =>
                setFilters({ ...filters, location: e.target.value })
              }
              className="filter-input"
            />
          </div>
        )}
      </form>

      {error && <div className="error-message">{error}</div>}

      <div className="search-results">
        {loading ? (
          <div className="loading">Searching...</div>
        ) : results.length > 0 ? (
          <>
            <h2>
              {searchType === 'posts' ? 'Posts' : 'Users'} (
              {results.length})
            </h2>

            {searchType === 'posts' ? (
              <div className="posts-list">
                {results.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="users-list">
                {results.map((user) => (
                  <div key={user.id} className="user-card">
                    <div className="user-info">
                      <h3>{user.name}</h3>
                      {user.location && <p>{user.location}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : query ? (
          <div className="empty-state">
            <p>No {searchType} found for "{query}"</p>
          </div>
        ) : (
          <div className="empty-state">
            <p>Enter a search term to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
