import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { useSmoothScroll } from '../lib/SmoothScrollContext';

/**
 * Appears once the visitor is a screen or so down the page.
 */
export const BackToTop = () => {
  const { scrollTo } = useSmoothScroll();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 720);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      className={`back-to-top ${visible ? 'is-visible' : ''}`}
      onClick={() => scrollTo(0)}
      aria-label="Back to top"
      tabIndex={visible ? 0 : -1}
    >
      <ArrowUp size={18} strokeWidth={3} />
      <span className="font-mono">TOP</span>
    </button>
  );
};

export default BackToTop;
