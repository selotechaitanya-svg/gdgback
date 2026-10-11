import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';

export const EventCard = ({ event, isRegistered = false, onRegister, onUnregister, loading = false }) => {
  const getCategoryTheme = (cat) => {
    switch (cat) {
      case 'Conference':
        return { border: 'accent-bar-blue', badge: 'badge-blue' };
      case 'Hackathon':
        return { border: 'accent-bar-red', badge: 'badge-red' };
      case 'Workshop':
        return { border: 'accent-bar-green', badge: 'badge-green' };
      case 'Bootcamp':
        return { border: 'accent-bar-purple', badge: 'badge-purple' };
      case 'Tech Talk':
      case 'Meetup':
      default:
        return { border: 'accent-bar-yellow', badge: 'badge-yellow' };
    }
  };

  const theme = getCategoryTheme(event.category);
  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();
  const capacity = event.capacity || 100;
  const registeredCount = event.registrationCount || 0;
  const spotsLeft = Math.max(0, capacity - registeredCount);
  const percentFilled = Math.min(100, Math.round((registeredCount / capacity) * 100));
  const isFull = spotsLeft === 0;

  const formatDate = (d) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(d));
  };

  return (
    <div
      className={`card-brutal ${theme.border}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: '#FFFFFF',
      }}
    >
      {/* Event Image or Category Visual Banner */}
      {event.image ? (
        <div style={{ position: 'relative', height: '180px', overflow: 'hidden', borderBottom: '3px solid #000' }}>
          <img
            src={event.image}
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
          <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
            <span className={`badge-brutal ${theme.badge}`}>{event.category}</span>
          </div>
          {isPast && (
            <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
              <span className="badge-brutal" style={{ backgroundColor: '#18181B', color: '#FFF' }}>
                PAST EVENT
              </span>
            </div>
          )}
          {isRegistered && (
            <div style={{ position: 'absolute', bottom: '10px', right: '10px' }}>
              <span className="badge-brutal badge-green" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} /> REGISTERED
              </span>
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '3px solid #000',
            backgroundColor: '#FAFAFA',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span className={`badge-brutal ${theme.badge}`}>{event.category}</span>
          {isRegistered && (
            <span className="badge-brutal badge-green">
              <CheckCircle2 size={13} /> REGISTERED
            </span>
          )}
        </div>
      )}

      {/* Card Body */}
      <div
        style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
        }}
      >
        {/* Title */}
        <h3
          style={{
            fontSize: '1.15rem',
            fontWeight: 800,
            lineHeight: '1.35',
            marginBottom: '0.75rem',
            color: '#000000',
          }}
        >
          {event.title}
        </h3>

        {/* Short Description */}
        <p
          style={{
            fontSize: '0.875rem',
            color: '#52525B',
            lineHeight: '1.5',
            marginBottom: '1.25rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {event.description}
        </p>

        {/* Date & Location Meta */}
        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: '#18181B', fontWeight: 600 }}>
            <Calendar size={16} style={{ color: 'var(--google-blue)', flexShrink: 0 }} />
            <span className="font-mono">{formatDate(event.date)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.825rem', color: '#52525B' }}>
            <MapPin size={16} style={{ color: 'var(--google-red)', flexShrink: 0 }} />
            <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {event.venue}
            </span>
          </div>
        </div>

        {/* Capacity Bar & Spots Left */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', fontSize: '0.75rem' }}>
            <span className="font-mono" style={{ fontWeight: 700, color: '#3F3F46' }}>
              <Users size={12} style={{ display: 'inline', marginRight: '4px' }} />
              {registeredCount} / {capacity} attendees
            </span>
            <span
              className="font-mono"
              style={{
                fontWeight: 800,
                color: isFull ? 'var(--google-red)' : spotsLeft <= 10 ? '#D97706' : 'var(--google-green)',
              }}
            >
              {isFull ? 'FULL' : `${spotsLeft} spots left`}
            </span>
          </div>
          <div className="progress-container">
            <div
              className="progress-fill"
              style={{
                width: `${percentFilled}%`,
                backgroundColor: isFull ? 'var(--google-red)' : percentFilled > 80 ? 'var(--google-yellow)' : 'var(--google-green)',
              }}
            />
          </div>
        </div>

        {/* Action Button Row */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link
            to={`/events/${event._id}`}
            className="btn-brutal btn-sm"
            style={{ flex: 1, textDecoration: 'none' }}
          >
            Details <ArrowRight size={14} />
          </Link>

          {!isPast && (
            isRegistered ? (
              <button
                onClick={() => onUnregister && onUnregister(event._id)}
                disabled={loading}
                className="btn-brutal btn-sm btn-red"
                style={{ padding: '0.4rem 0.65rem' }}
                title="Cancel Registration"
              >
                Cancel
              </button>
            ) : (
              <button
                onClick={() => onRegister && onRegister(event._id)}
                disabled={isFull || loading}
                className={`btn-brutal btn-sm ${isFull ? '' : 'btn-green'}`}
                style={{ padding: '0.4rem 0.85rem' }}
              >
                {isFull ? 'Full' : 'Register'}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
