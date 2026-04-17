import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import PostCard from '../components/PostCard';
import '../styles/user-profile.css';

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      loadUserProfile();
    }
  }, [id]);

  const loadUserProfile = async () => {
    if (!id) {
      setError('User ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Fetch user profile
      const userData = await api.get(`/users/${id}`);
      setUser(userData.data);
      
      // Fetch user's posts
      const postsData = await api.get(`/posts?userId=${id}`);
      setPosts(postsData.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="user-profile-page"><div className="loading">Loading...</div></div>;
  if (error) return <div className="user-profile-page"><div className="error-message">{error}</div></div>;
  if (!user) return <div className="user-profile-page"><div className="error-message">User not found</div></div>;

  const isOwnProfile = isAuthenticated && currentUser && currentUser.id === parseInt(id);

  return (
    <div className="user-profile-page">
      <div className="profile-header">
        <button className="back-btn" onClick={() => navigate('/')}>← Back to Posts</button>
        
        <div className="profile-card">
          <div className="profile-avatar">
            {user.profilePictureUrl ? (
              <img src={user.profilePictureUrl} alt={user.name} />
            ) : (
              <span>{user.name ? user.name.charAt(0).toUpperCase() : 'U'}</span>
            )}
          </div>
          
          <div className="profile-info">
            <h1>{user.name}</h1>
            <p className="profile-email">{user.email}</p>
            {user.contact && <p className="profile-contact">📱 {user.contact}</p>}
            {user.location && <p className="profile-location">📍 {user.location}</p>}
            
            <div className="profile-stats">
              <div className="stat">
                <span className="stat-value">{user.postsCount || 0}</span>
                <span className="stat-label">Posts</span>
              </div>
              <div className="stat">
                <span className="stat-value">{user.commentsCount || 0}</span>
                <span className="stat-label">Comments</span>
              </div>
              <div className="stat">
                <span className="stat-value">{user.likesReceived || 0}</span>
                <span className="stat-label">Likes Received</span>
              </div>
            </div>

            {isOwnProfile && (
              <button 
                className="edit-profile-btn"
                onClick={() => navigate('/edit-profile')}
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="user-posts-section">
        <h2>{user.name}'s Posts</h2>
        
        {posts.length === 0 ? (
          <div className="no-posts">
            <p>No posts yet</p>
            {isOwnProfile && (
              <button 
                className="create-post-btn"
                onClick={() => navigate('/create-post')}
              >
                Create Your First Post
              </button>
            )}
          </div>
        ) : (
          <div className="posts-list">
            {posts.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
