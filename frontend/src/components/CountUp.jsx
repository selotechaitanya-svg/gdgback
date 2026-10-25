import React, { useLayoutEffect, useRef } from 'react';
import { gsap, prefersReducedMotion, holdForIntro } from '../lib/motion';

const formatNumber = (value, decimals) => {
  const rounded = decimals
    ? Number(value.toFixed(decimals))
    : Math.round(value);
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(rounded);
};

/**
 * Counts from zero to `value` once the number scrolls into view.
 * The final value is rendered on the server-side of the first paint too.
 */
export const CountUp = ({
  value = 0,
  duration = 1.6,
  decimals = 0,
  prefix = '',
  suffix = '',
  className = '',
  ...rest
}) => {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    if (prefersReducedMotion()) {
      el.textContent = `${prefix}${formatNumber(value, decimals)}${suffix}`;
      return undefined;
    }

    const counter = { value: 0 };
    let releaseIntro = () => {};
    const ctx = gsap.context(() => {
      const tween = gsap.to(counter, {
        value,
        duration,
        ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        onUpdate: () => {
          el.textContent = `${prefix}${formatNumber(counter.value, decimals)}${suffix}`;
        },
        onComplete: () => {
          el.textContent = `${prefix}${formatNumber(value, decimals)}${suffix}`;
        },
      });
      releaseIntro = holdForIntro(tween);
    }, el);

    return () => {
      releaseIntro();
      ctx.revert();
    };
  }, [value, duration, decimals, prefix, suffix]);

  return (
    <span ref={ref} className={`count-up ${className}`.trim()} {...rest}>
      {`${prefix}${formatNumber(value, decimals)}${suffix}`}
    </span>
  );
};

export default CountUp;
