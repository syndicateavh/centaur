import React from 'react';
import { Mail } from 'lucide-react';
import { Link } from 'react-router';
import InternalLinkGroup from '@/components/InternalLinkGroup.jsx';
import { CtaSection, PageHero, SectionHeading } from '@/components/PageShell.jsx';
import DownloadPreviewDialog from '@/components/DownloadPreviewDialog.jsx';
import { DOWNLOAD_ASSETS } from '@/content/downloads.js';
import { ABOUT_SUMMARY, LEADERSHIP, LEADERSHIP_INTRO, PROGRAM } from '@/content/sourceContent.js';
import { getInternalLinks } from '@/seo/internalLinks.js';
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
            <SectionHeading eyebrow="About Centaur Careers" title={ABOUT_SUMMARY.heading} align="left" />
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
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" /> {email}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-trust-evidence className="bg-white py-16 sm:py-20" aria-labelledby="trust-evidence-title">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 id="trust-evidence-title" className="text-3xl font-bold text-primary">Check the program evidence yourself</h2>
          <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">Our published guide pages show an author and update date. For an enrolment decision, use the current program summary, example work, and written cohort terms. Ask the team to identify the trainer and confirm any detail that matters to you before paying.</p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            <article className="rounded-2xl border border-border bg-muted/30 p-6">
              <h3 className="text-xl font-bold text-primary">Curriculum and delivery</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">The dated syllabus summary lists the six subject areas, online and Lucknow access, and details to reconfirm for the current cohort.</p>
              <DownloadPreviewDialog
                asset={DOWNLOAD_ASSETS.syllabus}
                title="Financial Operations Masterclass syllabus"
                triggerLabel="Download syllabus summary"
                analyticsId="about-syllabus-preview"
                analyticsIntent="commercial_program"
                triggerClassName="mt-5 inline-block cursor-pointer border-0 bg-transparent p-0 text-left font-bold text-primary underline decoration-accent decoration-2 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              />
            </article>
            <article className="rounded-2xl border border-border bg-muted/30 p-6">
              <h3 className="text-xl font-bold text-primary">Original practice examples</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">The trade-break and KYC examples use fictional records. They show the reasoning a learner can practise; they are not learner outcome claims.</p>
              <Link to="/blog/settlement-trade-break-worked-example/" className="mt-5 inline-block font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Open a worked example</Link>
            </article>
            <article className="rounded-2xl border border-border bg-muted/30 p-6">
              <h3 className="text-xl font-bold text-primary">Placement conditions</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Read the published guarantee summary, then request the written terms for your cohort, including eligibility, scope, and exclusions.</p>
              <Link to="/placements/#job-guarantee-terms" className="mt-5 inline-block font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Read placement summary</Link>
            </article>
          </div>
        </div>
      </section>

      <InternalLinkGroup links={getInternalLinks('about')} />
      <CtaSection title="Ask about the current program" description="Contact the team to confirm cohort details, fees, and learning modes." />
    </>
  );
}
