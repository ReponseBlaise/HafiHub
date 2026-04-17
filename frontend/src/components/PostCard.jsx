import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/post-card.css';

export default function PostCard({ post, onPostUpdated }) {
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleLike = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const response = await api.toggleLike(post.id);
      setIsLiked(response.liked);
      setLikeCount(response.liked ? likeCount + 1 : likeCount - 1);
    } catch (err) {
      console.error('Failed to like post:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleComment = () => {
    navigate(`/post/${post.id}`);
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-author">
          <div className="author-avatar">{post.user.name[0]}</div>
          <div>
            <h3>{post.user.name}</h3>
            <p className="post-meta">{post.location}</p>
          </div>
        </div>
        <span className="post-category">{post.category}</span>
      </div>

      <div
        className="post-content"
        onClick={() => navigate(`/post/${post.id}`)}
        style={{ cursor: 'pointer' }}
      >
        <h2>{post.title}</h2>
        <p>{post.description}</p>
      </div>

      <div className="post-actions">
        <button
          className={`action-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
          disabled={loading}
        >
          👍 {likeCount}
        </button>

        <button className="action-btn" onClick={handleComment}>
          💬 {post.commentCount || 0}
        </button>
      </div>

      <div className="post-footer">
        <small>{new Date(post.createdAt).toLocaleDateString()}</small>
      </div>
    </div>
  );
}
