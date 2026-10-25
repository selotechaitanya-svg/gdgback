import React, { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap, prefersReducedMotion, holdForIntro, EASE } from '../lib/motion';

/**
 * Plays a quick, tasteful entrance on every route change.
 */
export const PageTransition = ({ children }) => {
  const ref = useRef(null);
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return undefined;

    const tween = gsap.fromTo(
      el,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.55, ease: EASE.out, clearProps: 'transform' }
    );
    const releaseIntro = holdForIntro(tween);

    return () => {
      releaseIntro();
      tween.kill();
    };
  }, [pathname]);

  return (
    <div ref={ref} className="page-transition">
      {children}
    </div>
  );
};

export default PageTransition;
