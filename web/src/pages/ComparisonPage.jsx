import React from 'react';
import { ArrowRight, CalendarDays, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';
import InternalLinkGroup from '@/components/InternalLinkGroup.jsx';
import { CtaSection, PageHero, SectionHeading } from '@/components/PageShell.jsx';
import { COMPARISON_PAGE } from '@/content/comparisonPage.js';
import { getInternalLinks } from '@/seo/internalLinks.js';
import { getSeoRoute } from '@/seo/seoRoutes.js';

function OfficialSourceLink({ provider }) {
  return (
    <a href={provider.officialUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">
      <span>Open official source</span>
      <ExternalLink className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" />
    </a>
  );
}

export default function ComparisonPage() {
  const route = getSeoRoute(COMPARISON_PAGE.routeId);

  return (
    <>
      <PageHero routeId={route.id} eyebrow="Neutral comparison guide" title={COMPARISON_PAGE.h1} intro={COMPARISON_PAGE.description}>
        <p className="mt-6 inline-flex items-center gap-2 text-sm text-white/70"><CalendarDays className="h-4 w-4" aria-hidden="true" />Public-source snapshot reviewed <time dateTime={COMPARISON_PAGE.updatedAt}>{COMPARISON_PAGE.updatedAt}</time></p>
      </PageHero>

      <article data-comparison-page={COMPARISON_PAGE.id} data-comparison-review-status={COMPARISON_PAGE.reviewStatus} data-comparison-review-date={COMPARISON_PAGE.updatedAt} className="bg-white py-14 sm:py-20">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <aside data-comparison-neutral-notice className="rounded-2xl border border-accent/40 bg-accent/10 p-6 text-primary sm:p-7">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-accent-ink" aria-hidden="true" />
              <div>
                <h2 className="text-xl font-bold text-primary">Neutral public-source comparison</h2>
                <p className="mt-2 leading-relaxed">This page describes selected provider pages as of the review date. It does not rank providers, repeat employment or salary outcomes, use provider logos, copy source text, or imply endorsement, partnership, sponsorship, or affiliation. Open each official source and confirm current terms before enrolling.</p>
              </div>
            </div>
          </aside>

          <div data-comparison-direct-answer className="mt-10 rounded-2xl border border-border bg-muted/40 p-7 text-lg leading-relaxed text-primary sm:p-9">
            <p>{COMPARISON_PAGE.directAnswer}</p>
          </div>

          <section data-comparison-criteria aria-labelledby="comparison-criteria-title" className="mt-14">
            <SectionHeading id="comparison-criteria-title" eyebrow="Decision framework" title="What to compare before you enrol" intro="Course labels can describe very different learning experiences. Use the same questions for every provider, including Centaur Careers." />
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {COMPARISON_PAGE.criteria.map((criterion) => (
                <article key={criterion.name} className="rounded-2xl border border-border bg-muted/30 p-6 shadow-sm">
                  <h3 className="text-xl font-bold text-primary">{criterion.name}</h3>
                  <p className="mt-3 font-semibold text-primary/80">{criterion.question}</p>
                  <p className="mt-3 leading-relaxed text-muted-foreground">{criterion.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section data-comparison-matrix aria-labelledby="comparison-matrix-title" className="mt-16">
            <SectionHeading id="comparison-matrix-title" eyebrow="Public-source snapshot" title="How selected provider pages describe their offer" intro={`The summaries below reflect official pages reviewed on ${COMPARISON_PAGE.updatedAt}. They are not independent ratings. Open the source and confirm the exact batch terms before relying on any detail.`} />
            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="min-w-[960px] w-full border-collapse text-left text-sm">
                <caption className="sr-only">Public-source comparison of selected investment banking operations course providers</caption>
                <thead className="bg-primary text-white">
                  <tr>
                    <th scope="col" className="w-[20%] p-5 font-bold">Provider or programme</th>
                    <th scope="col" className="w-[39%] p-5 font-bold">What the official page describes</th>
                    <th scope="col" className="w-[31%] p-5 font-bold">What to verify for your batch</th>
                    <th scope="col" className="w-[10%] p-5 font-bold">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_PAGE.providers.map((provider) => (
                    <tr key={provider.name} className="border-t border-border align-top even:bg-muted/30">
                      <th scope="row" className="p-5 font-bold text-primary">{provider.name}</th>
                      <td className="p-5 leading-relaxed text-foreground/80">{provider.publishedFocus}</td>
                      <td className="p-5 leading-relaxed text-muted-foreground">{provider.verify}</td>
                      <td className="p-5"><OfficialSourceLink provider={provider} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Provider names and marks belong to their respective owners. Their inclusion identifies the source being compared and does not imply endorsement, partnership, sponsorship, or affiliation with Centaur Careers.</p>
          </section>

          <section data-comparison-centaur aria-labelledby="comparison-centaur-title" className="mt-16 rounded-2xl border border-border bg-primary p-7 text-white sm:p-9">
            <SectionHeading id="comparison-centaur-title" eyebrow="Centaur Careers" title={COMPARISON_PAGE.centaur.name} intro={COMPARISON_PAGE.centaur.focus} light />
            <div className="grid gap-5 md:grid-cols-2">
              <div className="rounded-xl border border-white/15 bg-white/10 p-5">
                <h3 className="text-lg font-bold text-white">Published access information</h3>
                <p className="mt-3 leading-relaxed text-white/75">{COMPARISON_PAGE.centaur.access}</p>
              </div>
              <div className="rounded-xl border border-white/15 bg-white/10 p-5">
                <h3 className="text-lg font-bold text-white">Compare the complete program details</h3>
                <p className="mt-3 leading-relaxed text-white/75">{COMPARISON_PAGE.centaur.verify}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/courses/" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-primary">Review the Masterclass <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              <Link to="/india/" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-5 py-3 font-bold text-white">Review India-wide access <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
          </section>

          <section data-comparison-checklist aria-labelledby="comparison-checklist-title" className="mt-16">
            <SectionHeading id="comparison-checklist-title" eyebrow="Before payment" title="A practical comparison checklist" intro="Keep a dated record of what each provider confirms, especially when a page, brochure, or counsellor describes different terms." />
            <ol className="space-y-4">
              {COMPARISON_PAGE.checklist.map((item, index) => <li key={item} className="flex gap-4 rounded-xl border border-border p-5"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white" aria-hidden="true">{index + 1}</span><span className="leading-relaxed text-foreground/85">{item}</span></li>)}
            </ol>
          </section>

          <section data-comparison-faq={COMPARISON_PAGE.id} aria-labelledby="comparison-faq-title" className="mt-16">
            <SectionHeading id="comparison-faq-title" eyebrow="Comparison FAQs" title="Questions learners ask while comparing courses" intro="These answers explain the comparison method; they do not rank providers or replace current provider terms." />
            <div className="space-y-4">
              {COMPARISON_PAGE.faqs.map(({ question, answer }) => (
                <details key={question} className="group rounded-2xl border border-border bg-muted/40 p-6 open:border-accent/50 open:bg-white open:shadow-sm">
                  <summary className="cursor-pointer list-none pr-8 text-lg font-bold text-primary marker:hidden">{question}</summary>
                  <p className="mt-4 leading-relaxed text-muted-foreground">{answer}</p>
                </details>
              ))}
            </div>
          </section>

          <section data-comparison-sources aria-labelledby="comparison-sources-title" className="mt-16 rounded-2xl bg-muted p-7 sm:p-9">
            <SectionHeading id="comparison-sources-title" eyebrow="Source register" title="Official pages used for this comparison" intro="Source pages and brochures can change. The review date is shown above; open the official source and confirm the exact batch terms before relying on a detail." />
            <ul className="grid gap-3 sm:grid-cols-2">
              {COMPARISON_PAGE.sources.map((source) => <li key={source.href}><a href={source.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-start gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4"><span>{source.label}</span><ExternalLink className="mt-1 h-4 w-4 shrink-0" aria-hidden="true" /></a></li>)}
            </ul>
          </section>
        </div>
      </article>

      <InternalLinkGroup links={getInternalLinks(COMPARISON_PAGE.routeId)} />
      <CtaSection title="Compare the program with your learning goal" description="Review the Financial Operations Masterclass curriculum, delivery, fees, certificate wording, and written support terms, then ask the team about any remaining questions." primaryTo="/courses/" primaryLabel="Review course details" primaryAnalyticsIntent="commercial_program" secondaryTo="/contact/" secondaryLabel="Ask a specific question" />
    </>
  );
}
