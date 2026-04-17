import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import '../styles/news.css';

export default function News() {
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ category: '', featured: false });
  const navigate = useNavigate();

  useEffect(() => {
    loadNews();
  }, [page, filters]);

  const loadNews = async () => {
    try {
      setLoading(true);
      const response = await api.getNews(page, 10, filters);
      setNewsList(response.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load news');
      setNewsList([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="news-page">
      <div className="news-header">
        <h1>Market News & Updates</h1>
        <p>Stay informed about the latest in the HafiHub marketplace</p>
      </div>

      <div className="news-filters">
        <button
          className={`filter-btn ${!filters.featured ? 'active' : ''}`}
          onClick={() => setFilters({ ...filters, featured: false })}
        >
          All News
        </button>
        <button
          className={`filter-btn ${filters.featured ? 'active' : ''}`}
          onClick={() => setFilters({ ...filters, featured: true })}
        >
          Featured
        </button>

        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All Categories</option>
          <option value="market_news">Market News</option>
          <option value="event_highlights">Event Highlights</option>
          <option value="tips">Tips & Guides</option>
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="news-container">
        {loading ? (
          <div className="loading">Loading news...</div>
        ) : newsList.length > 0 ? (
          <>
            <div className="news-list">
              {newsList.map((article) => (
                <Link key={article.id} to={`/news/${article.id}`} className="news-card">
                  {article.imageUrl && (
                    <div className="news-image">
                      <img src={article.imageUrl} alt={article.title} />
                      {article.featured && <span className="featured-badge">Featured</span>}
                    </div>
                  )}
                  <div className="news-content">
                    <h3>{article.title}</h3>
                    <p className="news-excerpt">{article.content.substring(0, 150)}...</p>
                    
                    <div className="news-meta">
                      <span className="category-badge">{article.category.replace(/_/g, ' ')}</span>
                      <span className="date">{new Date(article.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {newsList.length > 0 && (
              <div className="pagination">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="btn-secondary"
                >
                  ← Previous
                </button>
                <span>Page {page}</span>
                <button onClick={() => setPage(page + 1)} className="btn-secondary">
                  Next →
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <p>No news found</p>
          </div>
        )}
      </div>
    </div>
  );
}
