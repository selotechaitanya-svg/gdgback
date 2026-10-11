import React from 'react';
import { X, Download, Printer, CheckCircle, ShieldCheck } from 'lucide-react';

export const QRModal = ({ isOpen, onClose, registration }) => {
  if (!isOpen || !registration) return null;

  const { event, user, qrCode, createdAt } = registration;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!qrCode) return;
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `GDG-Pass-${event?.title?.substring(0, 15) || 'Event'}.png`;
    link.click();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(3px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      onClick={onClose}
    >
      <div
        className="ticket-container"
        style={{
          maxWidth: '520px',
          width: '100%',
          backgroundColor: '#FFFFFF',
          padding: '2rem',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ticket Notches */}
        <div className="ticket-notch-left" />
        <div className="ticket-notch-right" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="btn-brutal btn-sm btn-red"
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            padding: '4px',
          }}
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Ticket Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '0.5rem' }}>
            <span className="font-pixel" style={{ fontSize: '0.85rem' }}>GDG ON CAMPUS · RBU</span>
          </div>
          <div className="badge-brutal badge-green" style={{ display: 'inline-flex', gap: '4px' }}>
            <ShieldCheck size={14} /> OFFICIAL ENTRY PASS
          </div>
        </div>

        {/* Event Details */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 900, marginBottom: '0.5rem' }}>
            {event?.title || 'GDG Community Event'}
          </h2>
          <p className="font-mono" style={{ fontSize: '0.85rem', color: '#52525B' }}>
            {event?.venue || 'Shri Ramdeobaba University, Nagpur'}
          </p>
          <p className="font-mono" style={{ fontSize: '0.8rem', color: '#18181B', fontWeight: 700, marginTop: '4px' }}>
            {event?.date ? new Date(event.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }) : 'Upcoming Session'}
          </p>
        </div>

        {/* Perforated Divider */}
        <div className="ticket-divider" />

        {/* QR Code Section */}
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
                alt="Registration QR Code"
                style={{ width: '190px', height: '190px', display: 'block' }}
              />
            </div>
          ) : (
            <div className="font-mono" style={{ padding: '2rem' }}>
              QR_GENERATING...
            </div>
          )}

          <div className="font-mono" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 800 }}>
              Attendee: {user?.name || 'Registered Developer'}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#71717A' }}>
              {user?.email}
            </div>
          </div>
        </div>

        {/* Ticket Footer Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
          <button
            onClick={handleDownload}
            className="btn-brutal btn-yellow"
            style={{ flex: 1 }}
          >
            <Download size={16} /> Save QR
          </button>
          <button
            onClick={handlePrint}
            className="btn-brutal"
            style={{ flex: 1 }}
          >
            <Printer size={16} /> Print Pass
          </button>
        </div>
      </div>
    </div>
  );
};

export default QRModal;
