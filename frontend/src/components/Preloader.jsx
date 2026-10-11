import React, { useState, useEffect } from 'react';

export const Preloader = ({ onFinish }) => {
  const [dots, setDots] = useState('');
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem('gdg_preloader_seen');
    const urlParams = new URLSearchParams(window.location.search);
    const forceShow = urlParams.has('showPreloader');

    if (hasSeen && !forceShow) {
      setVisible(false);
      if (onFinish) onFinish();
      return;
    }

    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 300);

    const timer = setTimeout(() => {
      sessionStorage.setItem('gdg_preloader_seen', 'true');
      setVisible(false);
      if (onFinish) onFinish();
    }, 1800);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onFinish]);

  if (!visible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#FCFDF8',
        backgroundImage: `
          radial-gradient(#000000 1.2px, transparent 1.2px),
          linear-gradient(to right, rgba(0,0,0,0.06) 1px, transparent 1px),
          linear-gradient(to bottom, rgba(0,0,0,0.06) 1px, transparent 1px)
        `,
        backgroundSize: '32px 32px, 80px 80px, 80px 80px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
    >
      <div
        className="card-static-lg"
        style={{
          padding: '2.5rem 3rem',
          maxWidth: '540px',
          width: '100%',
          textAlign: 'center',
          backgroundColor: '#FFFFFF',
        }}
      >
        {/* GDG Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
          <img
            src="/gdg-logo.png"
            alt="GDG on Campus logo"
            style={{ width: '56px', height: 'auto', display: 'block' }}
          />
        </div>

        <div className="font-pixel" style={{ fontSize: '1.25rem', marginBottom: '1rem', color: '#000000', lineHeight: '1.4' }}>
          GDG_RBU_INITIALIZING{dots}
        </div>

        <div
          className="font-mono"
          style={{
            backgroundColor: '#000000',
            color: '#4ADE80',
            padding: '0.85rem 1.2rem',
            borderRadius: '6px',
            fontSize: '0.9rem',
            display: 'inline-block',
            fontWeight: 700,
            letterSpacing: '0.1em',
          }}
        >
          &gt; READY_FOR_DISCOVERY<span className="cursor-blink">█</span>
        </div>

        <p className="font-mono" style={{ fontSize: '0.8rem', color: '#71717A', marginTop: '1.25rem' }}>
          Google Developer Groups on Campus · Ramdeobaba University
        </p>
      </div>
    </div>
  );
};

export default Preloader;
