import React from 'react';
import { Link } from 'react-router';
import { PageHero, SectionHeading } from '@/components/PageShell.jsx';
import { GENERAL_FAQS } from '@/content/faqData.js';
import { getSeoRoute } from '@/seo/seoRoutes.js';

export default function FaqPage() {
  const seo = getSeoRoute('faqs');

  return (
    <>
      <PageHero
        routeId="faqs"
        eyebrow="Admissions information"
        title={seo.h1}
        intro="Clear answers about courses, suitability, learning modes, current information and responsible career support."
      />

      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Frequently asked questions"
            title="Information to review before enrolling"
            intro="Batch dates, fees and delivery arrangements can change. Confirm current details with admissions before making a decision or payment."
          />
          <div className="space-y-4">
            {GENERAL_FAQS.map(({ question, answer }) => (
              <details key={question} className="group rounded-2xl border border-border bg-white p-6 open:border-accent/50 open:shadow-sm">
                <summary className="cursor-pointer list-none pr-8 text-lg font-bold text-primary marker:hidden">
                  {question}
                </summary>
                <p className="mt-4 text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>

          <aside className="mt-10 rounded-2xl bg-muted p-7">
            <h2 className="text-2xl font-bold text-primary">Need a batch-specific answer?</h2>
            <p className="mt-3 text-muted-foreground">
              Contact admissions for current schedules, modes, fees and written terms. Course pages provide detailed curriculum information.
            </p>
            <div className="mt-5 flex flex-wrap gap-4">
              <Link to="/contact/" className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Contact admissions</Link>
              <Link to="/courses/" className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Compare courses</Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
