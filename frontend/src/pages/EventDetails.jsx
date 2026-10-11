import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import QRModal from '../components/QRModal';
import {
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  QrCode,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  Share2,
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
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#4285F4', '#EA4335', '#FBBC04', '#34A853'],
        });

        toast.success('🎉 Successfully registered! Your QR Pass is ready.');
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
        toast.success('🔔 Reminder set! You will receive notification 24 hours prior.');
        setReminderSet(true);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to set reminder');
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Event link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="font-pixel" style={{ fontSize: '1.1rem' }}>
          LOADING_EVENT_DETAILS...<span className="cursor-blink">█</span>
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

  return (
    <div style={{ paddingTop: '2.5rem', paddingBottom: '6rem' }}>
      <div className="container-gdg" style={{ maxWidth: '1080px' }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link to="/events" className="btn-brutal btn-sm">
            <ArrowLeft size={16} /> Back to Events
          </Link>
          <button onClick={handleShare} className="btn-brutal btn-sm">
            <Share2 size={15} /> Share
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid-details">
          {/* Left Column: Event Visual & Description */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Banner Card */}
            <div className="card-static-lg" style={{ overflow: 'hidden' }}>
              {event.image ? (
                <div style={{ maxHeight: '380px', overflow: 'hidden', borderBottom: '3px solid #000' }}>
                  <img
                    src={event.image}
                    alt={event.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              ) : null}

              <div style={{ padding: '2rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <span className="badge-brutal badge-yellow">{event.category}</span>
                  {isPast ? (
                    <span className="badge-brutal" style={{ backgroundColor: '#18181B', color: '#FFF' }}>
                      PAST EVENT
                    </span>
                  ) : (
                    <span className="badge-brutal badge-green">UPCOMING</span>
                  )}
                  {isRegistered && (
                    <span className="badge-brutal badge-green">
                      <CheckCircle2 size={13} /> YOU ARE REGISTERED
                    </span>
                  )}
                </div>

                <h1
                  style={{
                    fontSize: 'clamp(1.5rem, 3.5vw, 2.25rem)',
                    fontWeight: 900,
                    lineHeight: '1.25',
                    marginBottom: '1rem',
                  }}
                >
                  {event.title}
                </h1>

                <p style={{ fontSize: '0.85rem', color: '#71717A', marginBottom: '1.5rem' }} className="font-mono">
                  Organized by: <strong>{event.createdBy?.name || 'GDG RBU Core Team'}</strong>
                </p>

                <h3 className="font-mono" style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.75rem' }}>
                  ABOUT THIS SESSION
                </h3>
                <p style={{ fontSize: '1rem', lineHeight: '1.8', color: '#27272A', whiteSpace: 'pre-line' }}>
                  {event.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Registration Box & Event Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
            {/* Key Logistics Card */}
            <div className="card-static" style={{ padding: '1.75rem' }}>
              <div className="badge-brutal badge-blue" style={{ marginBottom: '1.25rem' }}>
                SESSION DETAILS
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Date & Time */}
                <div style={{ display: 'flex', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      backgroundColor: 'var(--google-blue-soft)',
                      border: '2px solid #000',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Calendar size={22} color="var(--google-blue)" />
                  </div>
                  <div>
                    <div className="label-brutal" style={{ marginBottom: '2px' }}>DATE & TIME</div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {eventDate.toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>
                    <div className="font-mono" style={{ fontSize: '0.8rem', color: '#52525B' }}>
                      {eventDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>

                {/* Venue */}
                <div style={{ display: 'flex', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      backgroundColor: 'var(--google-red-soft)',
                      border: '2px solid #000',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <MapPin size={22} color="var(--google-red)" />
                  </div>
                  <div>
                    <div className="label-brutal" style={{ marginBottom: '2px' }}>VENUE</div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{event.venue}</div>
                    <div className="font-mono" style={{ fontSize: '0.75rem', color: '#71717A' }}>
                      Shri Ramdeobaba University, Nagpur
                    </div>
                  </div>
                </div>

                {/* Capacity Status */}
                <div style={{ display: 'flex', gap: '0.85rem' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      backgroundColor: 'var(--google-green-soft)',
                      border: '2px solid #000',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Users size={22} color="var(--google-green)" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="label-brutal" style={{ marginBottom: '2px' }}>CAPACITY</div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                      {registeredCount} / {capacity} Registered
                    </div>
                    <div className="progress-container" style={{ margin: '6px 0' }}>
                      <div
                        className="progress-fill"
                        style={{ width: `${Math.min(100, (registeredCount / capacity) * 100)}%` }}
                      />
                    </div>
                    <div className="font-mono" style={{ fontSize: '0.75rem', fontWeight: 800, color: isFull ? 'var(--google-red)' : 'var(--google-green)' }}>
                      {isFull ? 'EVENT IS AT FULL CAPACITY' : `${spotsLeft} SPOTS REMAINING`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Registration Action Box */}
            <div
              className="card-static"
              style={{
                padding: '1.75rem',
                backgroundColor: isRegistered ? 'var(--google-green-soft)' : '#FFFFFF',
              }}
            >
              {isPast ? (
                <div style={{ textAlign: 'center' }}>
                  <div className="font-pixel" style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                    EVENT_CONCLUDED
                  </div>
                  <p style={{ fontSize: '0.85rem', color: '#52525B' }}>
                    This event occurred on {eventDate.toLocaleDateString()}. Registration is closed.
                  </p>
                </div>
              ) : isRegistered ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={24} color="var(--google-green)" />
                    <div>
                      <h4 style={{ fontWeight: 900, fontSize: '1.1rem' }}>Registration Confirmed!</h4>
                      <p style={{ fontSize: '0.8rem', color: '#3F3F46' }}>
                        Your entry token is locked. Present your QR pass at the entrance.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-brutal btn-yellow"
                    style={{ width: '100%' }}
                  >
                    <QrCode size={18} /> View & Download QR Entry Pass
                  </button>

                  <button
                    onClick={handleSetReminder}
                    disabled={reminderSet}
                    className="btn-brutal"
                    style={{ width: '100%' }}
                  >
                    <Bell size={16} /> {reminderSet ? 'Reminder Enabled ✓' : 'Set Event Reminder'}
                  </button>

                  <button
                    onClick={handleUnregister}
                    disabled={actionLoading}
                    className="btn-brutal btn-sm btn-red"
                    style={{ width: '100%', marginTop: '0.5rem' }}
                  >
                    Cancel Registration
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <h4 style={{ fontWeight: 900, fontSize: '1.15rem', marginBottom: '0.25rem' }}>
                      Secure Your Spot
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: '#52525B' }}>
                      Free registration. Includes participation certificate and access to Discord discussion channels.
                    </p>
                  </div>

                  <button
                    onClick={handleRegister}
                    disabled={isFull || actionLoading}
                    className={`btn-brutal btn-lg ${isFull ? '' : 'btn-green'}`}
                    style={{ width: '100%' }}
                  >
                    {actionLoading
                      ? 'Processing...'
                      : isFull
                      ? 'Event Full (Waitlist)'
                      : 'Register Now — Free'}
                  </button>

                  {!user && (
                    <p className="font-mono" style={{ fontSize: '0.75rem', textAlign: 'center', color: '#71717A' }}>
                      You will be asked to sign in or create an account.
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Pass Modal */}
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
