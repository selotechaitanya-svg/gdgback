import React, { useLayoutEffect, useRef } from 'react';
import { gsap, prefersReducedMotion, holdForIntro, EASE, toWords } from '../lib/motion';

/**
 * Editorial word-by-word reveal for headlines.
 * Each word rises out of a clipping mask when scrolled into view.
 * The text remains selectable and is exposed once to assistive tech.
 */
export const SplitWords = ({
  text,
  as: Tag = 'span',
  className = '',
  style,
  delay = 0,
  duration = 0.85,
  stagger = 0.045,
  start = 'top 88%',
  once = true,
  ...rest
}) => {
  const ref = useRef(null);
  const words = toWords(text);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return undefined;

    let releaseIntro = () => {};
    const ctx = gsap.context(() => {
      const inner = el.querySelectorAll('.sw-inner');
      if (!inner.length) return;
      const tween = gsap.fromTo(
        inner,
        { yPercent: 118, rotate: 2.5 },
        {
          yPercent: 0,
          rotate: 0,
          duration,
          delay,
          stagger,
          ease: EASE.expo,
          scrollTrigger: { trigger: el, start, once },
        }
      );
      releaseIntro = holdForIntro(tween);
    }, el);

    return () => {
      releaseIntro();
      ctx.revert();
    };
  }, [text, delay, duration, stagger, start, once]);

  return (
    <Tag ref={ref} className={`sw-heading ${className}`} style={style} aria-label={text} {...rest}>
      {words.map((word, index) => (
        <span className="sw-word" aria-hidden="true" key={`${word}-${index}`}>
          <span className="sw-inner">{word}</span>
        </span>
      ))}
    </Tag>
  );
};

export default SplitWords;
