import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollTrigger } from '../lib/motion';
import { useSmoothScroll } from '../lib/SmoothScrollContext';

/**
 * Resets scroll on navigation and lets ScrollTrigger remeasure the new page.
 */
export const ScrollToTop = () => {
  const { pathname } = useLocation();
  const { lenis } = useSmoothScroll();
  const previousPath = useRef(pathname);

  useEffect(() => {
    if (previousPath.current === pathname) return;
    previousPath.current = pathname;

    if (lenis) {
      lenis.scrollTo(0, { immediate: true, force: true });
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }

    const frame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(frame);
  }, [pathname, lenis]);

  return null;
};

export default ScrollToTop;
