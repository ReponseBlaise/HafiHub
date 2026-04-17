import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import '../styles/create-post.css';

export default function CreatePost() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'product',
    location: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated) {
    return (
      <div className="create-post-page">
        <div className="auth-required">
          <h2>Login Required</h2>
          <p>You need to be logged in to create a post.</p>
          <button onClick={() => navigate('/login')}>Go to Login</button>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    if (!formData.location.trim()) {
      setError('Location is required');
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/posts', formData);
      alert('Post created successfully!');
      navigate(`/post/${response.data.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-page">
      <div className="create-post-container">
        <h1>Create New Post</h1>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="create-post-form">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Used Laptop for Sale"
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your item or service..."
              rows="6"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="product">Product</option>
                <option value="service">Service</option>
                <option value="job">Job</option>
                <option value="quick_job">Quick Job</option>
                <option value="business">Business</option>
              </select>
            </div>

            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Kigali, Rwanda"
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Post'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
