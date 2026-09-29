import React from 'react';
import { ArrowRight, CalendarDays, ExternalLink } from 'lucide-react';
import { Link } from 'react-router';
import InternalLinkGroup from '@/components/InternalLinkGroup.jsx';
import { CtaSection, PageHero, SectionHeading } from '@/components/PageShell.jsx';
import { BUSINESS_DATA } from '@/content/businessData.js';
import { getRegionalPage, REGIONAL_PAGES } from '@/content/regionalPages.js';
import { JOB_GUARANTEE } from '@/content/sourceContent.js';
import { getInternalLinks } from '@/seo/internalLinks.js';
import { getSeoRoute } from '@/seo/seoRoutes.js';

function RegionalSources({ page }) {
  return (
    <section data-regional-evidence aria-labelledby={`${page.id}-evidence-title`} className="bg-muted py-16 sm:py-20">
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionHeading
          id={`${page.id}-evidence-title`}
          eyebrow="Public sources"
          title="Research links behind this regional guide"
          intro="These sources support the market context only. They do not represent employer endorsements, employment promises, or Centaur Careers branches. Recheck dated information before making career decisions."
        />
        <ul className="grid gap-4 md:grid-cols-3">
          {page.evidence.map((source) => (
            <li key={source.href} className="rounded-2xl border border-border bg-white p-6 shadow-sm">
              <a href={source.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 font-bold leading-relaxed text-primary underline decoration-accent decoration-2 underline-offset-4">
                <span>{source.label}</span>
                <ExternalLink className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
              </a>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{source.note}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-muted-foreground">Source review date: <time dateTime={page.sourceReviewedAt || page.updatedAt}>{page.sourceReviewedAt || page.updatedAt}</time>. No compensation range is reproduced because role, employer, experience, shift, and location can change the result.</p>
      </div>
    </section>
  );
}

function RegionalNavigation({ page }) {
  const otherPages = REGIONAL_PAGES.filter((candidate) => candidate.id !== page.id);

  return (
    <nav data-regional-navigation aria-label="Published regional guides" className="mt-12 rounded-2xl bg-muted p-6">
      <h2 className="text-xl font-bold text-primary">Other published regional guides</h2>
      <p className="mt-2 text-muted-foreground">These guides are published selectively because each has its own market evidence and access explanation.</p>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2">
        <li><Link to="/india/" className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Finance operations training across India</Link></li>
        {otherPages.map((candidate) => (
          <li key={candidate.id}><Link to={candidate.path} className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">{candidate.h1}</Link></li>
        ))}
      </ul>
    </nav>
  );
}

export default function RegionalPage({ regionId }) {
  const page = getRegionalPage(regionId);
  if (!page) return null;

  const route = getSeoRoute(page.routeId);
  const regionalPlacementFaq = {
    question: `Does Centaur Careers' 100% Job Guarantee Program apply to learners in ${page.regionName}?`,
    answer: `Centaur Careers lists its ${JOB_GUARANTEE.label} for graduates and job switchers who complete the six-week Financial Operations Masterclass. Learners in ${page.regionName} can join live online. This regional guide does not announce local vacancies or promise a city-specific placement; review the Placements summary and request current written cohort terms.`,
    termsPath: JOB_GUARANTEE.termsPath,
  };
  const regionalFaqs = [...page.faqs, regionalPlacementFaq];
  const regionalWhatsAppUrl = `https://wa.me/${BUSINESS_DATA.telephone.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi Centaur Careers, I am researching live online finance training from ${page.regionName}. Please share the current cohort, fees, syllabus, and online-access details.`)}`;

  return (
    <>
      <PageHero routeId={route.id} eyebrow={`${page.regionName} regional guide`} title={page.h1} intro={page.description}>
        <p className="mt-6 inline-flex items-center gap-2 text-sm text-white/70"><CalendarDays className="h-4 w-4" aria-hidden="true" />Guide updated {page.updatedAt}</p>
      </PageHero>

      <article
        data-regional-page={page.id}
        data-regional-market={page.id}
        data-regional-keyword-owner={page.path}
        data-regional-online-owner="/india/"
        data-high-value-page={page.routeId}
        className="bg-white py-14 sm:py-20"
      >
        <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
          <div data-regional-direct-answer className="rounded-2xl border border-accent/30 bg-accent/10 p-7 text-lg leading-relaxed text-primary sm:p-9">
            <p>{page.directAnswer}</p>
          </div>

          <section data-regional-program-answer data-regional-online-access data-high-value-section="regional-commercial-bridge" aria-labelledby={`${page.id}-program-answer-title`} className="mt-8 rounded-2xl border border-border bg-white p-7 sm:p-9">
            <h2 id={`${page.id}-program-answer-title`} className="text-2xl font-bold text-primary">{page.courseQuestion}</h2>
            <p className="mt-3 leading-relaxed text-foreground/85">Centaur Careers offers one six-week Financial Operations Masterclass with an investment banking operations module. Learners in {page.regionName} can join live online; the published in-person option is in Lucknow. Review the full curriculum and ask the team to confirm the current cohort schedule, fees, certificate, and written support terms before enrolling. This page does not claim a classroom or a city-specific job in {page.regionName}.</p>
            <div className="mt-5 flex flex-wrap gap-4">
              <Link to="/courses/" className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Review the full program <ArrowRight className="inline h-4 w-4" aria-hidden="true" /></Link>
              <Link to="/placements/" className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Review placement support <ArrowRight className="inline h-4 w-4" aria-hidden="true" /></Link>
              <Link to={JOB_GUARANTEE.termsPath} className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Read the 100% Job Guarantee summary <ArrowRight className="inline h-4 w-4" aria-hidden="true" /></Link>
              <Link to="/contact/" className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Ask about live online access <ArrowRight className="inline h-4 w-4" aria-hidden="true" /></Link>
            </div>
          </section>

          <section data-regional-search-scope aria-labelledby={`${page.id}-search-scope-title`} className="mt-14 rounded-2xl border border-border bg-muted/40 p-7 sm:p-9">
            <SectionHeading
              id={`${page.id}-search-scope-title`}
              eyebrow="Local search scope"
              title={`Compare finance roles across ${page.regionName}`}
              intro={page.localAreaNote}
            />
            <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
              <div>
                <h3 className="text-lg font-bold text-primary">Areas to check in current postings</h3>
                <ul className="mt-4 flex flex-wrap gap-2" aria-label={`Search areas in ${page.regionName}`}>
                  {page.localAreas.map((area) => (
                    <li key={area} className="rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-primary">{area}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-border bg-white p-5 text-sm leading-relaxed text-muted-foreground">
                <p className="font-bold text-primary">Use location as a decision filter</p>
                <p className="mt-2">A city name can cover several employment corridors. Match the exact location with the role workflow, onsite or hybrid requirement, shift, and commute before deciding whether a course or vacancy fits.</p>
              </div>
            </div>
          </section>

          <section data-regional-market-context aria-labelledby={`${page.id}-market-title`} className="mt-14">
            <SectionHeading
              id={`${page.id}-market-title`}
              align="left"
              eyebrow={`${page.regionName} employment context`}
              title={`How to read the ${page.regionName} finance market`}
              intro="Use the regional signals below to interpret job descriptions. They describe a research context, not a promise that any particular vacancy is open."
            />
            <div className="space-y-5 text-base leading-relaxed text-foreground/85">
              {page.marketSignals.map((signal) => <p key={signal}>{signal}</p>)}
            </div>
          </section>

          <section data-regional-role-signals aria-labelledby={`${page.id}-roles-title`} className="mt-14 rounded-2xl border border-border bg-muted/40 p-7 sm:p-9">
            <SectionHeading id={`${page.id}-roles-title`} eyebrow="Role directions" title={`Finance operations roles to research in ${page.regionName}`} intro="Treat these as search directions. The employer’s current description remains the source of truth for responsibilities, qualifications, location, and work model." />
            <ul className="grid gap-4 md:grid-cols-2">
              {page.roleSignals.map((role) => <li key={role} className="flex items-start gap-3 rounded-xl border border-border bg-white p-4 text-foreground/85"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent-ink" aria-hidden="true" /><span>{role}</span></li>)}
            </ul>
          </section>

          <section data-regional-workflow-pathways aria-labelledby={`${page.id}-workflow-title`} className="mt-14 rounded-2xl border border-border bg-white p-7 shadow-sm sm:p-9">
            <SectionHeading
              id={`${page.id}-workflow-title`}
              eyebrow="Canonical workflow guides"
              title={`Follow the operations path behind ${page.regionName} searches`}
              intro="Use these existing guides and resources to move from a regional job-search question to the workflow itself. They explain general learning context and do not represent local vacancies, branches, or employer endorsements."
            />
            <div className="grid gap-4 md:grid-cols-3">
              {page.workflowLinks.map((link) => (
                <Link key={link.path} to={link.path} data-regional-workflow-pathway={link.path} className="rounded-xl border border-border bg-muted/30 p-5 font-bold leading-relaxed text-primary underline decoration-accent decoration-2 underline-offset-4">
                  {link.label} <ArrowRight className="inline h-4 w-4" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </section>

          <section data-regional-role-example aria-labelledby={`${page.id}-example-title`} className="mt-14 rounded-2xl border border-accent/30 bg-accent/10 p-7 sm:p-9">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent-ink">Illustrative job-search example</p>
            <h2 id={`${page.id}-example-title`} className="mt-3 text-2xl font-bold text-primary">{page.localResearchExample.title}</h2>
            <p className="mt-3 leading-relaxed text-foreground/85">{page.localResearchExample.situation}</p>
            <p className="mt-3 leading-relaxed text-foreground/85">{page.localResearchExample.decision}</p>
            <Link to={page.localResearchExample.guidePath} className="mt-5 inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">{page.localResearchExample.guideLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </section>

          <section data-regional-research-checklist aria-labelledby={`${page.id}-research-title`} className="mt-14">
            <SectionHeading id={`${page.id}-research-title`} eyebrow="Practical job research" title={`A focused search method for ${page.regionName}`} intro="Regional search quality improves when you match your preparation to the workflow, location, and controls named in the posting." />
            <ol className="space-y-4">
              {page.practicalResearch.map((step, index) => <li key={step} className="flex gap-4 rounded-xl border border-border p-5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white" aria-hidden="true">{index + 1}</span><span className="leading-relaxed text-foreground/85">{step}</span></li>)}
            </ol>
          </section>

          <section data-regional-access-boundary aria-labelledby={`${page.id}-access-title`} className="mt-14 rounded-2xl border border-border bg-primary p-7 text-white sm:p-9">
            <h2 id={`${page.id}-access-title`} className="text-2xl font-bold text-white">How learners in {page.regionName} access Centaur Careers</h2>
            <p className="mt-4 leading-relaxed text-white/75">{page.accessText}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/india/" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-primary">Review India-wide access <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              <Link to="/contact/" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 font-bold text-white">Confirm current terms <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              <a href={regionalWhatsAppUrl} target="_blank" rel="noopener noreferrer" data-analytics-id={`regional-${page.id}-whatsapp`} data-analytics-intent="regional_online_access" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-accent/50 bg-accent/10 px-5 py-3 font-bold text-white">Ask about {page.regionName} access <ArrowRight className="h-4 w-4" aria-hidden="true" /></a>
            </div>
          </section>

          <section data-regional-faq={page.id} aria-labelledby={`${page.id}-faq-title`} className="mt-14">
            <SectionHeading id={`${page.id}-faq-title`} eyebrow={`${page.regionName} FAQs`} title={`Questions about finance training and jobs in ${page.regionName}`} intro={page.faqIntro} />
            <div className="space-y-4">
              {regionalFaqs.map(({ question, answer, termsPath }) => (
                <details key={question} className="group rounded-2xl border border-border bg-muted/40 p-6 open:border-accent/50 open:bg-white open:shadow-sm">
                  <summary className="cursor-pointer list-none pr-8 text-lg font-bold text-primary marker:hidden">{question}</summary>
                  <p className="mt-4 leading-relaxed text-muted-foreground">{answer}</p>
                  {termsPath && <Link to={termsPath} className="mt-3 inline-flex font-semibold text-primary underline decoration-accent decoration-2 underline-offset-4">Review the published Job Guarantee summary</Link>}
                </details>
              ))}
            </div>
          </section>

          <RegionalNavigation page={page} />
          <p className="mt-10 text-sm leading-relaxed text-muted-foreground">This regional guide combines public market references with general career guidance. Confirm the current curriculum, learning mode, and cohort details before applying.</p>
        </div>
      </article>

      <RegionalSources page={page} />
      <InternalLinkGroup links={getInternalLinks(page.routeId)} />
      <CtaSection
        title={`Continue your ${page.regionName} finance career research`}
        description="Review the Financial Operations Masterclass, compare the regional workflow directions above with current job descriptions, and contact Centaur Careers with questions about online access."
        primaryLabel={`Ask about ${page.regionName} online access`}
        primaryHref={regionalWhatsAppUrl}
        primaryAnalyticsId={`regional-${page.id}-cta`}
        primaryAnalyticsIntent="regional_online_access"
      />
    </>
  );
}
