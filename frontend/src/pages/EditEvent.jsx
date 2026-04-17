import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import '../styles/edit-event.css';

export default function EditEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'workshop',
    location: '',
    eventDate: '',
    capacity: '',
    imageUrl: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      setError('');
      const eventData = await api.getEvent(id);
      setEvent(eventData.data);

      // Check if user is author
      if (isAuthenticated && user && user.id !== eventData.data.userId) {
        setError('You can only edit your own events');
        setTimeout(() => navigate('/events'), 2000);
        return;
      }

      // Format date for input
      const eventDate = new Date(eventData.data.eventDate);
      const dateString = eventDate.toISOString().slice(0, 16);

      setFormData({
        title: eventData.data.title,
        description: eventData.data.description,
        category: eventData.data.category,
        location: eventData.data.location,
        eventDate: dateString,
        capacity: eventData.data.capacity.toString(),
        imageUrl: eventData.data.imageUrl || ''
      });
    } catch (err) {
      setError(err.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="edit-event-page">
        <div className="auth-required">
          <h2>Login Required</h2>
          <p>You need to be logged in to edit events.</p>
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
    if (!formData.eventDate) {
      setError('Event date is required');
      return;
    }
    if (!formData.capacity || formData.capacity < 1) {
      setError('Capacity must be at least 1');
      return;
    }

    try {
      setSubmitting(true);
      await api.updateEvent(id, formData);
      alert('Event updated successfully!');
      navigate(`/event/${id}`);
    } catch (err) {
      setError(err.message || 'Failed to update event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="edit-event-page"><div className="loading">Loading...</div></div>;

  return (
    <div className="edit-event-page">
      <div className="edit-event-container">
        <h1>Edit Event</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="edit-event-form">
          <div className="form-group">
            <label>Event Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Event title"
              required
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your event"
              rows="6"
              required
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="workshop">Workshop</option>
                <option value="conference">Conference</option>
                <option value="meetup">Meetup</option>
                <option value="concert">Concert</option>
              </select>
            </div>

            <div className="form-group">
              <label>Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Event location"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Event Date & Time *</label>
              <input
                type="datetime-local"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Capacity *</label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                placeholder="Max participants"
                min="1"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Image URL (optional)</label>
            <input
              type="url"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Updating...' : 'Update Event'}
          </button>
        </form>
      </div>
    </div>
  );
}
