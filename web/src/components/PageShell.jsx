import React from 'react';
import { CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { getVisibleBreadcrumbs } from '@/seo/seoRoutes.js';

export { CtaSection, PrimaryLink } from './CallToAction.jsx';
export { SectionHeading } from './SectionHeading.jsx';

export function Breadcrumbs({ items, className = 'mb-8' }) {
  return (
    <nav aria-label="Breadcrumb" className={`${className} min-w-0 max-w-full text-sm text-white/70`}>
      <ol className="flex min-w-0 max-w-full flex-wrap items-center gap-x-2 gap-y-1">
        <li className="shrink-0">
          <Link to="/" className="transition-colors hover:text-accent">Home</Link>
        </li>
        {items.map((item) => (
          <React.Fragment key={item.label}>
            <li aria-hidden="true" className="shrink-0"><ChevronRight className="h-4 w-4" aria-hidden="true" /></li>
            <li className="min-w-0 max-w-full">
              {item.to ? (
                <Link to={item.to} className="inline-block max-w-full break-words [overflow-wrap:anywhere] align-top transition-colors hover:text-accent">{item.label}</Link>
              ) : (
                <span aria-current="page" className="inline-block max-w-full break-words [overflow-wrap:anywhere] align-top text-white">{item.label}</span>
              )}
            </li>
          </React.Fragment>
        ))}
      </ol>
    </nav>
  );
}

export function PageHero({ routeId, breadcrumbItems, eyebrow, title, intro, children, sideContent, containerClassName = 'container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8' }) {
  const breadcrumbs = breadcrumbItems ?? (routeId ? getVisibleBreadcrumbs(routeId) : []);
  const headingId = routeId ? `${routeId}-page-title` : 'page-title';

  return (
    <section data-page-hero aria-labelledby={headingId} className="bg-navy-gradient py-16 text-white sm:py-20 lg:py-24">
      <div className={`${containerClassName}${sideContent ? ' grid gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:items-center' : ''}`}>
        {breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} className={`mb-8${sideContent ? ' lg:col-span-2' : ''}`} />}
        <div className={`w-full min-w-0 ${sideContent ? 'max-w-3xl' : 'max-w-4xl'}`}>
          {eyebrow && (
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
          )}
          <h1 id={headingId} className="max-w-full break-words text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-6 w-full min-w-0 max-w-3xl break-words [overflow-wrap:anywhere] text-lg leading-relaxed text-white/75 sm:text-xl">{intro}</p>
          {children}
        </div>
        {sideContent && <div className="min-w-0">{sideContent}</div>}
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
