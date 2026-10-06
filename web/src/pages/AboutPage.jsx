import React from 'react';
import { ArrowRight, Mail } from 'lucide-react';
import { Link } from 'react-router';
import InternalLinkGroup from '@/components/InternalLinkGroup.jsx';
import { CtaSection, PageHero, SectionHeading } from '@/components/PageShell.jsx';
import DownloadPreviewDialog from '@/components/DownloadPreviewDialog.jsx';
import { BUSINESS_DATA } from '@/content/businessData.js';
import { DOWNLOAD_ASSETS } from '@/content/downloads.js';
import {
  ABOUT_SUMMARY,
  CAREER_TRACKS,
  LEADERSHIP,
  LEADERSHIP_INTRO,
  LEARNING_MODES,
  PROGRAM,
  PROGRAM_PROCESS,
} from '@/content/sourceContent.js';
import { getInternalLinks } from '@/seo/internalLinks.js';
import { getSeoRoute } from '@/seo/seoRoutes.js';

const ENROLMENT_CHECKS = [
  {
    title: 'The current cohort schedule',
    description: 'Confirm the start date, class timings, and attendance expectations for your cohort.',
  },
  {
    title: 'Total fees and payment terms',
    description: 'Ask for the applicable amount and payment terms in writing before paying.',
  },
  {
    title: 'The job guarantee terms',
    description: 'Check eligibility, the guaranteed role scope, conditions, and exclusions for your cohort.',
  },
  {
    title: 'Certificate and learner support',
    description: 'Confirm the certificate requirements and which training and career support activities are included.',
  },
];

const ABOUT_FAQS = [
  {
    question: 'What does Centaur Careers do?',
    answer: 'Centaur Careers provides finance and banking operations training through its six-week Financial Operations Masterclass, with a published 100% Job Guarantee Program for eligible learners who complete the course.',
  },
  {
    question: 'Who can join the program?',
    answer: 'The published program is open to graduates and job switchers. A prior finance background is not required; confirm the current cohort’s entry conditions with the team.',
  },
  {
    question: 'Can I study online?',
    answer: 'The published learning options are live online across India and in person at Mindsprout Career Hub in Lucknow. Confirm current availability and timings before enrolling.',
  },
  {
    question: 'Where can I read the job guarantee conditions?',
    answer: 'Read the published guarantee summary, then request the current written terms for your cohort, including eligibility, scope, and exclusions.',
    to: '/placements/#job-guarantee-terms',
    linkLabel: 'Read the job guarantee summary',
  },
];

function NumberedStep({ step, index }) {
  return (
    <article className="rounded-2xl border border-border bg-white p-6 shadow-sm sm:p-7">
      <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent-ink">{step.step || `Step ${String(index + 1).padStart(2, '0')}`}</p>
      <h3 className="mt-3 text-xl font-bold text-primary">{step.title}</h3>
      <p className="mt-2 font-semibold text-foreground/80">{step.subtitle}</p>
      <ul className="mt-5 space-y-3 text-sm leading-relaxed text-muted-foreground">
        {step.items.map((item) => <li key={item} className="flex gap-3"><span className="mt-0.5 text-accent-ink" aria-hidden="true">✓</span><span>{item}</span></li>)}
      </ul>
    </article>
  );
}

