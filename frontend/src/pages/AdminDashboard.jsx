import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Mail,
  LogOut,
  Calendar,
  Users,
  CheckCircle,
  AlertTriangle,
  Search,
  MapPin,
  RefreshCw,
  Plus,
  Edit3,
  Trash2,
  X,
  Image as ImageIcon,
  Upload,
} from 'lucide-react';
import toast from 'react-hot-toast';

const CATEGORIES = [
  'Workshop',
  'Hackathon',
  'Tech Talk',
  'Meetup',
  'Conference',
  'Bootcamp',
  'Other',
];

const PRESET_BANNERS = [
  { label: 'AI & Cloud', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Hackathon & Dev', url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Mobile & Web', url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80' },
  { label: 'Community Meetup', url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80' },
];

export const AdminDashboard = () => {
  const { user, isAdmin, loading: authLoading, requestOtp, verifyOtp, logout } = useAuth();
  const navigate = useNavigate();

  // Admin Sign-in State (When unauthenticated)
  const [adminEmail, setAdminEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // Dashboard Data State (When authenticated and authorized)
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [selectedEventMeta, setSelectedEventMeta] = useState(null);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1, limit: 50 });

  // Event CRUD Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Event Form Data State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Workshop',
    date: '',
    venue: '',
    capacity: 100,
    image: '',
  });

  // Delete Confirmation Modal State
  const [deleteModalEvent, setDeleteModalEvent] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // Helper to convert date to datetime-local input string
  const toDatetimeLocal = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return '';
    const pad = (n) => String(n).padStart(2, '0');
    const year = d.getFullYear();
    const month = pad(d.getMonth() + 1);
    const day = pad(d.getDate());
    const hours = pad(d.getHours());
    const minutes = pad(d.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // --------------------------------------------------------------------------
  // OTP Sign-In Handlers for /admin
  // --------------------------------------------------------------------------
  const handleSendAdminOtp = async (e) => {
    if (e) e.preventDefault();
    if (!adminEmail.trim() || !adminEmail.includes('@')) {
      toast.error('Please enter a valid administrator email address');
      return;
    }

    try {
      setOtpLoading(true);
      const res = await requestOtp(adminEmail.trim(), 'login');
      if (res.success) {
        setOtpSent(true);
        if (res.devOtp) {
          setOtp(res.devOtp);
          toast.success(`Verification code: ${res.devOtp}`, { duration: 8000 });
        } else {
          toast.success(`Verification code sent to ${adminEmail.trim()}! Check your inbox.`);
        }
        setCountdown(60);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        toast.error(res.message || 'Failed to send OTP code');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error requesting verification code');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyAdminOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim() || otp.trim().length !== 6) {
      toast.error('Please enter the 6-digit code received in your email');
      return;
    }

    try {
      setOtpLoading(true);
      const res = await verifyOtp(adminEmail.trim(), otp.trim());
      if (res.success) {
        if (res.user.isAdmin) {
          toast.success(`Administrator access granted. Welcome, ${res.user.name || res.user.email}!`);
        } else {
          toast.error('Verified, but this account is not on the administrator allowlist.');
        }
      } else {
        toast.error(res.message || 'Invalid verification code');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // --------------------------------------------------------------------------
  // Dashboard Fetch Handlers
  // --------------------------------------------------------------------------
  const fetchEvents = useCallback(async (preferredSelectedId = null) => {
    try {
      setEventsLoading(true);
      const res = await api.get('/api/admin/events');
      if (res.data.success) {
        setEvents(res.data.events);
        if (preferredSelectedId) {
          setSelectedEventId(preferredSelectedId);
        } else if (res.data.events.length > 0 && !selectedEventId) {
          setSelectedEventId(res.data.events[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch admin events:', err);
      if (err.response?.status === 403) {
        toast.error('Access denied: not authorized as an administrator.');
      } else {
        toast.error('Failed to load events.');
      }
    } finally {
      setEventsLoading(false);
    }
  }, [selectedEventId]);

  const fetchRegistrations = useCallback(async (eventId, targetPage = 1) => {
    if (!eventId) return;
    try {
      setRegistrationsLoading(true);
      const res = await api.get(`/api/admin/events/${eventId}/registrations?page=${targetPage}&limit=50`);
      if (res.data.success) {
        setRegistrations(res.data.registrations);
        setSelectedEventMeta(res.data.event);
        setPagination(res.data.pagination);
        setPage(targetPage);
      }
    } catch (err) {
      console.error('Failed to fetch registrations:', err);
      toast.error('Failed to load event registrations.');
    } finally {
      setRegistrationsLoading(false);
    }
  }, []);

  // Fetch events when user is authorized admin
  useEffect(() => {
    if (user && isAdmin) {
      fetchEvents();
    }
  }, [user, isAdmin, fetchEvents]);

  // Fetch registrations whenever selected event changes
  useEffect(() => {
    if (selectedEventId && user && isAdmin) {
      fetchRegistrations(selectedEventId, 1);
    }
  }, [selectedEventId, user, isAdmin, fetchRegistrations]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    toast.success('Logged out from admin portal');
  };

  // --------------------------------------------------------------------------
  // Event CRUD Handlers (Create, Edit, Delete)
  // --------------------------------------------------------------------------
  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      category: 'Workshop',
      date: '',
      venue: '',
      capacity: 100,
      image: PRESET_BANNERS[0].url,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (ev) => {
    setIsEditing(true);
    setEditingId(ev.id);
    setFormData({
      title: ev.title || '',
      description: ev.description || '',
      category: ev.category || 'Workshop',
      date: toDatetimeLocal(ev.date),
      venue: ev.venue || '',
      capacity: ev.capacity || 100,
      image: ev.image || '',
    });
    setIsModalOpen(true);
  };

  const handleImageFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image file must be under 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, image: reader.result }));
      toast.success('Image loaded successfully');
    };
    reader.readAsDataURL(file);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Event title is required');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Event description is required');
      return;
    }
    if (!formData.date) {
      toast.error('Event date & time is required');
      return;
    }
    if (!formData.venue.trim()) {
      toast.error('Event venue is required');
      return;
    }
    const capNum = Number(formData.capacity);
    if (!capNum || capNum < 1) {
      toast.error('Capacity (seats) must be at least 1');
      return;
    }

    try {
      setFormSubmitting(true);
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        date: new Date(formData.date).toISOString(),
        venue: formData.venue.trim(),
        capacity: capNum,
        image: formData.image || '',
      };

      if (isEditing) {
        const res = await api.put(`/api/events/${editingId}`, payload);
        if (res.data.success) {
          toast.success('Event updated successfully! 🚀');
          setIsModalOpen(false);
          await fetchEvents(editingId);
        } else {
          toast.error(res.data.message || 'Failed to update event');
        }
      } else {
        const res = await api.post('/api/events', payload);
        if (res.data.success) {
          toast.success('Event created successfully! 🎉');
          setIsModalOpen(false);
          const newId = res.data.data?._id || res.data.data?.id;
          await fetchEvents(newId);
          if (newId) setSelectedEventId(newId);
        } else {
          toast.error(res.data.message || 'Failed to create event');
        }
      }
    } catch (err) {
      console.error('Save event error:', err);
      toast.error(err.response?.data?.message || 'Error saving event');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!deleteModalEvent) return;
    try {
      setDeleteSubmitting(true);
      const res = await api.delete(`/api/events/${deleteModalEvent.id}`);
      if (res.data.success) {
        toast.success(`Event "${deleteModalEvent.title}" deleted.`);
        const deletedId = deleteModalEvent.id;
        setDeleteModalEvent(null);
        if (selectedEventId === deletedId) {
          setSelectedEventId(null);
        }
        await fetchEvents();
      } else {
        toast.error(res.data.message || 'Failed to delete event');
      }
    } catch (err) {
      console.error('Delete event error:', err);
      toast.error(err.response?.data?.message || 'Error deleting event');
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // Filter events by search
  const filteredEvents = events.filter((ev) =>
    ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ev.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
    ev.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --------------------------------------------------------------------------
  // STATE 1: AUTH LOADING SPINNER
  // --------------------------------------------------------------------------
  if (authLoading) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card-static-lg" style={{ padding: '2.5rem', textAlign: 'center', maxWidth: '440px' }}>
          <div className="badge-brutal badge-blue" style={{ marginBottom: '1rem' }}>
            VERIFYING IDENTITY
          </div>
          <div className="font-pixel" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
            CHECKING_SESSION...
          </div>
          <p className="font-mono" style={{ fontSize: '0.85rem', color: '#52525B' }}>
            Validating credentials and administrator allowlist...
          </p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // STATE 2: UNAUTHENTICATED -> DEDICATED ADMIN SIGN-IN INTERFACE
  // --------------------------------------------------------------------------
  if (!user) {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
        }}
      >
        <div
          className="card-static-lg"
          style={{
            maxWidth: '480px',
            width: '100%',
            backgroundColor: '#FFFFFF',
            padding: '2.5rem',
            position: 'relative',
          }}
        >
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              className="badge-brutal badge-red"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '1rem',
              }}
            >
              <Shield size={14} />
              RESTRICTED ACCESS
            </div>
            <h1 className="font-pixel" style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>
              ADMIN_PORTAL
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#52525B', lineHeight: '1.5' }}>
              Enter your authorized administrator email address. We'll send a 6-digit verification code to your inbox.
            </p>
          </div>

          {!otpSent ? (
            /* Step 1: Administrator Email Input */
            <form onSubmit={handleSendAdminOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label className="label-brutal">ADMINISTRATOR EMAIL ADDRESS</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    required
                    placeholder="admin@gdgrbu.app"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="input-brutal font-mono"
                    style={{ paddingLeft: '2.75rem' }}
                    autoFocus
                  />
                  <Mail
                    size={18}
                    style={{
                      position: 'absolute',
                      left: '14px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#71717A',
                    }}
                  />
                </div>
                <p className="font-mono" style={{ fontSize: '0.72rem', color: '#71717A', marginTop: '6px' }}>
                  Only emails configured on the server administrator allowlist can access this portal.
                </p>
              </div>

              <button
                type="submit"
                disabled={otpLoading}
                className="btn-brutal btn-lg btn-red"
                style={{ width: '100%' }}
              >
                {otpLoading ? 'Sending Verification Code...' : 'Send Administrator OTP →'}
              </button>
            </form>
          ) : (
            /* Step 2: 6-Digit OTP Verification */
            <form onSubmit={handleVerifyAdminOtp} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div
                className="card-static"
                style={{
                  padding: '0.85rem 1rem',
                  backgroundColor: '#DCFCE7',
                  border: '2px solid #000',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <CheckCircle size={18} style={{ color: '#16A34A', flexShrink: 0 }} />
                <div style={{ fontSize: '0.8rem', color: '#15803D' }}>
                  Code sent to <strong>{adminEmail}</strong>
                </div>
              </div>

              <div>
                <label className="label-brutal">6-DIGIT VERIFICATION CODE</label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="input-brutal font-mono text-center"
                  style={{
                    fontSize: '1.75rem',
                    letterSpacing: '0.35em',
                    padding: '0.75rem',
                    textAlign: 'center',
                  }}
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={otpLoading || otp.length !== 6}
                className="btn-brutal btn-lg btn-green"
                style={{ width: '100%' }}
              >
                {otpLoading ? 'Verifying...' : 'Verify & Enter Portal →'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  disabled={countdown > 0 || otpLoading}
                  onClick={handleSendAdminOtp}
                  className="font-mono"
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '0.8rem',
                    color: countdown > 0 ? '#A1A1AA' : '#2563EB',
                    cursor: countdown > 0 ? 'not-allowed' : 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  {countdown > 0 ? `Resend code in ${countdown}s` : 'Resend verification code'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // STATE 3: AUTHENTICATED USER BUT NOT AUTHORIZED IN SERVER ADMIN_EMAILS
  // --------------------------------------------------------------------------
  if (!isAdmin) {
    return (
      <div
        style={{
          minHeight: '80vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem 1rem',
        }}
      >
        <div
          className="card-static-lg"
          style={{
            maxWidth: '520px',
            width: '100%',
            backgroundColor: '#FFFFFF',
            padding: '2.5rem',
            textAlign: 'center',
          }}
        >
          <div
            className="badge-brutal badge-red"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginBottom: '1.25rem',
            }}
          >
            <AlertTriangle size={16} />
            UNAUTHORIZED ACCESS
          </div>

          <h1 className="font-pixel" style={{ fontSize: '1.4rem', marginBottom: '1rem', color: '#DC2626' }}>
            ACCESS_DENIED
          </h1>

          <p style={{ color: '#27272A', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
            Your account (<strong className="font-mono">{user.email}</strong>) has been verified, but it is <strong>not authorized</strong> to access the private administrator portal.
          </p>

          <div
            className="card-static"
            style={{
              backgroundColor: '#FEF2F2',
              border: '2px solid #EF4444',
              padding: '1rem',
              textAlign: 'left',
              marginBottom: '2rem',
              fontSize: '0.8rem',
              color: '#991B1B',
            }}
          >
            <strong>Security Notice:</strong>
            <p style={{ margin: '6px 0 0 0', lineHeight: '1.5' }}>
              Administrative privileges are strictly restricted to email addresses defined in the server-side <code style={{ fontWeight: 800 }}>ADMIN_EMAILS</code> allowlist.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={handleLogout}
              className="btn-brutal btn-red font-mono"
              style={{ fontSize: '0.85rem' }}
            >
              <LogOut size={14} style={{ marginRight: '6px', display: 'inline' }} />
              Sign Out & Switch Account
            </button>
            <button
              onClick={() => navigate('/')}
              className="btn-brutal btn-yellow font-mono"
              style={{ fontSize: '0.85rem' }}
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // STATE 4: AUTHORIZED ADMINISTRATOR -> FULL EVENT MANAGEMENT & ATTENDEE PORTAL
  // --------------------------------------------------------------------------
  const selectedEvent = events.find((ev) => ev.id === selectedEventId);

  return (
    <div style={{ minHeight: '85vh', padding: '2rem 0' }}>
      <div className="container-gdg">
        {/* Top Header Bar */}
        <div
          className="card-static-lg"
          style={{
            padding: '1.25rem 1.75rem',
            backgroundColor: '#FFFFFF',
            marginBottom: '2rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="badge-brutal badge-red">PRIVATE ADMIN</span>
              <span className="badge-brutal badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle size={12} />
                AUTHORIZED
              </span>
            </div>
            <h1 className="font-pixel" style={{ fontSize: '1.35rem', margin: '0.5rem 0 0 0' }}>
              EVENT_MANAGEMENT_PORTAL
            </h1>
            <p className="font-mono" style={{ fontSize: '0.78rem', color: '#52525B', margin: '4px 0 0 0' }}>
              Logged in as: <strong>{user.email}</strong> · Manage Events (Create, Edit, Delete) & View Registrations
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            {/* Primary Action: Add Event */}
            <button
              onClick={handleOpenCreateModal}
              className="btn-brutal btn-sm btn-yellow font-mono"
              title="Add New Event"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 800 }}
            >
              <Plus size={16} />
              + Add Event
            </button>

            <button
              onClick={() => {
                fetchEvents();
                if (selectedEventId) fetchRegistrations(selectedEventId, page);
                toast.success('Event data refreshed');
              }}
              className="btn-brutal btn-sm font-mono"
              title="Refresh Data"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <RefreshCw size={14} />
              Refresh
            </button>

            <button
              onClick={handleLogout}
              className="btn-brutal btn-sm btn-red font-mono"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Master-Detail Layout */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 390px) 1fr',
            gap: '1.75rem',
            alignItems: 'start',
          }}
          className="admin-dashboard-grid"
        >
          {/* Left Column: Events Master List */}
          <div
            className="card-static-lg"
            style={{
              padding: '1.5rem',
              backgroundColor: '#FFFFFF',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div className="font-pixel" style={{ fontSize: '0.95rem' }}>
                EVENTS ({events.length})
              </div>
              <button
                onClick={handleOpenCreateModal}
                className="btn-brutal btn-sm btn-green font-mono"
                style={{ fontSize: '0.72rem', padding: '3px 8px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <Plus size={12} />
                New Event
              </button>
            </div>

            {/* Search filter */}
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <input
                type="text"
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-brutal font-mono"
                style={{ paddingLeft: '2.5rem', fontSize: '0.8rem', padding: '0.5rem 0.5rem 0.5rem 2.5rem' }}
              />
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#71717A',
                }}
              />
            </div>

            {/* Events List */}
            {eventsLoading ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center' }} className="font-mono">
                Loading events...
              </div>
            ) : filteredEvents.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: '#71717A' }} className="font-mono">
                No events found.{' '}
                <button
                  onClick={handleOpenCreateModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563EB',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  Create one now?
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '650px', overflowY: 'auto' }}>
                {filteredEvents.map((ev) => {
                  const isSelected = ev.id === selectedEventId;
                  const dateFormatted = new Date(ev.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });

                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedEventId(ev.id)}
                      className={`card-interactive ${isSelected ? 'selected-event-card' : ''}`}
                      style={{
                        padding: '1rem',
                        textAlign: 'left',
                        backgroundColor: isSelected ? '#FEF08A' : '#FFFFFF',
                        border: isSelected ? '3px solid #000000' : '2px solid #000000',
                        boxShadow: isSelected ? '4px 4px 0px 0px #000000' : '2px 2px 0px 0px #000000',
                        cursor: 'pointer',
                        width: '100%',
                        position: 'relative',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <span className="badge-brutal badge-sm font-mono" style={{ fontSize: '0.65rem' }}>
                          {ev.category}
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span
                            className="font-mono"
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 800,
                              color: isSelected ? '#000000' : '#2563EB',
                            }}
                          >
                            👥 {ev.registrationCount}/{ev.capacity}
                          </span>
                        </div>
                      </div>

                      <div
                        style={{
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          margin: '6px 0',
                          lineHeight: '1.3',
                          color: '#000000',
                        }}
                      >
                        {ev.title}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: '#52525B' }}>
                          <Calendar size={12} />
                          <span>{dateFormatted}</span>
                        </div>

                        {/* Quick card action buttons */}
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditModal(ev);
                            }}
                            className="btn-brutal btn-sm font-mono"
                            title="Edit Event"
                            style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                          >
                            <Edit3 size={11} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteModalEvent(ev);
                            }}
                            className="btn-brutal btn-sm btn-red font-mono"
                            title="Delete Event"
                            style={{ padding: '2px 6px', fontSize: '0.7rem' }}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Event Details & Registrations */}
          <div
            className="card-static-lg"
            style={{
              padding: '1.75rem',
              backgroundColor: '#FFFFFF',
              minHeight: '500px',
            }}
          >
            {selectedEvent ? (
              <div>
                {/* Selected Event Details Header */}
                <div
                  style={{
                    borderBottom: '3px solid #000000',
                    paddingBottom: '1.25rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div className="badge-brutal badge-yellow font-mono" style={{ fontSize: '0.75rem' }}>
                      {selectedEvent.category}
                    </div>

                    {/* Action Buttons: Edit & Delete */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        onClick={() => handleOpenEditModal(selectedEvent)}
                        className="btn-brutal btn-sm btn-yellow font-mono"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem' }}
                      >
                        <Edit3 size={14} />
                        Edit Event
                      </button>
                      <button
                        onClick={() => setDeleteModalEvent(selectedEvent)}
                        className="btn-brutal btn-sm btn-red font-mono"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem' }}
                      >
                        <Trash2 size={14} />
                        Delete Event
                      </button>
                    </div>
                  </div>

                  {/* Banner Image Preview if set */}
                  {selectedEvent.image && (
                    <div
                      style={{
                        margin: '0.75rem 0',
                        border: '2px solid #000000',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        maxHeight: '180px',
                      }}
                    >
                      <img
                        src={selectedEvent.image}
                        alt={selectedEvent.title}
                        style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
                      />
                    </div>
                  )}

                  <h2 className="font-pixel" style={{ fontSize: '1.2rem', margin: '0.65rem 0', lineHeight: '1.4' }}>
                    {selectedEvent.title}
                  </h2>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem', fontSize: '0.8rem', color: '#52525B', marginTop: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Calendar size={14} style={{ color: '#000' }} />
                      <span>{new Date(selectedEvent.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <MapPin size={14} style={{ color: '#000' }} />
                      <span>{selectedEvent.venue}</span>
                    </div>
                    <div
                      className="card-static"
                      style={{
                        padding: '0.2rem 0.6rem',
                        backgroundColor: '#DCFCE7',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        border: '2px solid #000',
                      }}
                    >
                      SEATS: {selectedEventMeta?.registrationCount ?? selectedEvent.registrationCount} / {selectedEvent.capacity} (Remaining: {Math.max(0, selectedEvent.capacity - (selectedEventMeta?.registrationCount ?? selectedEvent.registrationCount))})
                    </div>
                  </div>

                  {selectedEvent.description && (
                    <p style={{ fontSize: '0.82rem', color: '#3F3F46', marginTop: '0.75rem', lineHeight: '1.5' }}>
                      {selectedEvent.description}
                    </p>
                  )}
                </div>

                {/* Attendees Table or Empty State */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                    <h3 className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 800, margin: 0 }}>
                      REGISTERED ATTENDEES ({registrations.length})
                    </h3>
                  </div>

                  {registrationsLoading ? (
                    <div style={{ padding: '3rem', textAlign: 'center' }} className="font-mono">
                      Loading registered attendees...
                    </div>
                  ) : registrations.length === 0 ? (
                    /* Required empty state when 0 registrations exist */
                    <div
                      className="card-static"
                      style={{
                        padding: '3rem 2rem',
                        textAlign: 'center',
                        backgroundColor: '#F4F4F5',
                        border: '2px dashed #71717A',
                        borderRadius: '8px',
                      }}
                    >
                      <Users size={32} style={{ color: '#71717A', margin: '0 auto 0.75rem auto' }} />
                      <div className="font-pixel" style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>
                        No registrations yet.
                      </div>
                      <p className="font-mono" style={{ fontSize: '0.8rem', color: '#71717A', margin: 0 }}>
                        Users who register for this event on the public site will appear here immediately.
                      </p>
                    </div>
                  ) : (
                    /* Registrations Data Table */
                    <div style={{ overflowX: 'auto' }}>
                      <table
                        style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          fontSize: '0.85rem',
                        }}
                      >
                        <thead>
                          <tr
                            style={{
                              backgroundColor: '#000000',
                              color: '#FFFFFF',
                              textAlign: 'left',
                            }}
                          >
                            <th className="font-mono" style={{ padding: '0.75rem 1rem', width: '40px' }}>#</th>
                            <th className="font-mono" style={{ padding: '0.75rem 1rem' }}>ATTENDEE NAME</th>
                            <th className="font-mono" style={{ padding: '0.75rem 1rem' }}>REGISTERED EMAIL</th>
                            <th className="font-mono" style={{ padding: '0.75rem 1rem' }}>REGISTRATION DATE</th>
                            <th className="font-mono" style={{ padding: '0.75rem 1rem' }}>STATUS</th>
                          </tr>
                        </thead>
                        <tbody>
                          {registrations.map((reg, index) => {
                            const dateStr = new Date(reg.registrationDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            });

                            return (
                              <tr
                                key={reg.id}
                                style={{
                                  borderBottom: '1px solid #E4E4E7',
                                  backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                                }}
                              >
                                <td className="font-mono" style={{ padding: '0.75rem 1rem', fontWeight: 700, color: '#71717A' }}>
                                  {(page - 1) * pagination.limit + index + 1}
                                </td>
                                <td style={{ padding: '0.75rem 1rem', fontWeight: 800 }}>
                                  {reg.attendeeName}
                                </td>
                                <td className="font-mono" style={{ padding: '0.75rem 1rem', color: '#18181B' }}>
                                  {reg.attendeeEmail}
                                </td>
                                <td className="font-mono" style={{ padding: '0.75rem 1rem', fontSize: '0.78rem', color: '#52525B' }}>
                                  {dateStr}
                                </td>
                                <td style={{ padding: '0.75rem 1rem' }}>
                                  <span
                                    className="badge-brutal badge-green"
                                    style={{
                                      fontSize: '0.65rem',
                                      padding: '2px 6px',
                                      textTransform: 'uppercase',
                                    }}
                                  >
                                    {reg.status}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination if multiple pages */}
                  {pagination.pages > 1 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem' }}>
                      <span className="font-mono" style={{ fontSize: '0.75rem', color: '#71717A' }}>
                        Showing page {page} of {pagination.pages} ({pagination.total} total attendees)
                      </span>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          disabled={page <= 1}
                          onClick={() => fetchRegistrations(selectedEventId, page - 1)}
                          className="btn-brutal btn-sm font-mono"
                          style={{ fontSize: '0.75rem' }}
                        >
                          Previous
                        </button>
                        <button
                          disabled={page >= pagination.pages}
                          onClick={() => fetchRegistrations(selectedEventId, page + 1)}
                          className="btn-brutal btn-sm font-mono"
                          style={{ fontSize: '0.75rem' }}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{ padding: '4rem 2rem', textAlign: 'center', color: '#71717A' }} className="font-mono">
                Select an event from the left list to view registered attendees or{' '}
                <button
                  onClick={handleOpenCreateModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563EB',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontWeight: 700,
                  }}
                >
                  create a new event
                </button>
                .
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* MODAL 1: CREATE / EDIT EVENT MODAL */}
      {/* ====================================================================== */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(3px)',
          }}
          onClick={() => !formSubmitting && setIsModalOpen(false)}
        >
          <div
            className="card-static-lg"
            style={{
              backgroundColor: '#FFFFFF',
              maxWidth: '620px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '2rem',
              position: 'relative',
              boxShadow: '8px 8px 0px #000000',
              border: '3px solid #000000',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #000', paddingBottom: '0.75rem' }}>
              <div>
                <span className={`badge-brutal ${isEditing ? 'badge-yellow' : 'badge-green'}`} style={{ marginBottom: '4px' }}>
                  {isEditing ? 'ADMIN EDIT' : 'ADMIN CREATE'}
                </span>
                <h2 className="font-pixel" style={{ fontSize: '1.25rem', margin: '4px 0 0 0' }}>
                  {isEditing ? 'EDIT_EVENT' : 'CREATE_NEW_EVENT'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="btn-brutal btn-sm"
                style={{ padding: '4px 8px' }}
                disabled={formSubmitting}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
              {/* Event Title */}
              <div>
                <label className="label-brutal">EVENT TITLE *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Google Cloud & GenAI Summit 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-brutal font-mono"
                />
              </div>

              {/* Category & Capacity (Seats) Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="label-brutal">CATEGORY *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input-brutal font-mono"
                    style={{ backgroundColor: '#FFFFFF', cursor: 'pointer' }}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label-brutal">CAPACITY (SEATS) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    placeholder="100"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="input-brutal font-mono"
                  />
                </div>
              </div>

              {/* Date & Time and Venue Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label className="label-brutal">DATE & TIME *</label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input-brutal font-mono"
                  />
                </div>

                <div>
                  <label className="label-brutal">VENUE / LOCATION *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Auditorium 1, RBU Campus"
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    className="input-brutal font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="label-brutal">DESCRIPTION *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Provide detailed event agenda, takeaways, prerequisites, and speaker details..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-brutal font-mono"
                  style={{ width: '100%', resize: 'vertical' }}
                />
              </div>

              {/* Banner Image / Upload Section */}
              <div style={{ border: '2px dashed #000', padding: '1rem', backgroundColor: '#F9FAFB', borderRadius: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <label className="label-brutal" style={{ margin: 0, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <ImageIcon size={14} />
                    EVENT BANNER (IMAGE UPLOAD OR URL)
                  </label>
                  {formData.image && (
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: '' })}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#DC2626',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        fontWeight: 700,
                      }}
                    >
                      Clear Image
                    </button>
                  )}
                </div>

                {/* Option 1: File Upload */}
                <div style={{ marginBottom: '10px' }}>
                  <label
                    className="btn-brutal btn-sm font-mono"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      fontSize: '0.75rem',
                      backgroundColor: '#FFFFFF',
                    }}
                  >
                    <Upload size={13} />
                    Choose File From Computer
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <span style={{ fontSize: '0.72rem', color: '#71717A', marginLeft: '8px' }} className="font-mono">
                    (PNG, JPG, WebP up to 5MB)
                  </span>
                </div>

                {/* Option 2: Image URL */}
                <div style={{ marginBottom: '10px' }}>
                  <input
                    type="url"
                    placeholder="Or paste image URL (e.g. https://images.unsplash.com/...)"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="input-brutal font-mono"
                    style={{ fontSize: '0.75rem', padding: '0.4rem 0.6rem' }}
                  />
                </div>

                {/* Option 3: Quick Preset Banners */}
                <div>
                  <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#52525B', marginBottom: '6px' }}>
                    QUICK TECH PRESETS:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {PRESET_BANNERS.map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => setFormData({ ...formData, image: preset.url })}
                        className={`badge-brutal ${formData.image === preset.url ? 'badge-green' : 'badge-blue'}`}
                        style={{ cursor: 'pointer', fontSize: '0.68rem', padding: '3px 8px' }}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Image Preview */}
                {formData.image && (
                  <div style={{ marginTop: '10px', border: '2px solid #000', borderRadius: '4px', overflow: 'hidden', maxHeight: '120px' }}>
                    <img
                      src={formData.image}
                      alt="Banner Preview"
                      style={{ width: '100%', height: '120px', objectFit: 'cover', display: 'block' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Modal Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem', borderTop: '2px solid #000', paddingTop: '1rem' }}>
                <button
                  type="button"
                  disabled={formSubmitting}
                  onClick={() => setIsModalOpen(false)}
                  className="btn-brutal font-mono"
                  style={{ fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className={`btn-brutal font-mono ${isEditing ? 'btn-yellow' : 'btn-green'}`}
                  style={{ fontSize: '0.85rem', fontWeight: 800 }}
                >
                  {formSubmitting ? 'Saving Event...' : isEditing ? '✓ Save Changes' : '✓ Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================== */}
      {/* MODAL 2: DELETE CONFIRMATION DIALOG */}
      {/* ====================================================================== */}
      {deleteModalEvent && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backdropFilter: 'blur(3px)',
          }}
          onClick={() => !deleteSubmitting && setDeleteModalEvent(null)}
        >
          <div
            className="card-static-lg"
            style={{
              backgroundColor: '#FFFFFF',
              maxWidth: '460px',
              width: '100%',
              padding: '2rem',
              boxShadow: '8px 8px 0px #000000',
              border: '3px solid #000000',
              textAlign: 'center',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="badge-brutal badge-red"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                marginBottom: '1rem',
              }}
            >
              <AlertTriangle size={15} />
              DANGER ZONE
            </div>

            <h2 className="font-pixel" style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: '#DC2626' }}>
              DELETE_EVENT?
            </h2>

            <p style={{ fontSize: '0.9rem', color: '#18181B', lineHeight: '1.5', marginBottom: '1.25rem' }}>
              Are you sure you want to permanently delete:
              <br />
              <strong>"{deleteModalEvent.title}"</strong>?
            </p>

            <div
              className="card-static"
              style={{
                backgroundColor: '#FEF2F2',
                border: '2px solid #EF4444',
                padding: '0.85rem',
                textAlign: 'left',
                marginBottom: '1.5rem',
                fontSize: '0.78rem',
                color: '#991B1B',
              }}
            >
              <strong>⚠️ Permanent Action:</strong> This will also remove all <strong>{deleteModalEvent.registrationCount || 0} confirmed attendee registrations</strong> associated with this event from the database.
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                type="button"
                disabled={deleteSubmitting}
                onClick={() => setDeleteModalEvent(null)}
                className="btn-brutal font-mono"
                style={{ fontSize: '0.85rem' }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleteSubmitting}
                onClick={handleDeleteEvent}
                className="btn-brutal btn-red font-mono"
                style={{ fontSize: '0.85rem', fontWeight: 800 }}
              >
                {deleteSubmitting ? 'Deleting...' : '🗑️ Yes, Delete Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 900px) {
          .admin-dashboard-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
