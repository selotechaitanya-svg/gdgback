import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import QRModal from '../components/QRModal';
import Countdown from '../components/Countdown';
import Reveal from '../components/Reveal';
import SplitWords from '../components/SplitWords';
import { buildGoogleCalendarUrl } from '../lib/calendar';
import {
  Ticket,
  Calendar,
  MapPin,
  QrCode,
  Trash2,
  ArrowRight,
  CalendarPlus,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const MyEvents = () => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModalReg, setActiveModalReg] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    fetchMyRegistrations();
  }, []);

  const fetchMyRegistrations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/registrations/my-events');
      if (res.data.success) {
        setRegistrations(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load registered events:', err);
      toast.error('Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleUnregister = async (eventId) => {
    if (!window.confirm('Cancel your registration for this event?')) {
      return;
    }
    try {
      setCancellingId(eventId);
      const res = await api.delete(`/api/registrations/events/${eventId}/unregister`);
      if (res.data.success) {
        toast.success('Registration cancelled');
        setRegistrations((prev) => prev.filter((r) => r.event?._id !== eventId));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    } finally {
      setCancellingId(null);
    }
  };

  const upcomingCount = registrations.filter((reg) => {
    const date = reg.event?.date ? new Date(reg.event.date) : null;
    return date && date > new Date();
  }).length;

  return (
    <div className="page">
      <div className="container-gdg">
        <div className="page-head">
          <Reveal className="section-eyebrow" y={10} duration={0.5}>
            <span className="badge-brutal badge-green">
              <Ticket size={13} aria-hidden="true" /> MY DASHBOARD
            </span>
          </Reveal>
          <SplitWords as="h1" className="page-title" text="MY TICKETS & REGISTRATIONS" />
          <p className="page-sub">
            Your scannable entry passes, upcoming sessions and registrations — all in one place.
            {registrations.length > 0 && (
              <>
                {' '}
                <strong style={{ color: '#000' }}>
                  {upcomingCount} upcoming {upcomingCount === 1 ? 'ticket' : 'tickets'}
                </strong>{' '}
                ready to scan.
              </>
            )}
          </p>
        </div>

        {loading ? (
          <div className="events-grid" aria-busy="true" aria-label="Loading your tickets">
            {[0, 1, 2].map((key) => (
              <div className="skeleton-card" key={key} style={{ height: 360 }}>
                <div className="skeleton-lines" style={{ paddingTop: '1.5rem' }}>
                  <div className="skeleton-block skeleton-line w-45" />
                  <div className="skeleton-block skeleton-line w-90" />
                  <div className="skeleton-block skeleton-line w-70" />
                  <div className="skeleton-block skeleton-line w-90" />
                  <div className="skeleton-block skeleton-line w-45" />
                </div>
              </div>
            ))}
          </div>
        ) : registrations.length === 0 ? (
          <Reveal className="empty-state" y={16}>
            <div className="empty-state__icon" aria-hidden="true">
              <Ticket size={30} />
            </div>
            <h3>NO_TICKETS_YET</h3>
            <p>
              You have not registered for any events yet. Browse upcoming workshops, hackathons and
              tech talks, and your QR pass will appear here instantly.
            </p>
            <Link to="/events" className="btn-brutal btn-yellow">
              Browse upcoming events <ArrowRight size={16} />
            </Link>
          </Reveal>
        ) : (
          <div className="events-grid">
            {registrations.map((reg, index) => {
              const event = reg.event;
              if (!event) return null;
              const eventDate = new Date(event.date);
              const isPast = eventDate < new Date();
              const calendarUrl = buildGoogleCalendarUrl({
                title: event.title,
                description: event.description,
                venue: event.venue,
                date: event.date,
              });

              return (
                <Reveal
                  key={reg._id}
                  as="article"
                  className="ticket-card"
                  delay={index * 0.06}
                  y={24}
                >
                  <div className="ticket-card__head">
                    <div className="ticket-card__top">
                      <span className="badge-brutal badge-yellow">{event.category}</span>
                      <span
                        className={`badge-brutal ${isPast ? 'badge-red' : 'badge-green'}`}
                        style={{ fontFamily: 'var(--font-mono)' }}
                      >
                        {isPast ? 'ATTENDED' : 'CONFIRMED PASS'}
                      </span>
                    </div>

                    <h3 className="ticket-card__title">{event.title}</h3>

                    <div className="ticket-card__meta">
                      <div className="ticket-card__meta-row">
                        <Calendar size={15} aria-hidden="true" />
                        <span className="font-mono">
                          {eventDate.toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="ticket-card__meta-row">
                        <MapPin size={15} aria-hidden="true" style={{ color: 'var(--google-red)' }} />
                        <span>{event.venue}</span>
                      </div>
                    </div>

                    <div className="ticket-card__countdown">
                      <Countdown
                        date={event.date}
                        compact
                        label={isPast ? 'Session wrapped' : 'Your session starts in'}
                      />
                    </div>
                  </div>

                  <div className="ticket-card__stub">
                    <div className="ticket-card__qr">
                      {reg.qrCode ? (
                        <img src={reg.qrCode} alt="" loading="lazy" />
                      ) : (
                        <span
                          style={{
                            width: 46,
                            height: 46,
                            display: 'grid',
                            placeItems: 'center',
                            border: '2px solid #000',
                            borderRadius: 5,
                            background: '#fff',
                          }}
                          aria-hidden="true"
                        >
                          <QrCode size={22} />
                        </span>
                      )}
                      <div>
                        <div className="ticket-card__qr-label">DIGITAL ENTRY PASS</div>
                        <div className="ticket-card__qr-sub">Scan at the check-in desk</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveModalReg(reg)}
                      className="btn-brutal btn-sm btn-yellow"
                    >
                      <QrCode size={14} /> View pass
                    </button>
                  </div>

                  <div className="ticket-card__actions">
                    <Link
                      to={`/events/${event._id}`}
                      className="btn-brutal btn-sm"
                      style={{ textDecoration: 'none' }}
                    >
                      Details
                    </Link>
                    {!isPast && calendarUrl && (
                      <a
                        href={calendarUrl}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="btn-brutal btn-sm"
                        aria-label={`Add ${event.title} to Google Calendar`}
                        title="Add to Google Calendar"
                      >
                        <CalendarPlus size={14} />
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => handleUnregister(event._id)}
                      disabled={cancellingId === event._id}
                      className="btn-brutal btn-sm btn-red"
                      title="Cancel registration"
                      aria-label={`Cancel registration for ${event.title}`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </Reveal>
              );
            })}
          </div>
        )}
      </div>

      {activeModalReg && (
        <QRModal
          isOpen={!!activeModalReg}
          onClose={() => setActiveModalReg(null)}
          registration={{
            ...activeModalReg,
            user,
          }}
        />
      )}
    </div>
  );
};

export default MyEvents;
