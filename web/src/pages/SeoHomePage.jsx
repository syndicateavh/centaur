import React from 'react';
import { ArrowRight, BadgeCheck, BriefcaseBusiness, CheckCircle2, MapPin } from 'lucide-react';
import { Link } from 'react-router';
import { CtaSection, PageHero, PrimaryLink, SectionHeading } from '@/components/PageShell.jsx';
import {
  ABOUT_SUMMARY,
  CAREER_TRACKS,
  PROGRAM,
  PROGRAM_BENEFITS,
  PROGRAM_FEATURES,
  PROGRAM_PROCESS,
} from '@/content/sourceContent.js';
import { getSeoRoute } from '@/seo/seoRoutes.js';

export default function SeoHomePage() {
  const seo = getSeoRoute('home');

  return (
    <>
      <PageHero
        routeId="home"
        eyebrow={PROGRAM.badge}
        title={seo.h1}
        intro={PROGRAM.modelDescription}
      >
        <p className="mt-5 text-lg font-bold text-accent">{PROGRAM.challenge}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <PrimaryLink to="/courses/">Explore the masterclass</PrimaryLink>
          <PrimaryLink to="/contact/" inverse>Start your application</PrimaryLink>
        </div>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/75">
          <span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-accent" /> 100% Placement Guarantee</span>
          <span className="flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4 text-accent" /> 100+ Students Placed</span>
          <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> Lucknow + Pan-India Roles</span>
        </div>
      </PageHero>

      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow={PROGRAM.model}
            title="6-Week Intensive Masterclass"
            intro={PROGRAM.trainingDescription}
            align="center"
          />
          <div className="grid gap-6 md:grid-cols-3">
            {PROGRAM_PROCESS.map(({ step, title, subtitle, items }) => (
              <article key={step} className="rounded-2xl border border-border bg-white p-7 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-accent">{step}</p>
                <h2 className="mt-3 text-2xl font-bold text-primary">{title}</h2>
                <p className="mt-1 text-sm font-bold uppercase tracking-wide text-muted-foreground">{subtitle}</p>
                <ul className="mt-6 space-y-3">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-sm text-foreground/75">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Finance career tracks"
            title="Career Paths After the Program"
            intro="IB Ops, Retail Banking & Finance Operations; KYC / AML, Digital Payments, Corporate Readiness."
            align="center"
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {CAREER_TRACKS.map((track) => (
              <article key={track.id} className="flex flex-col rounded-2xl bg-white p-7 shadow-sm">
                <h2 className="text-xl font-bold text-primary">{track.title}</h2>
                <p className="mt-3 flex-1 text-sm text-muted-foreground">{track.description}</p>
                <p className="mt-5 text-lg font-black text-accent-foreground">{track.ctc}</p>
                {track.route && (
                  <Link to={track.route} className="mt-5 inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">
                    View this career track <ArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Why Centaur Careers"
            title="What Makes Our Program Different"
            intro={PROGRAM.guaranteeDescription}
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {PROGRAM_FEATURES.map(({ title, description }) => (
              <article key={title} className="rounded-2xl border border-border p-6">
                <h2 className="text-xl font-bold text-primary">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary py-16 text-white sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Program benefits" title="Built for Finance Career Entry" align="center" />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {PROGRAM_BENEFITS.map(({ title, description }) => (
              <article key={title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/65">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.25fr_0.75fr] lg:px-8">
          <article>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">About Centaur Careers</p>
            <h2 className="mt-3 text-3xl font-bold text-primary sm:text-4xl">{ABOUT_SUMMARY.heading}</h2>
            {ABOUT_SUMMARY.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-5 text-muted-foreground">{paragraph}</p>
            ))}
          </article>
          <aside className="rounded-2xl bg-muted p-8">
            <h2 className="text-2xl font-bold text-primary">Original program information</h2>
            <p className="mt-4 text-muted-foreground">{PROGRAM.metaDescription}</p>
            <Link to="/about/" className="mt-6 inline-block font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">
              Meet the leadership team
            </Link>
          </aside>
        </div>
      </section>

      <CtaSection
        title="Ready to Get Hired?"
        description="Limited seats available • Free counselling call included"
      />
    </>
  );
}
