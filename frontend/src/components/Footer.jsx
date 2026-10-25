import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSmoothScroll } from '../lib/SmoothScrollContext';
import {
  MapPin,
  Phone,
  ArrowUpRight,
  ArrowUp,
  ExternalLink,
  Shield,
  Ticket,
  Calendar,
  Home as HomeIcon,
  Sparkles,
} from 'lucide-react';

const externalLinks = [
  { label: 'GDG Community', href: 'https://developers.google.com/community/gdg' },
  { label: 'Google Developers', href: 'https://developers.google.com/' },
  { label: 'DevFest', href: 'https://developers.google.com/community/devfest' },
  { label: 'Codelabs', href: 'https://codelabs.developers.google.com/' },
];

export const Footer = () => {
  const { isAdmin } = useAuth();
  const { scrollTo } = useSmoothScroll();

  return (
    <footer className="site-footer">
      <div className="container-gdg">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="footer-brand__lockup" aria-label="GDG on Campus Ramdeobaba">
              <span className="footer-brand__mark">
                <img src="/gdg-logo.png" alt="" />
              </span>
              <span>
                <strong>GDG on Campus</strong>
                <span className="font-mono">RAMDEOBABA UNIVERSITY</span>
              </span>
            </Link>

            <p className="footer-brand__copy">
              A student-led community of developers, designers and builders exploring Google
              technologies — from Gemini and Cloud to Android, Flutter and the modern web.
            </p>

            <div className="footer-status font-mono">
              <span className="footer-status__dot" aria-hidden="true" />
              ALL SYSTEMS HEALTHY · 2026 SEASON
            </div>

            <div className="footer-location">
              <MapPin size={16} aria-hidden="true" />
              <address>
                Shri Ramdeobaba University, Ramdeo Tekdi, Gittikhadan, Katol Road, Nagpur,
                Maharashtra 440013
              </address>
            </div>
          </div>

          <nav className="footer-col" aria-labelledby="footer-explore">
            <h3 id="footer-explore" className="footer-col__title font-mono">
              Explore
            </h3>
            <Link to="/" className="footer-link">
              <HomeIcon size={14} aria-hidden="true" /> Home
            </Link>
            <Link to="/events" className="footer-link">
              <Calendar size={14} aria-hidden="true" /> All events
            </Link>
            <Link to="/my-events" className="footer-link">
              <Ticket size={14} aria-hidden="true" /> My tickets
            </Link>
            {isAdmin && (
              <Link to="/admin" className="footer-link">
                <Shield size={14} aria-hidden="true" /> Admin console
              </Link>
            )}
          </nav>

          <nav className="footer-col" aria-labelledby="footer-community">
            <h3 id="footer-community" className="footer-col__title font-mono">
              Community
            </h3>
            {externalLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                className="footer-link"
              >
                <ExternalLink size={14} aria-hidden="true" /> {link.label}
              </a>
            ))}
          </nav>

          <div className="footer-col">
            <h3 className="footer-col__title font-mono">Recruitment desk</h3>
            <div className="footer-contact">
              <span className="font-mono footer-contact__role">DEVELOPER &amp; PROJECT LEAD</span>
              <strong>Chaitanya Selote</strong>
              <a href="tel:+919699910273" className="footer-phone font-mono">
                <Phone size={14} aria-hidden="true" /> +91 96999 10273
              </a>
            </div>
            <Link to="/register" className="btn-brutal btn-sm btn-yellow footer-join">
              <Sparkles size={14} /> Join the community
            </Link>
          </div>
        </div>

        <div className="footer-wordmark font-pixel" aria-hidden="true">
          <span>GDG</span>
          <span className="footer-wordmark__slash">//</span>
          <span>RBU</span>
        </div>

        <div className="footer-bottom">
          <p className="font-mono">
            © 2026 Google Developer Group on Campus · Ramdeobaba University. All rights reserved.
          </p>
          <div className="footer-bottom__actions">
            <span className="badge-brutal badge-green footer-tag">
              BUILT FOR GDG WEB DEV RECRUITMENT
            </span>
            <button
              type="button"
              onClick={() => scrollTo(0)}
              className="footer-top font-mono"
              aria-label="Back to top"
            >
              <ArrowUp size={14} aria-hidden="true" /> TOP
            </button>
          </div>
        </div>

        <p className="footer-disclaimer font-mono">
          Not affiliated with Google LLC. GDG on Campus programs are operated by student
          volunteers under the Google Developer Groups community guidelines.
          <a
            href="https://developers.google.com/community/gdg"
            target="_blank"
            rel="noreferrer noopener"
          >
            Learn more <ArrowUpRight size={12} aria-hidden="true" />
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
