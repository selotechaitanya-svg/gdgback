import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import QRModal from '../components/QRModal';
import { Ticket, Calendar, MapPin, QrCode, Trash2, ArrowRight, Bell, Sparkles } from 'lucide-react';
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
    if (!window.confirm('Are you sure you want to cancel your registration for this event?')) {
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

  return (
    <div style={{ paddingTop: '3rem', paddingBottom: '6rem' }}>
      <div className="container-gdg">
        {/* Page Banner */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="badge-brutal badge-green" style={{ marginBottom: '0.75rem' }}>
            MY DASHBOARD
          </div>
          <h1 className="font-pixel" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', marginBottom: '0.75rem' }}>
            MY TICKETS & REGISTRATIONS
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#52525B', maxWidth: '650px' }}>
            View your upcoming GDG sessions, access scannable entry passes, and manage your registrations.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div className="font-pixel" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
              LOADING_YOUR_TICKETS...<span className="cursor-blink">█</span>
            </div>
          </div>
        ) : registrations.length === 0 ? (
          <div className="card-static-lg" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                backgroundColor: 'var(--google-blue-soft)',
                border: '3px solid #000',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto',
              }}
            >
              <Ticket size={32} />
            </div>
            <h3 className="font-pixel" style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>
              NO_TICKETS_FOUND
            </h3>
            <p style={{ color: '#52525B', maxWidth: '480px', margin: '0 auto 1.75rem auto' }}>
              You haven't registered for any events yet. Check out upcoming workshops, hackathons, and tech talks!
            </p>
            <Link to="/events" className="btn-brutal btn-yellow">
              Browse Upcoming Events <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '2rem',
            }}
          >
            {registrations.map((reg) => {
              const event = reg.event;
              if (!event) return null;
              const eventDate = new Date(event.date);
              const isPast = eventDate < new Date();

              return (
                <div
                  key={reg._id}
                  className="card-brutal accent-bar-green"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span className="badge-brutal badge-yellow">{event.category}</span>
                      <span className="badge-brutal badge-green font-mono">CONFIRMED PASS</span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem', lineHeight: '1.3' }}>
                      {event.title}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                        <Calendar size={16} color="var(--google-blue)" />
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: '#52525B' }}>
                        <MapPin size={16} color="var(--google-red)" />
                        <span>{event.venue}</span>
                      </div>
                    </div>

                    {/* QR Code Quick Preview & Actions */}
                    <div
                      style={{
                        marginTop: 'auto',
                        padding: '1rem',
                        backgroundColor: '#F4F4F5',
                        border: '2px solid #000',
                        borderRadius: '8px',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {reg.qrCode && (
                          <img
                            src={reg.qrCode}
                            alt="QR Pass"
                            style={{ width: '48px', height: '48px', border: '1.5px solid #000', borderRadius: '4px' }}
                          />
                        )}
                        <div>
                          <div className="font-mono" style={{ fontSize: '0.8rem', fontWeight: 800 }}>
                            DIGITAL PASS
                          </div>
                          <div className="font-mono" style={{ fontSize: '0.7rem', color: '#71717A' }}>
                            Tap to view pass
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveModalReg(reg)}
                        className="btn-brutal btn-sm btn-yellow"
                      >
                        <QrCode size={14} /> View Pass
                      </button>
                    </div>

                    {/* Footer Actions */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link
                        to={`/events/${event._id}`}
                        className="btn-brutal btn-sm"
                        style={{ flex: 1, textDecoration: 'none' }}
                      >
                        Details
                      </Link>
                      <button
                        onClick={() => handleUnregister(event._id)}
                        disabled={cancellingId === event._id}
                        className="btn-brutal btn-sm btn-red"
                        title="Cancel Registration"
                      >
                        <Trash2 size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* QR Modal */}
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
