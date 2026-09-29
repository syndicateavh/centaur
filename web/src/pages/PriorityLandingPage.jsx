import React from 'react';
import { Link } from 'react-router';
import BlogContentRenderer from '@/components/blog/BlogContentRenderer.jsx';
import InternalLinkGroup from '@/components/InternalLinkGroup.jsx';
import { CtaSection, PageHero } from '@/components/PageShell.jsx';
import { BUSINESS_DATA } from '@/content/businessData.js';
import { getLeadIntentAction } from '@/content/leadIntentActions.js';
import { getPriorityLandingPage } from '@/content/prioritySeoContent.js';
import { getInternalLinks } from '@/seo/internalLinks.js';
import { getSeoRoute } from '@/seo/seoRoutes.js';

export default function PriorityLandingPage({ pageId }) {
  const page = getPriorityLandingPage(pageId);
  if (!page) return null;

  const route = getSeoRoute(page.routeId);
  const leadAction = getLeadIntentAction(page.id);
  const whatsappUrl = leadAction
    ? `https://wa.me/${BUSINESS_DATA.telephone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi Centaur Careers, I read your ${page.h1} page. I would like to ${leadAction.title.toLowerCase()}. Please share the current details and written terms.`)}`
    : null;
  return (
    <>
      <PageHero routeId={route.id} eyebrow="Finance career pathway" title={page.h1} intro={page.description} />
      <article data-priority-landing-page={page.id} className="bg-white py-14 sm:py-20">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-wrap items-center gap-3 border-b border-border pb-6 text-sm text-muted-foreground">
            {page.author?.name && <span className="font-bold text-primary">By {page.author.name}{page.author.role ? `, ${page.author.role}` : ''}</span>}
            <span>Page updated <time dateTime={page.updatedAt}>{page.updatedAt}</time></span>
          </div>
          {leadAction ? <BlogContentRenderer blocks={page.body.slice(0, 3)} /> : <BlogContentRenderer blocks={page.body} />}
          {leadAction && (
            <aside data-lead-intent-action={page.id} data-conversion-cta className="my-10 rounded-2xl border border-accent/40 bg-accent/10 p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-primary">{leadAction.title}</h2>
              <p className="mt-3 leading-relaxed text-foreground/80">{leadAction.description}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to={leadAction.path} data-analytics-id={`lead_${page.id}_details`} data-analytics-intent="commercial_program" className="inline-flex min-h-12 items-center rounded-xl bg-primary px-5 py-3 font-bold text-white">{leadAction.title}</Link>
                <a href={`tel:${BUSINESS_DATA.telephone}`} data-analytics-id={`lead_${page.id}_phone`} data-analytics-intent="commercial_program" className="inline-flex min-h-12 items-center rounded-xl border border-border bg-white px-5 py-3 font-bold text-primary">Call {BUSINESS_DATA.displayTelephone}</a>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" data-analytics-id={`lead_${page.id}_whatsapp`} data-analytics-intent="commercial_program" className="inline-flex min-h-12 items-center rounded-xl border border-border bg-white px-5 py-3 font-bold text-primary">Ask on WhatsApp</a>
              </div>
            </aside>
          )}
          {leadAction && <BlogContentRenderer blocks={page.body.slice(3)} />}
          <aside className="mt-12 rounded-2xl border border-accent/30 bg-accent/10 p-6 text-primary">
            <h2 className="text-2xl font-bold">Confirm the current program details</h2>
            <p className="mt-3 leading-relaxed">Curriculum, cohort timing, fees, learning mode, certificate wording, and support terms can change. Review the full program page and ask Centaur Careers to confirm the terms for your cohort.</p>
            <div className="mt-5 flex flex-wrap gap-4">
              <Link to="/courses/" className="font-bold underline decoration-accent decoration-2 underline-offset-4">Review the Masterclass</Link>
              <Link to="/placements/#job-guarantee-terms" className="font-bold underline decoration-accent decoration-2 underline-offset-4">Read the placement summary</Link>
              <Link to="/contact/" className="font-bold underline decoration-accent decoration-2 underline-offset-4">Contact Centaur Careers</Link>
            </div>
          </aside>
        </div>
      </article>
      <InternalLinkGroup links={getInternalLinks(page.routeId)} />
      <CtaSection title="Choose your finance career direction" description="Use the topic pages to understand the work, then confirm the current Financial Operations Masterclass details before you apply." />
    </>
  );
}
