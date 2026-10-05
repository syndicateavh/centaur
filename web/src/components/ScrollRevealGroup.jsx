import React, { useEffect, useRef } from 'react';

/**
 * Adds a one-time entrance to a group of cards when they enter the viewport.
 * Content remains visible when JavaScript, IntersectionObserver, or motion is unavailable.
 */
export default function ScrollRevealGroup({ as: Element = 'div', className = '', children, ...props }) {
  const groupRef = useRef(null);

  useEffect(() => {
    const group = groupRef.current;
    if (!group || typeof IntersectionObserver !== 'function') return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const items = [...group.querySelectorAll('[data-scroll-reveal-item]')];
    if (!items.length) return undefined;

    group.dataset.scrollRevealReady = 'true';
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.dataset.scrollRevealVisible = 'true';
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -32px 0px' });

    items.forEach((item, index) => {
      item.style.setProperty('--scroll-reveal-delay', `${Math.min(index * 110, 220)}ms`);
      observer.observe(item);
    });

    return () => {
      observer.disconnect();
      delete group.dataset.scrollRevealReady;
      items.forEach((item) => {
        delete item.dataset.scrollRevealVisible;
        item.style.removeProperty('--scroll-reveal-delay');
      });
    };
  }, []);

  return <Element ref={groupRef} className={className} {...props}>{children}</Element>;
}
