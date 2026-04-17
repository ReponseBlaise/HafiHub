import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import '../styles/event-bookings.css';

export default function EventBookings() {
  const { eventId } = useParams();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [eventData, setEventData] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!eventId || eventId === 'undefined' || isNaN(parseInt(eventId))) {
      navigate('/host/events');
      return;
    }

    fetchEventBookings();
  }, [isAuthenticated, eventId, navigate]);

  const fetchEventBookings = async () => {
    try {
      setLoading(true);
      const response = await api.getEventBookings(parseInt(eventId));
      if (response.success) {
        setEventData(response.data.event);
        setBookings(response.data.bookings);
      } else {
        setError('Failed to fetch event bookings');
      }
    } catch (err) {
      setError(err.message || 'Error fetching bookings');
    } finally {
      setLoading(false);
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

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    alert('Email copied to clipboard!');
  };

  const handleCopyContact = (contact) => {
    navigator.clipboard.writeText(contact);
    alert('Contact copied to clipboard!');
  };

  if (loading) {
    return <div className="loading">Loading event bookings...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => navigate('/host/events')} className="btn-primary">
          Back to My Events
        </button>
      </div>
    );
  }

  return (
    <div className="event-bookings-container">
      <button onClick={() => navigate('/host/events')} className="btn-secondary back-btn">
        ← Back to My Events
      </button>

      {eventData && (
        <div className="event-header">
          <h1>{eventData.title}</h1>
          <div className="event-info">
            <p className="event-date">📅 {formatDate(eventData.eventDate)}</p>
            <div className="capacity-info">
              <span className="capacity-stat">
                Capacity: <strong>{eventData.capacity}</strong>
              </span>
              <span className="booked-stat">
                Booked: <strong>{eventData.booked}</strong>
              </span>
              <span className="available-stat">
                Available: <strong>{Math.max(0, eventData.capacity - eventData.booked)}</strong>
              </span>
            </div>
          </div>
        </div>
      )}

      {bookings.length === 0 ? (
        <div className="no-bookings">
          <p>No one has booked this event yet.</p>
        </div>
      ) : (
        <>
          <div className="bookings-info">
            <p>Total Attendees: <strong>{bookings.length}</strong></p>
          </div>

          <div className="bookings-table-responsive">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Contact</th>
                  <th>Location</th>
                  <th>Booked Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking, index) => (
                  <tr key={booking.id} className={`booking-row status-${booking.status}`}>
                    <td className="booking-number">{index + 1}</td>
                    <td className="booker-name">{booking.user.name}</td>
                    <td className="booker-email">
                      <span>{booking.user.email}</span>
                    </td>
                    <td className="booker-contact">
                      {booking.user.contact ? (
                        <span>{booking.user.contact}</span>
                      ) : (
                        <span className="no-contact">—</span>
                      )}
                    </td>
                    <td className="booker-location">
                      {booking.user.location ? booking.user.location : '—'}
                    </td>
                    <td className="booked-date">{formatDate(booking.bookedAt)}</td>
                    <td className="booking-status">
                      <span className={`status-badge status-${booking.status}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="booking-actions">
                      <button
                        onClick={() => handleCopyEmail(booking.user.email)}
                        className="btn-small"
                        title="Copy email"
                      >
                        📧 Email
                      </button>
                      {booking.user.contact && (
                        <button
                          onClick={() => handleCopyContact(booking.user.contact)}
                          className="btn-small"
                          title="Copy contact"
                        >
                          📱 Contact
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="export-info">
            <p>💡 Click on Email or Contact buttons to copy attendee information</p>
          </div>
        </>
      )}
    </div>
  );
}
