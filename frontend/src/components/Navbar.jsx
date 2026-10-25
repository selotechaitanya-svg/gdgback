import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSmoothScroll } from '../lib/SmoothScrollContext';
import { gsap, prefersReducedMotion } from '../lib/motion';
import Magnetic from './Magnetic';
import {
  Menu,
  X,
  LogOut,
  Shield,
  Ticket,
  Calendar,
  Home as HomeIcon,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/events', label: 'Events', icon: Calendar },
  { to: '/my-events', label: 'My Tickets', icon: Ticket, authOnly: true },
];

export const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { stop, start } = useSmoothScroll();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const drawerRef = useRef(null);

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const onKey = (event) => {
      if (event.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    stop();
    return () => {
      window.removeEventListener('keydown', onKey);
      start();
    };
  }, [mobileMenuOpen, stop, start]);

  useLayoutEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const drawer = drawerRef.current;
    if (!drawer || prefersReducedMotion()) return undefined;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        drawer,
        { opacity: 0, y: -14 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
      );
      gsap.fromTo(
        drawer.querySelectorAll('.nav-drawer__item'),
        { opacity: 0, x: -12 },
        { opacity: 1, x: 0, duration: 0.35, stagger: 0.05, delay: 0.08, ease: 'power2.out' }
      );
    }, drawer);

    return () => ctx.revert();
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="container-gdg nav-shell">
        <Link to="/" className="nav-logo" aria-label="GDG on Campus Ramdeobaba — home">
          <span className="nav-logo__mark">
            <img src="/gdg-logo.png" alt="" />
          </span>
          <span className="nav-logo__text">
            <strong>GDG on Campus</strong>
            <span className="font-mono">RAMDEOBABA UNIVERSITY</span>
          </span>
        </Link>

        <nav className="nav-links" aria-label="Primary">
          {navItems
            .filter((item) => !item.authOnly || user)
            .map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={`nav-link ${isActive(to) ? 'is-active' : ''}`}
                aria-current={isActive(to) ? 'page' : undefined}
              >
                <Icon size={15} strokeWidth={2.4} aria-hidden="true" />
                {label}
                <span className="nav-link__dot" aria-hidden="true" />
              </Link>
            ))}
          {isAdmin && (
            <Link
              to="/admin"
              className={`nav-link nav-link--admin ${isActive('/admin') ? 'is-active' : ''}`}
              aria-current={isActive('/admin') ? 'page' : undefined}
            >
              <Shield size={15} strokeWidth={2.4} aria-hidden="true" />
              Admin
              <span className="nav-link__dot" aria-hidden="true" />
            </Link>
          )}
        </nav>

        <div className="nav-actions">
          {user ? (
            <>
              <div className="nav-user" title={user.email}>
                <span className="nav-user__avatar" aria-hidden="true">
                  {(user.name || user.email || 'G').charAt(0).toUpperCase()}
                </span>
                <span className="nav-user__meta">
                  <span className="nav-user__name">{user.name?.split(' ')[0] || 'Developer'}</span>
                  <span className="font-mono">{isAdmin ? 'ADMIN' : 'MEMBER'}</span>
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="btn-brutal btn-sm btn-icon btn-red"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut size={15} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-signin">
                Sign in
              </Link>
              <Magnetic strength={0.2}>
                <Link to="/register" className="btn-brutal btn-sm btn-join">
                  <Sparkles size={14} />
                  Join GDG
                  <ArrowUpRight size={14} />
                </Link>
              </Magnetic>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="btn-brutal btn-sm btn-icon nav-toggle"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div ref={drawerRef} className="nav-drawer" id="mobile-navigation">
          <div className="container-gdg nav-drawer__inner">
            {navItems
              .filter((item) => !item.authOnly || user)
              .map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={`nav-drawer__link nav-drawer__item ${isActive(to) ? 'is-active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{label}</span>
                  <ArrowUpRight size={16} className="nav-drawer__arrow" aria-hidden="true" />
                </Link>
              ))}

            {isAdmin && (
              <Link
                to="/admin"
                className="nav-drawer__link nav-drawer__item"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Shield size={18} aria-hidden="true" />
                <span>Admin Console</span>
                <ArrowUpRight size={16} className="nav-drawer__arrow" aria-hidden="true" />
              </Link>
            )}

            <div className="nav-drawer__divider nav-drawer__item" aria-hidden="true" />

            {user ? (
              <div className="nav-drawer__account nav-drawer__item">
                <div>
                  <div className="font-mono nav-drawer__account-label">SIGNED IN AS</div>
                  <strong>{user.email}</strong>
                  <span className="font-mono">{isAdmin ? 'ADMIN' : 'MEMBER'}</span>
                </div>
                <button type="button" onClick={handleLogout} className="btn-brutal btn-sm btn-red">
                  <LogOut size={15} /> Log out
                </button>
              </div>
            ) : (
              <div className="nav-drawer__cta nav-drawer__item">
                <Link
                  to="/login"
                  className="btn-brutal"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="btn-brutal btn-yellow"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Join GDG <ArrowUpRight size={15} />
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
