import React from 'react';
import { Link } from 'react-router';
import BlogContentRenderer from '@/components/blog/BlogContentRenderer.jsx';
import InternalLinkGroup from '@/components/InternalLinkGroup.jsx';
import { CtaSection, PageHero, SectionHeading } from '@/components/PageShell.jsx';
import { getPriorityFaqPage } from '@/content/prioritySeoContent.js';
import { getInternalLinks } from '@/seo/internalLinks.js';
import { getSeoRoute } from '@/seo/seoRoutes.js';

export default function PriorityFaqPage({ pageId }) {
  const page = getPriorityFaqPage(pageId);
  if (!page) return null;
  const route = getSeoRoute(page.routeId);

  return (
    <>
      <PageHero routeId={route.id} eyebrow="Program information" title={page.h1} intro={page.description} />
      <section data-priority-faq={page.id} className="bg-white py-16 sm:py-20">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Current-term questions" title="Answers before you enquire or enrol" intro="These answers describe the current public positioning. Request written confirmation for cohort-specific details." />
          {page.body?.length > 0 && <BlogContentRenderer blocks={page.body} />}
          <div className="space-y-4">
            {page.questions.map(({ question, answer }) => (
              <details key={question} className="group rounded-2xl border border-border bg-white p-6 open:border-accent/50 open:shadow-sm">
                <summary className="cursor-pointer list-none pr-8 text-lg font-bold text-primary">{question}</summary>
                <p className="mt-4 leading-relaxed text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
          <aside className="mt-10 rounded-2xl bg-muted p-7">
            <h2 className="text-2xl font-bold text-primary">Useful next pages</h2>
            <p className="mt-3 text-muted-foreground">Read the complete curriculum and published placement summary, then request the current written terms for your cohort.</p>
            <div className="mt-5 flex flex-wrap gap-4">
              <Link to="/courses/" className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Review the Masterclass</Link>
              <Link to="/placements/#job-guarantee-terms" className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Read placement summary</Link>
              <Link to="/contact/" className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Contact Centaur Careers</Link>
            </div>
          </aside>
        </div>
      </section>
      <InternalLinkGroup links={getInternalLinks(page.routeId)} />
      <CtaSection title="Confirm the details that apply to your cohort" description="Read the full program information and ask Centaur Careers about current schedule, fees, learning access, certificate requirements, or written support terms." primaryTo="/contact/" primaryLabel="Ask about the current cohort" primaryAnalyticsIntent="commercial_program" secondaryTo="/courses/" secondaryLabel="Review full course details" />
    </>
  );
}
