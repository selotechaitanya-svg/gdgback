import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSmoothScroll } from '../lib/SmoothScrollContext';
import { gsap, hasFinePointer, prefersReducedMotion, holdForIntro } from '../lib/motion';
import EventCard from '../components/EventCard';
import Reveal from '../components/Reveal';
import SplitWords from '../components/SplitWords';
import CountUp from '../components/CountUp';
import Marquee from '../components/Marquee';
import Magnetic from '../components/Magnetic';
import {
  Calendar,
  Sparkles,
  ArrowRight,
  ArrowDown,
  Code2,
  Cpu,
  Globe,
  Terminal as TerminalIcon,
  ChevronDown,
  Users,
  Search,
  UserPlus,
  QrCode,
  MapPin,
  ShieldCheck,
  BellRing,
} from 'lucide-react';
import toast from 'react-hot-toast';

const marqueeItems = [
  'DevFest 2026',
  'Gemini & Vertex AI',
  'Google Cloud Study Jams',
  'Android with Compose',
  'Flutter Forward',
  'Solution Challenge',
  'Build with Firebase',
  'Web Performance',
];

const tracks = [
  {
    title: 'Cloud & DevOps',
    icon: Globe,
    description:
      'Ship resilient systems on Google Cloud with containers, CI/CD and infrastructure as code.',
    tags: ['GCP', 'Docker', 'Kubernetes'],
    accent: 'var(--google-blue)',
    soft: 'var(--google-blue-soft)',
  },
  {
    title: 'AI & Vertex AI',
    icon: Cpu,
    description:
      'Design prompts, build RAG pipelines and deploy Gemini-powered agents that actually work.',
    tags: ['Gemini', 'Vertex AI', 'RAG'],
    accent: '#B45309',
    soft: 'var(--google-yellow-soft)',
  },
  {
    title: 'Android & Flutter',
    icon: Code2,
    description:
      'Build expressive cross-platform apps with Kotlin, Jetpack Compose and Flutter.',
    tags: ['Kotlin', 'Compose', 'Flutter'],
    accent: 'var(--google-green)',
    soft: 'var(--google-green-soft)',
  },
  {
    title: 'Modern Web',
    icon: TerminalIcon,
    description:
      'Craft fast, accessible interfaces with React, TypeScript, Node.js and motion design.',
    tags: ['React', 'Node.js', 'TypeScript'],
    accent: 'var(--google-red)',
    soft: 'var(--google-red-soft)',
  },
];

const steps = [
  {
    icon: Search,
    title: 'Discover your track',
    text: 'Browse conferences, hackathons, bootcamps and meetups. Filter by category, date or venue in seconds.',
    accent: 'var(--google-blue-soft)',
  },
  {
    icon: UserPlus,
    title: 'Register in one click',
    text: 'Create your developer profile, lock your seat and get instant confirmation. Every GDG RBU event is free.',
    accent: 'var(--google-yellow-soft)',
  },
  {
    icon: QrCode,
    title: 'Scan in and build',
    text: 'Your unique QR pass lives in My Tickets. Set a reminder, show the code at the door and start building.',
    accent: 'var(--google-green-soft)',
  },
];

const faqs = [
  {
    q: 'Who can register and participate in GDG RBU events?',
    a: 'All students of Shri Ramdeobaba University, as well as external students, developers and tech enthusiasts from Central India are welcome. Regular meetups, webinars and hackathons are 100% free.',
  },
  {
    q: 'How does the automated QR Code entry pass work?',
    a: 'When you register for any event, our backend generates a cryptographically unique entry token and QR code. Present the pass on your phone or print it for instant verification at the venue check-in desk.',
  },
  {
    q: 'What if an event reaches maximum capacity?',
    a: 'Each event has an enforced capacity limit so hands-on labs stay hands-on. Once capacity is reached, registrations close automatically, and spots reopen in real time if someone cancels.',
  },
  {
    q: 'Can I set email reminders for my registered events?',
    a: 'Yes. Registered attendees can enable reminders with one click, and our background queue sends a notification 24 hours before the session so you never miss a check-in.',
  },
  {
    q: 'Do I need to bring a laptop or any prerequisites?',
    a: 'For workshops and bootcamps, bring a laptop with a modern browser. Setup guides are shared before each session, and mentors are available on the community Discord for help.',
  },
];

