import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import {
  Calendar,
  Sparkles,
  ArrowRight,
  Code2,
  Cpu,
  Globe,
  Terminal,
  ChevronDown,
  CheckCircle,
  Users,
  Award,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const Home = () => {
  const { user } = useAuth();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRegistrations, setUserRegistrations] = useState(new Set());
  const [activeFaq, setActiveFaq] = useState(null);

  useEffect(() => {
    fetchFeaturedEvents();
    if (user) {
      fetchUserRegistrations();
    }
  }, [user]);

  const fetchFeaturedEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/api/events?limit=3&upcoming=true&sort=date_asc');
      if (res.data.success) {
        setFeaturedEvents(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
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
      console.warn('Could not load registrations:', err);
    }
  };

  const handleRegister = async (eventId) => {
    if (!user) {
      toast.error('Please login to register for events');
      return;
    }
    try {
      const res = await api.post(`/api/registrations/events/${eventId}/register`);
      if (res.data.success) {
        toast.success('Registered successfully! QR Pass is ready in My Tickets.');
        setUserRegistrations((prev) => new Set([...prev, eventId]));
        fetchFeaturedEvents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleUnregister = async (eventId) => {
    try {
      const res = await api.delete(`/api/registrations/events/${eventId}/unregister`);
      if (res.data.success) {
        toast.success('Registration cancelled');
        setUserRegistrations((prev) => {
          const next = new Set(prev);
          next.delete(eventId);
          return next;
        });
        fetchFeaturedEvents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed');
    }
  };

  const faqs = [
    {
      q: 'Who can register and participate in GDG RBU events?',
      a: 'All students of Shri Ramdeobaba University, as well as external students, developers, and tech enthusiasts from Central India are welcome! All our regular meetups, webinars, and hackathons are 100% free.',
    },
    {
      q: 'How does the automated QR Code entry pass work?',
      a: 'When you register for any event, our backend generates a cryptographically unique entry token and QR Code. You can present this QR pass on your phone or print it out at the venue check-in desk for instant verification.',
    },
    {
      q: 'What if an event reaches maximum capacity?',
      a: 'Each event has an enforced capacity limit to ensure hands-on lab quality and venue safety. Once capacity is reached, new registrations are blocked automatically. If someone unregisters, spots open up in real time.',
    },
    {
      q: 'Can I set email reminders for my registered events?',
      a: 'Yes! Our EventHub features an automated notification system. Registered users can enable reminders with a single click, and our background queue triggers reminders 24 hours prior to the event.',
    },
  ];

  return (
    <div style={{ paddingBottom: '3rem' }}>
      {/* ===================================================================
          HERO SECTION (Neo-Brutalist 12-Column Layout matching gdgrbu.app)
          =================================================================== */}
      <section
        style={{
          padding: '4rem 0 3rem 0',
          position: 'relative',
        }}
      >
        <div className="container-gdg">
          <div className="grid-hero">
            {/* Hero Left: Headline + Mission + CTAs */}
            <div>
              {/* Brand Tag without box or dots */}
              <div
                className="font-mono"
                style={{
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  marginBottom: '1.5rem',
                  color: '#18181B',
                  letterSpacing: '0.04em',
                }}
              >
                RAMDEOBABA UNIVERSITY · GDG ON CAMPUS
              </div>

              {/* Massive Retro Pixel Headline */}
              <h1
                className="font-pixel"
                style={{
                  fontSize: 'clamp(1.75rem, 4vw, 3.25rem)',
                  lineHeight: '1.15',
                  marginBottom: '1.5rem',
                  letterSpacing: '-0.03em',
                  color: '#000000',
                }}
              >
                DISCOVER. REGISTER. BUILD.
              </h1>

              {/* Subtitle */}
              <p
                style={{
                  fontSize: '1.15rem',
                  color: '#27272A',
                  lineHeight: '1.7',
                  marginBottom: '2rem',
                  maxWidth: '580px',
                }}
              >
                The central hub for hackathons, study jams, AI masterclasses, and tech talks organized by <strong>Google Developer Group on Campus RBU</strong>. Discover events, lock in your spot, and receive instant QR admission passes.
              </p>

              {/* Action Buttons */}
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  marginBottom: '2.5rem',
                }}
              >
                <Link to="/events" className="btn-brutal btn-lg btn-yellow">
                  Browse All Events <ArrowRight size={20} />
                </Link>
                {user ? (
                  <Link to="/my-events" className="btn-brutal btn-lg btn-green">
                    My Tickets & QR Pass
                  </Link>
                ) : (
                  <Link to="/register" className="btn-brutal btn-lg btn-black">
                    Join Community
                  </Link>
                )}
              </div>

              {/* Fast Stats Row */}
              <div className="grid-stats" style={{ maxWidth: '540px' }}>
                <div
                  className="card-static"
                  style={{ padding: '0.85rem', textAlign: 'center', backgroundColor: 'var(--google-blue-soft)' }}
                >
                  <div className="font-pixel" style={{ fontSize: '1.1rem', marginBottom: '4px' }}>12+</div>
                  <div className="font-mono" style={{ fontSize: '0.7rem', fontWeight: 700 }}>ANNUAL EVENTS</div>
                </div>

                <div
                  className="card-static"
                  style={{ padding: '0.85rem', textAlign: 'center', backgroundColor: 'var(--google-yellow-soft)' }}
                >
                  <div className="font-pixel" style={{ fontSize: '1.1rem', marginBottom: '4px' }}>1,000+</div>
                  <div className="font-mono" style={{ fontSize: '0.7rem', fontWeight: 700 }}>DEVELOPERS</div>
                </div>

                <div
                  className="card-static"
                  style={{ padding: '0.85rem', textAlign: 'center', backgroundColor: 'var(--google-green-soft)' }}
                >
                  <div className="font-pixel" style={{ fontSize: '1.1rem', marginBottom: '4px' }}>100%</div>
                  <div className="font-mono" style={{ fontSize: '0.7rem', fontWeight: 700 }}>FREE ACCESS</div>
                </div>
              </div>
            </div>

            {/* Hero Right: Neo-Brutalist Graphic Box / Terminal Card */}
            <div>
              <div
                className="card-static-lg"
                style={{
                  backgroundColor: '#FFFFFF',
                  padding: '2rem',
                  position: 'relative',
                }}
              >
                {/* Terminal Title Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '3px solid #000000',
                    paddingBottom: '1rem',
                    marginBottom: '1.5rem',
                  }}
                >
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: 'var(--google-red)', border: '2px solid #000' }} />
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: 'var(--google-yellow)', border: '2px solid #000' }} />
                    <div style={{ width: '14px', height: '14px', borderRadius: '50%', backgroundColor: 'var(--google-green)', border: '2px solid #000' }} />
                  </div>
                  <div className="font-mono" style={{ fontSize: '0.8rem', fontWeight: 800 }}>
                    gdg_rbu_terminal.sh
                  </div>
                </div>

                {/* Simulated Terminal Output */}
                <div
                  className="font-mono"
                  style={{
                    backgroundColor: '#18181B',
                    color: '#F4F4F5',
                    padding: '1.25rem',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                    lineHeight: '1.7',
                    marginBottom: '1.5rem',
                  }}
                >
                  <p style={{ color: '#4ADE80' }}>$ gdg-cli discover --university "RBU" --season "2026"</p>
                  <p style={{ color: '#FACC15' }}>&gt; Initializing Google Developer Group on Campus...</p>
                  <p style={{ color: '#60A5FA' }}>&gt; Found flagship summits: DevFest, Cloud Study Jam, Compose Camp</p>
                  <p style={{ color: '#FFFFFF' }}>&gt; Automated QR ticketing: ACTIVE</p>
                  <p style={{ color: '#4ADE80' }}>&gt; Ready for registration <span className="cursor-blink">█</span></p>
                </div>

                {/* Quick Next Event Spotlight */}
                <div
                  className="card-static"
                  style={{
                    padding: '1.25rem',
                    backgroundColor: 'var(--google-yellow-soft)',
                    border: '3px solid #000',
                  }}
                >
                  <div className="badge-brutal badge-red" style={{ marginBottom: '0.5rem' }}>
                    NEXT FLAGSHIP
                  </div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.4rem' }}>
                    DevFest Nagpur 2026
                  </h4>
                  <p style={{ fontSize: '0.85rem', color: '#52525B', marginBottom: '0.75rem' }}>
                    AI, Cloud & Web Ecosystems · Central India's biggest community event.
                  </p>
                  <Link to="/events" className="btn-brutal btn-sm btn-black" style={{ width: '100%' }}>
                    Register Your Seat Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          FEATURED UPCOMING EVENTS SECTION
          =================================================================== */}
      <section style={{ padding: '4rem 0', borderTop: '3px solid #000' }}>
        <div className="container-gdg">
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: '1.5rem',
              marginBottom: '2.5rem',
            }}
          >
            <div>
              <div className="badge-brutal badge-yellow" style={{ marginBottom: '0.75rem' }}>
                HAPPENING SOON
              </div>
              <h2 className="font-pixel" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', color: '#000' }}>
                UPCOMING EVENTS
              </h2>
            </div>
            <Link to="/events" className="btn-brutal btn-blue">
              View All Events <ArrowRight size={18} />
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div className="font-pixel" style={{ fontSize: '1rem', marginBottom: '1rem' }}>
                LOADING_EVENTS...<span className="cursor-blink">█</span>
              </div>
            </div>
          ) : featuredEvents.length === 0 ? (
            <div className="card-static" style={{ padding: '3rem', textAlign: 'center' }}>
              <h3 className="font-pixel" style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>
                NO_UPCOMING_EVENTS_FOUND
              </h3>
              <p style={{ color: '#52525B' }}>Check back soon or explore past archives!</p>
            </div>
          ) : (
            <div className="grid-cards">
              {featuredEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  isRegistered={userRegistrations.has(event._id)}
                  onRegister={handleRegister}
                  onUnregister={handleUnregister}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===================================================================
          TECHNOLOGY DOMAINS (Matching gdgrbu.app)
          =================================================================== */}
      <section style={{ padding: '4rem 0', borderTop: '3px solid #000', backgroundColor: '#FFFFFF' }}>
        <div className="container-gdg">
          <div style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem auto' }}>
            <div className="badge-brutal badge-green" style={{ marginBottom: '0.75rem' }}>
              WHAT WE BUILD
            </div>
            <h2 className="font-pixel" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', marginBottom: '1rem' }}>
              CORE TECH TRACKS
            </h2>
            <p style={{ color: '#52525B', fontSize: '1.05rem' }}>
              From distributed systems on Google Cloud to next-gen AI applications, our workshops empower engineers across all disciplines.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
              gap: '1.75rem',
            }}
          >
            {/* Domain 1: Cloud & DevOps */}
            <div className="card-brutal accent-bar-blue" style={{ padding: '1.75rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'var(--google-blue-soft)',
                  border: '2.5px solid #000',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Globe size={26} color="var(--google-blue)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Cloud & DevOps</h3>
              <p style={{ fontSize: '0.9rem', color: '#52525B', lineHeight: '1.6' }}>
                Master Google Cloud Platform, Docker, Kubernetes, Terraform, and resilient microservice architectures.
              </p>
            </div>

            {/* Domain 2: AI & Machine Learning */}
            <div className="card-brutal accent-bar-yellow" style={{ padding: '1.75rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'var(--google-yellow-soft)',
                  border: '2.5px solid #000',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Cpu size={26} color="#B45309" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>AI & Vertex AI</h3>
              <p style={{ fontSize: '0.9rem', color: '#52525B', lineHeight: '1.6' }}>
                Explore Gemini models, prompt design, multimodal AI, vector search, and deploying intelligent autonomous agents.
              </p>
            </div>

            {/* Domain 3: Android & Flutter */}
            <div className="card-brutal accent-bar-green" style={{ padding: '1.75rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'var(--google-green-soft)',
                  border: '2.5px solid #000',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Code2 size={26} color="var(--google-green)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Android & Flutter</h3>
              <p style={{ fontSize: '0.9rem', color: '#52525B', lineHeight: '1.6' }}>
                Build modern, reactive cross-platform mobile apps using Kotlin, Jetpack Compose, Flutter, and Firebase.
              </p>
            </div>

            {/* Domain 4: Web Architecture */}
            <div className="card-brutal accent-bar-red" style={{ padding: '1.75rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: 'var(--google-red-soft)',
                  border: '2.5px solid #000',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <Terminal size={26} color="var(--google-red)" />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Modern Web</h3>
              <p style={{ fontSize: '0.9rem', color: '#52525B', lineHeight: '1.6' }}>
                High-performance full-stack web with Node.js, Express, React, TypeScript, and Neo-Brutalist design systems.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================================
          FAQS ACCORDION (Matching gdgrbu.app Section 4)
          =================================================================== */}
      <section style={{ padding: '4rem 0', borderTop: '3px solid #000' }}>
        <div className="container-gdg" style={{ maxWidth: '860px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <div className="badge-brutal badge-purple" style={{ marginBottom: '0.75rem' }}>
              GOT QUESTIONS?
            </div>
            <h2 className="font-pixel" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.25rem)' }}>
              FREQUENTLY ASKED
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div
                  key={index}
                  className="card-static"
                  style={{
                    backgroundColor: isOpen ? '#FFFFFF' : '#FAFAFA',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => setActiveFaq(isOpen ? null : index)}
                >
                  <div
                    style={{
                      padding: '1.25rem 1.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem',
                    }}
                  >
                    <span style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                      {faq.q}
                    </span>
                    <div
                      style={{
                        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      <ChevronDown size={20} />
                    </div>
                  </div>

                  {isOpen && (
                    <div
                      style={{
                        padding: '0 1.5rem 1.25rem 1.5rem',
                        borderTop: '2px dashed #000',
                        paddingTop: '1rem',
                        fontSize: '0.95rem',
                        color: '#3F3F46',
                        lineHeight: '1.65',
                      }}
                    >
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
