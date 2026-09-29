import React from 'react';
import { CalendarDays } from 'lucide-react';
import { Link } from 'react-router';
import BlogContentRenderer from '@/components/blog/BlogContentRenderer.jsx';
import CommercialDecisionChecklist from '@/components/CommercialDecisionChecklist.jsx';
import TopicProgramPathway from '@/components/TopicProgramPathway.jsx';
import InternalLinkGroup from '@/components/InternalLinkGroup.jsx';
import { CtaSection, PageHero } from '@/components/PageShell.jsx';
import { getInformationalModule } from '@/content/informationalModules.js';
import { getInternalLinks } from '@/seo/internalLinks.js';
import { getSeoRoute } from '@/seo/seoRoutes.js';

export default function InformationalModulePage({ moduleId }) {
  const module = getInformationalModule(moduleId);
  if (!module) return null;

  const route = getSeoRoute(module.routeId);

  return (
    <>
      <PageHero routeId={route.id} eyebrow="Masterclass module guide" title={module.h1} intro={module.description} />
      <article data-informational-module={module.id} className="bg-white py-14 sm:py-20">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <p className="mb-10 inline-flex items-center gap-2 border-b border-border pb-6 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4" aria-hidden="true" /> Page updated <time dateTime={module.updatedAt}>{module.updatedAt}</time>
          </p>
          <div className="mb-10 rounded-xl border border-accent/30 bg-accent/10 p-5 text-sm leading-relaxed text-primary">
            This is an informational page about one subject in the <Link to="/courses/" className="font-bold underline decoration-accent decoration-2 underline-offset-4">Financial Operations Masterclass</Link>. It is not a separate course or standalone certification. Review the full program page and <Link to="/placements/#job-guarantee-terms" className="font-bold underline decoration-accent decoration-2 underline-offset-4">published placement summary</Link>, then request current written cohort terms.
          </div>
          {module.id === 'kyc-aml-compliance' && (
            <section data-high-value-page="kyc-aml-compliance" data-high-value-section="module-commercial-bridge" className="mb-10 rounded-2xl border border-border bg-muted p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-primary">KYC AML course learning within the full finance program</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">If you are comparing a KYC AML course, check whether it teaches customer due diligence, screening, transaction monitoring, case documentation, controls, and escalation in a practical sequence. At Centaur Careers, KYC / AML is one module in the Financial Operations Masterclass rather than a separate course or standalone certification.</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link to="/courses/" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white">Review the full Masterclass <span aria-hidden="true">→</span></Link>
                <Link to="/contact/" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-white px-5 py-3 font-bold text-primary">Confirm current cohort details <span aria-hidden="true">→</span></Link>
              </div>
            </section>
          )}
          <BlogContentRenderer blocks={module.body} />
        </div>
      </article>
      <TopicProgramPathway topicId={module.id} />
      <CommercialDecisionChecklist
        context={`${module.h1} subject area`}
        title={`What to verify before choosing ${module.breadcrumbLabel} learning`}
        intro="Use this subject guide to understand the workflow, then compare the complete programme scope and current participation terms before enrolling."
        primaryLabel="Review the Financial Operations Masterclass"
      />
      <InternalLinkGroup links={getInternalLinks(module.routeId)} />
      <CtaSection title="Explore the complete Financial Operations Masterclass" description="Use the program page or contact Centaur Careers to confirm current curriculum, learning mode, fees, cohort timing, and support terms." />
    </>
  );
}
