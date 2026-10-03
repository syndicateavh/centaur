import React from 'react';
import { CheckCircle2, Clock3, Route } from 'lucide-react';
import { Link } from 'react-router';
import InternalLinkGroup from '@/components/InternalLinkGroup.jsx';
import CommercialDecisionChecklist from '@/components/CommercialDecisionChecklist.jsx';
import TopicProgramPathway from '@/components/TopicProgramPathway.jsx';
import { CtaSection, PageHero, SectionHeading } from '@/components/PageShell.jsx';
import { ResponsiveImage } from '@/components/ui/responsive-image.jsx';
import { getCourseData } from '@/content/courseData.js';
import { getCourseTrackImage } from '@/content/courseImages.js';
import { GENERAL_FAQS } from '@/content/faqData.js';
import { CAREER_TRACKS, HOME_COPY, PROGRAM, PROGRAM_PROCESS } from '@/content/sourceContent.js';
import { getInternalLinks } from '@/seo/internalLinks.js';
import { getSeoRoute } from '@/seo/seoRoutes.js';

const SEARCH_INTENT_CONTENT = Object.freeze({
  'investment-banking-operations': Object.freeze({
    heading: 'Investment Banking Operations Training Topics',
    intro: 'For learners comparing investment banking courses or investment banking training, this module focuses on the operational workflows taught within the full Financial Operations Masterclass.',
  }),
  'retail-banking': Object.freeze({
    heading: 'Retail Banking Course Topics',
    intro: 'This retail banking training module introduces practical topics connected with branch operations, customer relationships, lending support, and NRI banking within the full program.',
  }),
  'finance-operations': Object.freeze({
    heading: 'Financial and Credit Analyst Skills Covered',
    intro: 'Learners exploring financial analyst or credit analyst training can review how this module introduces NBFC processes, loan processing, credit analysis, and risk management within the wider program.',
  }),
});

export default function CourseDetailPage({ courseId }) {
  const track = getCourseData(courseId);
  const trackImage = getCourseTrackImage(courseId);
  const seo = getSeoRoute(track.seoId);
  const trackTopics = track.description.split(', ');
  const searchContent = SEARCH_INTENT_CONTENT[courseId];

  return (
    <>
      <PageHero
        routeId={track.seoId}
        eyebrow={HOME_COPY.tracksEyebrow}
        title={seo.h1}
        intro={track.description}
        sideContent={(
          <figure className="course-detail-media aspect-[4/3] overflow-hidden rounded-3xl border border-white/15 bg-white/5 shadow-2xl">
            <ResponsiveImage
              {...trackImage}
              alt={`${track.title} course module`}
              className="course-detail-image"
              sizes="(min-width: 1024px) 38rem, 100vw"
            />
          </figure>
        )}
      >
        <div className="mt-8 flex flex-wrap gap-3 text-sm">
          <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3"><Clock3 className="h-4 w-4 text-accent" aria-hidden="true" /> {PROGRAM.duration}</span>
          <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3"><Route className="h-4 w-4 text-accent" aria-hidden="true" /> {PROGRAM.model}</span>
        </div>
        <Link to="/courses/" className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-primary shadow-lg shadow-accent/15 transition hover:-translate-y-0.5">
          View the full Financial Operations Masterclass <Route className="h-4 w-4" aria-hidden="true" />
        </Link>
      </PageHero>

      <section data-commercial-section="module-overview" className="bg-white py-16 sm:py-20">
        <div className="container mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
          <article>
            <SectionHeading eyebrow={HOME_COPY.tracksHeading} title={track.title} />
            <p className="text-lg text-muted-foreground">{track.description}</p>
            <p className="mt-5 rounded-xl border border-accent/30 bg-accent/10 p-4 text-sm font-semibold text-primary">This subject is taught within the <Link to="/courses/" className="underline decoration-accent decoration-2 underline-offset-4">Financial Operations Masterclass</Link> as a module, not as a separate program.</p>
            {courseId === 'investment-banking-operations' && <p className="mt-4 rounded-xl border border-border bg-muted p-4 text-sm leading-relaxed text-muted-foreground">Centaur Careers does not offer a separate Investment Banking Operations certification. The published Course Completion Certificate applies to the full Financial Operations Masterclass under its current completion terms; it is not an external professional or regulatory credential.</p>}
            <p className="mt-5 rounded-xl border border-border bg-muted p-4 text-sm text-muted-foreground">This is a curriculum module within the Financial Operations Masterclass. Graduates and job switchers who complete the six-week program get a finance job through the 100% Job Guarantee Program.</p>
          </article>
          <div>
            <article className="rounded-2xl border border-border bg-muted p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-primary">{searchContent.heading}</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">{searchContent.intro}</p>
              <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                {trackTopics.map((topic) => (
                  <li key={topic} className="flex items-start gap-3 rounded-xl bg-white p-4 font-medium text-foreground/80">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent-ink" aria-hidden="true" /> {topic}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </section>

      <TopicProgramPathway topicId={courseId} />

      <section data-commercial-section="module-process" className="bg-muted py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Our Process"
            title="Complete the Program. Get a Guaranteed Finance Job."
            intro="Graduates and job switchers who complete the six-week Financial Operations Masterclass get a finance job through the 100% Job Guarantee Program."
            align="center"
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {PROGRAM_PROCESS.map(({ step, title, subtitle, items }) => (
              <article key={step} className="rounded-2xl bg-white p-7 shadow-sm">
                <p className="text-xs font-black uppercase tracking-widest text-accent-ink">{step}</p>
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

      <section data-commercial-section="module-directory" className="bg-white py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={HOME_COPY.tracksEyebrow} title={HOME_COPY.tracksHeading} intro={HOME_COPY.tracksDescription} align="center" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {CAREER_TRACKS.map((item) => (
              <article key={item.id} className={`rounded-xl border p-5 ${item.id === track.id ? 'border-accent bg-accent/5' : 'border-border'}`}>
                <h2 className="font-bold text-primary">{item.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
                <p className="mt-3 text-sm font-semibold text-accent-foreground">Curriculum module</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-commercial-section="module-faq" className="bg-primary py-16 text-white">
        <div className="container mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <article>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Frequently Asked Questions</p>
            <h2 className="mt-3 text-3xl font-bold text-white">{GENERAL_FAQS[0].question}</h2>
            <p className="mt-5 text-white/70">{GENERAL_FAQS[0].answer}</p>
          </article>
          <article>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent">Frequently Asked Questions</p>
            <h2 className="mt-3 text-3xl font-bold text-white">{GENERAL_FAQS[2].question}</h2>
            <p className="mt-5 whitespace-pre-line text-white/70">{GENERAL_FAQS[2].answer}</p>
          </article>
        </div>
      </section>

      <section className="bg-white py-12">
        <div className="container mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-muted-foreground">
            Read the original program answers on the <Link to="/faqs/" className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">complete FAQ page</Link> and the full program process on the <Link to="/placements/" className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">placement page</Link>.
          </p>
        </div>
      </section>

      <CommercialDecisionChecklist
        context={`${track.title} curriculum module`}
        title={`What to verify before choosing ${track.title} training`}
        intro="Use the module description to understand the subject area, then verify the complete programme scope and current participation terms before enrolling."
        primaryLabel="Review the Financial Operations Masterclass"
      />

      <InternalLinkGroup links={getInternalLinks(track.seoId)} />
      <CtaSection title="Ask about this curriculum module" description="Contact the team to confirm current course details, learning modes, fees, and support terms." />
    </>
  );
}
