import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { gsap, prefersReducedMotion } from '../lib/motion';
import EventCard from '../components/EventCard';
import Reveal from '../components/Reveal';
import SplitWords from '../components/SplitWords';
import {
  Search,
  RefreshCw,
  SlidersHorizontal,
  ArrowRight,
  CalendarSearch,
  Ticket,
} from 'lucide-react';
import toast from 'react-hot-toast';

const categories = ['All', 'Conference', 'Workshop', 'Hackathon', 'Tech Talk', 'Bootcamp', 'Meetup'];

export const Events = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [timeFilter, setTimeFilter] = useState('upcoming');
  const [sort, setSort] = useState('date_asc');
  const [userRegistrations, setUserRegistrations] = useState(new Set());
  const [actionLoading, setActionLoading] = useState(null);
  const gridRef = useRef(null);
  const requestRef = useRef(0);

  // Debounce text search so we do not hammer the API on every keystroke.
  useEffect(() => {
    const timer = window.setTimeout(() => setSearch(searchInput.trim()), 280);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

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

  // Stagger freshly loaded cards into view.
  useLayoutEffect(() => {
    const grid = gridRef.current;
    if (!grid || prefersReducedMotion()) return undefined;
    const cards = grid.children;
    if (!cards.length) return undefined;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        cards,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.05, ease: 'power2.out', clearProps: 'transform' }
      );
    }, grid);

    return () => ctx.revert();
  }, [events, loading]);

  const fetchEvents = async () => {
    const requestId = ++requestRef.current;
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (search) params.append('search', search);
      if (category !== 'All') params.append('category', category);
      if (sort) params.append('sort', sort);

      if (timeFilter === 'upcoming') params.append('upcoming', 'true');
      if (timeFilter === 'past') params.append('upcoming', 'false');

      params.append('limit', '50');

      const res = await api.get(`/api/events?${params.toString()}`);
      if (requestId !== requestRef.current) return;
      if (res.data.success) {
        setEvents(res.data.data);
      }
    } catch (err) {
      if (requestId !== requestRef.current) return;
      console.error('Failed to fetch events:', err);
      toast.error('Failed to load events');
    } finally {
      if (requestId === requestRef.current) setLoading(false);
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
        toast.success('Registered! Your QR pass is ready in My Tickets.');
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

  const resetFilters = () => {
    setSearchInput('');
    setSearch('');
    setCategory('All');
    setTimeFilter('all');
    setSort('date_asc');
  };

  return (
    <div className="page">
      <div className="container-gdg">
        <div className="page-head">
          <Reveal className="section-eyebrow" y={10} duration={0.5}>
            <span className="badge-brutal badge-yellow">
              <SlidersHorizontal size={13} aria-hidden="true" /> COMMUNITY DIRECTORY
            </span>
          </Reveal>
          <SplitWords as="h1" className="page-title" text="ALL EVENTS & WORKSHOPS" />
          <p className="page-sub">
            Hands-on developer workshops, hackathons and conferences at Shri Ramdeobaba University.
            Every session is free, mentor-led and open to curious builders.
          </p>
        </div>

        <Reveal className="filter-panel" y={18} duration={0.6}>
          <div className="filter-row">
            <div className="filter-search">
              <Search size={18} aria-hidden="true" />
              <label htmlFor="event-search" className="sr-only">
                Search events by title, description or venue
              </label>
              <input
                id="event-search"
                type="search"
                placeholder="Search title, description or venue…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="input-brutal"
              />
            </div>

            <div className="segmented" role="group" aria-label="Filter by date">
              {[
                { value: 'upcoming', label: 'UPCOMING' },
                { value: 'past', label: 'PAST' },
                { value: 'all', label: 'ALL' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={timeFilter === option.value}
                  onClick={() => setTimeFilter(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <div>
              <label htmlFor="event-sort" className="sr-only">
                Sort events
              </label>
              <select
                id="event-sort"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="input-brutal font-mono"
                style={{ fontSize: '0.82rem', cursor: 'pointer', minHeight: 48 }}
              >
                <option value="date_asc">Date · soonest first</option>
                <option value="date_desc">Date · latest first</option>
                <option value="title">Title · A to Z</option>
                <option value="capacity">Capacity · highest</option>
              </select>
            </div>
          </div>

          <div className="chip-row">
            <span className="chip-row__label">CATEGORY</span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className="chip"
                aria-pressed={category === cat}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="events-toolbar">
          <div className="events-count" role="status" aria-live="polite">
            {loading ? (
              'Searching event engine…'
            ) : (
              <>
                Showing <strong>{events.length}</strong> {events.length === 1 ? 'event' : 'events'}
                {search && (
                  <>
                    {' '}
                    for <strong>“{search}”</strong>
                  </>
                )}
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {user && (
              <Link to="/my-events" className="btn-brutal btn-sm btn-green">
                <Ticket size={14} /> My tickets
              </Link>
            )}
            <button
              type="button"
              onClick={fetchEvents}
              className="btn-brutal btn-sm"
              aria-label="Refresh event results"
            >
              <RefreshCw size={13} className={loading ? 'spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="events-grid" aria-busy="true" aria-label="Loading events">
            {[0, 1, 2, 3, 4, 5].map((key) => (
              <div className="skeleton-card" key={key}>
                <div className="skeleton-block skeleton-media" />
                <div className="skeleton-lines">
                  <div className="skeleton-block skeleton-line w-45" />
                  <div className="skeleton-block skeleton-line w-90" />
                  <div className="skeleton-block skeleton-line w-70" />
                  <div className="skeleton-block skeleton-line w-90" />
                  <div className="skeleton-block skeleton-line w-70" />
                </div>
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <Reveal className="empty-state" y={16}>
            <div className="empty-state__icon" aria-hidden="true">
              <CalendarSearch size={30} />
            </div>
            <h3>NO_EVENTS_MATCHED</h3>
            <p>
              No events match this combination of filters yet. Reset the filters, or join the
              community to hear about the next drop first.
            </p>
            <div
              style={{ display: 'flex', gap: '0.65rem', justifyContent: 'center', flexWrap: 'wrap' }}
            >
              <button type="button" onClick={resetFilters} className="btn-brutal btn-yellow">
                Reset all filters
              </button>
              <Link to="/register" className="btn-brutal">
                Join GDG <ArrowRight size={15} />
              </Link>
            </div>
          </Reveal>
        ) : (
          <div className="events-grid" ref={gridRef}>
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
