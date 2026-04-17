import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import '../styles/event-detail.css';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBooked, setIsBooked] = useState(false);
  const [bookingError, setBookingError] = useState('');

  useEffect(() => {
    loadEvent();
    checkBooking();
  }, [id]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const response = await api.getEvent(id);
      setEvent(response.data);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load event');
    } finally {
      setLoading(false);
    }
  };

  const checkBooking = async () => {
    if (!isAuthenticated) return;
    try {
      const response = await api.getBookings();
      const booked = response.data.some((b) => b.eventId === parseInt(id));
      setIsBooked(booked);
    } catch (err) {
      console.error('Failed to check booking:', err);
    }
  };

  const handleBook = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setBookingError('');
      await api.bookEvent(parseInt(id));
      setIsBooked(true);
      await loadEvent();
      alert('Successfully booked event!');
    } catch (err) {
      setBookingError(err.message || 'Failed to book event');
    }
  };

  const handleCancelBooking = async () => {
    if (window.confirm('Cancel this booking?')) {
      try {
        const bookings = await api.getBookings();
        const booking = bookings.data.find((b) => b.eventId === parseInt(id));
        if (booking) {
          await api.cancelBooking(booking.id);
          setIsBooked(false);
          await loadEvent();
          alert('Booking cancelled');
        }
      } catch (err) {
        setBookingError(err.message || 'Failed to cancel booking');
      }
    }
  };

  const handleDeleteEvent = async () => {
    if (window.confirm('Delete this event?')) {
      try {
        await api.deleteEvent(id);
        alert('Event deleted');
        navigate('/events');
      } catch (err) {
        alert('Failed to delete event: ' + err.message);
      }
    }
  };

  if (loading) return <div className="event-detail-page"><div className="loading">Loading...</div></div>;
  if (error) return <div className="event-detail-page"><div className="error-message">{error}</div></div>;
  if (!event) return <div className="event-detail-page"><div className="error-message">Event not found</div></div>;

  const isAuthor = isAuthenticated && user && user.id === event.userId;
  const spotsLeft = event.capacity - event.booked;
  const isFull = spotsLeft <= 0;

  return (
    <div className="event-detail-page">
      <button className="back-btn" onClick={() => navigate('/events')}>← Back to Events</button>

      {event.imageUrl && (
        <div className="event-detail-image">
          <img src={event.imageUrl} alt={event.title} />
        </div>
      )}

      <div className="event-detail-container">
        <div className="event-detail-header">
          <h1>{event.title}</h1>
          {isAuthor && (
            <div className="event-actions">
              <button
                className="edit-btn"
                onClick={() => navigate(`/event/${id}/edit`)}
              >
                Edit
              </button>
              <button className="delete-btn" onClick={handleDeleteEvent}>
                Delete
              </button>
            </div>
          )}
        </div>

        <div className="event-detail-info">
          <div className="event-detail-meta">
            <div className="meta-item">
              <span className="meta-label">📅 Date:</span>
              <span className="meta-value">{new Date(event.eventDate).toLocaleDateString()}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">🕐 Time:</span>
              <span className="meta-value">{new Date(event.eventDate).toLocaleTimeString()}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">📍 Location:</span>
              <span className="meta-value">{event.location}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Category:</span>
              <span className="category-badge">{event.category}</span>
            </div>
          </div>

          <div className="event-capacity-info">
            <h3>Availability</h3>
            <div className="capacity-bar">
              <div
                className="capacity-filled"
                style={{ width: `${(event.booked / event.capacity) * 100}%` }}
              ></div>
            </div>
            <p>
              {isFull ? (
                <span className="full">Event is full</span>
              ) : (
                <span className="available">{spotsLeft} spots available</span>
              )}
            </p>
          </div>

          <div className="event-organizer">
            <h3>Organizer</h3>
            <p>{event.user.name}</p>
          </div>
        </div>

        <div className="event-detail-content">
          <h2>About This Event</h2>
          <p>{event.description}</p>
        </div>

        <div className="event-actions-section">
          {bookingError && <div className="error-message">{bookingError}</div>}

          {!isAuthor && (
            <>
              {isBooked ? (
                <button className="btn-secondary" onClick={handleCancelBooking}>
                  Cancel Booking
                </button>
              ) : (
                <button
                  className="btn-primary"
                  onClick={handleBook}
                  disabled={isFull || !isAuthenticated}
                >
                  {!isAuthenticated ? 'Login to Book' : isFull ? 'Event Full' : 'Book Now'}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
