import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { BUSINESS_DATA } from '@/content/businessData.js';

function getOutboundCtaChannel(href) {
  try {
    const hostname = new URL(href, BUSINESS_DATA.url).hostname.toLowerCase();
    if (hostname === 'wa.me' || hostname === 'wa.link' || hostname === 'api.whatsapp.com' || hostname === 'whatsapp.com' || hostname.endsWith('.whatsapp.com')) return 'whatsapp';
    if (hostname === 'forms.gle' || hostname === 'docs.google.com') return 'enrollment';
  } catch {
    // Unknown destinations are still usable links; analytics can classify them separately.
  }
  return undefined;
}

export function PrimaryLink({ to, children, inverse = false }) {
  return (
    <Link
      to={to}
      className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 py-3 font-bold transition-all hover:-translate-y-0.5 ${
        inverse ? 'border border-white/25 bg-white/10 text-white hover:bg-white/15' : 'bg-accent text-primary shadow-md hover:shadow-lg'
      }`}
    >
      {children}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </Link>
  );
}

export function CtaSection({
  eyebrow,
  title,
  description,
  primaryLabel = 'Start Your Application',
  primaryHref = BUSINESS_DATA.enrollmentUrl,
  primaryTo,
  secondaryLabel = 'Contact Centaur Careers',
  secondaryTo = '/contact/',
  secondaryHref,
  primaryAnalyticsId,
  primaryAnalyticsIntent,
  primaryMagnetic = false,
}) {
  const primaryChannel = getOutboundCtaChannel(primaryHref);
  const ctaId = primaryAnalyticsId ?? `conversion-section-${primaryTo ? 'internal' : primaryChannel ?? 'primary'}`;
  const primaryClassName = `conversion-cta-primary inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 font-bold text-primary shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg ${primaryMagnetic ? 'home-magnetic-button' : ''}`;

  return (
    <section data-conversion-cta data-conversion-path={secondaryTo} aria-labelledby="cta-section-title" className="bg-primary py-16 text-white">
      <div className="container mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
        <div>
          {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">{eyebrow}</p>}
          <h2 id="cta-section-title" className="text-3xl font-bold text-white">{title}</h2>
          <p className="mt-3 max-w-2xl text-white/70">{description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          {primaryTo ? (
            <Link to={primaryTo} data-analytics-id={ctaId} data-analytics-intent={primaryAnalyticsIntent} data-analytics-channel="internal" className={primaryClassName}>
              {primaryLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          ) : (
            <a data-analytics-id={ctaId} data-analytics-intent={primaryAnalyticsIntent} data-analytics-channel={primaryChannel} data-home-magnetic={primaryMagnetic ? '' : undefined} href={primaryHref} target="_blank" rel="noopener noreferrer" className={primaryClassName}>
              {primaryLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
          {secondaryHref ? (
            <a href={secondaryHref} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3 font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-white/15">
              {secondaryLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          ) : <PrimaryLink to={secondaryTo} inverse>{secondaryLabel}</PrimaryLink>}
        </div>
      </div>
    </section>
  );
}
