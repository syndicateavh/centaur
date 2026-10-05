import React from 'react';
import { CalendarDays } from 'lucide-react';
import { Link } from 'react-router';
import BlogContentRenderer from '@/components/blog/BlogContentRenderer.jsx';
import InternalLinkGroup from '@/components/InternalLinkGroup.jsx';
import { CtaSection, PageHero } from '@/components/PageShell.jsx';
import { CAREER_ROLE_GUIDE_IDS, getCareerGuide } from '@/content/careerGuides.js';
import { CAREER_TRACKS, JOB_GUARANTEE, LEARNING_MODES, PROGRAM } from '@/content/sourceContent.js';
import RoleIntentPathway from '@/components/RoleIntentPathway.jsx';
import { getRoleIntentByGuideId } from '@/content/roleIntent.js';
import { getInternalLinks } from '@/seo/internalLinks.js';
import { getSeoRoute } from '@/seo/seoRoutes.js';

const ROLE_COURSE_FIT = Object.freeze({
  'investment-banking-operations': { trackId: 'investment-banking-operations', focus: 'Build familiarity with trade settlements, reconciliation, corporate actions, and fund accounting workflows used across investment banking operations.' },
  'settlement-analyst': { trackId: 'investment-banking-operations', focus: 'Connect trade instructions, settlement dates, cash and securities movements, matching, and exception escalation.' },
  'reconciliation-analyst': { trackId: 'investment-banking-operations', focus: 'Practise comparing transaction and balance records, identifying breaks, documenting evidence, and following exceptions to resolution.' },
  'custody-operations': { trackId: 'investment-banking-operations', focus: 'Relate custody records to settlement, cash and securities positions, asset servicing, and reconciliation controls.' },
  'corporate-actions-analyst': { trackId: 'investment-banking-operations', focus: 'Study event notices, dates, entitlements, election instructions, payments, and corporate-action reconciliations.' },
  'fund-accounting-analyst': { trackId: 'investment-banking-operations', focus: 'Connect fund accounting concepts with NAV records, transaction inputs, valuation checks, cash and position reconciliation, and exception evidence.' },
  'kyc-aml-analyst': { trackId: 'kyc-aml-compliance', focus: 'Build context around due diligence, onboarding records, transaction monitoring, regulatory reporting, and careful case documentation.' },
  'aml-analyst': { trackId: 'kyc-aml-compliance', focus: 'Relate due-diligence and transaction-monitoring concepts to alert review, evidence-based case notes, confidentiality, and escalation.' },
  'transaction-monitoring-analyst': { trackId: 'kyc-aml-compliance', focus: 'Connect transaction-monitoring concepts with alert review, customer and transaction context, case records, and escalation boundaries.' },
  'client-onboarding-analyst': { trackId: 'kyc-aml-compliance', focus: 'Practise thinking through onboarding records, due-diligence requirements, completeness checks, case tracking, and controlled hand-offs.' },
  'payment-operations-analyst': { trackId: 'digital-payments', focus: 'Build familiarity with payment rails, transaction status checks, reconciliation, disputes, and exception handling.' },
  'upi-operations-analyst': { trackId: 'digital-payments', focus: 'Connect UPI and IMPS operations concepts with transaction references, status checks, payment reconciliation, and customer-case hand-offs.' },
  'payment-disputes-analyst': { trackId: 'digital-payments', focus: 'Relate payment operations to dispute intake, transaction evidence, deadlines, reconciliation, and documented case resolution.' },
  'fintech-operations-analyst': { trackId: 'fintech-neo-banking', focus: 'Explore digital lending, product operations, compliance coordination, customer success, and the operational records that connect these functions.' },
  'retail-banking-operations': { trackId: 'retail-banking', focus: 'Build familiarity with branch workflows, customer servicing, relationship management, loan processes, and controlled record handling.' },
  'branch-operations-analyst': { trackId: 'retail-banking', focus: 'Practise thinking through branch requests, document checks, transaction support, daily controls, and customer-service hand-offs.' },
  'banking-relationship-manager': { trackId: 'retail-banking', focus: 'Connect relationship management with customer needs, banking products, service coordination, and responsible hand-offs to operations.' },
  'loan-processing-analyst': { trackId: 'finance-operations', focus: 'Relate loan-file documentation and application tracking to credit conditions, booking, servicing, and controlled lending workflows.' },
  'credit-operations-analyst': { trackId: 'finance-operations', focus: 'Build context around approved terms, documentation, conditions, booking, servicing, reconciliations, and credit operations exceptions.' },
  'nbfc-operations-analyst': { trackId: 'finance-operations', focus: 'Connect NBFC operations with loan processing, repayments, credit administration, customer records, and operational risk controls.' },
});

