import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone, ExternalLink, Heart, Terminal } from 'lucide-react';

export const Footer = () => {
  return (
    <footer
      style={{
        marginTop: '6rem',
        borderTop: '4px solid #000000',
        backgroundColor: '#FFFFFF',
        boxShadow: '0 -4px 0px 0px rgba(0,0,0,1)',
      }}
    >
      <div
        className="container-gdg"
        style={{
          paddingTop: '4rem',
          paddingBottom: '3rem',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2.5rem',
            marginBottom: '3rem',
          }}
        >
          {/* Column 1: Organization & Campus */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: '#FFFFFF',
                  border: '2.5px solid #000',
                  borderRadius: '6px',
                  boxShadow: '2px 2px 0px 0px #000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src="/gdg-logo.png"
                  alt="GDG on Campus logo"
                  style={{ width: '26px', height: 'auto', display: 'block' }}
                />
              </div>
              <div>
                <span className="font-pixel" style={{ fontSize: '0.9rem' }}>GDG ON CAMPUS</span>
                <p className="font-mono" style={{ fontSize: '0.75rem', color: '#52525B' }}>Ramdeobaba University</p>
              </div>
            </div>

            <p style={{ fontSize: '0.9rem', color: '#3F3F46', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              A vibrant community of student developers, designers, and tech leaders passionate about Google technologies, AI, and software craftsmanship.
            </p>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', color: '#52525B' }}>
              <MapPin size={18} style={{ flexShrink: 0, marginTop: '2px', color: '#000000' }} />
              <span>Shri Ramdeobaba University, Ramdeo Tekdi, Gittikhadan, Katol Road, Nagpur, Maharashtra 440013</span>
            </div>
          </div>

          {/* Column 2: Recruitment & Contact Queries */}
          <div>
            <div className="badge-brutal badge-yellow" style={{ marginBottom: '1rem' }}>
              RECRUITMENT CONTACT
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div
                className="card-static"
                style={{ padding: '0.85rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <div>
                  <div className="font-mono" style={{ fontSize: '0.9rem', fontWeight: 800 }}>
                    Chaitanya Selote
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#71717A' }}>Developer & Project Lead</div>
                </div>
                <a href="tel:+919699910273" className="btn-brutal btn-sm font-mono" style={{ textDecoration: 'none' }}>
                  +91 9699910273
                </a>
              </div>
            </div>
          </div>

          {/* Column 3: Quick Navigation & API Status */}
          <div>
            <div className="badge-brutal badge-blue" style={{ marginBottom: '1rem' }}>
              NAVIGATION & STATUS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <Link to="/" style={{ color: '#000000', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
                → Home
              </Link>
              <Link to="/events" style={{ color: '#000000', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
                → Events
              </Link>
              <Link to="/my-events" style={{ color: '#000000', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none' }}>
                → My Tickets
              </Link>
            </div>

            <div
              className="card-static"
              style={{
                padding: '1rem',
                backgroundColor: '#18181B',
                color: '#FFFFFF',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#4ADE80' }} />
                <span className="font-mono" style={{ fontSize: '0.8rem', color: '#4ADE80', fontWeight: 700 }}>
                  SYSTEM_STATUS: HEALTHY
                </span>
              </div>
              <div className="font-mono" style={{ fontSize: '0.75rem', color: '#A1A1AA' }}>
                JWT Auth · Rate Limiter · In-Memory Mongo · QR Code Generator
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div
          style={{
            borderTop: '2px solid #000000',
            paddingTop: '1.5rem',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div className="font-mono" style={{ fontSize: '0.8rem', color: '#52525B' }}>
            © 2026 Google Developer Group on Campus · Ramdeobaba University. All rights reserved.
          </div>
          <div className="badge-brutal badge-green" style={{ fontSize: '0.75rem' }}>
            BUILT FOR GDG WEB DEV BACKEND RECRUITMENT DRIVE
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
