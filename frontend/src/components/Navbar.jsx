import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, Shield, Ticket, Calendar, PlusCircle, UserCheck } from 'lucide-react';

export const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backgroundColor: '#FCFDF8',
        borderBottom: '3px solid #000000',
        boxShadow: '0 4px 0px 0px rgba(0,0,0,1)',
      }}
    >
      <div
        className="container-gdg"
        style={{
          height: '70px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* GDG Logo */}
        <Link
          to="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none',
          }}
          onClick={() => setMobileMenuOpen(false)}
          aria-label="GDG RBU Home"
        >
          <img
            src="/gdg-logo.png"
            alt="GDG on Campus logo"
            style={{
              height: '44px',
              width: 'auto',
              display: 'block',
              transition: 'transform 0.2s ease',
            }}
            className="hover:scale-105"
          />
        </Link>

        {/* Desktop Navigation Links */}
        <nav
          style={{
            display: 'none',
            alignItems: 'center',
            gap: '1rem',
          }}
          className="desktop-nav"
        >
          {/* Home Button (Blue) */}
          <Link
            to="/"
            className={`btn-brutal btn-sm ${isActive('/') ? 'btn-blue' : ''}`}
            style={{ backgroundColor: isActive('/') ? 'var(--google-blue-light)' : '#FFFFFF' }}
          >
            Home
          </Link>

          {/* Events Button (Yellow) */}
          <Link
            to="/events"
            className={`btn-brutal btn-sm ${isActive('/events') ? 'btn-yellow' : ''}`}
            style={{ backgroundColor: isActive('/events') ? 'var(--google-yellow-light)' : '#FFFFFF' }}
          >
            <Calendar size={15} />
            Events
          </Link>

          {/* Authenticated Links */}
          {user && (
            <Link
              to="/my-events"
              className={`btn-brutal btn-sm ${isActive('/my-events') ? 'btn-green' : ''}`}
              style={{ backgroundColor: isActive('/my-events') ? 'var(--google-green-light)' : '#FFFFFF' }}
            >
              <Ticket size={15} />
              My Tickets
            </Link>
          )}


        </nav>

        {/* Auth Action Buttons (Desktop) */}
        <div style={{ display: 'none', alignItems: 'center', gap: '0.75rem' }} className="desktop-nav">
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  backgroundColor: '#FFFFFF',
                  border: '2px solid #000000',
                  borderRadius: '6px',
                  boxShadow: '2px 2px 0px 0px #000000',
                }}
              >
                <div
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: isAdmin ? 'var(--google-red)' : 'var(--google-green)',
                  }}
                />
                <span className="font-mono" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                  {user.name.split(' ')[0]}
                </span>
                {isAdmin && (
                  <span
                    className="font-pixel"
                    style={{
                      fontSize: '0.55rem',
                      backgroundColor: '#000000',
                      color: '#FFFFFF',
                      padding: '2px 4px',
                      borderRadius: '3px',
                    }}
                  >
                    ADMIN
                  </span>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="btn-brutal btn-sm btn-red"
                title="Logout"
                style={{ padding: '0.4rem 0.6rem' }}
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn-brutal btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn-brutal btn-sm btn-black">
                Join Us
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="btn-brutal btn-sm"
          style={{ display: 'flex', padding: '0.45rem' }}
          aria-label="Toggle Navigation Menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            backgroundColor: '#FCFDF8',
            borderTop: '2px solid #000000',
            padding: '1.25rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.85rem',
            maxHeight: 'calc(100vh - 75px)',
            overflowY: 'auto',
          }}
        >
          <Link
            to="/"
            className="btn-brutal btn-blue"
            style={{ width: '100%' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/events"
            className="btn-brutal btn-yellow"
            style={{ width: '100%' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Calendar size={18} />
            Browse Events
          </Link>
          {user && (
            <Link
              to="/my-events"
              className="btn-brutal btn-green"
              style={{ width: '100%' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Ticket size={18} />
              My Tickets & QR Codes
            </Link>
          )}

          <div style={{ height: '2px', backgroundColor: '#000000', margin: '0.5rem 0' }} />

          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div className="font-mono" style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                Logged in as: <strong>{user.email}</strong> ({user.role})
              </div>
              <button
                onClick={handleLogout}
                className="btn-brutal btn-red"
                style={{ width: '100%' }}
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link
                to="/login"
                className="btn-brutal"
                style={{ flex: 1 }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="btn-brutal btn-black"
                style={{ flex: 1 }}
                onClick={() => setMobileMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Responsive CSS helper */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          button[aria-label="Toggle Navigation Menu"] {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
};

export default Navbar;
