import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router';
import InternalLinkGroup from '@/components/InternalLinkGroup.jsx';
import { CtaSection, PageHero, SectionHeading } from '@/components/PageShell.jsx';
import { ResponsiveImage } from '@/components/ui/responsive-image.jsx';
import { getCourseTrackImage } from '@/content/courseImages.js';
import { getCourseModulePath } from '@/content/courseModulePaths.js';
import { DOWNLOAD_ASSETS } from '@/content/downloads.js';
import {
  CAREER_TRACKS,
  CERTIFICATE,
  HOME_COPY,
  JOB_GUARANTEE,
  LEARNING_MODES,
  OFFLINE_PARTNER_LINE,
  PROGRAM,
  PROGRAM_FEATURES,
  PROGRAM_COMPARISON,
  PROGRAM_PROCESS,
} from '@/content/sourceContent.js';
import { GENERAL_FAQS } from '@/content/faqData.js';
import { REGIONAL_PAGES } from '@/content/regionalPages.js';
import { getInternalLinks } from '@/seo/internalLinks.js';
import { getSeoRoute } from '@/seo/seoRoutes.js';

export default function CoursesPage() {
  const seo = getSeoRoute('courses');

  return (
    <>
      <PageHero routeId="courses" eyebrow={PROGRAM.model} title={seo.h1} intro="One six-week finance course for graduates and job switchers. Study investment banking operations alongside KYC and AML, retail banking, digital payments, finance operations, and FinTech through the Financial Operations Masterclass. Compare the published online and Lucknow options, then confirm the current cohort details." />

      <section data-course-direct-answer className="border-b border-border bg-white py-8" aria-labelledby="course-direct-answer-title">
        <div className="container mx-auto min-w-0 max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="min-w-0 max-w-4xl">
          <h2 id="course-direct-answer-title" className="text-2xl font-bold text-primary">What does the Financial Operations Masterclass cover?</h2>
          <p className="mx-0 mt-3 max-w-none leading-relaxed text-muted-foreground">The six-week Financial Operations Masterclass is a finance operations course for graduates and job switchers. It covers banking and investment operations, KYC and AML, retail banking, digital payments, credit, and FinTech. Investment banking operations is one module within the programme, including trade settlements, reconciliation, corporate actions, and fund accounting. Join live online across India or study in person in Lucknow.</p>
          <p className="mx-0 mt-3 max-w-none text-sm leading-relaxed text-muted-foreground">Before enrolling, confirm the current cohort schedule, fees, certificate wording, and written support terms with the team.</p>
          <p className="mx-0 mt-3 max-w-none text-sm leading-relaxed text-muted-foreground">First compare <Link to="/career-guides/investment-banking-operations/" className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">what investment banking operations analysts do</Link> with the topics taught here. Then use the <Link to="/career-guides/choosing-finance-career-course/" className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">finance course selection checklist</Link> to review the syllabus, study mode, full cost, certificate, and current support terms.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/contact/" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white">Ask about the current cohort <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            <Link to="/career-guides/investment-banking-operations/" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-5 py-3 font-bold text-primary">Understand the operations role <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
          </div>
        </div>
      </section>

      <section className="bg-accent/15 py-8" aria-label="100% Job Guarantee Program">
        <div className="container mx-auto flex max-w-5xl flex-col items-start justify-between gap-5 px-4 sm:px-6 md:flex-row md:items-center lg:px-8">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-accent-foreground">{JOB_GUARANTEE.label}</p>
            <p className="mt-2 max-w-3xl leading-relaxed text-foreground/80">{JOB_GUARANTEE.description} {JOB_GUARANTEE.shortQualifier}</p>
          </div>
          <Link to={JOB_GUARANTEE.termsPath} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white">View program details <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </section>

      <section data-high-value-page="courses" data-commercial-section="finance-course-overview" className="bg-muted py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Banking and finance training"
            title="A practical finance course for graduates and job switchers"
            intro="If you are comparing finance courses, review the six-week curriculum, published learning modes and fees, certificate wording, and current written career-support terms for this single program."
            align="center"
          />
          <div className="grid gap-5 md:grid-cols-3">
            <article className="rounded-2xl border border-border bg-white p-7 shadow-sm">
              <h2 className="text-xl font-bold text-primary">Live online finance course</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">Join live online sessions from across India. Ask which recordings, mentoring, and interview-preparation activities are included for the current cohort.</p>
              <Link to="/india/" className="mt-5 inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Explore online access across India <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </article>
            <article className="rounded-2xl border border-border bg-white p-7 shadow-sm">
              <h2 className="text-xl font-bold text-primary">Finance training for graduates new to the sector</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">Graduates and job switchers can explore investment banking operations, retail banking, KYC and AML, digital payments, finance operations, and FinTech without previous finance experience.</p>
              <Link to="/career-guides/" className="mt-5 inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Compare finance career paths <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </article>
            <article className="rounded-2xl border border-border bg-white p-7 shadow-sm">
              <h2 className="text-xl font-bold text-primary">Course certificate and job guarantee</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">The published program describes a Centaur Careers Course Completion Certificate and a guaranteed finance job for graduates and job switchers after completing the six-week course. Confirm certificate requirements and current written cohort terms before enrolling.</p>
              <Link to="/placements/" className="mt-5 inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Explore the 100% Job Guarantee Program <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </article>
          </div>

          <div className="mx-auto mt-12 max-w-5xl overflow-x-auto rounded-2xl border border-border bg-white shadow-sm">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="border-b border-border bg-primary px-6 py-4 text-left text-base font-bold text-white">
                Financial Operations Masterclass — Key Program Facts, Fees &amp; Modules
              </caption>
              <tbody className="divide-y divide-border">
                <tr>
                  <th scope="row" className="w-1/3 bg-muted/40 px-6 py-4 font-bold text-primary">Program Name &amp; Format</th>
                  <td className="px-6 py-4 text-foreground/85">{PROGRAM.name} ({PROGRAM.alternateName}) — 1 integrated program covering 6 BFSI &amp; financial operations modules</td>
                </tr>
                <tr>
                  <th scope="row" className="bg-muted/40 px-6 py-4 font-bold text-primary">Duration</th>
                  <td className="px-6 py-4 text-foreground/85">{PROGRAM.duration} (intensive practical workflow training, case studies, and interview preparation)</td>
                </tr>
                <tr>
                  <th scope="row" className="bg-muted/40 px-6 py-4 font-bold text-primary">Delivery Modes &amp; Published Fees</th>
                  <td className="px-6 py-4 text-foreground/85">{LEARNING_MODES.map((mode) => `${mode.name} mode: ${mode.price} (reference fee ${mode.originalPrice})`).join(' | ')}. Confirm the applicable cohort fee and validity with Centaur Careers.</td>
                </tr>
                <tr>
                  <th scope="row" className="bg-muted/40 px-6 py-4 font-bold text-primary">Core Curriculum Modules</th>
                  <td className="px-6 py-4 text-foreground/85">Investment Banking Operations (trade settlements, reconciliation, corporate actions, fund accounting), Finance Operations (NBFC &amp; credit analysis), Retail Banking, KYC &amp; AML Compliance, Digital Payments, and FinTech &amp; Neo-Banking</td>
                </tr>
                <tr>
                  <th scope="row" className="bg-muted/40 px-6 py-4 font-bold text-primary">Credential &amp; Career Support</th>
                  <td className="px-6 py-4 text-foreground/85">Centaur Careers Course Completion Certificate and the 100% Job Guarantee Program for graduates and job switchers after completing the six-week program. <Link to="/placements/#job-guarantee-terms" className="font-semibold underline underline-offset-4">Read the published summary</Link> and request current written cohort terms.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section data-course-regional-guides className="border-b border-border bg-white py-10" aria-label="Regional career guides for online learners">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-primary">Explore finance career paths from your city</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">The Masterclass is available live online for learners outside Lucknow. These guides explain local job-research context; they do not list Centaur Careers classrooms or promise jobs in those cities.</p>
          <ul className="mt-5 flex flex-wrap gap-x-6 gap-y-3">
            {REGIONAL_PAGES.map((page) => (
              <li key={page.id}><Link to={page.path} className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">{page.regionName} career guide</Link></li>
            ))}
          </ul>
        </div>
      </section>

      <section data-commercial-page="courses" data-commercial-section="program-modules" className="bg-white py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={HOME_COPY.tracksEyebrow} title={HOME_COPY.tracksHeading} intro={HOME_COPY.tracksDescription} align="center" />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {CAREER_TRACKS.map((track) => {
              const image = getCourseTrackImage(track.id);

              return (
                <article key={track.id} className="course-track-card group flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
                  <div className="course-track-card-media" aria-hidden="true">
                    <ResponsiveImage
                      {...image}
                      className="course-track-card-image"
                      sizes="(min-width: 1024px) 26rem, (min-width: 768px) 50vw, 100vw"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-7">
                    <h2 className="text-xl font-bold text-primary">{track.title}</h2>
                    <p className="mt-3 flex-1 text-sm text-muted-foreground">{track.description}</p>
                    <p className="mt-5 text-sm font-semibold text-accent-foreground">Curriculum module</p>
                    {getCourseModulePath(track.id) && <Link to={getCourseModulePath(track.id)} className="mt-5 inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">View module guide <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-muted py-12" aria-label="Investment Banking Operations course scope">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="One current course offering"
            title="How investment banking operations fits into the Masterclass"
            intro={`Centaur Careers currently offers the ${PROGRAM.name}. Investment Banking Operations is one subject area within this ${PROGRAM.duration} program; there is no separate course duration or standalone syllabus for the module.`}
          />
          <p className="mx-auto mt-5 max-w-3xl text-center leading-relaxed text-muted-foreground">
            The published Investment Banking Operations topics include trade settlements, reconciliation, corporate actions, and fund accounting. Review the full Masterclass page for the current program curriculum and participation details.
          </p>
        </div>
      </section>

      <section data-commercial-section="program-benefits" className="bg-primary py-16 text-white sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={HOME_COPY.whyEyebrow} title={HOME_COPY.whyHeading} intro={HOME_COPY.whyDescription} align="center" light />
          <div className="mx-auto mb-10 grid max-w-4xl gap-3 text-center text-sm sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"><span className="block text-white/60">Duration</span><strong className="text-white">{PROGRAM.duration}</strong></div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"><span className="block text-white/60">Learning modes</span><strong className="text-white">Online and Offline</strong></div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3"><span className="block text-white/60">Program</span><strong className="text-white">{PROGRAM.alternateName}</strong></div>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {PROGRAM_FEATURES.map(({ title, description }) => (
              <article key={title} className="rounded-2xl border border-white/10 bg-white/5 p-7">
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/70">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-commercial-section="program-process" className="bg-muted py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Our Process" title="Complete the Program. Get a Guaranteed Finance Job." intro="Graduates and job switchers who complete the six-week Financial Operations Masterclass get a finance job through the 100% Job Guarantee Program." align="center" />
          <div className="grid gap-6 lg:grid-cols-3">
            {PROGRAM_PROCESS.map(({ step, title, subtitle, items }) => (
              <article key={step} className="rounded-2xl bg-white p-7 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-accent-ink">{step}</p>
                <h2 className="mt-3 text-2xl font-bold text-primary">{title}</h2>
                <p className="mt-2 text-sm font-bold uppercase tracking-wide text-muted-foreground">{subtitle}</p>
                <ul className="mt-6 space-y-3">
                  {items.map((item) => <li key={item} className="flex items-start gap-3 text-sm text-foreground/75"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />{item}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-commercial-section="learning-modes" className="bg-white py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Learning modes" title="Compare online and in-person learning" intro="Online access is available across India; the published in-person option is in Lucknow. Confirm the current cohort, schedule, and fees before applying." align="center" />
          <div className="mx-auto grid max-w-5xl gap-7 lg:grid-cols-2">
            {LEARNING_MODES.map((mode) => (
              <article key={mode.name} className="rounded-2xl border border-border p-8 shadow-sm">
                <p className="text-sm font-bold uppercase tracking-widest text-muted-foreground">{mode.name} Mode</p>
                <p className="mt-4 text-sm font-semibold text-accent-ink">Current published fee</p>
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-4xl font-extrabold text-primary">{mode.price}</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Reference fee: {mode.originalPrice}. {mode.note} Confirm the total payable amount and cohort terms in writing before paying.</p>
                <p className="mt-3 text-muted-foreground">{mode.summary}</p>
                <ul className="mt-6 space-y-3">
              {mode.features.map((feature) => <li key={feature} className="flex items-start gap-3 text-sm text-foreground/75"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />{feature}</li>)}
                </ul>
              </article>
            ))}
          </div>
          <p className="mx-auto mt-7 max-w-3xl text-center text-sm font-medium text-foreground/85">{OFFLINE_PARTNER_LINE}</p>
          <p className="mx-auto mt-3 max-w-3xl text-center text-xs text-muted-foreground">Contact Centaur Careers for current fees, cohort details, and learning modes.</p>
        </div>
      </section>

      <section data-commercial-section="program-resources" className="bg-muted py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Practical decision support"
            title="Review the syllabus and practise with sample projects"
            intro="Download the current syllabus summary, then use fictional workflow records to understand the kind of evidence and exception reasoning that operations learners can practise."
            align="center"
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            <a href={DOWNLOAD_ASSETS.syllabus.path} download={DOWNLOAD_ASSETS.syllabus.filename} data-analytics-id="course-syllabus-download" data-analytics-intent="commercial_program" className="rounded-2xl border border-border bg-white p-6 font-bold text-primary shadow-sm transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lg">
              <span className="block text-lg">{DOWNLOAD_ASSETS.syllabus.label}</span>
              <span className="mt-2 block text-sm font-normal leading-relaxed text-muted-foreground">Modules, access, practical learning, certificate notes, and questions to confirm for the current cohort.</span>
            </a>
            <Link to="/blog/settlement-trade-break-worked-example/" className="rounded-2xl border border-border bg-white p-6 font-bold text-primary shadow-sm transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lg">
              <span className="block text-lg">Trade-break sample project</span>
              <span className="mt-2 block text-sm font-normal leading-relaxed text-muted-foreground">Open the fictional settlement-break case and download its source records.</span>
            </Link>
            <Link to="/blog/kyc-onboarding-case-file-example/" className="rounded-2xl border border-border bg-white p-6 font-bold text-primary shadow-sm transition hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-lg">
              <span className="block text-lg">KYC case-file sample</span>
              <span className="mt-2 block text-sm font-normal leading-relaxed text-muted-foreground">Review a fictional onboarding file, missing evidence, and a neutral case-note exercise.</span>
            </Link>
            <Link to="/contact/" data-conversion-cta data-analytics-id="course-syllabus-question" data-analytics-intent="commercial_program" className="rounded-2xl border border-primary bg-primary p-6 font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
              <span className="block text-lg">Ask for the current cohort details</span>
              <span className="mt-2 block text-sm font-normal leading-relaxed text-white/75">Confirm trainer information, assessments, fees, and support terms before applying.</span>
            </Link>
          </div>
        </div>
      </section>

      <section data-high-value-section="commercial-decision" className="bg-muted py-12">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Before you apply"
            title="One programme, with a source page for each enrolment decision"
            intro="Use the page that owns the answer you need: published fees and entry criteria, syllabus and duration, placement terms, or the questions to ask before enrolling. Request written cohort details for anything that needs confirmation."
            align="center"
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ['/courses/finance-course-fees-eligibility/', 'Fees and entry', 'Published mode fees, graduation entry rule, and written terms.'],
              ['/courses/finance-operations-syllabus/', 'Syllabus and duration', 'The six-week learning sequence and topics to confirm for a cohort.'],
              ['/placements/#job-guarantee-terms', 'Placement terms', 'The published Job Guarantee Program summary and current-term request.'],
              ['/blog/questions-to-ask-finance-institute-before-enrolling/', 'Before-enrolment checklist', 'Questions about practice, access, costs, certificates, refunds, and support.'],
              ['/contact/', 'Ask about a cohort', 'Request written answers to details that are not stated on the source pages.'],
            ].map(([path, title, description]) => (
              <Link key={path} to={path} className="rounded-2xl border border-border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-accent/60 hover:shadow-md">
                <span className="block font-bold text-primary">{title}</span>
                <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">{description}</span>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">Open source page <ArrowRight className="h-4 w-4" aria-hidden="true" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section data-commercial-section="learning-method" className="bg-muted py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="How learning works"
            title="Learn a workflow, practise it, explain your reasoning"
            intro="The published program describes live teaching, practical scenarios, case studies, and projects. Confirm the current cohort schedule, assessment format, and interview-preparation activities with the team."
            align="center"
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              ['Understand the process', 'Build a clear picture of the workflow and the role each step plays.'],
              ['Work through a scenario', 'Apply the concepts to a practical case or project rather than memorising terms alone.'],
              ['Check your understanding', 'Ask how progress is assessed and whether interview practice is included in the current cohort.'],
              ['Connect learning to roles', 'Compare the skills you practise with the responsibilities in current job descriptions.'],
            ].map(([title, description]) => (
              <article key={title} className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold text-primary">{title}</h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-commercial-section="certificate" className="bg-primary py-16 text-white sm:py-20">
        <div className="container mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Course Completion Certificate</p>
            <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">{CERTIFICATE.heading}</h2>
            <p className="mt-5 leading-relaxed text-white/70">{CERTIFICATE.description}</p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {CERTIFICATE.benefits.map((benefit) => <li key={benefit} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 p-5 text-white/80"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />{benefit}</li>)}
          </ul>
        </div>
      </section>

      <section data-commercial-section="program-comparison" className="bg-white py-16 sm:py-20">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={HOME_COPY.comparisonEyebrow} title={HOME_COPY.comparisonHeading} intro={HOME_COPY.comparisonDescription} align="center" />
          <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="w-full border-collapse text-left text-sm">
              <caption className="sr-only">Comparison between general finance courses and the Centaur Careers Financial Operations Masterclass</caption>
              <thead className="bg-primary font-bold text-white">
                <tr>
                  <th scope="col" className="w-1/2 p-5">Compare</th>
                  <th scope="col" className="w-1/2 p-5">What to verify</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {PROGRAM_COMPARISON.map(({ others, centaur }) => (
                  <tr key={others}>
                    <th scope="row" className="p-5 font-normal text-muted-foreground">{others}</th>
                    <td className="p-5 font-semibold text-primary">{centaur}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section data-commercial-section="program-faq" className="bg-muted py-16 sm:py-20">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Program FAQs" title="Frequently Asked Questions" intro="Review the original program answers before you apply." align="center" />
          <div className="space-y-3">
            {GENERAL_FAQS.map(({ question, answer }) => (
              <details key={question} className="group rounded-2xl border border-border bg-white p-6 shadow-sm">
                <summary className="cursor-pointer list-none pr-8 text-lg font-bold text-primary marker:hidden">{question}</summary>
                <p className="mt-4 whitespace-pre-line text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <InternalLinkGroup
        links={getInternalLinks('courses')}
        featuredRouteIds={['courses-finance-operations-syllabus', 'courses-finance-course-fees-eligibility', 'career-guides', 'resources', 'placements', 'india', 'faqs', 'contact']}
        visibleCount={12}
      />
      <CtaSection title={HOME_COPY.comparisonCtaHeading} description={HOME_COPY.comparisonCtaDescription} />
    </>
  );
}
