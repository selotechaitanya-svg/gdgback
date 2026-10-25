import React, { useEffect, useRef } from 'react';
import { gsap, hasFinePointer, prefersReducedMotion } from '../lib/motion';

const CustomCursor = () => {
  const cursorRef = useRef(null);
  const cursorFollowerRef = useRef(null);

  useEffect(() => {
    if (!hasFinePointer() || prefersReducedMotion()) return;

    const cursor = cursorRef.current;
    const follower = cursorFollowerRef.current;
    if (!cursor || !follower) return;

    const xTo = gsap.quickTo(cursor, 'x', { duration: 0.1, ease: 'power3.out' });
    const yTo = gsap.quickTo(cursor, 'y', { duration: 0.1, ease: 'power3.out' });
    
    const xToFollower = gsap.quickTo(follower, 'x', { duration: 0.4, ease: 'power3.out' });
    const yToFollower = gsap.quickTo(follower, 'y', { duration: 0.4, ease: 'power3.out' });

    const moveCursor = (e) => {
      xTo(e.clientX);
      yTo(e.clientY);
      xToFollower(e.clientX);
      yToFollower(e.clientY);
    };

    const handleMouseEnter = (e) => {
      const target = e.target;
      if (target.matches('a, button, .magnetic, .btn-brutal, .card, .event-card')) {
        gsap.to(cursor, { scale: 0.5, duration: 0.3, ease: 'power3.out' });
        gsap.to(follower, { scale: 1.8, duration: 0.3, ease: 'power3.out' });
      }
    };

    const handleMouseLeave = () => {
      gsap.to(cursor, { scale: 1, duration: 0.3, ease: 'power3.out' });
      gsap.to(follower, { scale: 1, duration: 0.3, ease: 'power3.out' });
    };

    window.addEventListener('mousemove', moveCursor);
    document.addEventListener('mouseover', handleMouseEnter);
    document.addEventListener('mouseout', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', moveCursor);
      document.removeEventListener('mouseover', handleMouseEnter);
      document.removeEventListener('mouseout', handleMouseLeave);
    };
  }, []);

  if (!hasFinePointer() || prefersReducedMotion()) return null;

  return (
    <>
      <div ref={cursorRef} className="custom-cursor" />
      <div ref={cursorFollowerRef} className="custom-cursor-follower" />
    </>
  );
};

export default CustomCursor;
