import { useEffect } from 'react';
import { scheduleAfterPaint } from './motionUtils.js';

export function useMarqueeMotion(marqueeRef, trackRef) {
  useEffect(() => {
    let cancelled = false;
    let stopMotion = () => {};

    const loadMotion = async () => {
      const [{ gsap }] = await Promise.all([import('gsap')]);
      if (cancelled || !marqueeRef.current || !trackRef.current) return;

      const media = gsap.matchMedia();
      media.add({ reducedMotion: '(prefers-reduced-motion: reduce)' }, (context) => {
        const track = trackRef.current;
        const firstSet = track?.querySelector('[data-marquee-set]');
        if (context.conditions.reducedMotion || !track || !firstSet) return undefined;

        let animation;
        let started = false;
        let observer;

        const createAnimation = () => {
          const distance = firstSet.getBoundingClientRect().width;
          if (!distance) return;

          animation?.kill();
          gsap.set(track, { x: 0 });
          animation = gsap.to(track, {
            duration: Math.max(16, distance / 105),
            ease: 'none',
            repeat: -1,
            x: -distance,
          });
        };

        const pause = () => animation?.pause();
        const play = () => animation?.play();

        const start = () => {
          if (started) return;
          started = true;
          createAnimation();
          window.addEventListener('resize', createAnimation);
          marqueeRef.current?.addEventListener('pointerenter', pause);
          marqueeRef.current?.addEventListener('pointerleave', play);
        };

        if (typeof window.IntersectionObserver === 'function') {
          observer = new window.IntersectionObserver(
            (entries) => {
              if (!entries.some((entry) => entry.isIntersecting)) return;
              start();
              observer.disconnect();
            },
            { rootMargin: '240px 0px' },
          );
          observer.observe(marqueeRef.current);
        } else {
          start();
        }

        return () => {
          observer?.disconnect();
          if (started) {
            window.removeEventListener('resize', createAnimation);
            marqueeRef.current?.removeEventListener('pointerenter', pause);
            marqueeRef.current?.removeEventListener('pointerleave', play);
          }
          animation?.kill();
        };
      });

      stopMotion = () => media.revert();
    };

    const cancelScheduledLoad = scheduleAfterPaint(() => {
      loadMotion().catch(() => {
        // Motion is optional. The static partner list remains available if it fails.
      });
    });

    return () => {
      cancelled = true;
      cancelScheduledLoad();
      stopMotion();
    };
  }, [marqueeRef, trackRef]);
}
