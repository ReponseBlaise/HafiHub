import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import '../styles/edit-profile.css';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    location: '',
    contact: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Email validation regex
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  useEffect(() => {
    // Redirect if not authenticated
    if (!user) {
      navigate('/login');
      return;
    }

    // Load user data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        location: user.location || '',
        contact: user.contact || ''
      });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      setError('Name is required');
      return;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return;
    }
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!formData.contact.trim()) {
      setError('Contact information is required');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (!user || !user.id) {
        setError('User session lost. Please login again.');
        return;
      }

      // Call the update profile endpoint
      await api.updateProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
        location: formData.location.trim(),
        contact: formData.contact.trim()
      });
      
      setSuccess('Profile updated successfully!');
      
      // Redirect after 2 seconds
      const userId = user.id;
      setTimeout(() => {
        navigate(`/profile/${userId}`);
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-container">
        <h1>Edit Your Profile</h1>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit} className="edit-profile-form">
          <div className="form-group">
            <label htmlFor="name">Full Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="contact">Contact (Phone or WhatsApp) *</label>
            <input
              type="text"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              placeholder="+250 7XX XXX XXX"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, Region"
            />
          </div>

          <div className="form-actions">
            <button 
              type="submit" 
              className="save-btn"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
            <button 
              type="button" 
              className="cancel-btn"
              onClick={() => {
                if (user && user.id) {
                  navigate(`/profile/${user.id}`);
                } else {
                  navigate('/');
                }
              }}
            >
              Cancel
            </button>
          </div>
        </form>

        <div className="profile-section">
          <h3>Account Information</h3>
          <p>
            <strong>Member Since:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
          </p>
          <p>
            <strong>Account ID:</strong> {user?.id}
          </p>
        </div>
      </div>
    </div>
  );
}
