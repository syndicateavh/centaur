import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

function LinkList({ links }) {
  return <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {links.map(({ routeId, to, label, authorityTier }) => (
      <li key={routeId}>
        <Link
          to={to}
          data-internal-link-target={routeId}
          data-authority-link="contextual"
          data-authority-tier={authorityTier}
          className="group flex min-h-14 items-center justify-between gap-4 rounded-xl border border-border bg-white px-5 py-4 font-bold text-primary transition hover:-translate-y-0.5 hover:border-accent hover:shadow-sm"
        >
          <span>{label}</span>
          <ArrowRight className="h-4 w-4 shrink-0 text-accent-ink transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </li>
    ))}
  </ul>;
}

export default function InternalLinkGroup({ links, featuredRouteIds = [], visibleCount = 0 }) {
  if (!links?.length) return null;

  const featured = featuredRouteIds.flatMap((routeId) => links.filter((link) => link.routeId === routeId));
  const featuredIds = new Set(featured.map((link) => link.routeId));
  const orderedLinks = [...featured, ...links.filter((link) => !featuredIds.has(link.routeId))];
  const initialCount = visibleCount > 0 ? visibleCount : orderedLinks.length;
  const primaryLinks = orderedLinks.slice(0, initialCount);
  const moreLinks = orderedLinks.slice(initialCount);

  return (
    <nav aria-label="Related pages" data-internal-link-group="contextual" data-authority-link-group="internal-graph" className="bg-muted py-12 sm:py-16">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-5 text-2xl font-bold text-primary">Explore related topics</h2>
        <LinkList links={primaryLinks} />
        {moreLinks.length > 0 && <details className="mt-6 rounded-xl border border-border bg-white p-5">
          <summary className="cursor-pointer font-bold text-primary">Browse {moreLinks.length} more related pages</summary>
          <div className="mt-5"><LinkList links={moreLinks} /></div>
        </details>}
      </div>
    </nav>
  );
}