export default function CareerGuidePage({ guideId }) {
  const guide = getCareerGuide(guideId);
  if (!guide) return null;

  const route = getSeoRoute(guide.routeId);
  const relatedGuides = guide.relatedGuideIds.map((relatedId) => getCareerGuide(relatedId)).filter(Boolean);
  const roleIntent = getRoleIntentByGuideId(guide.id);
  const isRoleLandingPage = CAREER_ROLE_GUIDE_IDS.has(guide.id);
  const roleCourseFit = ROLE_COURSE_FIT[guide.id];
  const relevantTrack = CAREER_TRACKS.find((track) => track.id === roleCourseFit?.trackId);

  return (
    <>
      <PageHero routeId={route.id} eyebrow="Career guide" title={guide.h1} intro={guide.description} />

      <article data-career-guide={guide.id} data-high-value-page={guide.id === 'choosing-finance-career-course' ? 'career-guide-choosing-finance-career-course' : undefined} data-high-value-section={guide.id === 'choosing-finance-career-course' ? 'course-selection' : undefined} className="bg-white py-14 sm:py-20">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-wrap items-center gap-4 border-b border-border pb-6 text-sm text-muted-foreground">
            <span className="font-bold text-primary">{guide.author.name}</span>
            <span aria-hidden="true">·</span>
            <span>{guide.author.role}</span>
            <span aria-hidden="true">·</span>
            <time className="inline-flex items-center gap-2" dateTime={guide.updatedAt}><CalendarDays className="h-4 w-4" aria-hidden="true" />Updated {guide.updatedAt}</time>
          </div>
          <BlogContentRenderer blocks={guide.body} />

          {isRoleLandingPage && roleCourseFit && relevantTrack && (
            <section data-role-program-positioning className="mt-12 space-y-6" aria-labelledby="role-course-fit-title">
              <div className="rounded-2xl border border-accent/40 bg-accent/10 p-6 text-primary sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-accent-ink">Centaur Careers’ best-in-industry finance course</p>
                <h2 id="role-course-fit-title" className="mt-2 text-2xl font-bold">How the {PROGRAM.name} prepares you to explore {guide.breadcrumbLabel} roles</h2>
                <p className="mt-3 leading-relaxed">Centaur Careers offers the six-week {PROGRAM.name} as its best-in-industry finance course. It brings together six learning areas—investment banking operations, retail banking, KYC / AML compliance, digital payments, finance operations, and FinTech &amp; Neo-Banking—through concepts, practical scenarios, and guided learning. The published program also describes projects and case studies.</p>
                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl bg-white/80 p-5">
                    <h3 className="font-bold">Most relevant course area: {relevantTrack.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed">{relevantTrack.description}. {roleCourseFit.focus}</p>
                  </div>
                  <div className="rounded-xl bg-white/80 p-5">
                    <h3 className="font-bold">Learning options across India</h3>
                    <p className="mt-2 text-sm leading-relaxed">{LEARNING_MODES.find((mode) => mode.name === 'Online')?.summary}; an in-person option is available in Lucknow. Confirm current cohort schedule and inclusions with Centaur Careers.</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-primary/15 bg-white p-6 shadow-sm sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-accent-ink">100% Job Guarantee Program</p>
                <h2 className="mt-2 text-2xl font-bold text-primary">Complete the course and get a guaranteed finance job</h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">{JOB_GUARANTEE.description} This is the Masterclass’s finance-job guarantee; it does not guarantee a job specifically as a {guide.breadcrumbLabel}, or with a particular employer, salary, or city. Review the current written terms for your cohort before enrolling.</p>
                <Link to={JOB_GUARANTEE.termsPath} className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-primary px-4 py-2 font-bold text-white underline decoration-accent decoration-2 underline-offset-4">Read the 100% Job Guarantee terms</Link>
              </div>
            </section>
          )}

          {relatedGuides.length > 0 && (
            <nav data-career-guide-related aria-label="Related career guides" className="mt-12 rounded-2xl bg-muted p-6">
              <h2 className="text-xl font-bold text-primary">Related career guides</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {relatedGuides.map((relatedGuide) => (
                  <li key={relatedGuide.id}>
                    <Link to={relatedGuide.path} className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">{relatedGuide.h1}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <p className="mt-10 text-sm text-muted-foreground">This guide explains a career topic in general terms. Program-specific curriculum, delivery, and support information belongs to the current Financial Operations Masterclass details.</p>
        </div>
      </article>

      <RoleIntentPathway intent={roleIntent} />
      <InternalLinkGroup links={getInternalLinks(guide.routeId)} />
      <CtaSection eyebrow="Explore your next step" title={`Compare training with the ${guide.breadcrumbLabel} career path`} description="Review the full Masterclass scope, learning options, fees, certificate wording, and current written support terms. Ask the team whether the curriculum fits the role you are researching." primaryTo="/courses/" primaryLabel="Compare course details" primaryAnalyticsIntent="commercial_program" secondaryTo="/contact/" secondaryLabel="Ask about course fit" />
    </>
  );
}
