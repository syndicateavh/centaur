import React from 'react';
import { CheckCircle2, Quote, ShieldCheck } from 'lucide-react';
import { CtaSection, PageHero, SectionHeading } from '@/components/PageShell.jsx';
import {
  EMPLOYER_LOGO_NAMES,
  GUARANTEE_ELIGIBILITY,
  HIRING_PARTNERS,
  ORIGINAL_OUTCOME_STATEMENTS,
  PLACEMENT_PROMISE,
  PLACEMENT_TIERS,
  TESTIMONIALS,
} from '@/content/sourceContent.js';
import { getSeoRoute } from '@/seo/seoRoutes.js';

export default function PlacementsPage() {
  const seo = getSeoRoute('placements');

  return (
    <>
      <PageHero
        routeId="placements"
        eyebrow="Our Commitment to You"
        title={seo.h1}
        intro={PLACEMENT_PROMISE.description}
      >
        <div className="mt-8 grid max-w-4xl gap-3 text-sm sm:grid-cols-3">
          <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">100+ Students Placed</span>
          <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">105+ Finance Roles</span>
          <span className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">200+ Leading Companies Across Banking, NBFCs &amp; FinTech</span>
        </div>
      </PageHero>

      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Placement Guarantee & Student Promise" title="A structured pathway to placement" align="center" />
          <div className="grid gap-6 md:grid-cols-3">
            {PLACEMENT_PROMISE.cards.map(({ title, description }) => (
              <article key={title} className="rounded-2xl border border-border p-7 shadow-sm">
                <ShieldCheck className="h-7 w-7 text-accent" />
                <h2 className="mt-5 text-xl font-bold text-primary">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary py-16 text-white sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Assessment-Based Placement Tiers" title="Placement Tiers" align="center" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {PLACEMENT_TIERS.map(({ tier, range, perks }) => (
              <article key={tier} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-bold text-white">{tier}</h2>
                <p className="mt-2 text-2xl font-black text-accent">{range}</p>
                <ul className="mt-5 space-y-3">
                  {perks.map((perk) => (
                    <li key={perk} className="flex items-start gap-2 text-sm text-white/70">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {perk}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <p className="mx-auto mt-7 max-w-3xl text-center text-sm text-white/60">{PLACEMENT_PROMISE.scoreNote}</p>
        </div>
      </section>

      <section className="bg-muted py-16 sm:py-20">
        <div className="container mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_0.8fr] lg:px-8">
          <article className="rounded-2xl bg-white p-8 shadow-sm">
            <h2 className="text-3xl font-bold text-primary">Guarantee Eligibility</h2>
            <ul className="mt-6 space-y-4">
              {GUARANTEE_ELIGIBILITY.map((item) => (
                <li key={item} className="flex items-start gap-3 text-foreground/80">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" /> {item}
                </li>
              ))}
            </ul>
            <p className="mt-7 text-sm font-semibold text-primary">{PLACEMENT_PROMISE.termsNote}</p>
          </article>
          <aside className="rounded-2xl bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-primary">Published outcomes and role areas</h2>
            <ul className="mt-6 space-y-4">
              {ORIGINAL_OUTCOME_STATEMENTS.map((statement) => (
                <li key={statement} className="flex items-start gap-3 text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" /> {statement}
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Our Hiring Partners"
            title="Banking, investment banking, NBFC and FinTech employers"
            intro="Direct access to multiple BFSI hiring partners"
            align="center"
          />
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {HIRING_PARTNERS.map(({ name, category }) => (
              <article key={name} className="rounded-xl border border-border p-5 text-center">
                <h2 className="font-bold text-primary">{name}</h2>
                <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">{category}</p>
              </article>
            ))}
          </div>
          <h2 className="mt-12 text-center text-2xl font-bold text-primary">Leading Companies Across Banking, NBFCs &amp; FinTech</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            {EMPLOYER_LOGO_NAMES.map((name) => (
              <span key={name} className="rounded-full bg-muted px-4 py-2 text-sm font-semibold text-primary">{name}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Student outcomes" title="Trusted by 500+ students placed across India" align="center" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {TESTIMONIALS.map(({ name, role, quote }) => (
              <figure key={name} className="rounded-2xl bg-white p-7 shadow-sm">
                <Quote className="h-7 w-7 text-accent" />
                <blockquote className="mt-5 text-sm leading-relaxed text-foreground/75">{quote}</blockquote>
                <figcaption className="mt-6">
                  <strong className="block text-primary">{name}</strong>
                  <span className="text-sm text-muted-foreground">{role}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <CtaSection title="Start Your Application" description="Limited seats available • Free counselling call included" />
    </>
  );
}
