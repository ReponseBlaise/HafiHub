import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import '../styles/news-detail.css';

export default function NewsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadArticle();
  }, [id]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const response = await api.getNewsArticle(id);
      setArticle(response.data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load article');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="news-detail-page"><div className="loading">Loading...</div></div>;
  if (error) return <div className="news-detail-page"><div className="error-message">{error}</div></div>;
  if (!article) return <div className="news-detail-page"><div className="error-message">Article not found</div></div>;

  return (
    <div className="news-detail-page">
      <button className="back-btn" onClick={() => navigate('/news')}>← Back to News</button>

      {article.imageUrl && (
        <div className="news-detail-image">
          <img src={article.imageUrl} alt={article.title} />
          {article.featured && <span className="featured-badge">Featured</span>}
        </div>
      )}

      <article className="news-detail-article">
        <h1>{article.title}</h1>

        <div className="article-meta">
          <span className="category-badge">{article.category.replace(/_/g, ' ')}</span>
          <span className="date">{new Date(article.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="article-content">
          {article.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  );
}
