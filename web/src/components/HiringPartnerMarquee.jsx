import React, { useRef } from 'react';
import { useMarqueeMotion } from '@/components/home/useMarqueeMotion.js';

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

  useMarqueeMotion(marqueeRef, trackRef);

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
