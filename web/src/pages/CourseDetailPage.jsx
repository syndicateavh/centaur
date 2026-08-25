import React from 'react';
import { BookOpenCheck, BriefcaseBusiness, Clock3, MapPin, Monitor } from 'lucide-react';
import { Checklist, CtaSection, PageHero, SectionHeading } from '@/components/PageShell.jsx';
import { getCourseData } from '@/content/courseData.js';
import { getSeoRoute } from '@/seo/seoRoutes.js';

export default function CourseDetailPage({ courseId }) {
  const course = getCourseData(courseId);
  const seo = getSeoRoute(course.seoId);

  return (
    <>
      <PageHero
        eyebrow={course.eyebrow}
        title={seo.h1}
        intro={course.intro}
        breadcrumbs={[{ label: 'Courses', to: '/courses/' }, { label: seo.h1 }]}
      >
        <div className="mt-8 grid max-w-3xl gap-3 text-sm sm:grid-cols-3">
          <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3"><Clock3 className="h-4 w-4 text-accent" /> Guided course pathway</span>
          <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3"><MapPin className="h-4 w-4 text-accent" /> Lucknow centre</span>
          <span className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3"><Monitor className="h-4 w-4 text-accent" /> Live online option</span>
        </div>
      </PageHero>

      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.25fr_0.75fr] lg:px-8">
          <div>
            <SectionHeading eyebrow="Course overview" title="What this pathway covers" />
            <p className="text-lg text-muted-foreground">{course.overview}</p>
          </div>
          <aside className="rounded-2xl bg-primary p-7 text-white">
            <h2 className="text-2xl font-bold text-white">Who this is designed for</h2>
            <div className="mt-5"><Checklist items={course.audience} light /></div>
          </aside>
        </div>
      </section>

      <section className="bg-muted py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Curriculum"
            title="Skills and process modules"
            intro="Modules build from foundations toward applied scenarios and interview communication."
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {course.modules.map((module, index) => (
              <article key={module.title} className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <BookOpenCheck className="h-6 w-6 text-accent" aria-hidden="true" />
                  <span className="font-poppins text-2xl font-black text-primary/10">0{index + 1}</span>
                </div>
                <h2 className="text-lg font-bold text-primary">{module.title}</h2>
                <p className="mt-3 text-sm text-muted-foreground">{module.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <article className="rounded-2xl border border-border p-8">
            <h2 className="text-2xl font-bold text-primary">Learning outcomes</h2>
            <div className="mt-6"><Checklist items={course.outcomes} /></div>
          </article>
          <article className="rounded-2xl border border-border p-8">
            <div className="flex items-center gap-3">
              <BriefcaseBusiness className="h-6 w-6 text-accent" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-primary">Related role areas</h2>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Training can support preparation for entry-level discussions in these areas. Role availability and selection are controlled by employers.
            </p>
            <div className="mt-6"><Checklist items={course.relatedRoles} /></div>
          </article>
        </div>
      </section>

      <section className="bg-muted py-16">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Delivery and eligibility" title="How to confirm the current batch" />
          <div className="grid gap-5 md:grid-cols-3">
            <div className="rounded-xl bg-white p-6 shadow-sm"><h2 className="font-bold text-primary">Eligibility</h2><p className="mt-2 text-sm text-muted-foreground">Designed for graduates, final-year students and early-career learners. Admissions will confirm suitability.</p></div>
            <div className="rounded-xl bg-white p-6 shadow-sm"><h2 className="font-bold text-primary">Learning modes</h2><p className="mt-2 text-sm text-muted-foreground">Instructor-led options may include the Lucknow centre and live online delivery.</p></div>
            <div className="rounded-xl bg-white p-6 shadow-sm"><h2 className="font-bold text-primary">Current schedule</h2><p className="mt-2 text-sm text-muted-foreground">Contact admissions for current duration, timetable, fees and seat availability before enrolling.</p></div>
          </div>
        </div>
      </section>

      <CtaSection
        title={`Discuss the ${seo.h1}`}
        description="Ask for the current curriculum, schedule, learning mode and admissions requirements before making a decision."
      />
    </>
  );
}
