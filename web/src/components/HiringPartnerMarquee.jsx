import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(useGSAP);
}

function PartnerLogo({ partner, duplicate = false }) {
  const handleImageError = (event) => {
    event.currentTarget.classList.add('hidden');
    event.currentTarget.nextElementSibling?.classList.remove('hidden');
  };

  return (
    <li className="flex h-20 w-44 shrink-0 items-center justify-center rounded-2xl border border-border bg-white px-6 py-4 shadow-sm transition-colors hover:border-accent/50 hover:bg-[#fffdf5] sm:h-24 sm:w-52">
      <img
        src={`https://www.google.com/s2/favicons?domain_url=${encodeURIComponent(partner.domain)}&sz=128`}
        alt={duplicate ? '' : `${partner.name} logo`}
        aria-hidden={duplicate || undefined}
        className="h-12 max-w-full object-contain sm:h-14"
        decoding="async"
        loading="lazy"
        onError={handleImageError}
      />
      <span className="hidden text-center text-xs font-bold leading-tight text-primary">{partner.name}</span>
    </li>
  );
}

export function HiringPartnerMarquee({ partners }) {
  const marqueeRef = useRef(null);
  const trackRef = useRef(null);

  useGSAP(() => {
    const media = gsap.matchMedia();
    media.add({ reducedMotion: '(prefers-reduced-motion: reduce)' }, (context) => {
      const track = trackRef.current;
      const firstSet = track?.querySelector('[data-marquee-set]');
      if (context.conditions.reducedMotion || !track || !firstSet) return undefined;

      let animation;
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

      createAnimation();
      window.addEventListener('resize', createAnimation);
      const pause = () => animation?.pause();
      const play = () => animation?.play();
      const marquee = marqueeRef.current;
      marquee?.addEventListener('pointerenter', pause);
      marquee?.addEventListener('pointerleave', play);

      return () => {
        window.removeEventListener('resize', createAnimation);
        animation?.kill();
        marquee?.removeEventListener('pointerenter', pause);
        marquee?.removeEventListener('pointerleave', play);
      };
    });

    return () => media.revert();
  }, { scope: marqueeRef });

  return (
    <div ref={marqueeRef} role="region" className="home-partner-marquee relative overflow-hidden border-y border-border py-4" aria-label="Hiring partner logos">
      <div ref={trackRef} className="flex w-max will-change-transform">
        <ul data-marquee-set className="flex gap-3 pr-3">
          {partners.map((partner) => <PartnerLogo key={partner.name} partner={partner} />)}
        </ul>
        <ul className="flex gap-3 pr-3" aria-hidden="true">
          {partners.map((partner) => <PartnerLogo key={`${partner.name}-duplicate`} partner={partner} duplicate />)}
        </ul>
      </div>
    </div>
  );
}
