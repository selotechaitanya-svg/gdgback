import React, { useLayoutEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { gsap, prefersReducedMotion } from '../lib/motion';
import {
  Home,
  Calendar,
  Ticket,
  ArrowLeft,
  AlertTriangle,
  ArrowRight,
} from 'lucide-react';

export const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const codeRef = useRef(null);

  useLayoutEffect(() => {
    const el = codeRef.current;
    if (!el || prefersReducedMotion()) return undefined;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 3.4 });
      tl.to(el, { x: -4, skewX: 10, duration: 0.06, ease: 'steps(1)' })
        .to(el, { x: 5, skewX: -8, duration: 0.06, ease: 'steps(1)' })
        .to(el, { x: -2, skewX: 4, duration: 0.05, ease: 'steps(1)' })
        .to(el, { x: 0, skewX: 0, duration: 0.05, ease: 'steps(1)' });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <div className="notfound">
      <div className="notfound__card">
        <div className="notfound__dots" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="badge-brutal badge-red" style={{ marginBottom: '1.25rem' }}>
          <AlertTriangle size={14} aria-hidden="true" />
          HTTP 404 · ROUTE_NOT_FOUND
        </div>

        <h1 className="notfound__code" ref={codeRef}>
          404
        </h1>

        <h2 className="notfound__title">LOOKS LIKE YOU TOOK A WRONG TURN IN THE STACK</h2>

        <p className="notfound__copy">
          The page you are looking for does not exist, moved, or is still under construction by GDG
          RBU engineers. Let&apos;s get you back to the good stuff.
        </p>

        <div className="notfound__terminal" role="log" aria-label="Debug output">
          <div className="err">[ERROR] 404 Not Found: Cannot GET &quot;{location.pathname}&quot;</div>
          <div className="warn">
            [DIAGNOSIS] Route lookup failed in the react-router-dom route table.
          </div>
          <div className="ok">
            [SUGGESTION] Return to the home portal or browse upcoming events{' '}
            <span className="cursor-blink">█</span>
          </div>
        </div>

        <div className="notfound__actions">
          <button type="button" onClick={() => navigate(-1)} className="btn-brutal">
            <ArrowLeft size={16} /> Go back
          </button>
          <Link to="/" className="btn-brutal btn-yellow">
            <Home size={16} /> Return home
          </Link>
          <Link to="/events" className="btn-brutal btn-blue">
            <Calendar size={16} /> Browse events
          </Link>
          <Link to="/my-events" className="btn-brutal btn-green">
            <Ticket size={16} /> My tickets
          </Link>
        </div>

        <div className="notfound__help">
          <span>Need assistance? Reach the GDG lead:</span>
          <a href="tel:+919699910273">Chaitanya Selote · +91 96999 10273</a>
          <Link to="/register" className="btn-brutal btn-sm">
            Join GDG <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
