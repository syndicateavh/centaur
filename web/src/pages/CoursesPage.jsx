import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router';
import { CtaSection, PageHero, SectionHeading } from '@/components/PageShell.jsx';
import {
  CAREER_TRACKS,
  CERTIFICATE,
  LEARNING_MODES,
  OFFLINE_PARTNER_LINE,
  PROGRAM,
  PROGRAM_COMPARISON,
  PROGRAM_PROCESS,
} from '@/content/sourceContent.js';
import { getSeoRoute } from '@/seo/seoRoutes.js';

export default function CoursesPage() {
  const seo = getSeoRoute('courses');

  return (
    <>
      <PageHero
        routeId="courses"
        eyebrow={PROGRAM.model}
        title={seo.h1}
        intro={PROGRAM.trainingDescription}
      />

      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="One program, six career tracks"
            title="Career Paths After the Program"
            intro="Finance track matching — IB / Retail / Ops"
            align="center"
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {CAREER_TRACKS.map((track) => (
              <article key={track.id} className="flex flex-col rounded-2xl border border-border p-7 shadow-sm">
                <h2 className="text-xl font-bold text-primary">{track.title}</h2>
                <p className="mt-3 flex-1 text-sm text-muted-foreground">{track.description}</p>
                <p className="mt-5 font-black text-accent-foreground">{track.ctc}</p>
                {track.route && (
                  <Link to={track.route} className="mt-5 inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">
                    View track details <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="From Applicant to Placed — In 3 Steps"
            title="One clear path. One outcome: your first ₹3–12 LPA finance job."
            align="center"
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {PROGRAM_PROCESS.map(({ step, title, subtitle, items }) => (
              <article key={step} className="rounded-2xl bg-white p-7 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-accent">{step}</p>
                <h2 className="mt-3 text-2xl font-bold text-primary">{title}</h2>
                <p className="mt-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">{subtitle}</p>
                <ul className="mt-6 space-y-3">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-foreground/75">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Program fees"
            title="Choose Your Learning Mode"
            intro="Same curriculum and placement guarantee. Different experience levels."
            align="center"
          />
          <div className="mx-auto grid max-w-5xl gap-7 lg:grid-cols-2">
            {LEARNING_MODES.map((mode) => (
              <article key={mode.name} className="rounded-2xl border border-border p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-primary">{mode.name}</h2>
                <p className="mt-2 text-muted-foreground">{mode.summary}</p>
                <div className="mt-6 flex items-end gap-3">
                  <span className="text-4xl font-black text-primary">{mode.price}</span>
                  <span className="pb-1 text-lg text-muted-foreground line-through">{mode.originalPrice}</span>
                </div>
                <p className="mt-2 text-sm font-semibold text-accent-foreground">{mode.note}</p>
                <ul className="mt-6 space-y-3">
                  {mode.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-foreground/75">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {feature}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <p className="mx-auto mt-7 max-w-3xl text-center text-sm text-muted-foreground">{OFFLINE_PARTNER_LINE}</p>
          <p className="mt-2 text-center text-sm font-semibold text-primary">Placement guarantee subject to terms.</p>
        </div>
      </section>

      <section className="bg-primary py-16 text-white sm:py-20">
        <div className="container mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Course Completion Certificate</p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">{CERTIFICATE.heading}</h2>
            <p className="mt-5 leading-relaxed text-white/70">{CERTIFICATE.description}</p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {CERTIFICATE.benefits.map((benefit) => (
              <li key={benefit} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-5 text-white/80">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" /> {benefit}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Comparison" title="Why We're Different" intro="Most programs teach theory. We focus on getting you hired." align="center" />
          <div className="overflow-hidden rounded-2xl border border-border">
            <div className="grid grid-cols-2 bg-primary p-5 font-bold text-white"><span>Others</span><span>Centaur Careers</span></div>
            {PROGRAM_COMPARISON.map(({ others, centaur }) => (
              <div key={others} className="grid grid-cols-2 border-t border-border p-5 text-sm">
                <span className="text-muted-foreground">{others}</span>
                <span className="font-semibold text-primary">{centaur}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaSection title="Start Your Application" description="Limited seats available • Free counselling call included" />
    </>
  );
}
