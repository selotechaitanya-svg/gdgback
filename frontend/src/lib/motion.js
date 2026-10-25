import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

export { gsap, ScrollTrigger };

/** True when the visitor asked the OS to reduce motion. */
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** True for mouse/trackpad devices (no touch-only screens). */
export const hasFinePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches;

/** True while the one-time brand intro covers the page. */
export const isIntroActive = () =>
  typeof document !== 'undefined' && document.documentElement.classList.contains('is-intro');

/**
 * Holds an entrance tween until the preloader curtain lifts, so the
 * first impression is not wasted behind the overlay.
 */
export const holdForIntro = (tween) => {
  if (!tween || !isIntroActive()) return () => {};
  tween.pause();
  const resume = () => tween.play();
  window.addEventListener('gdg:intro-complete', resume, { once: true });
  // Safety valve: never leave content hidden if the intro is interrupted.
  const failSafe = window.setTimeout(resume, 6000);
  return () => {
    window.clearTimeout(failSafe);
    window.removeEventListener('gdg:intro-complete', resume);
  };
};

/** Shared easing language for the whole site. */
export const EASE = {
  out: 'power3.out',
  inOut: 'power2.inOut',
  expo: 'expo.out',
  spring: 'back.out(1.6)',
};

/**
 * Splits a string into word tokens for staggered reveal animations.
 * Returns null for strings that contain no visible words.
 */
export const toWords = (text = '') =>
  String(text)
    .split(/\s+/)
    .filter(Boolean);

/**
 * Smoothly scrolls an element into view while accounting for the sticky navbar.
 */
export const scrollToSection = (target, offset = 80) => {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  gsap.to(window, {
    duration: 1,
    ease: EASE.inOut,
    scrollTo: { y: el, offsetY: offset, autoKill: true },
  });
};
