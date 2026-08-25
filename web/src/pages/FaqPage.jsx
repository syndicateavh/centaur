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
        eyebrow="Frequently Asked Questions"
        title={seo.h1}
        intro="Program eligibility, placement guarantee, learning modes, interview opportunities, placement cities and post-placement support."
      />

      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Original program FAQs" title="Information to review before enrolling" />
          <div className="space-y-4">
            {GENERAL_FAQS.map(({ question, answer }) => (
              <details key={question} className="group rounded-2xl border border-border bg-white p-6 open:border-accent/50 open:shadow-sm">
                <summary className="cursor-pointer list-none pr-8 text-lg font-bold text-primary marker:hidden">{question}</summary>
                <p className="mt-4 whitespace-pre-line text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
          <aside className="mt-10 rounded-2xl bg-muted p-7">
            <h2 className="text-2xl font-bold text-primary">Full terms available on request</h2>
            <p className="mt-3 text-muted-foreground">T&amp;C apply. Placement guarantee is contingent on meeting eligibility criteria.</p>
            <div className="mt-5 flex flex-wrap gap-4">
              <Link to="/placements/" className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Review placement eligibility</Link>
              <Link to="/contact/" className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Contact Centaur Careers</Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
