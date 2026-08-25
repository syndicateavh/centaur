import React from 'react';
import { BookOpenCheck, MessagesSquare, Route, ShieldCheck } from 'lucide-react';
import { CtaSection, PageHero, SectionHeading } from '@/components/PageShell.jsx';
import { getSeoRoute } from '@/seo/seoRoutes.js';

const principles = [
  {
    title: 'Process before promises',
    description: 'Explain how banking and finance work is performed and avoid relying on unsupported outcome claims.',
    icon: Route,
  },
  {
    title: 'Practice with context',
    description: 'Connect terminology to scenarios, controls, documents and the decisions learners may encounter.',
    icon: BookOpenCheck,
  },
  {
    title: 'Clear communication',
    description: 'Help learners explain what they know in professional conversations and entry-level interviews.',
    icon: MessagesSquare,
  },
  {
    title: 'Transparent expectations',
    description: 'Separate training and career support from decisions made independently by employers.',
    icon: ShieldCheck,
  },
];

export default function AboutPage() {
  const seo = getSeoRoute('about');

  return (
    <>
      <PageHero
        routeId="about"
        eyebrow="Our institute"
        title={seo.h1}
        intro="A banking and finance training institute focused on practical process knowledge, guided application and responsible career preparation."
      />

      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionHeading eyebrow="Why we exist" title="Make career preparation more practical" />
            <p className="text-lg text-muted-foreground">
              Centaur Careers helps learners understand the processes behind entry-level banking and finance work. The aim is to bridge the gap between academic familiarity and the ability to discuss workflows, controls and workplace scenarios clearly.
            </p>
            <p className="mt-5 text-muted-foreground">
              Training is available through the Lucknow centre and live online formats. Current schedules, fees and availability should always be confirmed with admissions before enrollment.
            </p>
          </div>
          <aside className="rounded-2xl bg-primary p-8 text-white">
            <h2 className="text-2xl font-bold text-white">Our training method</h2>
            <ol className="mt-6 space-y-5">
              {[
                ['Understand', 'Build clear foundations and learn the language of the process.'],
                ['Apply', 'Work through examples, process maps, questions and guided scenarios.'],
                ['Communicate', 'Present knowledge accurately in assignments and interviews.'],
                ['Improve', 'Use feedback to identify gaps and strengthen readiness.'],
              ].map(([title, description], index) => (
                <li key={title} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent font-bold text-primary">{index + 1}</span>
                  <div><h3 className="font-bold text-white">{title}</h3><p className="mt-1 text-sm text-white/65">{description}</p></div>
                </li>
              ))}
            </ol>
          </aside>
        </div>
      </section>

      <section className="bg-muted py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Working principles" title="What guides the learning experience" align="center" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {principles.map(({ title, description, icon: Icon }) => (
              <article key={title} className="rounded-2xl bg-white p-6 shadow-sm">
                <Icon className="h-7 w-7 text-accent" aria-hidden="true" />
                <h2 className="mt-5 text-xl font-bold text-primary">{title}</h2>
                <p className="mt-3 text-sm text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaSection
        title="Learn more about the training pathways"
        description="Compare course curricula or contact the Lucknow centre for current delivery information."
      />
    </>
  );
}
