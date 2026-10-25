import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import QRModal from '../components/QRModal';
import Countdown from '../components/Countdown';
import Reveal from '../components/Reveal';
import SplitWords from '../components/SplitWords';
import { buildGoogleCalendarUrl } from '../lib/calendar';
import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  QrCode,
  Bell,
  CheckCircle2,
  Clock,
  Share2,
  CalendarPlus,
  Award,
  MessagesSquare,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';

export const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [reminderSet, setReminderSet] = useState(false);

  useEffect(() => {
    fetchEventDetails();
    if (user) {
      checkRegistrationStatus();
    }
  }, [id, user]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/events/${id}`);
      if (res.data.success) {
        setEvent(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load event:', err);
      toast.error('Event not found');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const checkRegistrationStatus = async () => {
    try {
      const res = await api.get(`/api/registrations/check/${id}`);
      if (res.data.success) {
        setIsRegistered(res.data.isRegistered);
        if (res.data.registration) {
          setRegistrationData(res.data.registration);
        }
      }
    } catch (err) {
      console.warn('Could not check registration:', err);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      toast.error('Please login to register for this event');
      navigate('/login', { state: { from: { pathname: `/events/${id}` } } });
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.post(`/api/registrations/events/${id}/register`);
      if (res.data.success) {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.62 },
          colors: ['#4285F4', '#EA4335', '#FBBC04', '#34A853'],
        });

        toast.success('Successfully registered! Your QR pass is ready.');
        setIsRegistered(true);
        setRegistrationData(res.data.data);
        fetchEventDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnregister = async () => {
    try {
      setActionLoading(true);
      const res = await api.delete(`/api/registrations/events/${id}/unregister`);
      if (res.data.success) {
        toast.success('Registration cancelled');
        setIsRegistered(false);
        setRegistrationData(null);
        fetchEventDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetReminder = async () => {
    try {
      const res = await api.post(`/api/reminders/${id}`);
      if (res.data.success) {
        toast.success('Reminder set! We will notify you 24 hours before.');
        setReminderSet(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to set reminder');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: event?.title || 'GDG RBU Event',
      text: event?.description?.slice(0, 120),
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Event link copied to clipboard');
    } catch (err) {
      if (err?.name !== 'AbortError') {
        toast.error('Could not share this event');
      }
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container-gdg" style={{ maxWidth: 1080 }}>
          <div className="detail-layout">
            <div className="skeleton-card" style={{ height: 520 }}>
              <div className="skeleton-block skeleton-media" style={{ height: 280 }} />
              <div className="skeleton-lines">
                <div className="skeleton-block skeleton-line w-45" />
                <div className="skeleton-block skeleton-line w-90" />
                <div className="skeleton-block skeleton-line w-70" />
              </div>
            </div>
            <div className="skeleton-card" style={{ height: 360 }}>
              <div className="skeleton-lines">
                <div className="skeleton-block skeleton-line w-70" />
                <div className="skeleton-block skeleton-line w-90" />
                <div className="skeleton-block skeleton-line w-90" />
                <div className="skeleton-block skeleton-line w-45" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) return null;

  const eventDate = new Date(event.date);
  const isPast = eventDate < new Date();
  const capacity = event.capacity || 100;
  const registeredCount = event.registrationCount || 0;
  const spotsLeft = Math.max(0, capacity - registeredCount);
  const isFull = spotsLeft === 0;
  const percentFilled = Math.min(100, Math.round((registeredCount / capacity) * 100));

  const calendarUrl = buildGoogleCalendarUrl({
    title: event.title,
    description: event.description,
    venue: event.venue,
    date: event.date,
  });

  return (
    <div className="page">
      <div className="container-gdg" style={{ maxWidth: 1120 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '0.75rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <Link to="/events" className="btn-brutal btn-sm">
            <ArrowLeft size={15} /> Back to events
          </Link>
          <button type="button" onClick={handleShare} className="btn-brutal btn-sm">
            <Share2 size={14} /> Share event
          </button>
        </div>

        <div className="detail-layout">
          <div className="detail-main">
            <Reveal y={22} duration={0.7}>
              <div className="detail-hero">
                {event.image && (
                  <div className="detail-hero__media">
                    <img src={event.image} alt="" />
                  </div>
                )}

                <div className="detail-hero__content">
                  <div className="detail-badges">
                    <span className="badge-brutal badge-yellow">{event.category}</span>
                    {isPast ? (
                      <span className="badge-brutal" style={{ background: '#18181b', color: '#fff' }}>
                        PAST EVENT
                      </span>
                    ) : (
                      <span className="badge-brutal badge-green">
                        <span className="hero__eyebrow-dot" aria-hidden="true" /> UPCOMING
                      </span>
                    )}
                    {isRegistered && (
                      <span className="badge-brutal badge-green">
                        <CheckCircle2 size={13} aria-hidden="true" /> YOU ARE REGISTERED
                      </span>
                    )}
                  </div>

                  <SplitWords as="h1" className="detail-title" text={event.title} />
                  <p className="detail-byline">
                    Organized by <strong>{event.createdBy?.name || 'GDG RBU Core Team'}</strong> ·
                    Google Developer Group on Campus
                  </p>

                  <h2 className="detail-section-label">About this session</h2>
                  <p className="detail-description">{event.description}</p>

                  <div className="detail-perks">
                    <div className="detail-perk">
                      <Award size={17} aria-hidden="true" /> Participation certificate
                    </div>
                    <div className="detail-perk">
                      <MessagesSquare size={17} aria-hidden="true" /> Community Discord access
                    </div>
                    <div className="detail-perk">
                      <Sparkles size={17} aria-hidden="true" /> Mentor-led hands-on session
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>

            {!isPast && (
              <Reveal className="detail-countdown" y={16} delay={0.05}>
                <Countdown date={event.date} label="Doors open in" />
              </Reveal>
            )}
          </div>

          <aside className="detail-sidebar">
            <Reveal y={20} delay={0.05}>
              <div className="detail-card">
                <h2 className="detail-card__title">
                  <Clock size={13} aria-hidden="true" /> SESSION DETAILS
                </h2>

                <div className="detail-meta">
                  <div className="detail-meta__row">
                    <span
                      className="detail-meta__icon"
                      style={{
                        '--meta-soft': 'var(--google-blue-soft)',
                        '--meta-color': 'var(--google-blue)',
                      }}
                    >
                      <Calendar size={19} aria-hidden="true" />
                    </span>
                    <div>
                      <div className="detail-meta__label">DATE &amp; TIME</div>
                      <div className="detail-meta__value">
                        {eventDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                      <div className="detail-meta__note">
                        {eventDate.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        IST
                      </div>
                    </div>
                  </div>

                  <div className="detail-meta__row">
                    <span
                      className="detail-meta__icon"
                      style={{
                        '--meta-soft': 'var(--google-red-soft)',
                        '--meta-color': 'var(--google-red)',
                      }}
                    >
                      <MapPin size={19} aria-hidden="true" />
                    </span>
                    <div>
                      <div className="detail-meta__label">VENUE</div>
                      <div className="detail-meta__value">{event.venue}</div>
                      <div className="detail-meta__note">Shri Ramdeobaba University, Nagpur</div>
                    </div>
                  </div>

                  <div className="detail-meta__row">
                    <span
                      className="detail-meta__icon"
                      style={{
                        '--meta-soft': 'var(--google-green-soft)',
                        '--meta-color': 'var(--google-green)',
                      }}
                    >
                      <Users size={19} aria-hidden="true" />
                    </span>
                    <div style={{ flex: 1 }}>
                      <div className="detail-meta__label">CAPACITY</div>
                      <div className="detail-meta__value">
                        {registeredCount} / {capacity} registered
                      </div>
                    </div>
                  </div>
                </div>

                <div className="detail-capacity">
                  <div className="detail-capacity__top">
                    <span>{percentFilled}% filled</span>
                    <span
                      style={{
                        color: isFull
                          ? 'var(--google-red)'
                          : spotsLeft <= 10
                            ? '#B45309'
                            : 'var(--google-green)',
                      }}
                    >
                      {isPast
                        ? 'REGISTRATION CLOSED'
                        : isFull
                          ? 'EVENT FULL'
                          : `${spotsLeft} SPOTS LEFT`}
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
              </div>
            </Reveal>

            <Reveal y={20} delay={0.1}>
              <div
                className="detail-card"
                style={{ background: isRegistered ? 'var(--google-green-soft)' : '#FFFFFF' }}
              >
                {isPast ? (
                  <div style={{ textAlign: 'center' }}>
                    <h2 className="font-pixel" style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                      EVENT_CONCLUDED
                    </h2>
                    <p style={{ fontSize: '0.82rem', color: '#52525B', lineHeight: 1.6 }}>
                      This session wrapped on {eventDate.toLocaleDateString()}. Explore upcoming
                      events to find your next build.
                    </p>
                    <Link
                      to="/events"
                      className="btn-brutal btn-sm btn-yellow"
                      style={{ marginTop: '1rem', width: '100%' }}
                    >
                      Browse upcoming <ArrowRight size={14} />
                    </Link>
                  </div>
                ) : isRegistered ? (
                  <div className="detail-actions">
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                      <CheckCircle2 size={23} color="var(--google-green)" aria-hidden="true" />
                      <div>
                        <h2 style={{ fontWeight: 900, fontSize: '1.02rem', marginBottom: '0.15rem' }}>
                          Your seat is locked
                        </h2>
                        <p style={{ fontSize: '0.78rem', color: '#3F3F46', lineHeight: 1.55 }}>
                          Present your QR pass at the entrance. Need to transfer it? Cancel and
                          re-register from the same account.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsModalOpen(true)}
                      className="btn-brutal btn-yellow"
                    >
                      <QrCode size={17} /> View &amp; download QR pass
                    </button>

                    <button
                      type="button"
                      onClick={handleSetReminder}
                      disabled={reminderSet}
                      className="btn-brutal"
                    >
                      <Bell size={16} /> {reminderSet ? 'Reminder enabled' : 'Set 24h reminder'}
                    </button>

                    <a
                      href={calendarUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="btn-brutal btn-sm"
                    >
                      <CalendarPlus size={15} /> Add to Google Calendar
                    </a>

                    <button
                      type="button"
                      onClick={handleUnregister}
                      disabled={actionLoading}
                      className="btn-brutal btn-sm btn-red"
                    >
                      Cancel registration
                    </button>
                  </div>
                ) : (
                  <div className="detail-actions">
                    <div>
                      <h2 style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: '0.2rem' }}>
                        Secure your spot
                      </h2>
                      <p style={{ fontSize: '0.82rem', color: '#52525B', lineHeight: 1.6 }}>
                        Free registration. Includes a participation certificate, hands-on lab access
                        and community Discord channels.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleRegister}
                      disabled={isFull || actionLoading}
                      className={`btn-brutal btn-lg ${isFull ? '' : 'btn-green'}`}
                    >
                      {actionLoading
                        ? 'Processing…'
                        : isFull
                          ? 'Event full'
                          : 'Register now — free'}
                    </button>

                    <a
                      href={calendarUrl}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="btn-brutal btn-sm"
                    >
                      <CalendarPlus size={15} /> Add to Google Calendar
                    </a>

                    {!user && (
                      <p className="detail-actions__note">
                        You will be asked to sign in or create a free account.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Reveal>
          </aside>
        </div>
      </div>

      {isModalOpen && (
        <QRModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          registration={{
            event,
            user,
            qrCode: registrationData?.qrCode,
            createdAt: registrationData?.createdAt,
          }}
        />
      )}
    </div>
  );
};

export default EventDetails;
