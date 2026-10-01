import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import InternalLinkGroup from '@/components/InternalLinkGroup.jsx';
import { CtaSection, PageHero, SectionHeading } from '@/components/PageShell.jsx';
import { JOB_GUARANTEE, LEARNING_MODES, PROGRAM, PROGRAM_PROCESS, CAREER_TRACKS } from '@/content/sourceContent.js';
import { CAREER_GUIDE_TOPIC_MAP } from '@/content/careerGuides.js';
import { INDIA_PAGE } from '@/content/indiaPage.js';
import { REGIONAL_EXPANSION_POLICY, REGIONAL_PAGES } from '@/content/regionalPages.js';
import { getCourseModulePath } from '@/content/courseModulePaths.js';
import { getInternalLinks } from '@/seo/internalLinks.js';

const careerGuideByTrack = Object.freeze({
  'kyc-aml-compliance': '/career-guides/kyc-aml-analyst/',
  'digital-payments': '/career-guides/digital-payments-operations/',
});

function trackHref(track) {
  return getCourseModulePath(track.id) || track.route || careerGuideByTrack[track.id] || '/career-guides/';
}

export default function IndiaPage() {
  return (
    <>
      <PageHero routeId="india" eyebrow="India-wide access" title={INDIA_PAGE.h1} intro={INDIA_PAGE.description} />

      <section className="border-b border-accent/25 bg-accent/15 py-8" aria-label="100% Job Guarantee Program">
        <div className="container mx-auto flex max-w-7xl flex-col justify-between gap-5 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-accent-foreground">{JOB_GUARANTEE.label}</p>
            <p className="mt-2 max-w-3xl leading-relaxed text-foreground/80">{JOB_GUARANTEE.description} {JOB_GUARANTEE.shortQualifier}</p>
          </div>
          <Link to={JOB_GUARANTEE.termsPath} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white">View program details <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </section>

      <section data-high-value-page="india" data-national-page="india" className="bg-white py-16 sm:py-20" aria-label="Finance operations training across India">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div data-national-direct-answer className="mx-auto mb-14 max-w-4xl rounded-2xl border border-accent/30 bg-accent/10 p-7 text-lg leading-relaxed text-primary sm:p-9">
            <p>{INDIA_PAGE.directAnswer}</p>
          </div>

          <div data-high-value-section="national-commercial-bridge" className="mx-auto mb-14 max-w-4xl rounded-2xl border border-border bg-muted p-7 sm:p-9">
            <h2 className="text-2xl font-bold text-primary">Online finance course in India: choose a live learning mode</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">Centaur Careers teaches investment banking operations as part of one Financial Operations Masterclass. Check the trade settlement, reconciliation, corporate actions, and fund accounting topics against the work you want to learn. Then choose live online access from your city or the published Lucknow option, and confirm the current schedule, fees, assessment, and written support terms. The full programme details and enquiry route are on the course page.</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/courses/" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white">Review the full program <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              <Link to="/contact/" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border bg-white px-5 py-3 font-bold text-primary">Ask about access and fees <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
          </div>

          <SectionHeading
            eyebrow="One program, multiple finance directions"
            title="Explore the Financial Operations Masterclass topics"
            intro="Centaur Careers presents these areas as subjects, modules, and career directions within the Financial Operations Masterclass. Start with the topic that matches the work you want to understand, then review the full curriculum before applying."
            align="center"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CAREER_TRACKS.map((track) => (
              <article key={track.id} className="flex flex-col rounded-2xl border border-border bg-muted/30 p-6 shadow-sm">
                <h2 className="text-xl font-bold text-primary">{track.title}</h2>
                <p className="mt-3 flex-1 leading-relaxed text-muted-foreground">{track.description}</p>
                <Link to={trackHref(track)} className="mt-5 inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">
                  Read the {track.title} module guide <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>

          <div data-national-operations-map className="mx-auto mt-14 max-w-7xl" aria-labelledby="national-operations-map-title">
            <SectionHeading
              id="national-operations-map-title"
              eyebrow="Operations search pathways"
              title="Explore the finance-operations workflow you want to understand"
              intro="The India-wide page connects national online-access questions to one canonical guide or resource for each workflow. These are general learning and career paths, not separate Centaur Careers courses, regional branches, or employer promises."
              align="center"
            />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {CAREER_GUIDE_TOPIC_MAP.map((topic) => (
                <article key={topic.id} data-national-operations-topic={topic.id} className="flex flex-col rounded-2xl border border-border bg-muted/30 p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-primary">{topic.label}</h3>
                  <p className="mt-3 flex-1 leading-relaxed text-muted-foreground">{topic.question}</p>
                  <div className="mt-5 space-y-3">
                    <Link to={topic.primaryPath} className="block font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">{topic.primaryLabel} <ArrowRight className="inline h-4 w-4" aria-hidden="true" /></Link>
                    <Link to={topic.supportPath} className="block text-sm font-semibold text-accent-ink underline decoration-accent decoration-2 underline-offset-4">{topic.supportLabel} <ArrowRight className="inline h-4 w-4" aria-hidden="true" /></Link>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-muted py-16 sm:py-20" aria-label="Online and offline learning modes">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Choose your learning mode"
            title="Live online finance course access across India"
            intro="Learners comparing online finance courses can join the live national-access option, while the published in-person option is available at Mindsprout Career Hub, Lucknow. Confirm the current cohort schedule, fees, and terms with Centaur Careers."
            align="center"
          />
          <div className="grid gap-6 lg:grid-cols-2">
            {LEARNING_MODES.map((mode) => (
              <article key={mode.name} className="rounded-2xl border border-border bg-white p-7 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent-ink">{mode.name} mode</p>
                <h2 className="mt-3 text-2xl font-bold text-primary">{mode.name === 'Online' ? 'Live online banking and finance course' : 'In-person finance course in Lucknow'}</h2>
                <p className="mt-3 text-sm font-semibold text-accent-ink">Current published fee</p>
                <div className="mt-3 flex items-baseline gap-3">
                  <span className="text-3xl font-extrabold text-primary">{mode.price}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Reference fee: {mode.originalPrice}. {mode.note} Confirm the total payable amount and written cohort terms before paying.</p>
                <p className="mt-3 text-muted-foreground">{mode.name === 'Online'
                  ? 'The live online route is available across India.'
                  : 'The offline route is the published in-person learning option at Mindsprout Career Hub, Lucknow.'}</p>
                <ul className="mt-6 space-y-3 text-sm text-foreground/80">
                  {mode.features.slice(0, 4).map((feature) => <li key={feature} className="flex items-start gap-3"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-ink" aria-hidden="true" />{feature}</li>)}
                </ul>
                <Link to={mode.name === 'Offline' ? '/locations/lucknow/' : '/contact/'} className="mt-6 inline-flex min-h-11 items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">
                  {mode.name === 'Offline' ? 'View the Lucknow location' : 'Ask about online access'} <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
          <div data-national-location-boundary className="mx-auto mt-8 max-w-4xl rounded-2xl border border-border bg-white p-7 text-muted-foreground shadow-sm">
            <h2 className="text-2xl font-bold text-primary">Where are in-person classes available?</h2>
            <p className="mt-3">The published physical learning location is Mindsprout Career Hub in Lucknow. Students elsewhere in India can ask about the online mode; do not assume a Centaur Careers classroom or branch exists in another city unless the team confirms it.</p>
            <Link to="/locations/lucknow/" className="mt-5 inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">See the verified Lucknow location <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </div>
      </section>

      <section data-regional-guides className="bg-white py-16 sm:py-20" aria-label="Published regional finance career guides">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Selective regional research"
            title="Explore published regional finance-career guides"
            intro="These pages add local employment context to the India-wide access information. They are published only where distinct public evidence and a useful learner-access explanation are available; they do not represent Centaur Careers branches."
            align="center"
          />
          <div className="grid gap-5 md:grid-cols-3">
            {REGIONAL_PAGES.map((page) => (
              <article key={page.id} className="flex flex-col rounded-2xl border border-border bg-muted/30 p-6 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent-ink">{page.regionName}</p>
                <h2 className="mt-3 text-xl font-bold text-primary">{page.h1}</h2>
                <p className="mt-3 flex-1 leading-relaxed text-muted-foreground">{page.directAnswer}</p>
                <Link to={page.path} className="mt-5 inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Read the regional guide <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              </article>
            ))}
          </div>
          <aside data-regional-publishing-policy className="mx-auto mt-8 max-w-4xl rounded-2xl border border-accent/30 bg-accent/10 p-6 text-primary sm:p-7">
            <h2 className="text-xl font-bold">Why local coverage is selective</h2>
            <p className="mt-3 leading-relaxed">{REGIONAL_EXPANSION_POLICY.selectionRule} These guides add market context; they do not claim a Centaur Careers branch, local placement result, or employer relationship. {REGIONAL_EXPANSION_POLICY.localScopeRule} {REGIONAL_EXPANSION_POLICY.accessBoundary}</p>
            <Link to="/contact/" className="mt-5 inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Ask about the right access route <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </aside>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20" aria-label="How the program works for India-wide learners">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="A clear next step"
            title={`How the ${PROGRAM.name} pathway is described`}
            intro="The existing program process gives learners a simple sequence to review. The exact cohort requirements and availability remain provider-specific."
            align="center"
          />
          <div className="grid gap-6 md:grid-cols-3">
            {PROGRAM_PROCESS.map((step) => (
              <article key={step.step} className="rounded-2xl border border-border bg-muted/30 p-6">
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent-ink">{step.step}</p>
                <h2 className="mt-3 text-2xl font-bold text-primary">{step.title}</h2>
                <p className="mt-2 font-semibold text-primary/75">{step.subtitle}</p>
                <ul className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
                  {step.items.slice(0, 3).map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-national-faq="india" className="bg-muted py-16 sm:py-20" aria-label="India-wide learner FAQs">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="India learner FAQs" title="Questions about joining from another city" intro="These answers distinguish online access from the published Lucknow location and keep current program details confirmation-controlled." />
          <div className="space-y-4">
            {INDIA_PAGE.faqs.map(({ question, answer }) => (
              <details key={question} className="group rounded-2xl border border-border bg-white p-6 open:border-accent/50 open:shadow-sm">
                <summary className="cursor-pointer list-none pr-8 text-lg font-bold text-primary marker:hidden">{question}</summary>
                <p className="mt-4 text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20" aria-label="India-wide next steps">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Research before you apply" title="Use the right page for the next question" intro="Read the program page for current provider information, the career guides for general role context, and the resources for interview preparation." align="center" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link to="/courses/" className="rounded-xl border border-border bg-muted/30 p-5 font-bold text-primary transition hover:-translate-y-0.5 hover:border-accent">Financial Operations Masterclass</Link>
            <Link to="/career-guides/" className="rounded-xl border border-border bg-muted/30 p-5 font-bold text-primary transition hover:-translate-y-0.5 hover:border-accent">Finance career guides</Link>
            <Link to="/resources/" className="rounded-xl border border-border bg-muted/30 p-5 font-bold text-primary transition hover:-translate-y-0.5 hover:border-accent">Interview resources</Link>
            <Link to="/contact/" className="rounded-xl border border-border bg-muted/30 p-5 font-bold text-primary transition hover:-translate-y-0.5 hover:border-accent">Contact Centaur Careers</Link>
          </div>
        </div>
      </section>

      <InternalLinkGroup
        links={getInternalLinks('india')}
        featuredRouteIds={['courses', 'career-guides', 'resources', 'placements', 'lucknow-location', 'india-delhi-ncr', 'india-bengaluru', 'india-mumbai', 'india-pune', 'india-hyderabad', 'contact']}
        visibleCount={12}
      />
      <CtaSection secondaryTo="/courses/" title="Explore finance operations training across India" description="Review the current Financial Operations Masterclass information, confirm the learning mode that fits you, and contact Centaur Careers with your questions." />
    </>
  );
}
