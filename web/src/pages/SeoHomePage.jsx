import React from 'react';
import { BookOpen, BriefcaseBusiness, Building2, GraduationCap, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router';
import { CtaSection, PageHero, PrimaryLink, SectionHeading } from '@/components/PageShell.jsx';
import { getSeoRoute } from '@/seo/seoRoutes.js';

const courseCards = [
  {
    title: 'Investment Banking Operations',
    description: 'Learn trade lifecycle, settlements, reconciliations, corporate actions and fund-accounting foundations.',
    to: '/courses/investment-banking-operations/',
    icon: BriefcaseBusiness,
  },
  {
    title: 'Retail Banking',
    description: 'Understand branch processes, banking products, customer service, relationship support and loan workflows.',
    to: '/courses/retail-banking/',
    icon: Building2,
  },
  {
    title: 'Finance Operations',
    description: 'Build foundations in lending operations, documentation, payments, controls and NBFC processes.',
    to: '/courses/finance-operations/',
    icon: BookOpen,
  },
];

const learningSteps = [
  {
    title: 'Learn the process',
    description: 'Start with clear foundations and understand how each banking or finance workflow fits together.',
    icon: GraduationCap,
  },
  {
    title: 'Practise the work',
    description: 'Apply concepts through examples, scenarios, process maps and guided assignments.',
    icon: Users,
  },
  {
    title: 'Prepare for interviews',
    description: 'Develop role knowledge, professional communication and structured answers for entry-level discussions.',
    icon: BriefcaseBusiness,
  },
];

export default function SeoHomePage() {
  const seo = getSeoRoute('home');

  return (
    <>
      <PageHero
        routeId="home"
        eyebrow="Centaur Careers · Lucknow and live online"
        title={seo.h1}
        intro="Practical learning for graduates and early-career professionals exploring investment operations, retail banking and finance operations."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <PrimaryLink to="/courses/">Explore career courses</PrimaryLink>
          <PrimaryLink to="/contact/" inverse>Speak with admissions</PrimaryLink>
        </div>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/70">
          <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" /> Alambagh, Lucknow</span>
          <span className="flex items-center gap-2"><Users className="h-4 w-4 text-accent" /> Live guided learning</span>
          <span className="flex items-center gap-2"><BriefcaseBusiness className="h-4 w-4 text-accent" /> Structured career preparation</span>
        </div>
      </PageHero>

      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Choose a pathway"
            title="Practical courses for banking and finance careers"
            intro="Each course has a distinct curriculum and page so you can compare the skills, learning outcomes and role areas before choosing."
            align="center"
          />
          <div className="grid gap-6 md:grid-cols-3">
            {courseCards.map(({ title, description, to, icon: Icon }) => (
              <article key={title} className="flex flex-col rounded-2xl border border-border bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg">
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/5 text-primary">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h2 className="text-xl font-bold text-primary">{title}</h2>
                <p className="mt-3 flex-1 text-sm text-muted-foreground">{description}</p>
                <Link to={to} className="mt-6 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">
                  View course details
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Learning approach"
            title="From concepts to career preparation"
            intro="Training is organised around understanding real processes, practising how they work and communicating that knowledge clearly."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {learningSteps.map(({ title, description, icon: Icon }, index) => (
              <article key={title} className="rounded-2xl bg-white p-7 shadow-sm">
                <div className="mb-5 flex items-center justify-between">
                  <Icon className="h-7 w-7 text-accent" aria-hidden="true" />
                  <span className="font-poppins text-3xl font-black text-primary/10">0{index + 1}</span>
                </div>
                <h2 className="text-xl font-bold text-primary">{title}</h2>
                <p className="mt-3 text-sm text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <article className="rounded-2xl border border-border p-8">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">How support works</p>
            <h2 className="mt-3 text-3xl font-bold text-primary">Transparent career preparation</h2>
            <p className="mt-4 text-muted-foreground">
              Career support focuses on resume preparation, interview practice and role awareness. Employment outcomes depend on eligibility, performance, vacancies and employer selection.
            </p>
            <Link to="/placements/" className="mt-6 inline-block font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">
              Read the placement-support process
            </Link>
          </article>
          <article className="rounded-2xl bg-primary p-8 text-white">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Meet the institute</p>
            <h2 className="mt-3 text-3xl font-bold text-white">Training built around job-relevant processes</h2>
            <p className="mt-4 text-white/70">
              Centaur Careers provides guided banking and finance learning from its Lucknow centre and through live online delivery.
            </p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link to="/about/" className="font-bold text-white underline decoration-accent decoration-2 underline-offset-4">About Centaur Careers</Link>
              <Link to="/locations/lucknow/" className="font-bold text-white underline decoration-accent decoration-2 underline-offset-4">Lucknow training centre</Link>
              <Link to="/contact/" className="font-bold text-white underline decoration-accent decoration-2 underline-offset-4">Contact the centre</Link>
            </div>
          </article>
        </div>
      </section>

      <CtaSection
        title="Find the right banking or finance pathway"
        description="Compare the course curricula or contact the admissions team for current delivery and batch information."
      />
    </>
  );
}
