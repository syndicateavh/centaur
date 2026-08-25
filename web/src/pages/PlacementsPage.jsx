import React from 'react';
import { BadgeCheck, ClipboardCheck, FileCheck2, MessageSquareText, ShieldCheck, UserRoundCheck } from 'lucide-react';
import { Checklist, CtaSection, PageHero, SectionHeading } from '@/components/PageShell.jsx';
import { getSeoRoute } from '@/seo/seoRoutes.js';

const processSteps = [
  {
    title: 'Readiness review',
    description: 'Review course participation, assignments, role knowledge and the learner’s preferred job areas.',
    icon: ClipboardCheck,
  },
  {
    title: 'Profile preparation',
    description: 'Improve resume structure, professional profiles and the explanation of relevant training projects.',
    icon: FileCheck2,
  },
  {
    title: 'Interview practice',
    description: 'Practise process questions, workplace scenarios, communication and feedback-led improvement.',
    icon: MessageSquareText,
  },
  {
    title: 'Opportunity communication',
    description: 'Share suitable opportunities when available and explain the employer’s application requirements.',
    icon: UserRoundCheck,
  },
];

export default function PlacementsPage() {
  const seo = getSeoRoute('placements');

  return (
    <>
      <PageHero
        routeId="placements"
        eyebrow="Transparent career support"
        title={seo.h1}
        intro="Understand what Centaur Careers can support, what learners are expected to complete and which decisions remain with employers."
      />

      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Support process"
            title="Preparation before opportunity sharing"
            intro="Career support is a structured preparation process. It does not replace an employer’s screening, interview or hiring decision."
          />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {processSteps.map(({ title, description, icon: Icon }, index) => (
              <article key={title} className="rounded-2xl border border-border p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <Icon className="h-7 w-7 text-accent" aria-hidden="true" />
                  <span className="font-poppins text-2xl font-black text-primary/10">0{index + 1}</span>
                </div>
                <h2 className="mt-5 text-xl font-bold text-primary">{title}</h2>
                <p className="mt-3 text-sm text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted py-16 sm:py-20">
        <div className="container mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <article className="rounded-2xl bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <BadgeCheck className="h-7 w-7 text-accent" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-primary">Learner responsibilities</h2>
            </div>
            <div className="mt-6">
              <Checklist items={[
                'Participate consistently in scheduled learning activities',
                'Complete required assignments and readiness exercises',
                'Provide accurate education and experience information',
                'Attend agreed preparation sessions and interviews on time',
                'Respond professionally to feedback and employer communication',
              ]} />
            </div>
          </article>
          <article className="rounded-2xl bg-primary p-8 text-white">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-7 w-7 text-accent" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-white">What remains outside our control</h2>
            </div>
            <div className="mt-6">
              <Checklist light items={[
                'The number and timing of employer vacancies',
                'An employer’s eligibility and background requirements',
                'Interview, assessment and final hiring decisions',
                'Role location, compensation and joining conditions',
                'Changes to employer recruitment processes',
              ]} />
            </div>
          </article>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border-2 border-accent/40 bg-accent/5 p-8 sm:p-10">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-7 w-7 text-accent" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-primary">Verified-outcomes publishing standard</h2>
            </div>
            <p className="mt-5 text-muted-foreground">
              Centaur Careers will publish a student outcome only after confirming the learner’s consent and retaining appropriate supporting information. Employer names, salary figures, placement totals, testimonials and guarantee statements are omitted when they have not completed that review.
            </p>
            <p className="mt-4 text-sm font-semibold text-primary">
              Career support improves preparation but cannot guarantee selection by an independent employer.
            </p>
          </div>
        </div>
      </section>

      <CtaSection
        title="Ask about career-support eligibility"
        description="Contact admissions for the current written support terms that apply to your course and batch."
      />
    </>
  );
}
