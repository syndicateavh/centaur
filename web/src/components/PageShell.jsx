import React from 'react';
import { ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { getVisibleBreadcrumbs } from '@/seo/seoRoutes.js';

export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8 text-sm text-white/70">
      <ol className="flex flex-wrap items-center gap-2">
        <li>
          <Link to="/" className="transition-colors hover:text-accent">Home</Link>
        </li>
        {items.map((item) => (
          <React.Fragment key={item.label}>
            <li aria-hidden="true"><ChevronRight className="h-4 w-4" /></li>
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

export function PageHero({ routeId, eyebrow, title, intro, children }) {
  const breadcrumbs = routeId ? getVisibleBreadcrumbs(routeId) : [];

  return (
    <section className="bg-navy-gradient py-16 text-white sm:py-20 lg:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {breadcrumbs.length > 0 && <Breadcrumbs items={breadcrumbs} />}
        <div className="max-w-4xl">
          {eyebrow && (
            <p className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
          )}
          <h1 className="text-4xl font-black leading-tight text-white sm:text-5xl lg:text-6xl">{title}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-white/75 sm:text-xl">{intro}</p>
          {children}
        </div>
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, intro, align = 'left' }) {
  const alignment = align === 'center' ? 'mx-auto text-center' : '';
  return (
    <div className={`mb-10 max-w-3xl ${alignment}`}>
      {eyebrow && <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-accent">{eyebrow}</p>}
      <h2 className="text-3xl font-bold text-primary sm:text-4xl">{title}</h2>
      {intro && <p className={`mt-4 text-base text-muted-foreground sm:text-lg ${align === 'center' ? 'mx-auto' : ''}`}>{intro}</p>}
    </div>
  );
}

export function Checklist({ items, light = false }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className={`flex items-start gap-3 ${light ? 'text-white/75' : 'text-foreground/80'}`}>
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
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

export function CtaSection({ title, description }) {
  return (
    <section className="bg-primary py-16 text-white">
      <div className="container mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 sm:px-6 lg:flex-row lg:items-center lg:px-8">
        <div>
          <h2 className="text-3xl font-bold text-white">{title}</h2>
          <p className="mt-3 max-w-2xl text-white/70">{description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <PrimaryLink to="/contact/">Contact admissions</PrimaryLink>
          <PrimaryLink to="/courses/" inverse>Compare courses</PrimaryLink>
        </div>
      </div>
    </section>
  );
}
