import React from 'react';
import { BookOpen, BriefcaseBusiness, Building2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router';
import { CtaSection, PageHero, SectionHeading } from '@/components/PageShell.jsx';
import { getSeoRoute } from '@/seo/seoRoutes.js';

const courses = [
  {
    title: 'Investment Banking Operations',
    to: '/courses/investment-banking-operations/',
    icon: BriefcaseBusiness,
    focus: 'Post-trade and investment operations',
    topics: ['Trade lifecycle', 'Settlements', 'Reconciliations', 'Corporate actions', 'Fund-accounting foundations'],
  },
  {
    title: 'Retail Banking',
    to: '/courses/retail-banking/',
    icon: Building2,
    focus: 'Customer, relationship and branch processes',
    topics: ['Banking products', 'Branch operations', 'Customer service', 'Loan-processing foundations', 'KYC basics'],
  },
  {
    title: 'Finance Operations',
    to: '/courses/finance-operations/',
    icon: BookOpen,
    focus: 'Lending, payments and operational controls',
    topics: ['Loan workflows', 'NBFC operations', 'Payments', 'Documentation', 'Risk and process controls'],
  },
];

export default function CoursesPage() {
  const seo = getSeoRoute('courses');

  return (
    <>
      <PageHero
        routeId="courses"
        eyebrow="Course directory"
        title={seo.h1}
        intro="Compare three focused pathways designed to build practical process knowledge and improve entry-level career readiness."
      />

      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Compare pathways"
            title="Choose by the work you want to understand"
            intro="Review the focus and curriculum of each pathway. Course pages explain what is taught and who the training is designed for."
          />
          <div className="grid gap-7 lg:grid-cols-3">
            {courses.map(({ title, to, icon: Icon, focus, topics }) => (
              <article key={title} className="flex flex-col rounded-2xl border border-border bg-white p-7 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-accent">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h2 className="mt-5 text-2xl font-bold text-primary">{title}</h2>
                <p className="mt-2 text-sm font-semibold text-accent-foreground">{focus}</p>
                <ul className="mt-6 flex-1 space-y-3">
                  {topics.map((topic) => (
                    <li key={topic} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                      {topic}
                    </li>
                  ))}
                </ul>
                <Link to={to} className="mt-7 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 py-3 font-bold text-white transition hover:bg-primary/90">
                  Explore {title}
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted py-16 sm:py-20">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Included across pathways"
            title="A consistent learning and support structure"
            intro="Exact schedules and delivery details may vary by batch, but every pathway is organised around the same practical principles."
            align="center"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              'Live instructor-led explanations',
              'Process examples and guided exercises',
              'Role-specific terminology and scenarios',
              'Resume and interview-preparation guidance',
              'Online and Lucknow-centre delivery information',
              'Clear expectations without guaranteed job claims',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-xl bg-white p-5 shadow-sm">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                <span className="font-medium text-foreground/80">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaSection
        title="Need help comparing the courses?"
        description="Tell the admissions team about your education and the kind of finance work you want to explore."
      />
    </>
  );
}
