import React from 'react';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { getVisibleBreadcrumbs } from '@/seo/seoRoutes.js';

export { CtaSection, PrimaryLink } from './CallToAction.jsx';
export { SectionHeading } from './SectionHeading.jsx';

export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8 text-sm text-white/70">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link to="/" className="transition-colors hover:text-accent">Home</Link>
        </li>
        {items.map((item) => (
          <React.Fragment key={item.label}>
            <li aria-hidden="true"><ChevronRight className="h-4 w-4" aria-hidden="true" /></li>
            <li>
              {item.to ? (
                <Link to={item.to} className="transition-colors hover:text-accent">{item.label}</Link>
              ) : (
                <span aria-current="page" className="text-white">{item.label}</span>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}

export function PageHero({ routeId, breadcrumbItems, eyebrow, title, intro, children }) {
  const breadcrumbs = breadcrumbItems ?? (routeId ? getVisibleBreadcrumbs(routeId) : []);
  const headingId = routeId ? `${routeId}-page-title` : 'page-title';

  return (
    <section data-page-hero aria-labelledby={headingId} className="bg-navy-gradient py-16 text-white sm:py-20 lg:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}
        <div className="max-w-4xl">
          {eyebrow && (
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
          )}
          <h1 id={headingId} className="text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/75 sm:text-xl">{intro}</p>
          {children}
        </div>
      </div>
    </section>
  );
}

export function Checklist({ items, light = false }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className={`flex items-start gap-3 ${light ? 'text-white/75' : 'text-foreground/80'}`}>
          <CheckCircle2 className={`mt-0.5 h-5 w-5 shrink-0 ${light ? 'text-accent' : 'text-accent-ink'}`} aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
