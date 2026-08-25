import React from 'react';
import { CheckCircle2, Clock3, IndianRupee, Route } from 'lucide-react';
import { Link } from 'react-router';
import { CtaSection, PageHero, SectionHeading } from '@/components/PageShell.jsx';
import { getCourseData } from '@/content/courseData.js';
import { GENERAL_FAQS } from '@/content/faqData.js';
import { CAREER_TRACKS, PROGRAM, PROGRAM_PROCESS } from '@/content/sourceContent.js';
import { getSeoRoute } from '@/seo/seoRoutes.js';

export default function CourseDetailPage({ courseId }) {
  const track = getCourseData(courseId);
  const seo = getSeoRoute(track.seoId);
  const trackTopics = track.description.split(', ');

  return (
    <>
      <PageHero
        routeId={track.seoId}
        eyebrow={`${PROGRAM.name} career track`}
        title={seo.h1}
        intro={track.description}
      >
        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3"><IndianRupee className="h-4 w-4 text-accent" /> {track.ctc}</span>
          <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3"><Clock3 className="h-4 w-4 text-accent" /> {PROGRAM.duration}</span>
          <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3"><Route className="h-4 w-4 text-accent" /> {PROGRAM.model}</span>
        </div>
      </PageHero>

      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <article>
            <SectionHeading eyebrow="Career track" title={track.title} />
            <p className="text-lg text-muted-foreground">{track.description}</p>
            <p className="mt-5 text-2xl font-black text-primary">{track.ctc}</p>
          </article>
          <article className="rounded-2xl bg-muted p-8">
            <h2 className="text-2xl font-bold text-primary">Track areas shown on the original site</h2>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">
              {trackTopics.map((topic) => (
                <li key={topic} className="flex items-start gap-3 rounded-xl bg-white p-4 font-medium text-foreground/80">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" /> {topic}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="bg-muted py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Financial Operations Masterclass"
            title="This track is part of the 6-week program"
            intro={PROGRAM.trainingDescription}
            align="center"
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {PROGRAM_PROCESS.map(({ step, title, subtitle, items }) => (
              <article key={step} className="rounded-2xl bg-white p-7 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-accent">{step}</p>
                <h2 className="mt-3 text-xl font-bold text-primary">{title}</h2>
                <p className="mt-2 text-xs font-bold uppercase tracking-wide text-muted-foreground">{subtitle}</p>
                <ul className="mt-5 space-y-3">
                  {items.map((item) => <li key={item} className="text-sm text-foreground/75">{item}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="All program tracks" title="Career Paths After the Program" align="center" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {CAREER_TRACKS.map((item) => (
              <article key={item.id} className={`rounded-xl border p-5 ${item.id === track.id ? 'border-accent bg-accent/5' : 'border-border'}`}>
                <h2 className="font-bold text-primary">{item.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                <p className="mt-3 font-bold text-accent-foreground">{item.ctc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-primary py-16 text-white">
        <div className="container mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <article>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Eligibility</p>
            <h2 className="mt-3 text-3xl font-bold text-white">{GENERAL_FAQS[0].question}</h2>
            <p className="mt-5 text-white/70">{GENERAL_FAQS[0].answer}</p>
          </article>
          <article>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Program details</p>
            <h2 className="mt-3 text-3xl font-bold text-white">One masterclass, online or offline</h2>
            <p className="mt-5 whitespace-pre-line text-white/70">{GENERAL_FAQS[2].answer}</p>
          </article>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-muted-foreground">
            Read the original program answers on the <Link to="/faqs/" className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">complete FAQ page</Link> and the full eligibility conditions on the <Link to="/placements/" className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">placement page</Link>.
          </p>
        </div>
      </section>

      <CtaSection title="Start Your Application" description="Limited seats available • Free counselling call included" />
    </>
  );
}
