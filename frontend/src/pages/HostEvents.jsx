import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import '../styles/host-events.css';

export default function HostEvents() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    fetchHostEvents();
  }, [isAuthenticated, page, navigate]);

  const fetchHostEvents = async () => {
    try {
      setLoading(true);
      const response = await api.getHostEvents(page, 10);
      if (response.success) {
        setEvents(response.data);
        setPagination(response.pagination);
      } else {
        setError('Failed to fetch your events');
      }
    } catch (err) {
      setError(err.message || 'Error fetching events');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      const response = await api.deleteEvent(eventId);
      if (response.success) {
        setEvents(events.filter(e => e.id !== eventId));
        alert('Event deleted successfully');
      } else {
        alert('Failed to delete event');
      }
    } catch (err) {
      alert('Error deleting event: ' + err.message);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getAvailableSlots = (event) => {
    return Math.max(0, event.capacity - event.booked);
  };

  if (loading) {
    return <div className="loading">Loading your events...</div>;
  }

  return (
    <div className="host-events-container">
      <div className="host-events-header">
        <h1>My Hosted Events</h1>
        <Link to="/create-event" className="btn-primary">
          + Create New Event
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      {events.length === 0 ? (
        <div className="no-events">
          <p>You haven't created any events yet.</p>
          <Link to="/create-event" className="btn-primary">
            Create Your First Event
          </Link>
        </div>
      ) : (
        <>
          <div className="events-grid">
            {events.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-card-header">
                  <h3>{event.title}</h3>
                  <span className={`status-badge ${getAvailableSlots(event) > 0 ? 'available' : 'full'}`}>
                    {getAvailableSlots(event) > 0 ? `${getAvailableSlots(event)} slots` : 'Full'}
                  </span>
                </div>

                <p className="event-date">📅 {formatDate(event.eventDate)}</p>
                <p className="event-location">📍 {event.location}</p>
                <p className="event-category">🏷️ {event.category}</p>

                <div className="event-stats">
                  <div className="stat">
                    <span className="stat-label">Capacity</span>
                    <span className="stat-value">{event.capacity}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Booked</span>
                    <span className="stat-value">{event.booked}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Available</span>
                    <span className="stat-value">{getAvailableSlots(event)}</span>
                  </div>
                </div>

                <div className="event-actions">
                  <Link to={`/events/${event.id}/bookings`} className="btn-secondary">
                    View Bookings ({event.booked})
                  </Link>
                  <Link to={`/edit-event/${event.id}`} className="btn-secondary">
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
                    className="btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {pagination && pagination.pages > 1 && (
            <div className="pagination">
              <button
                disabled={page === 1}
                onClick={() => setPage(Math.max(1, page - 1))}
                className="btn-secondary"
              >
                Previous
              </button>
              <span className="page-info">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                className="btn-secondary"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
