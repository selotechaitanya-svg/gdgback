import React, { useLayoutEffect, useRef } from 'react';
import { gsap, prefersReducedMotion, holdForIntro, EASE } from '../lib/motion';

/**
 * Scroll-triggered entrance wrapper.
 * Content is fully visible when motion is reduced (or JS animation is skipped).
 */
export const Reveal = ({
  children,
  as: Tag = 'div',
  className = '',
  style,
  y = 26,
  x = 0,
  scale = 1,
  rotate = 0,
  delay = 0,
  duration = 0.8,
  start = 'top 88%',
  once = true,
  ...rest
}) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return undefined;

    let releaseIntro = () => {};
    const ctx = gsap.context(() => {
      const tween = gsap.fromTo(
        el,
        { opacity: 0, y, x, scale, rotate },
        {
          opacity: 1,
          y: 0,
          x: 0,
          scale: 1,
          rotate: 0,
          duration,
          delay,
          ease: EASE.out,
          clearProps: 'transform',
          scrollTrigger: { trigger: el, start, once },
        }
      );
      releaseIntro = holdForIntro(tween);
    }, el);

    return () => {
      releaseIntro();
      ctx.revert();
    };
  }, [y, x, scale, rotate, delay, duration, start, once]);

  return (
    <Tag ref={ref} className={className} style={style} {...rest}>
      {children}
    </Tag>
  );
};

export default Reveal;
