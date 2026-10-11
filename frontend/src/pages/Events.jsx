import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import { Search, Filter, Calendar, Sparkles, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [timeFilter, setTimeFilter] = useState('upcoming'); // 'upcoming' | 'all' | 'past'
  const [sort, setSort] = useState('date_asc');
  const [userRegistrations, setUserRegistrations] = useState(new Set());
  const [actionLoading, setActionLoading] = useState(null);

  const categories = ['All', 'Conference', 'Workshop', 'Hackathon', 'Tech Talk', 'Bootcamp', 'Meetup'];

  useEffect(() => {
    fetchEvents();
  }, [search, category, timeFilter, sort]);

  useEffect(() => {
    if (user) {
      fetchUserRegistrations();
    } else {
      setUserRegistrations(new Set());
    }
  }, [user]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (search.trim()) params.append('search', search.trim());
      if (category !== 'All') params.append('category', category);
      if (sort) params.append('sort', sort);

      if (timeFilter === 'upcoming') params.append('upcoming', 'true');
      if (timeFilter === 'past') params.append('upcoming', 'false');

      params.append('limit', '50');

      const res = await api.get(`/api/events?${params.toString()}`);
      if (res.data.success) {
        setEvents(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRegistrations = async () => {
    try {
      const res = await api.get('/api/registrations/my-events');
      if (res.data.success) {
        const ids = new Set(res.data.data.map((r) => r.event?._id));
        setUserRegistrations(ids);
      }
    } catch (err) {
      console.warn('Failed to load user registrations:', err);
    }
  };

  const handleRegister = async (eventId) => {
    if (!user) {
      toast.error('Please login to register for events');
      return;
    }
    try {
      setActionLoading(eventId);
      const res = await api.post(`/api/registrations/events/${eventId}/register`);
      if (res.data.success) {
        toast.success('🎉 Registered successfully! Pass available in My Tickets');
        setUserRegistrations((prev) => new Set([...prev, eventId]));
        fetchEvents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUnregister = async (eventId) => {
    try {
      setActionLoading(eventId);
      const res = await api.delete(`/api/registrations/events/${eventId}/unregister`);
      if (res.data.success) {
        toast.success('Registration cancelled');
        setUserRegistrations((prev) => {
          const next = new Set(prev);
          next.delete(eventId);
          return next;
        });
        fetchEvents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel registration');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      <div className="container-gdg">
        {/* Header Title Banner */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div className="badge-brutal badge-yellow" style={{ marginBottom: '0.75rem' }}>
            COMMUNITY DIRECTORY
          </div>
          <h1 className="font-pixel" style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.75rem)', marginBottom: '0.75rem' }}>
            ALL EVENTS & WORKSHOPS
          </h1>
          <p style={{ fontSize: '1.05rem', color: '#52525B', maxWidth: '650px' }}>
            Discover and enroll in hands-on developer workshops, hackathons, and conferences at Shri Ramdeobaba University.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div
          className="card-static-lg"
          style={{
            padding: '1.5rem',
            backgroundColor: '#FFFFFF',
            marginBottom: '2.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}
        >
          {/* Top Row: Search input + Time filter + Sort */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              alignItems: 'center',
            }}
          >
            {/* Search Input */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search title, description, venue..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-brutal"
                style={{ paddingLeft: '2.75rem' }}
              />
              <Search
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

            {/* Time Toggle Pills (Upcoming / Past / All) */}
            <div
              style={{
                display: 'flex',
                backgroundColor: '#F4F4F5',
                border: '3px solid #000',
                borderRadius: '8px',
                padding: '3px',
                boxShadow: 'var(--brutal-shadow-sm)',
              }}
            >
              <button
                onClick={() => setTimeFilter('upcoming')}
                className="font-mono"
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  border: timeFilter === 'upcoming' ? '2px solid #000' : 'none',
                  borderRadius: '6px',
                  backgroundColor: timeFilter === 'upcoming' ? 'var(--google-yellow)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                UPCOMING
              </button>
              <button
                onClick={() => setTimeFilter('past')}
                className="font-mono"
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  border: timeFilter === 'past' ? '2px solid #000' : 'none',
                  borderRadius: '6px',
                  backgroundColor: timeFilter === 'past' ? 'var(--google-blue-light)' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                PAST ARCHIVE
              </button>
              <button
                onClick={() => setTimeFilter('all')}
                className="font-mono"
                style={{
                  flex: 1,
                  padding: '0.5rem',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  border: timeFilter === 'all' ? '2px solid #000' : 'none',
                  borderRadius: '6px',
                  backgroundColor: timeFilter === 'all' ? '#FFFFFF' : 'transparent',
                  cursor: 'pointer',
                }}
              >
                ALL
              </button>
            </div>

            {/* Sort Dropdown */}
            <div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="input-brutal font-mono"
                style={{ fontSize: '0.85rem', cursor: 'pointer' }}
              >
                <option value="date_asc">Date (Soonest First)</option>
                <option value="date_desc">Date (Latest First)</option>
                <option value="title">Title (A to Z)</option>
                <option value="capacity">Capacity (Highest First)</option>
              </select>
            </div>
          </div>

          {/* Bottom Row: Category Badges */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
            <span className="font-mono" style={{ fontSize: '0.8rem', fontWeight: 800, marginRight: '0.5rem' }}>
              CATEGORIES:
            </span>
            {categories.map((cat) => {
              const isSelected = category === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`btn-brutal btn-sm ${isSelected ? 'btn-black' : ''}`}
                  style={{
                    backgroundColor: isSelected ? '#000000' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#000000',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Results Counter */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 700 }}>
            Showing <strong>{events.length}</strong> event{events.length === 1 ? '' : 's'}
          </div>
          <button
            onClick={fetchEvents}
            className="btn-brutal btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <RefreshCw size={13} /> Refresh
          </button>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem 0' }}>
            <div className="font-pixel" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
              FETCHING_EVENTS...<span className="cursor-blink">█</span>
            </div>
            <p className="font-mono" style={{ color: '#71717A', fontSize: '0.85rem' }}>
              Connecting to GDG RBU Event Engine
            </p>
          </div>
        ) : events.length === 0 ? (
          <div className="card-static" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                backgroundColor: 'var(--google-yellow-soft)',
                border: '3px solid #000',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem auto',
              }}
            >
              <Search size={30} />
            </div>
            <h3 className="font-pixel" style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>
              NO_EVENTS_MATCHED
            </h3>
            <p style={{ color: '#52525B', marginBottom: '1.5rem', maxWidth: '450px', margin: '0 auto 1.5rem auto' }}>
              We could not find any events matching your search or filters. Try adjusting your search query or reset filters.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setCategory('All');
                setTimeFilter('all');
              }}
              className="btn-brutal btn-yellow"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '2rem',
            }}
          >
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                isRegistered={userRegistrations.has(event._id)}
                onRegister={handleRegister}
                onUnregister={handleUnregister}
                loading={actionLoading === event._id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Events;
