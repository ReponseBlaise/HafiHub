import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/create-event.css';

export default function CreateEvent() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'workshop',
    location: '',
    eventDate: '',
    capacity: '',
    imageUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    return navigate('/login');
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Event title is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Event description is required');
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
      setLoading(true);
      const response = await api.createEvent(formData);
      alert('Event created successfully!');
      navigate(`/event/${response.data.id}`);
    } catch (err) {
      setError(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-event-page">
      <div className="create-event-container">
        <h1>Host a New Event</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="event-form">
          <div className="form-group">
            <label htmlFor="title">Event Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Enter event title"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your event"
              rows="6"
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category *</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option value="workshop">Workshop</option>
                <option value="conference">Conference</option>
                <option value="meetup">Meetup</option>
                <option value="concert">Concert</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location *</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Event location"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="eventDate">Event Date & Time *</label>
              <input
                type="datetime-local"
                id="eventDate"
                name="eventDate"
                value={formData.eventDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="capacity">Capacity *</label>
              <input
                type="number"
                id="capacity"
                name="capacity"
                value={formData.capacity}
                onChange={handleInputChange}
                placeholder="Max participants"
                min="1"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="imageUrl">Image URL (optional)</label>
            <input
              type="url"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleInputChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
}
