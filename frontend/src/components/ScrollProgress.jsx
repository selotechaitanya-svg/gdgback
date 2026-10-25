import React, { useLayoutEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { gsap, ScrollTrigger } from '../lib/motion';

/**
 * Five-colour progress rail pinned to the top of the viewport.
 */
export const ScrollProgress = () => {
  const barRef = useRef(null);
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    const bar = barRef.current;
    if (!bar) return undefined;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        bar,
        { scaleX: 0 },
        {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: {
            start: 0,
            end: 'max',
            scrub: 0.25,
            invalidateOnRefresh: true,
          },
        }
      );
    });

    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 250);
    return () => {
      window.clearTimeout(refresh);
      ctx.revert();
    };
  }, [pathname]);

  return (
    <div className="scroll-progress" aria-hidden="true">
      <div ref={barRef} className="scroll-progress__bar" />
    </div>
  );
};

export default ScrollProgress;
