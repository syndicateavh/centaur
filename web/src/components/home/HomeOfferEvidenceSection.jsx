import React from 'react';
import { ArrowRight, FileText, GraduationCap, IndianRupee } from 'lucide-react';
import { Link } from 'react-router';
import { SectionHeading } from '@/components/SectionHeading.jsx';
import { HomeSection } from './HomeSection.jsx';

const RESOURCES = Object.freeze([
  Object.freeze({
    title: 'Check the published fees',
    description: 'See the online and Lucknow classroom prices, then request the written amount and payment terms for your cohort.',
    to: '/courses/finance-course-fees-eligibility/',
    icon: IndianRupee,
  }),
  Object.freeze({
    title: 'Read the job guarantee summary',
    description: 'See who the 100% Job Guarantee Program covers and what to confirm in the current written terms.',
    to: '/placements/#job-guarantee-terms',
    icon: FileText,
  }),
  Object.freeze({
    title: 'Review the entry requirement',
    description: 'Graduation is the program entry requirement. A previous finance background is not required.',
    to: '/finance-course-eligibility/',
    icon: GraduationCap,
  }),
]);

export function HomeOfferEvidenceSection() {
  return (
    <HomeSection name="offer-evidence" aria-labelledby="home-offer-evidence-title" className="bg-primary py-16 text-white sm:py-20 lg:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" data-home-reveal-group>
        <div data-home-reveal>
          <SectionHeading
            id="home-offer-evidence-title"
            eyebrow="Before you enrol"
            title="Check the offer in one place"
            intro="Compare the course, fees, entry requirement, and job guarantee summary before asking for the current written cohort terms."
            align="center"
            light
          />
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {RESOURCES.map(({ title, description, to, icon: Icon }) => (
            <article key={title} data-home-reveal className="rounded-2xl border border-white/15 bg-white/[0.06] p-7">
              <Icon className="h-7 w-7 text-accent" aria-hidden="true" />
              <h3 className="mt-5 text-xl font-bold text-white">{title}</h3>
              <p className="mt-3 leading-relaxed text-white/75">{description}</p>
              <Link to={to} className="mt-6 inline-flex items-center gap-2 font-bold text-accent underline underline-offset-4">
                Review details <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </div>
    </HomeSection>
  );
}
