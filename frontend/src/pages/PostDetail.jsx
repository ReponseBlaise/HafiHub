import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import '../styles/post-detail.css';

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch post details
      const postData = await api.get(`/posts/${id}`);
      setPost(postData.data);
      setLikeCount(postData.data.likeCount || 0);
      
      // Fetch comments
      const commentsData = await api.get(`/comments?postId=${id}`);
      setComments(commentsData.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!newComment.trim()) {
      setSubmitError('Comment cannot be empty');
      return;
    }

    try {
      setSubmitError('');
      await api.post('/comments', {
        postId: parseInt(id),
        content: newComment
      });
      setNewComment('');
      await loadPost();
    } catch (err) {
      setSubmitError(err.message || 'Failed to add comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm('Delete this comment?')) {
      try {
        await api.delete(`/comments/${commentId}`);
        await loadPost();
      } catch (err) {
        alert('Failed to delete comment: ' + err.message);
      }
    }
  };

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      await api.post('/likes', { postId: parseInt(id) });
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    } catch (err) {
      alert('Failed to toggle like: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await api.delete(`/posts/${id}`);
        alert('Post deleted successfully');
        navigate('/');
      } catch (err) {
        alert('Failed to delete post: ' + err.message);
      }
    }
  };

  if (loading) return <div className="post-detail-page"><div className="loading">Loading...</div></div>;
  if (error) return <div className="post-detail-page"><div className="error-message">{error}</div></div>;
  if (!post) return <div className="post-detail-page"><div className="error-message">Post not found</div></div>;

  const isAuthor = isAuthenticated && user && user.id === post.userId;

  return (
    <div className="post-detail-page">
      <div className="post-detail-container">
        <div className="post-detail-header">
          <button className="back-btn" onClick={() => navigate('/')}>← Back</button>
          {isAuthor && (
            <div className="post-actions">
              <button 
                className="edit-btn"
                onClick={() => navigate(`/post/${id}/edit`)}
              >
                Edit
              </button>
              <button 
                className="delete-btn"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="post-detail-content">
          <h1>{post.title}</h1>
          
          <div className="post-meta">
            <Link to={`/profile/${post.userId}`} className="author-link">
              <strong>{post.user?.name}</strong>
            </Link>
            <span className="category-badge">{post.category}</span>
            <span className="location">📍 {post.location}</span>
            <span className="date">{new Date(post.createdAt).toLocaleDateString()}</span>
          </div>

          <p className="post-description">{post.description}</p>

          <div className="post-stats">
            <button 
              className={`like-btn ${isLiked ? 'liked' : ''}`}
              onClick={handleToggleLike}
            >
              ❤️ {likeCount} Likes
            </button>
            <span className="comment-count">💬 {comments.length} Comments</span>
          </div>
        </div>

        <div className="comments-section">
          <h2>Comments ({comments.length})</h2>

          {isAuthenticated && (
            <form onSubmit={handleAddComment} className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows="3"
              />
              {submitError && <div className="error-message">{submitError}</div>}
              <button type="submit" className="submit-btn">Post Comment</button>
            </form>
          )}

          {!isAuthenticated && (
            <div className="login-prompt">
              <p>Please <Link to="/login">login</Link> to comment</p>
            </div>
          )}

          <div className="comments-list">
            {comments.length === 0 ? (
              <p className="no-comments">No comments yet. Be the first!</p>
            ) : (
              comments.map(comment => (
                <div key={comment.id} className="comment">
                  <div className="comment-header">
                    <strong>{comment.user?.name}</strong>
                    <span className="comment-date">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                    {isAuthenticated && user && user.id === comment.userId && (
                      <button 
                        className="delete-comment-btn"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                  <p>{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
