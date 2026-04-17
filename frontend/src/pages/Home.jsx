import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import PostCard from '../components/PostCard';
import '../styles/home.css';

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    loadPosts();
  }, [page]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await api.getPosts(page, 10);
      setPosts(response.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load posts: ' + err.message);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/create-post');
  };

  return (
    <div className="home-page">
      <div className="home-header">
        <h1>HafiHub Feed</h1>
        {isAuthenticated && (
          <button className="btn-primary" onClick={handleCreatePost}>
            + Create Post
          </button>
        )}
      </div>

      {!isAuthenticated && (
        <div className="welcome-banner">
          <h2>Welcome to HafiHub</h2>
          <p>A local economic activity marketplace for Rwanda. Connect, trade, and grow together.</p>
          <button className="btn-primary" onClick={() => navigate('/login')}>
            Login to Get Started
          </button>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="posts-container">
        {loading ? (
          <div className="loading">Loading posts...</div>
        ) : posts.length > 0 ? (
          <>
            <div className="posts-list">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} onPostUpdated={loadPosts} />
              ))}
            </div>

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
          </>
        ) : (
          <div className="empty-state">
            <p>No posts yet. Be the first to create one!</p>
            {isAuthenticated && (
              <button className="btn-primary" onClick={handleCreatePost}>
                Create First Post
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
