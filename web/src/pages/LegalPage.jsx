import React from 'react';
import { Link } from 'react-router';
import { PageHero } from '@/components/PageShell.jsx';
import InternalLinkGroup from '@/components/InternalLinkGroup.jsx';
import { LEGAL_PAGES } from '@/content/legalContent.js';
import { getInternalLinks } from '@/seo/internalLinks.js';
import { getSeoRoute } from '@/seo/seoRoutes.js';

export default function LegalPage({ pageId }) {
  const page = LEGAL_PAGES[pageId];
  const seo = getSeoRoute(pageId);
  const internalLinks = getInternalLinks(pageId);

  return (
    <>
      <PageHero routeId={pageId} eyebrow={page.eyebrow} title={seo.h1} intro={page.intro} />

      <section className="bg-white py-14 sm:py-18 lg:py-20">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 rounded-2xl border border-border bg-muted/40 px-5 py-4 text-sm text-muted-foreground sm:px-6">
            <span className="font-semibold text-primary">Last updated:</span> {page.updatedAt}
          </div>

          <div className="space-y-10">
            {page.sections.map((section) => (
              <article key={section.title}>
                <h2 className="text-2xl font-bold text-primary sm:text-3xl">{section.title}</h2>
                {section.paragraphs?.map((paragraph) => (
                  <p key={paragraph} className="mt-4 text-base leading-8 text-foreground/75">{paragraph}</p>
                ))}
                {section.bullets && (
                  <ul className="mt-5 list-disc space-y-3 pl-6 text-base leading-7 text-foreground/75 marker:text-accent-ink">
                    {section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
                  </ul>
                )}
              </article>
            ))}
          </div>

          <aside className="mt-12 rounded-2xl bg-primary p-6 text-white sm:p-8" aria-labelledby={`${pageId}-questions-title`}>
            <h2 id={`${pageId}-questions-title`} className="text-2xl font-bold text-white">Questions about this policy?</h2>
            <p className="mt-3 text-white/75">Contact Centaur Careers if you need clarification or want to make a privacy, enrolment, cancellation, or support request.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {page.relatedLinks.map((link) => (
                <Link key={link.to} to={link.to} className="inline-flex min-h-11 items-center rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/15">
                  {link.label}
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>

      {internalLinks.length > 0 && <InternalLinkGroup links={internalLinks} />}
    </>
  );
}
