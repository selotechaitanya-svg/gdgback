import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Lenis from 'lenis';
import { gsap, ScrollTrigger, prefersReducedMotion } from './motion';

const SmoothScrollContext = createContext(null);

/**
 * Lenis powers buttery-smooth inertia scrolling and is driven by the GSAP
 * ticker, so every ScrollTrigger stays in sync with the interpolated scroll.
 * Visitors who prefer reduced motion get the native scroll behaviour instead.
 */
export const SmoothScrollProvider = ({ children }) => {
  const [lenis, setLenis] = useState(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    const instance = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
      syncTouch: false,
      // We drive the RAF loop from GSAP instead.
      autoRaf: false,
    });

    instanceRef.current = instance;
    setLenis(instance);

    instance.on('scroll', ScrollTrigger.update);

    const tick = (time) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // The page height changes as fonts/images/events load — keep triggers honest.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    const refreshTimer = window.setTimeout(refresh, 600);

    return () => {
      window.removeEventListener('load', refresh);
      window.clearTimeout(refreshTimer);
      gsap.ticker.remove(tick);
      instance.destroy();
      instanceRef.current = null;
      setLenis(null);
    };
  }, []);

  const scrollTo = useCallback(
    (target, options = {}) => {
      const instance = instanceRef.current;
      if (!instance) {
        if (typeof target === 'number') {
          window.scrollTo({ top: target, behavior: 'smooth' });
        } else if (target instanceof Element) {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else if (typeof target === 'string') {
          document.querySelector(target)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }

      if (target instanceof Element || typeof target === 'string') {
        instance.scrollTo(target, { offset: -80, duration: 1.1, ...options });
      } else {
        instance.scrollTo(target, { duration: 1.1, ...options });
      }
    },
    []
  );

  const stop = useCallback(() => instanceRef.current?.stop(), []);
  const start = useCallback(() => instanceRef.current?.start(), []);

  const value = useMemo(
    () => ({ lenis, scrollTo, stop, start, isSmooth: Boolean(lenis) }),
    [lenis, scrollTo, stop, start]
  );

  return (
    <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>
  );
};

export const useSmoothScroll = () => {
  const context = useContext(SmoothScrollContext);
  if (!context) {
    return {
      lenis: null,
      isSmooth: false,
      scrollTo: (target) => {
        if (typeof target === 'number') window.scrollTo({ top: target, behavior: 'smooth' });
        else if (target instanceof Element) target.scrollIntoView({ behavior: 'smooth' });
        else if (typeof target === 'string')
          document.querySelector(target)?.scrollIntoView({ behavior: 'smooth' });
      },
      stop: () => {},
      start: () => {},
    };
  }
  return context;
};

export default SmoothScrollContext;
