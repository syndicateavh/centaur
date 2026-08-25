import React from 'react';
import { Mail } from 'lucide-react';
import { CtaSection, PageHero, SectionHeading } from '@/components/PageShell.jsx';
import { ABOUT_SUMMARY, LEADERSHIP, LEADERSHIP_INTRO, PROGRAM } from '@/content/sourceContent.js';
import { getSeoRoute } from '@/seo/seoRoutes.js';

export default function AboutPage() {
  const seo = getSeoRoute('about');

  return (
    <>
      <PageHero
        routeId="about"
        eyebrow={PROGRAM.model}
        title={seo.h1}
        intro={ABOUT_SUMMARY.heading}
      />

      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <article>
            <SectionHeading eyebrow="About Centaur Careers" title={ABOUT_SUMMARY.heading} />
            {ABOUT_SUMMARY.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-5 text-lg leading-relaxed text-muted-foreground">{paragraph}</p>
            ))}
          </article>
          <aside className="rounded-2xl bg-primary p-8 text-white">
            <h2 className="text-2xl font-bold text-white">{PROGRAM.name}</h2>
            <p className="mt-5 text-white/70">{PROGRAM.modelDescription}</p>
            <p className="mt-5 text-white/70">{PROGRAM.trainingDescription}</p>
          </aside>
        </div>
      </section>

      <section className="bg-muted py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Our leadership"
            title={LEADERSHIP_INTRO.heading}
            intro={LEADERSHIP_INTRO.description}
            align="center"
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {LEADERSHIP.map(({ name, role, organization, experience, email }) => (
              <article key={name} className="rounded-2xl bg-white p-7 shadow-sm">
                <h2 className="text-xl font-bold text-primary">{name}</h2>
                <p className="mt-2 font-semibold text-accent-foreground">{role}</p>
                <p className="mt-1 text-sm text-muted-foreground">{organization}</p>
                <p className="mt-5 text-sm leading-relaxed text-foreground/75">{experience}</p>
                <a href={`mailto:${email}`} className="mt-5 flex items-start gap-2 break-all text-sm font-semibold text-primary">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {email}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaSection title="Start Your Application" description="Free counselling call with our advisor" />
    </>
  );
}
