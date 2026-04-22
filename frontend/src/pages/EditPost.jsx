import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import '../styles/edit-post.css';

export default function EditPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [post, setPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'product',
    location: '',
    imageUrl: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPost();
  }, [id]);

  const loadPost = async () => {
    try {
      setLoading(true);
      setError('');
      const postData = await api.get(`/posts/${id}`);
      setPost(postData.data);

      // Check if user is author
      if (isAuthenticated && user && user.id !== postData.data.userId) {
        setError('You can only edit your own posts');
        setTimeout(() => navigate('/'), 2000);
        return;
      }

      setFormData({
        title: postData.data.title,
        description: postData.data.description,
        category: postData.data.category,
        location: postData.data.location,
        imageUrl: postData.data.imageUrl || ''
      });
      if (postData.data.imageUrl) {
        setImagePreview(postData.data.imageUrl);
      }
    } catch (err) {
      setError(err.message || 'Failed to load post');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="edit-post-page">
        <div className="auth-required">
          <h2>Login Required</h2>
          <p>You need to be logged in to edit posts.</p>
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

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPG, PNG, GIF, etc.)');
        return;
      }

      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 10MB');
        return;
      }

      // Read file as data URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result;
        setFormData(prev => ({
          ...prev,
          imageUrl: result
        }));
        setImagePreview(result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      imageUrl: ''
    }));
    setImagePreview(null);
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
      setSubmitting(true);
      await api.put(`/posts/${id}`, formData);
      alert('Post updated successfully!');
      navigate(`/post/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to update post');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="edit-post-page"><div className="loading">Loading...</div></div>;

  return (
    <div className="edit-post-page">
      <div className="edit-post-container">
        <h1>Edit Post</h1>
        
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="edit-post-form">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Post title"
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

          <div className="form-group image-upload-group">
            <label htmlFor="postImage">Image (Optional)</label>
            <div className="image-container">
              {imagePreview && (
                <div className="image-preview">
                  <img src={imagePreview} alt="Post Preview" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="remove-image-btn"
                    title="Remove image"
                  >
                    ✕
                  </button>
                </div>
              )}
              <div className="image-input-group">
                <label htmlFor="postImage" className="image-upload-label">
                  <input
                    type="file"
                    id="postImage"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                  <span className="upload-button">📷 Add Image</span>
                  <span className="upload-hint">JPG, PNG, GIF (Max 10MB)</span>
                </label>
              </div>
            </div>
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
                placeholder="Location"
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => navigate(`/post/${id}`)}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-btn"
              disabled={submitting}
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
