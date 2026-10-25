import React, { useEffect, useLayoutEffect, useRef } from 'react';
import { X, Download, Printer, ShieldCheck } from 'lucide-react';
import { gsap, prefersReducedMotion } from '../lib/motion';
import { useSmoothScroll } from '../lib/SmoothScrollContext';

export const QRModal = ({ isOpen, onClose, registration }) => {
  const overlayRef = useRef(null);
  const ticketRef = useRef(null);
  const { stop, start } = useSmoothScroll();

  useEffect(() => {
    if (!isOpen) return undefined;
    stop();

    const onKey = (event) => {
      if (event.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      start();
    };
  }, [isOpen, onClose, stop, start]);

  useLayoutEffect(() => {
    if (!isOpen || prefersReducedMotion()) return undefined;
    const overlay = overlayRef.current;
    const ticket = ticketRef.current;
    if (!overlay || !ticket) return undefined;

    const ctx = gsap.context(() => {
      gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.25, ease: 'power2.out' });
      gsap.fromTo(
        ticket,
        { opacity: 0, y: 28, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: 'back.out(1.4)' }
      );
    }, overlay);

    return () => ctx.revert();
  }, [isOpen]);

  if (!isOpen || !registration) return null;

  const { event, user, qrCode } = registration;

  const handlePrint = () => window.print();

  const handleDownload = () => {
    if (!qrCode) return;
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `GDG-Pass-${event?.title?.substring(0, 15) || 'Event'}.png`;
    link.click();
  };

  return (
    <div
      ref={overlayRef}
      className="qr-overlay"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.68)',
        backdropFilter: 'blur(4px)',
        zIndex: 1500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(0.75rem, 3vw, 1.5rem)',
        overflowY: 'auto',
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Your QR entry pass"
    >
      <div
        ref={ticketRef}
        className="ticket-container"
        style={{
          maxWidth: '500px',
          width: '100%',
          backgroundColor: '#FFFFFF',
          padding: 'clamp(1.25rem, 4vw, 2rem)',
          position: 'relative',
          margin: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ticket-notch-left" aria-hidden="true" />
        <div className="ticket-notch-right" aria-hidden="true" />

        <button
          type="button"
          onClick={onClose}
          className="btn-brutal btn-sm btn-red"
          style={{ position: 'absolute', top: '16px', right: '16px', padding: '4px' }}
          aria-label="Close QR pass"
        >
          <X size={18} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div className="font-pixel" style={{ fontSize: '0.8rem', marginBottom: '0.5rem' }}>
            GDG ON CAMPUS · RBU
          </div>
          <div className="badge-brutal badge-green" style={{ display: 'inline-flex', gap: '4px' }}>
            <ShieldCheck size={14} aria-hidden="true" /> OFFICIAL ENTRY PASS
          </div>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 900, marginBottom: '0.5rem', lineHeight: 1.35 }}>
            {event?.title || 'GDG Community Event'}
          </h2>
          <p className="font-mono" style={{ fontSize: '0.82rem', color: '#52525B' }}>
            {event?.venue || 'Shri Ramdeobaba University, Nagpur'}
          </p>
          <p
            className="font-mono"
            style={{ fontSize: '0.78rem', color: '#18181B', fontWeight: 700, marginTop: '4px' }}
          >
            {event?.date
              ? new Date(event.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Upcoming Session'}
          </p>
        </div>

        <div className="ticket-divider" aria-hidden="true" />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.5rem',
          }}
        >
          {qrCode ? (
            <div
              style={{
                padding: '12px',
                backgroundColor: '#FFFFFF',
                border: '3px solid #000000',
                borderRadius: '12px',
                boxShadow: '4px 4px 0px 0px #000000',
                marginBottom: '1rem',
              }}
            >
              <img
                src={qrCode}
                alt={`QR entry pass for ${user?.name || 'attendee'}`}
                style={{ width: '190px', height: '190px', display: 'block' }}
              />
            </div>
          ) : (
            <div className="font-mono" style={{ padding: '2rem' }}>
              QR_GENERATING…
            </div>
          )}

          <div className="font-mono" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 800 }}>
              Attendee: {user?.name || 'Registered Developer'}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#71717A' }}>{user?.email}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button type="button" onClick={handleDownload} className="btn-brutal btn-yellow" style={{ flex: 1 }}>
            <Download size={16} /> Save QR
          </button>
          <button type="button" onClick={handlePrint} className="btn-brutal" style={{ flex: 1 }}>
            <Printer size={16} /> Print pass
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRModal;
