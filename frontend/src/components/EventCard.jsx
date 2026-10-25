import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Users,
  ArrowRight,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import TiltCard from './TiltCard';

const themes = {
  Conference: {
    badge: 'badge-blue',
    accent: 'var(--google-blue)',
    soft: 'var(--google-blue-soft)',
  },
  Hackathon: {
    badge: 'badge-red',
    accent: 'var(--google-red)',
    soft: 'var(--google-red-soft)',
  },
  Workshop: {
    badge: 'badge-green',
    accent: 'var(--google-green)',
    soft: 'var(--google-green-soft)',
  },
  Bootcamp: {
    badge: 'badge-purple',
    accent: 'var(--google-purple)',
    soft: 'var(--google-purple-soft)',
  },
  Meetup: {
    badge: 'badge-yellow',
    accent: 'var(--google-yellow)',
    soft: 'var(--google-yellow-soft)',
  },
  'Tech Talk': {
    badge: 'badge-yellow',
    accent: 'var(--google-yellow)',
    soft: 'var(--google-yellow-soft)',
  },
};

export const EventCard = ({
  event,
  isRegistered = false,
  onRegister,
  onUnregister,
  loading = false,
}) => {
  const theme = themes[event.category] || themes.Meetup;
  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();
  const capacity = event.capacity || 100;
  const registeredCount = event.registrationCount || 0;
  const spotsLeft = Math.max(0, capacity - registeredCount);
  const percentFilled = Math.min(100, Math.round((registeredCount / capacity) * 100));
  const isFull = spotsLeft === 0;

  const formatDate = (value) =>
    new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));

  const day = new Intl.DateTimeFormat('en-US', { day: '2-digit' }).format(eventDate);
  const month = new Intl.DateTimeFormat('en-US', { month: 'short' })
    .format(eventDate)
    .toUpperCase();

  const handleSpotlight = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    card.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  return (
    <TiltCard>
    <article
      className="event-card"
      onPointerMove={handleSpotlight}
      style={{ '--event-accent': theme.accent, '--event-soft': theme.soft }}
    >
      <div className="event-card__media">
        {event.image ? (
          <img src={event.image} alt="" loading="lazy" />
        ) : (
          <div className="event-card__placeholder" aria-hidden="true">
            <Sparkles size={30} />
            <span>GDG SESSION</span>
          </div>
        )}

        <div className="event-card__badges">
          <span className={`badge-brutal ${theme.badge}`}>{event.category}</span>
          {isPast ? (
            <span className="badge-brutal" style={{ background: '#18181b', color: '#fff' }}>
              PAST EVENT
            </span>
          ) : isRegistered ? (
            <span className="badge-brutal badge-green">
              <CheckCircle2 size={12} aria-hidden="true" /> GOING
            </span>
          ) : null}
        </div>

        <span className="event-card__date" aria-hidden="true">
          <strong>{day}</strong>
          <span>{month}</span>
        </span>
      </div>

      <div className="event-card__body">
        <h3 className="event-card__title">
          <Link to={`/events/${event._id}`}>{event.title}</Link>
        </h3>
        <p className="event-card__desc">{event.description}</p>

        <div className="event-card__meta">
          <div className="event-card__meta-row" style={{ '--meta-color': 'var(--google-blue)' }}>
            <Calendar size={15} aria-hidden="true" />
            <span className="font-mono">{formatDate(event.date)}</span>
          </div>
          <div className="event-card__meta-row" style={{ '--meta-color': 'var(--google-red)' }}>
            <MapPin size={15} aria-hidden="true" />
            <span title={event.venue}>{event.venue}</span>
          </div>
        </div>

        <div className="event-card__capacity">
          <div className="event-card__capacity-top">
            <span>
              <Users size={11} style={{ display: 'inline', marginRight: 4 }} aria-hidden="true" />
              {registeredCount} / {capacity} attendees
            </span>
            <span
              className={`spots ${
                isFull ? 'spots--full' : spotsLeft <= 10 ? 'spots--low' : ''
              }`}
            >
              {isPast ? 'CONCLUDED' : isFull ? 'FULL' : `${spotsLeft} LEFT`}
            </span>
          </div>
          <div
            className="progress-container"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={capacity}
            aria-valuenow={registeredCount}
            aria-label={`${registeredCount} of ${capacity} seats filled`}
          >
            <div
              className="progress-fill"
              style={{
                width: `${percentFilled}%`,
                backgroundColor: isFull
                  ? 'var(--google-red)'
                  : percentFilled > 80
                    ? 'var(--google-yellow)'
                    : 'var(--google-green)',
              }}
            />
          </div>
        </div>

        <div className="event-card__actions">
          <Link to={`/events/${event._id}`} className="btn-brutal btn-sm">
            Details <ArrowRight size={14} />
          </Link>

          {!isPast &&
            (isRegistered ? (
              <button
                type="button"
                onClick={() => onUnregister && onUnregister(event._id)}
                disabled={loading}
                className="btn-brutal btn-sm btn-red btn-icon-action"
                title="Cancel registration"
                aria-label={`Cancel registration for ${event.title}`}
                style={{ padding: '0.4rem 0.6rem' }}
              >
                <X size={14} />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onRegister && onRegister(event._id)}
                disabled={isFull || loading}
                className={`btn-brutal btn-sm ${isFull ? '' : 'btn-green'}`}
                aria-label={
                  isFull
                    ? `${event.title} is full`
                    : `Register for ${event.title}`
                }
              >
                {loading ? 'Working…' : isFull ? 'Full' : 'Register'}
              </button>
            ))}
        </div>
      </div>
    </article>
    </TiltCard>
  );
};

export default EventCard;