export default function AboutPage() {
  const seo = getSeoRoute('about');

  return (
    <>
      <PageHero
        routeId="about"
        eyebrow="About Centaur Careers"
        title={seo.h1}
        intro="Centaur Careers provides practical banking and finance operations training through a six-week masterclass, with live online and Lucknow learning options."
      />

      <section className="bg-white py-14 sm:py-20">
        <div className="container mx-auto grid max-w-7xl gap-9 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8">
          <article>
            <SectionHeading eyebrow="What Centaur Careers does" title={ABOUT_SUMMARY.heading} align="left" />
            {ABOUT_SUMMARY.paragraphs.map((paragraph) => (
              <p key={paragraph} className="mt-5 text-lg leading-relaxed text-muted-foreground">{paragraph}</p>
            ))}
            <p className="mt-5 text-base leading-relaxed text-muted-foreground">
              This website is operated by {BUSINESS_DATA.legalName}. Live online learning is available across India; the published in-person option is at{' '}
              <Link to={BUSINESS_DATA.trainingLocation.path} className="font-semibold text-primary underline decoration-accent decoration-2 underline-offset-4">{BUSINESS_DATA.trainingLocation.name} in Lucknow</Link>.
              {' '}That training location is not the company’s registered office.
            </p>
            <Link to="/courses/" className="mt-7 inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">
              Explore the Financial Operations Masterclass <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </article>
          <aside className="rounded-2xl bg-primary p-7 text-white sm:p-8">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent">The program at a glance</p>
            <h2 className="mt-3 text-2xl font-bold text-white">{PROGRAM.name}</h2>
            <dl className="mt-6 space-y-5">
              <div><dt className="font-bold text-white">Duration</dt><dd className="mt-1 text-white/75">{PROGRAM.duration} of structured learning</dd></div>
              <div><dt className="font-bold text-white">Who it is for</dt><dd className="mt-1 text-white/75">Graduates and job switchers</dd></div>
              <div><dt className="font-bold text-white">Learning options</dt><dd className="mt-1 text-white/75">Live online across India or in person in Lucknow</dd></div>
              <div><dt className="font-bold text-white">Published outcome</dt><dd className="mt-1 text-white/75">100% Job Guarantee Program; review the written terms for your cohort</dd></div>
            </dl>
            <Link to="/placements/" className="mt-7 inline-flex items-center gap-2 font-bold text-white underline decoration-accent decoration-2 underline-offset-4">
              Understand the job guarantee <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </aside>
        </div>
      </section>

      <section className="bg-muted py-14 sm:py-20" aria-labelledby="how-centaur-works-title">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            id="how-centaur-works-title"
            eyebrow="How the program works"
            title="Three steps from learning to career support"
            intro="Review the course and cohort terms first, complete the six-week learning program, then follow the published job guarantee process."
            align="left"
          />
          <div className="grid gap-5 lg:grid-cols-3">
            {PROGRAM_PROCESS.map((step, index) => <NumberedStep key={step.title} step={step} index={index} />)}
          </div>
          <p className="mt-6 max-w-4xl text-sm leading-relaxed text-muted-foreground">
            The exact schedule, learning activities, and support terms can vary by cohort. Review the current written details before enrolling.
          </p>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-20" aria-labelledby="about-curriculum-title">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            id="about-curriculum-title"
            eyebrow="What you learn"
            title="Finance operations topics in the masterclass"
            intro="The published curriculum introduces workflows across banking, investment operations, compliance, payments, credit, and FinTech."
            align="left"
          />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CAREER_TRACKS.map((track) => (
              <article key={track.id} className="rounded-2xl border border-border bg-muted/30 p-6">
                <h3 className="text-lg font-bold text-primary">{track.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{track.description}</p>
                {track.route && <Link to={track.route} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Explore this subject <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>}
              </article>
            ))}
          </div>
          <Link to="/courses/" className="mt-7 inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">
            View the complete course details <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="bg-muted py-14 sm:py-20" aria-labelledby="about-learning-modes-title">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            id="about-learning-modes-title"
            eyebrow="Where learning happens"
            title="Choose the published learning option"
            intro="Ask the team which format and schedule are available for the cohort you are considering."
            align="left"
          />
          <div className="grid gap-5 md:grid-cols-2">
            {LEARNING_MODES.map((mode) => (
              <article key={mode.name} className="rounded-2xl border border-border bg-white p-6 sm:p-7">
                <h3 className="text-xl font-bold text-primary">{mode.name === 'Online' ? 'Live online across India' : 'In person in Lucknow'}</h3>
                <p className="mt-3 leading-relaxed text-muted-foreground">
                  {mode.name === 'Online'
                    ? 'Join live online classes from across India. Confirm the current cohort schedule, assessment format, and support terms.'
                    : 'Attend the published in-person option at Mindsprout Career Hub in Lucknow. Confirm the current cohort schedule and availability before travelling.'}
                </p>
                <p className="mt-4 text-sm font-semibold text-foreground/75">{mode.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-20" aria-labelledby="about-enrolment-checks-title">
        <div className="container mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent-ink">Before you enrol</p>
            <h2 id="about-enrolment-checks-title" className="mt-3 text-3xl font-bold text-primary">Get the current details in writing</h2>
            <p className="mt-4 leading-relaxed text-muted-foreground">Use the public course information as a starting point, then confirm cohort-specific details directly with Centaur Careers before paying.</p>
            <Link to="/contact/" className="mt-6 inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Ask Centaur Careers a question <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {ENROLMENT_CHECKS.map((check) => (
              <article key={check.title} className="rounded-2xl border border-border bg-muted/30 p-5">
                <h3 className="font-bold text-primary">{check.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{check.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted py-14 sm:py-20">
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
                <h3 className="text-xl font-bold text-primary">{name}</h3>
                <p className="mt-2 font-semibold text-accent-foreground">{role}</p>
                <p className="mt-1 text-sm text-muted-foreground">{organization}</p>
                <p className="mt-5 text-sm leading-relaxed text-foreground/75">{experience}</p>
                <a href={`mailto:${email}`} className="mt-5 flex items-start gap-2 break-all text-sm font-semibold text-primary">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" /> {email}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-trust-evidence className="bg-white py-14 sm:py-20" aria-labelledby="trust-evidence-title">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="trust-evidence-title" className="text-3xl font-bold text-primary">Review the program evidence</h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">Use the current syllabus, sample practice work, and written cohort terms to understand what is included. Ask the team to identify the trainer and confirm any detail that matters to you before paying.</p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <article className="rounded-2xl border border-border bg-muted/30 p-6">
              <h3 className="text-xl font-bold text-primary">Curriculum and delivery</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Preview the syllabus summary for the published subject areas and learning modes, then confirm current cohort details.</p>
              <DownloadPreviewDialog
                asset={DOWNLOAD_ASSETS.syllabus}
                title="Financial Operations Masterclass syllabus"
                triggerLabel="Preview syllabus summary"
                analyticsId="about-syllabus-preview"
                analyticsIntent="commercial_program"
                triggerClassName="mt-5 inline-block cursor-pointer border-0 bg-transparent p-0 text-left font-bold text-primary underline decoration-accent decoration-2 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </article>
            <article className="rounded-2xl border border-border bg-muted/30 p-6">
              <h3 className="text-xl font-bold text-primary">Original practice examples</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">The trade-break and KYC examples use fictional records to show the reasoning a learner can practise.</p>
              <Link to="/blog/settlement-trade-break-worked-example/" className="mt-5 inline-block font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Open a worked example</Link>
            </article>
            <article className="rounded-2xl border border-border bg-muted/30 p-6">
              <h3 className="text-xl font-bold text-primary">Job guarantee conditions</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Review the published summary, then request the written terms for your cohort, including eligibility, scope, and exclusions.</p>
              <Link to="/placements/#job-guarantee-terms" className="mt-5 inline-block font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Read the guarantee summary</Link>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-muted py-14 sm:py-20" aria-labelledby="about-faq-title">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading id="about-faq-title" eyebrow="Common questions" title="Centaur Careers, explained" align="left" />
          <div className="divide-y divide-border rounded-2xl border border-border bg-white px-6 sm:px-8">
            {ABOUT_FAQS.map((faq) => (
              <article key={faq.question} className="py-5">
                <h3 className="text-lg font-bold text-primary">{faq.question}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground">{faq.answer}</p>
                {faq.to && <Link to={faq.to} className="mt-3 inline-flex items-center gap-2 font-semibold text-primary underline decoration-accent decoration-2 underline-offset-4">{faq.linkLabel} <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>}
              </article>
            ))}
          </div>
        </div>
      </section>

      <InternalLinkGroup links={getInternalLinks('about')} />
      <CtaSection title="Ask about the current program" description="Contact the team to confirm cohort details, fees, learning modes, certificate requirements, and written support terms." primaryTo="/contact/" primaryLabel="Contact Centaur Careers" primaryAnalyticsIntent="commercial_program" secondaryTo="/courses/" secondaryLabel="Review course details" />
    </>
  );
}