const formatShortDate = (value) => {
  if (!value) return 'Date announced soon';
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(
    new Date(value)
  );
};

export const Home = () => {
  const { user } = useAuth();
  const { scrollTo } = useSmoothScroll();
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRegistrations, setUserRegistrations] = useState(new Set());
  const [activeFaq, setActiveFaq] = useState(0);

  const heroRef = useRef(null);
  const terminalRef = useRef(null);
  const terminalBodyRef = useRef(null);
  const spotlightFrame = useRef(0);

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
        toast.success('Registered! Your QR pass is ready in My Tickets.');
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

  const handleSpotlight = (event) => {
    if (!hasFinePointer() || prefersReducedMotion()) return;
    if (spotlightFrame.current) return;
    const section = event.currentTarget;
    const { clientX, clientY } = event;
    spotlightFrame.current = window.requestAnimationFrame(() => {
      const rect = section.getBoundingClientRect();
      section.style.setProperty('--spot-x', `${clientX - rect.left}px`);
      section.style.setProperty('--spot-y', `${clientY - rect.top}px`);
      spotlightFrame.current = 0;
    });
  };

  // Gentle 3D tilt on the hero terminal.
  useEffect(() => {
    const el = terminalRef.current;
    if (!el || !hasFinePointer() || prefersReducedMotion()) return undefined;

    const rotateX = gsap.quickTo(el, 'rotationX', { duration: 0.7, ease: 'power3.out' });
    const rotateY = gsap.quickTo(el, 'rotationY', { duration: 0.7, ease: 'power3.out' });

    const onMove = (event) => {
      const rect = el.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      rotateY(px * 7);
      rotateX(-py * 7);
    };

    const onLeave = () => {
      rotateX(0);
      rotateY(0);
    };

    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);

    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      gsap.killTweensOf(el);
    };
  }, []);

  // Stagger the terminal boot log once it is on screen.
  useLayoutEffect(() => {
    const el = terminalBodyRef.current;
    if (!el || prefersReducedMotion()) return undefined;

    let releaseIntro = () => {};
    const ctx = gsap.context(() => {
      const tween = gsap.fromTo(
        el.querySelectorAll('.terminal__line'),
        { opacity: 0, x: -8 },
        { opacity: 1, x: 0, duration: 0.4, stagger: 0.13, delay: 0.15, ease: 'power2.out' }
      );
      releaseIntro = holdForIntro(tween);
    }, el);

    return () => {
      releaseIntro();
      ctx.revert();
    };
  }, []);

  useEffect(
    () => () => {
      if (spotlightFrame.current) cancelAnimationFrame(spotlightFrame.current);
    },
    []
  );

  const nextEvent = featuredEvents[0];

  return (
    <div className="home">
      {/* ============================= HERO ============================= */}
      <section
        className="hero"
        ref={heroRef}
        onPointerMove={handleSpotlight}
        aria-labelledby="hero-title"
      >
        <div className="container-gdg">
          <div className="hero__grid">
            <div className="hero__copy">
              <Reveal as="div" className="hero__eyebrow" y={10} duration={0.6}>
                <span className="hero__eyebrow-dot" aria-hidden="true" />
                RAMDEOBABA UNIVERSITY · 2026 SEASON
                <span aria-hidden="true">↗</span>
              </Reveal>

              <h1 className="hero__title" id="hero-title">
                <span className="hero__title-line">
                  <SplitWords text="DISCOVER." duration={0.9} stagger={0.06} />
                </span>
                <span className="hero__title-line">
                  <SplitWords text="REGISTER." delay={0.08} duration={0.9} stagger={0.06} />
                </span>
                <span className="hero__title-line hero__highlight">
                  <SplitWords text="BUILD." delay={0.16} duration={0.9} stagger={0.06} />
                </span>
              </h1>

              <Reveal delay={0.18} y={18}>
                <p className="hero__lead">
                  The central hub for hackathons, study jams, AI masterclasses and tech talks by{' '}
                  <strong>Google Developer Group on Campus, RBU</strong>. Discover events, lock in
                  your seat and walk in with an instant QR pass.
                </p>
              </Reveal>

              <Reveal className="hero__actions" delay={0.26} y={14}>
                <Magnetic strength={0.22}>
                  <Link to="/events" className="btn-brutal btn-lg btn-yellow">
                    Browse events <ArrowRight size={18} />
                  </Link>
                </Magnetic>
                {user ? (
                  <Magnetic strength={0.18}>
                    <Link to="/my-events" className="btn-brutal btn-lg btn-green">
                      My tickets <QrCode size={18} />
                    </Link>
                  </Magnetic>
                ) : (
                  <Magnetic strength={0.18}>
                    <Link to="/register" className="btn-brutal btn-lg btn-black">
                      Join the community <Sparkles size={17} />
                    </Link>
                  </Magnetic>
                )}
              </Reveal>

              <Reveal className="hero__stats" delay={0.34} y={16}>
                <div className="hero__stat" style={{ '--stat-accent': 'var(--google-blue)' }}>
                  <strong>
                    <CountUp value={12} suffix="+" />
                  </strong>
                  <span>Events / year</span>
                </div>
                <div className="hero__stat" style={{ '--stat-accent': 'var(--google-yellow)' }}>
                  <strong>
                    <CountUp value={1000} suffix="+" />
                  </strong>
                  <span>Developers</span>
                </div>
                <div className="hero__stat" style={{ '--stat-accent': 'var(--google-green)' }}>
                  <strong>
                    <CountUp value={100} suffix="%" />
                  </strong>
                  <span>Free access</span>
                </div>
              </Reveal>

              <button
                type="button"
                className="hero__scroll"
                onClick={() => scrollTo('#featured-events')}
              >
                Scroll to explore <ArrowDown size={14} aria-hidden="true" />
              </button>
            </div>

            <div className="hero__visual">
              <Reveal y={40} delay={0.2} duration={0.9}>
                <div className="terminal" ref={terminalRef}>
                  <div className="terminal__bar">
                    <div className="terminal__dots" aria-hidden="true">
                      <span />
                      <span />
                      <span />
                    </div>
                    <span className="terminal__title">gdg_rbu_terminal.sh</span>
                    <span className="font-mono" style={{ fontSize: '0.6rem', color: '#71717a' }}>
                      ● LIVE
                    </span>
                  </div>

                  <div className="terminal__body" ref={terminalBodyRef}>
                    <p className="terminal__line">
                      <span className="terminal__prompt">$</span>
                      <span>gdg discover --campus &quot;RBU&quot; --season &quot;2026&quot;</span>
                    </p>
                    <p className="terminal__line">
                      <span className="terminal__ok">&gt;</span>
                      <span>Initializing Google Developer ecosystem…</span>
                    </p>
                    <p className="terminal__line">
                      <span className="terminal__info">&gt;</span>
                      <span>
                        {nextEvent
                          ? `${nextEvent.category} found · ${formatShortDate(nextEvent.date)}`
                          : 'Scanning flagship summits: DevFest · Cloud · Compose'}
                      </span>
                    </p>
                    <p className="terminal__line">
                      <span className="terminal__warn">&gt;</span>
                      <span>Automated QR ticketing: ACTIVE</span>
                    </p>
                    <p className="terminal__line">
                      <span className="terminal__ok">&gt;</span>
                      <span>
                        Ready for registration <span className="cursor-blink">█</span>
                      </span>
                    </p>
                  </div>

                  <div className="terminal__next">
                    <div className="terminal__next-top">
                      <span className="badge-brutal badge-red">NEXT FLAGSHIP</span>
                      {nextEvent && (
                        <span
                          className="font-mono"
                          style={{ fontSize: '0.62rem', fontWeight: 800, color: '#52525b' }}
                        >
                          {formatShortDate(nextEvent.date)}
                        </span>
                      )}
                    </div>
                    <h3>{nextEvent?.title || 'DevFest Nagpur 2026'}</h3>
                    <p>
                      {nextEvent?.description
                        ? nextEvent.description.slice(0, 110) + '…'
                        : 'AI, Cloud and Web ecosystems — Central India’s biggest community developer event.'}
                    </p>
                    <div className="terminal__next-meta">
                      <span>
                        <MapPin size={12} aria-hidden="true" />
                        {nextEvent?.venue?.split(',')[0] || 'RBU Campus, Nagpur'}
                      </span>
                      <span>
                        <Users size={12} aria-hidden="true" />
                        {nextEvent
                          ? `${nextEvent.registrationCount || 0} registered`
                          : 'Open registration'}
                      </span>
                    </div>
                    <Link
                      to={nextEvent ? `/events/${nextEvent._id}` : '/events'}
                      className="btn-brutal btn-sm"
                    >
                      Reserve your seat <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>

                <span className="hero__sticker" aria-hidden="true">
                  100%
                  <br />
                  FREE
                </span>
                <span className="hero__sticker hero__sticker--blue" aria-hidden="true">
                  QR
                  <br />
                  PASS
                </span>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <Marquee items={marqueeItems} speed={34} />

      {/* ====================== FEATURED EVENTS ====================== */}
      <section className="section section--white" id="featured-events">
        <div className="container-gdg">
          <div className="section-head">
            <div className="section-head__copy">
              <Reveal className="section-eyebrow" y={10} duration={0.5}>
                <span className="badge-brutal badge-yellow">
                  <Calendar size={13} aria-hidden="true" /> HAPPENING SOON
                </span>
              </Reveal>
              <SplitWords as="h2" className="section-title" text="UPCOMING EVENTS" />
              <p className="section-sub">
                Seats are limited and registrations close automatically at capacity. Pick your next
                build session.
              </p>
            </div>
            <Reveal y={10} duration={0.5}>
              <Link to="/events" className="btn-brutal btn-blue">
                View all events <ArrowRight size={17} />
              </Link>
            </Reveal>
          </div>

          {loading ? (
            <div className="events-grid" aria-busy="true" aria-label="Loading upcoming events">
              {[0, 1, 2].map((key) => (
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
          ) : featuredEvents.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon" aria-hidden="true">
                <Sparkles size={30} />
              </div>
              <h3>THE NEXT DROP IS LOADING</h3>
              <p>
                No upcoming events are published right now. Join the community and you will be the
                first to know when registration opens.
              </p>
              <Link to="/register" className="btn-brutal btn-yellow">
                Join the community <ArrowRight size={16} />
              </Link>
            </div>
          ) : (
            <div className="events-grid">
              {featuredEvents.map((event, index) => (
                <Reveal key={event._id} delay={index * 0.08} y={28}>
                  <EventCard
                    event={event}
                    isRegistered={userRegistrations.has(event._id)}
                    onRegister={handleRegister}
                    onUnregister={handleUnregister}
                  />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ========================== TRACKS ========================== */}
      <section className="section section--cream">
        <div className="container-gdg">
          <div className="section-head">
            <div className="section-head__copy">
              <Reveal className="section-eyebrow" y={10} duration={0.5}>
                <span className="badge-brutal badge-green">WHAT WE BUILD</span>
              </Reveal>
              <SplitWords as="h2" className="section-title" text="FOUR TECH TRACKS. ONE COMMUNITY." />
              <p className="section-sub">
                From distributed systems on Google Cloud to Gemini-powered applications, every
                session is hands-on, mentor-led and built around shipping real projects.
              </p>
            </div>
            <Reveal y={10} duration={0.5}>
              <Link to="/events" className="link-arrow">
                Explore sessions <ArrowRight size={14} />
              </Link>
            </Reveal>
          </div>

          <div className="tracks-grid">
            {tracks.map((track, index) => {
              const Icon = track.icon;
              return (
                <Reveal
                  key={track.title}
                  as="article"
                  className="track-card"
                  delay={index * 0.07}
                  y={24}
                  style={{ '--track-accent': track.accent, '--track-soft': track.soft }}
                >
                  <div className="track-card__top">
                    <span className="track-card__icon">
                      <Icon size={25} aria-hidden="true" />
                    </span>
                    <span className="track-card__num">{String(index + 1).padStart(2, '0')}</span>
                  </div>
                  <h3>{track.title}</h3>
                  <p>{track.description}</p>
                  <div className="track-card__tags">
                    {track.tags.map((tag) => (
                      <span className="tag" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ======================== HOW IT WORKS ======================== */}
      <section className="section section--white">
        <div className="container-gdg">
          <div className="section-head">
            <div className="section-head__copy">
              <Reveal className="section-eyebrow" y={10} duration={0.5}>
                <span className="badge-brutal badge-blue">ZERO FRICTION</span>
              </Reveal>
              <SplitWords
                as="h2"
                className="section-title"
                text="FROM DISCOVERY TO CHECK-IN IN 3 STEPS"
              />
              <p className="section-sub">
                No paper forms, no group chats, no waiting at the desk. EventHub handles the entire
                journey.
              </p>
            </div>
          </div>

          <div className="steps-grid">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <Reveal
                  key={step.title}
                  as="article"
                  className="step-card"
                  delay={index * 0.1}
                  y={26}
                >
                  <span className="step-card__number">STEP {String(index + 1).padStart(2, '0')}</span>
                  <span className="step-card__icon" style={{ background: step.accent }}>
                    <Icon size={21} aria-hidden="true" />
                  </span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </Reveal>
              );
            })}
          </div>

          <Reveal className="detail-perks" y={16} delay={0.1}>
            <div className="detail-perk">
              <ShieldCheck size={17} aria-hidden="true" /> Secure JWT sessions &amp; rate-limited API
            </div>
            <div className="detail-perk">
              <BellRing size={17} aria-hidden="true" /> Automated 24-hour event reminders
            </div>
            <div className="detail-perk">
              <QrCode size={17} aria-hidden="true" /> Unique QR pass with instant verification
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================ CTA ============================ */}
      <section className="section section--cream">
        <div className="container-gdg">
          <Reveal className="cta-panel" y={34} duration={0.9}>
            <div className="cta-panel__inner">
              <div>
                <span className="badge-brutal badge-yellow" style={{ marginBottom: '1.1rem' }}>
                  <Sparkles size={13} aria-hidden="true" /> OPEN INVITATION
                </span>
                <h2 className="cta-panel__title">
                  READY TO BUILD
                  <br />
                  SOMETHING <span>GREAT?</span>
                </h2>
                <p className="cta-panel__copy">
                  Join 1,000+ student developers learning in public, shipping side projects and
                  meeting the people who will hire them. Your next teammate is probably in the room.
                </p>
                <div className="cta-panel__actions">
                  {user ? (
                    <Link to="/my-events" className="btn-brutal btn-lg btn-yellow">
                      Open my tickets <ArrowRight size={17} />
                    </Link>
                  ) : (
                    <Link to="/register" className="btn-brutal btn-lg btn-yellow">
                      Create free account <ArrowRight size={17} />
                    </Link>
                  )}
                  <Link to="/events" className="btn-brutal btn-lg btn-ghost-light">
                    Browse all events
                  </Link>
                </div>
              </div>

              <div className="cta-panel__stats" aria-label="Community at a glance">
                <div className="cta-panel__stat">
                  <strong>
                    <CountUp value={12} suffix="+" />
                  </strong>
                  <span>flagship events every year</span>
                </div>
                <div className="cta-panel__stat">
                  <strong>
                    <CountUp value={1000} suffix="+" />
                  </strong>
                  <span>developers in the community</span>
                </div>
                <div className="cta-panel__stat">
                  <strong>
                    <CountUp value={4} />
                  </strong>
                  <span>hands-on technology tracks</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============================ FAQ ============================ */}
      <section className="section section--white">
        <div className="container-gdg" style={{ maxWidth: '880px' }}>
          <div className="section-head" style={{ justifyContent: 'center', textAlign: 'center' }}>
            <div className="section-head__copy">
              <Reveal className="section-eyebrow" y={10} duration={0.5}>
                <span className="badge-brutal badge-purple">GOT QUESTIONS?</span>
              </Reveal>
              <SplitWords as="h2" className="section-title" text="FREQUENTLY ASKED" />
              <p className="section-sub" style={{ marginLeft: 'auto', marginRight: 'auto' }}>
                Everything you need to know before your first GDG RBU session. Still stuck? Ping the
                recruitment desk in the footer.
              </p>
            </div>
          </div>

          <div className="faq-list">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div key={faq.q} className={`faq-item ${isOpen ? 'is-open' : ''}`}>
                  <button
                    type="button"
                    className="faq-button"
                    aria-expanded={isOpen}
                    aria-controls={`faq-panel-${index}`}
                    id={`faq-button-${index}`}
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                  >
                    <span>{faq.q}</span>
                    <span className="faq-icon" aria-hidden="true">
                      <ChevronDown size={18} />
                    </span>
                  </button>
                  <div
                    className="faq-panel"
                    id={`faq-panel-${index}`}
                    role="region"
                    aria-labelledby={`faq-button-${index}`}
                  >
                    <div className="faq-panel__inner">
                      <p>{faq.a}</p>
                    </div>
                  </div>
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
