import React from 'react';
import { ArrowRight, BriefcaseBusiness, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router';
import { HomePlacementShowcase } from '@/components/home/HomePlacementShowcase.jsx';
import { PageHero, SectionHeading } from '@/components/PageShell.jsx';
import { TESTIMONIALS } from '@/content/sourceContent.js';
import { createRouteMeta, getSeoRoute } from '@/seo/seoRoutes.js';

export function meta() {
  return createRouteMeta('student-outcomes');
}

export default function StudentOutcomesPage() {
  const seo = getSeoRoute('student-outcomes');

  return (
    <>
      <PageHero
        routeId="student-outcomes"
        eyebrow="Learner outcomes"
        title={seo.h1}
        intro="Explore individual Centaur Careers learner profiles, current role titles, and employer marks. These examples show individual career outcomes; they are not a cohort-wide placement rate."
        sideContent={(
          <aside className="rounded-3xl border border-white/15 bg-white/[0.07] p-6 shadow-2xl backdrop-blur sm:p-8" aria-label="How to read learner outcomes">
            <BriefcaseBusiness className="h-8 w-8 text-accent" aria-hidden="true" />
            <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-accent">Learner stories</p>
            <h2 className="mt-2 text-2xl font-bold leading-tight text-white">Where our learners work</h2>
            <p className="mt-3 leading-relaxed text-white/75">Meet some of our learners and see the roles they’ve taken up in banking and finance. Every career journey is different.</p>
            <Link to="/placements/" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 px-4 py-3 font-semibold text-white transition hover:bg-white/10">How does the job guarantee work? <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </aside>
        )}
      />

      <HomePlacementShowcase
        sectionName="student-outcome-profiles"
        eyebrow="Candidate profiles"
        title="Learners who have moved into finance roles"
        intro="Browse the published learner profiles and their role and employer details."
        showLink={false}
      />

      <section className="bg-primary py-16 text-white sm:py-20" aria-labelledby="student-stories-title">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            id="student-stories-title"
            eyebrow="Learner testimonials"
            title="Learner stories"
            intro="Individual learners describe their experience with training and interview preparation. Testimonials are personal accounts and do not define every learner’s experience."
            align="center"
            light
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2">
            {TESTIMONIALS.map(({ name, role, quote, companyLogo }) => {
              const [jobTitle, ...companyParts] = role.split(', ');
              const company = companyParts.join(', ');
              return (
                <article key={name} className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.06] p-6 sm:p-7">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Student story</p>
                  <blockquote className="mt-4 flex-1 text-lg leading-relaxed text-white/90">“{quote}”</blockquote>
                  <div className="mt-7 border-t border-white/10 pt-5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <p className="break-words text-lg font-bold text-white">{name}</p>
                        <p className="mt-1 text-sm leading-relaxed text-white/65">{jobTitle}</p>
                      </div>
                      <img
                        src={companyLogo}
                        alt={`${company} logo`}
                        width="160"
                        height="72"
                        loading="lazy"
                        decoding="async"
                        className="h-12 w-28 shrink-0 rounded bg-white p-1 object-contain"
                      />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-muted py-12 sm:py-16" aria-label="How placements relate to the job guarantee">
        <div className="container mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[auto_1fr_auto] lg:items-center lg:px-8">
          <ShieldCheck className="h-10 w-10 text-accent-ink" aria-hidden="true" />
          <div>
            <h2 className="text-2xl font-bold text-primary">Understand the guarantee separately</h2>
            <p className="mt-2 max-w-3xl leading-relaxed text-muted-foreground">The published 100% Job Guarantee Program applies to graduates and job switchers who complete the six-week Financial Operations Masterclass. Review the current terms for eligibility and scope; learner profiles and testimonials are not a substitute for those terms.</p>
          </div>
          <Link to="/placements/#job-guarantee-terms" className="inline-flex min-h-11 items-center gap-2 font-bold text-primary underline decoration-accent-ink decoration-2 underline-offset-4">Read guarantee terms <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </section>
    </>
  );
}
