import React, { useMemo, useState } from 'react';

export const HIRING_PARTNER_MARQUEE_SPEED_SECONDS = 36;

function PartnerLogo({ partner }) {
  const logoSrc = partner.src ?? (partner.logo ? `/images/partners/${partner.logo}` : null);
  const logoScale = partner.homeScale ?? 1;
  const handleImageError = (event) => {
    event.currentTarget.classList.add('hidden');
  };

  return (
    <li className="home-partner-marquee-card group flex shrink-0 items-center justify-center">
      {logoSrc && (
        <span
          className="home-partner-marquee-logo-frame"
          style={{ '--home-partner-logo-scale': logoScale }}
        >
          <img
            src={logoSrc}
            alt={`${partner.name} logo`}
            width="160"
            height="72"
            className="home-partner-marquee-logo max-w-full object-contain"
            decoding="async"
            loading="lazy"
            onError={handleImageError}
          />
        </span>
      )}
    </li>
  );
}

function PartnerSet({ partners, duplicate = false }) {
  return (
    <ul className="home-partner-marquee-set" aria-hidden={duplicate || undefined}>
      {partners.map((partner) => (
        <PartnerLogo key={`${partner.name}-${duplicate ? 'duplicate' : 'primary'}`} partner={partner} />
      ))}
    </ul>
  );
}

export function HiringPartnerMarquee({ partners }) {
  const [isPaused, setIsPaused] = useState(false);
  const rows = useMemo(() => {
    const groupedPartners = [[], [], []];
    partners.forEach((partner, index) => groupedPartners[index % groupedPartners.length].push(partner));
    return groupedPartners.filter((row) => row.length > 0);
  }, [partners]);

  const handleBlur = (event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
  };

  return (
    <div
      role="region"
      aria-label="Hiring partner logos"
      className={`home-partner-marquee${isPaused ? ' is-paused' : ''}`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={handleBlur}
    >
      {rows.map((row, rowIndex) => (
        <div
          key={`partner-marquee-row-${rowIndex + 1}`}
          className={`home-partner-marquee-row ${rowIndex % 2 ? 'is-reversed' : ''}`}
        >
          <div className="home-partner-marquee-track">
            <PartnerSet partners={row} />
            <PartnerSet partners={row} duplicate />
          </div>
        </div>
      ))}
    </div>
  );
}
