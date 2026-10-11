import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, Calendar, Ticket, ArrowLeft, Search, Compass, AlertTriangle } from 'lucide-react';

export const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1rem',
      }}
    >
      <div
        className="card-static-lg"
        style={{
          maxWidth: '680px',
          width: '100%',
          backgroundColor: '#FFFFFF',
          padding: 'clamp(1.5rem, 4vw, 3rem)',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        {/* Top Decorative Color Pill Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            marginBottom: '1.5rem',
          }}
        >
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--google-blue)', border: '2px solid #000' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--google-red)', border: '2px solid #000' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--google-yellow)', border: '2px solid #000' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--google-green)', border: '2px solid #000' }} />
        </div>

        {/* 404 Badge */}
        <div
          className="badge-brutal badge-red"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
          }}
        >
          <AlertTriangle size={15} />
          HTTP 404 // ROUTE_NOT_FOUND
        </div>

        {/* Massive Glitch Pixel Heading */}
        <h1
          className="font-pixel"
          style={{
            fontSize: 'clamp(2.5rem, 8vw, 4.5rem)',
            lineHeight: '1.1',
            marginBottom: '1rem',
            color: '#000000',
            letterSpacing: '-0.04em',
            textShadow: '3px 3px 0px var(--google-yellow)',
          }}
        >
          404
        </h1>

        <h2
          style={{
            fontSize: 'clamp(1.15rem, 2.5vw, 1.5rem)',
            fontWeight: 900,
            marginBottom: '0.75rem',
            color: '#18181B',
          }}
        >
          LOOKS LIKE YOU TOOK A WRONG TURN IN THE STACK!
        </h2>

        <p
          style={{
            fontSize: '0.95rem',
            color: '#52525B',
            maxWidth: '520px',
            margin: '0 auto 1.75rem auto',
            lineHeight: '1.6',
          }}
        >
          The page or route you were looking for doesn't exist, was moved, or is under construction by GDG RBU engineers.
        </p>

        {/* Simulated Terminal Debug Box */}
        <div
          className="font-mono"
          style={{
            backgroundColor: '#18181B',
            color: '#F4F4F5',
            padding: '1rem 1.25rem',
            borderRadius: '8px',
            border: '2px solid #000',
            textAlign: 'left',
            fontSize: 'clamp(0.72rem, 1.8vw, 0.825rem)',
            marginBottom: '2rem',
            overflowX: 'auto',
          }}
        >
          <div style={{ color: '#EF4444', marginBottom: '4px' }}>
            [ERROR] 404 Not Found: Cannot GET &quot;{location.pathname}&quot;
          </div>
          <div style={{ color: '#FACC15', marginBottom: '4px' }}>
            [DIAGNOSIS] Route lookup failed in react-router-dom router table.
          </div>
          <div style={{ color: '#4ADE80' }}>
            [SUGGESTION] Return to the home portal or browse upcoming events <span className="cursor-blink">█</span>
          </div>
        </div>

        {/* Primary Action Buttons (Responsive Wrap) */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.85rem',
            marginBottom: '2rem',
          }}
        >
          <button
            onClick={() => navigate(-1)}
            className="btn-brutal"
            style={{ fontSize: '0.875rem' }}
          >
            <ArrowLeft size={16} /> Go Back
          </button>

          <Link
            to="/"
            className="btn-brutal btn-yellow"
            style={{ fontSize: '0.875rem' }}
          >
            <Home size={16} /> Return Home
          </Link>

          <Link
            to="/events"
            className="btn-brutal btn-blue"
            style={{ fontSize: '0.875rem' }}
          >
            <Calendar size={16} /> Browse Events
          </Link>

          <Link
            to="/my-events"
            className="btn-brutal btn-green"
            style={{ fontSize: '0.875rem' }}
          >
            <Ticket size={16} /> My Tickets
          </Link>
        </div>

        {/* Helpful Fast Navigation Links */}
        <div
          style={{
            borderTop: '2px dashed #E4E4E7',
            paddingTop: '1.25rem',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '1.25rem',
            fontSize: '0.8rem',
            color: '#71717A',
          }}
          className="font-mono"
        >
          <span>Need assistance? Contact GDG Lead:</span>
          <a
            href="tel:+919699910273"
            style={{
              color: '#000000',
              fontWeight: 800,
              textDecoration: 'underline',
            }}
          >
            Chaitanya Selote (+91 9699910273)
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
