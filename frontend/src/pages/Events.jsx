import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/events.css';

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ category: '', location: '' });
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
  }, [page, filters]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await api.getEvents(page, 10, filters);
      setEvents(response.data || []);
      setError('');
    } catch (err) {
      setError('Failed to load events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="events-page">
      <div className="events-header">
        <h1>Upcoming Events</h1>
        {isAuthenticated && (
          <button className="btn-primary" onClick={() => navigate('/create-event')}>
            + Host Event
          </button>
        )}
      </div>

      <div className="events-filters">
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All Categories</option>
          <option value="workshop">Workshop</option>
          <option value="conference">Conference</option>
          <option value="meetup">Meetup</option>
          <option value="concert">Concert</option>
        </select>

        <input
          type="text"
          placeholder="Filter by location..."
          value={filters.location}
          onChange={(e) => setFilters({ ...filters, location: e.target.value })}
        />
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="events-container">
        {loading ? (
          <div className="loading">Loading events...</div>
        ) : events.length > 0 ? (
          <>
            <div className="events-list">
              {events.map((event) => (
                <Link key={event.id} to={`/event/${event.id}`} className="event-card">
                  {event.imageUrl && (
                    <div className="event-image">
                      <img src={event.imageUrl} alt={event.title} />
                    </div>
                  )}
                  <div className="event-content">
                    <h3>{event.title}</h3>
                    <p className="event-description">{event.description.substring(0, 100)}...</p>
                    
                    <div className="event-meta">
                      <span className="category-badge">{event.category}</span>
                      <span className="location">📍 {event.location}</span>
                    </div>

                    <div className="event-date">
                      📅 {new Date(event.eventDate).toLocaleDateString()}
                    </div>

                    <div className="event-capacity">
                      {event.booked} / {event.capacity} booked
                    </div>
                  </div>
                </Link>
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
            <p>No events found</p>
            {isAuthenticated && (
              <button className="btn-primary" onClick={() => navigate('/create-event')}>
                Create First Event
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
