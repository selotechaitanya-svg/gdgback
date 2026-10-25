import React, { useLayoutEffect, useRef } from 'react';
import { Star } from 'lucide-react';
import { gsap, prefersReducedMotion } from '../lib/motion';

/**
 * Infinite, seamless ticker. Pauses on hover and on keyboard focus.
 * With reduced motion it degrades to a static wrapped list.
 */
export const Marquee = ({ items = [], speed = 26, className = '' }) => {
  const trackRef = useRef(null);
  const tweenRef = useRef(null);

  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track || prefersReducedMotion()) return undefined;

    const ctx = gsap.context(() => {
      tweenRef.current = gsap.to(track, {
        xPercent: -50,
        ease: 'none',
        duration: speed,
        repeat: -1,
        paused: false,
      });
    }, track);

    return () => {
      tweenRef.current = null;
      ctx.revert();
    };
  }, [speed, items.length]);

  const group = (hidden) => (
    <div className="marquee__group" aria-hidden={hidden || undefined}>
      {items.map((item, index) => (
        <span className="marquee__item" key={`${item}-${index}`}>
          <span>{item}</span>
          <Star size={14} fill="currentColor" strokeWidth={0} aria-hidden="true" />
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={`marquee ${className}`}
      role="marquee"
      aria-label={`Community highlights: ${items.join(', ')}`}
      onPointerEnter={() => {
        if (tweenRef.current) gsap.to(tweenRef.current, { timeScale: 0, duration: 0.35 });
      }}
      onPointerLeave={() => {
        if (tweenRef.current) gsap.to(tweenRef.current, { timeScale: 1, duration: 0.35 });
      }}
    >
      <div className="marquee__track" ref={trackRef}>
        {group(false)}
        {group(true)}
      </div>
    </div>
  );
};

export default Marquee;
