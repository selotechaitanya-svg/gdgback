import React, { useEffect, useRef } from 'react';
import { gsap, hasFinePointer, prefersReducedMotion } from '../lib/motion';

const TiltCard = ({ children, className = '', maxTilt = 15, scale = 1.02 }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || !hasFinePointer() || prefersReducedMotion()) return;

    const handleMouseMove = (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = (y - centerY) / centerY * -maxTilt;
      const rotateY = (x - centerX) / centerX * maxTilt;
      
      gsap.to(card, {
        rotateX: rotateX,
        rotateY: rotateY,
        scale: scale,
        duration: 0.5,
        ease: 'power2.out',
        transformPerspective: 1000,
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        rotateX: 0,
        rotateY: 0,
        scale: 1,
        duration: 0.7,
        ease: 'elastic.out(1, 0.5)',
      });
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
      gsap.killTweensOf(card);
    };
  }, [maxTilt, scale]);

  return (
    <div ref={cardRef} className={`tilt-card ${className}`} style={{ transformStyle: 'preserve-3d' }}>
      {children}
    </div>
  );
};

export default TiltCard;
