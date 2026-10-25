import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { gsap, prefersReducedMotion } from '../lib/motion';
import { useSmoothScroll } from '../lib/SmoothScrollContext';

const SESSION_KEY = 'gdg_preloader_seen';

const shouldSkipIntro = () => {
  try {
    if (sessionStorage.getItem(SESSION_KEY)) return true;
    const params = new URLSearchParams(window.location.search);
    if (params.has('nopreloader') || params.has('showPreloader')) {
      return params.has('nopreloader');
    }
  } catch {
    return true;
  }
  return prefersReducedMotion();
};

/**
 * One-time brand intro. Skips itself for returning visitors, reduced motion,
 * and anyone deep-linking with ?nopreloader.
 */
export const Preloader = ({ onFinish }) => {
  const skip = useMemo(shouldSkipIntro, []);
  const [mounted, setMounted] = useState(!skip);
  const overlayRef = useRef(null);
  const counterRef = useRef(null);
  const { stop, start } = useSmoothScroll();

  useLayoutEffect(() => {
    if (skip) {
      onFinish?.();
      return undefined;
    }

    try {
      sessionStorage.setItem(SESSION_KEY, 'true');
    } catch {
      /* private mode — intro just plays again next visit */
    }

    stop();
    document.documentElement.classList.add('is-intro');

    const overlay = overlayRef.current;
    const counter = { value: 0 };
    const progress = { value: 0 };

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        document.documentElement.classList.remove('is-intro');
        start();
        setMounted(false);
        onFinish?.();
      },
    });

    tl.fromTo(
      overlay.querySelectorAll('.preloader__cell'),
      { scaleY: 0, transformOrigin: 'bottom' },
      { scaleY: 1, duration: 0.55, stagger: 0.06, ease: 'power4.out' }
    )
      .from(
        '.preloader__logo',
        { scale: 0.5, rotate: -10, opacity: 0, duration: 0.7, ease: 'back.out(1.8)' },
        '-=0.15'
      )
      .from(
        '.preloader__title .sw-inner',
        { yPercent: 115, opacity: 0, duration: 0.65, stagger: 0.05 },
        '-=0.35'
      )
      .from(
        '.preloader__sub, .preloader__bar, .preloader__meta',
        { opacity: 0, y: 12, duration: 0.45, stagger: 0.07 },
        '-=0.3'
      )
      .to(
        counter,
        {
          value: 100,
          duration: 1.15,
          ease: 'power2.inOut',
          onUpdate: () => {
            if (counterRef.current) {
              counterRef.current.textContent = String(Math.round(counter.value)).padStart(3, '0');
            }
          },
        },
        '<'
      )
      .to(
        progress,
        {
          value: 100,
          duration: 1.15,
          ease: 'power2.inOut',
          onUpdate: () => {
            if (overlay) overlay.style.setProperty('--load', `${progress.value}%`);
          },
        },
        '<'
      )
      .to('.preloader__status', { opacity: 1, duration: 0.2 }, '>-0.15')
      .to('.preloader__inner', { y: -14, opacity: 0, duration: 0.35, ease: 'power2.in' }, '+=0.18')
      .to(
        overlay,
        {
          yPercent: -101,
          duration: 0.85,
          ease: 'expo.inOut',
          onStart: () => {
            start();
            window.dispatchEvent(new Event('gdg:intro-complete'));
            // Let the hero reveal start as the curtain lifts, then unblock input.
            window.setTimeout(() => document.documentElement.classList.remove('is-intro'), 120);
          },
        },
        '<0.1'
      )
      .set(overlay, { pointerEvents: 'none' });

    return () => {
      tl.kill();
      document.documentElement.classList.remove('is-intro');
      start();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip]);

  if (!mounted) return null;

  return (
    <div
      ref={overlayRef}
      className="preloader"
      role="status"
      aria-live="polite"
      aria-label="Loading GDG on Campus EventHub"
    >
      <div className="preloader__cells" aria-hidden="true">
        <span className="preloader__cell" />
        <span className="preloader__cell" />
        <span className="preloader__cell" />
        <span className="preloader__cell" />
        <span className="preloader__cell" />
      </div>

      <div className="preloader__inner">
        <img src="/gdg-logo.png" alt="GDG on Campus" className="preloader__logo" />

        <div className="preloader__title font-pixel" aria-hidden="true">
          {'GDG_RBU_EVENTHUB'.split('_').map((chunk, index) => (
            <span className="sw-word" key={chunk}>
              <span className="sw-inner">{index === 0 ? chunk : `_${chunk}`}</span>
            </span>
          ))}
        </div>

        <p className="preloader__sub font-mono">GOOGLE DEVELOPER GROUP · RAMDEOBABA UNIVERSITY</p>

        <div className="preloader__bar" aria-hidden="true">
          <div className="preloader__bar-fill" />
        </div>

        <div className="preloader__meta font-mono">
          <span className="preloader__status">BOOTING EVENT ENGINE</span>
          <span ref={counterRef} className="preloader__counter">
            000
          </span>
        </div>

        <div className="preloader__dots font-mono" aria-hidden="true">
          <span>JWT</span>
          <span>QR PASSES</span>
          <span>LIVE REGISTRATIONS</span>
        </div>
      </div>
    </div>
  );
};

export default Preloader;
