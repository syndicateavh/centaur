import React from 'react';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router';
import BlogContentRenderer from '@/components/blog/BlogContentRenderer.jsx';
import InternalLinkGroup from '@/components/InternalLinkGroup.jsx';
import { CtaSection, PageHero, SectionHeading } from '@/components/PageShell.jsx';
import { getPriorityComparisonPage } from '@/content/prioritySeoContent.js';
import { getInternalLinks } from '@/seo/internalLinks.js';
import { getSeoRoute } from '@/seo/seoRoutes.js';

export default function PriorityComparisonPage({ pageId }) {
  const page = getPriorityComparisonPage(pageId);
  if (!page) return null;
  const route = getSeoRoute(page.routeId);

  return (
    <>
        <PageHero routeId={route.id} eyebrow="Decision-support guide" title={page.h1} intro={page.description}>
        <p className="mt-6 text-sm text-white/70">{page.author?.name ? `By ${page.author.name}${page.author.role ? `, ${page.author.role}` : ''}. ` : ''}Reviewed {page.updatedAt}. Confirm current provider terms before making a decision.</p>
      </PageHero>
      <article data-priority-comparison={page.id} className="bg-white py-14 sm:py-20">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-accent/40 bg-accent/10 p-6 text-lg leading-relaxed text-primary sm:p-8">
            <p>{page.directAnswer}</p>
          </div>
          <section className="mt-14" aria-labelledby={`${page.id}-criteria`}>
            <SectionHeading id={`${page.id}-criteria`} eyebrow="Compare the real decision" title="What to compare before you enrol" intro="Use the same questions for each route and separate general education from provider-specific claims." />
            <div className="grid gap-5 md:grid-cols-2">
              {page.criteria.map((criterion) => (
                <article key={criterion.name} className="rounded-2xl border border-border bg-muted/30 p-6">
                  <h2 className="text-xl font-bold text-primary">{criterion.name}</h2>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{criterion.detail}</p>
                </article>
              ))}
            </div>
          </section>
          {page.body?.length > 0 && (
            <section className="mt-16" aria-labelledby={`${page.id}-deep-dive`}>
              <SectionHeading id={`${page.id}-deep-dive`} eyebrow="Practical guidance" title="Use the comparison in context" intro="Apply the decision framework to the role, study goal, and current terms that matter to you." />
              <BlogContentRenderer blocks={page.body} />
            </section>
          )}
          <section className="mt-16" aria-labelledby={`${page.id}-faq`}>
            <SectionHeading id={`${page.id}-faq`} eyebrow="Common questions" title="Questions learners ask" />
            <div className="space-y-4">
              {page.faqs.map((item) => (
                <details key={item.question} className="rounded-2xl border border-border bg-muted/30 p-6 open:bg-white open:shadow-sm">
                  <summary className="cursor-pointer list-none pr-6 text-lg font-bold text-primary">{item.question}</summary>
                  <p className="mt-4 leading-relaxed text-muted-foreground">{item.answer}</p>
                </details>
              ))}
            </div>
          </section>
          <section className="mt-16 rounded-2xl bg-muted p-7 sm:p-9" aria-labelledby={`${page.id}-sources`}>
            <SectionHeading id={`${page.id}-sources`} eyebrow="External references" title="Verify current information at the source" intro="External pages can change. Open the source and check the current rules, curriculum, location, or program terms." />
            <ul className="grid gap-3 sm:grid-cols-2">
              {page.sources.map((source) => (
                <li key={source.href}>
                  <a href={source.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">
                    <span>{source.label}</span><ExternalLink className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </section>
          <nav className="mt-12 rounded-2xl border border-border p-6" aria-label="Next finance learning steps">
            <h2 className="text-xl font-bold text-primary">Continue your research</h2>
            <div className="mt-4 flex flex-wrap gap-4">
              <Link to="/courses/" className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Review the Masterclass</Link>
              <Link to="/contact/" className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Ask for current terms</Link>
            </div>
          </nav>
        </div>
      </article>
      <InternalLinkGroup links={getInternalLinks(page.routeId)} />
      <CtaSection title="Check the course details against your priorities" description="Compare curriculum, learning mode, fees, certificate wording, and current written support terms before deciding whether to enquire." primaryTo="/courses/" primaryLabel="Review course details" primaryAnalyticsIntent="commercial_program" secondaryTo="/contact/" secondaryLabel="Ask about the current cohort" />
    </>
  );
}
