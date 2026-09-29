import React from 'react';
import { Link } from 'react-router';
import InternalLinkGroup from '@/components/InternalLinkGroup.jsx';
import { PageHero, SectionHeading } from '@/components/PageShell.jsx';
import { GENERAL_FAQS } from '@/content/faqData.js';
import { getInternalLinks } from '@/seo/internalLinks.js';
import { getSeoRoute } from '@/seo/seoRoutes.js';

export default function FaqPage() {
  const seo = getSeoRoute('faqs');

  return (
    <>
      <PageHero
        routeId="faqs"
        eyebrow="Frequently Asked Questions"
        title={seo.h1}
        intro="Answers about who can join, learning modes, support, interview opportunities, placement locations, and the next steps for the Financial Operations Masterclass."
      />

      <section data-faq-content="program" className="bg-white py-16 sm:py-20" aria-label="Financial Operations Masterclass program FAQs">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Program FAQ" title="Questions about the Financial Operations Masterclass" intro="Find clear answers about the course, learning modes, and career pathway." />
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
            <p className="mt-3 text-muted-foreground">Open to graduates and job switchers across India. Specific opportunities depend on current availability and employer decisions.</p>
            <div className="mt-5 flex flex-wrap gap-4">
              <Link to="/placements/" className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Review the placement process</Link>
              <Link to="/contact/" className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Contact Centaur Careers</Link>
            </div>
          </aside>

          <aside data-faq-supporting-resources className="mt-8 rounded-2xl border border-border bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-bold text-primary">More finance-career answers</h2>
            <p className="mt-3 text-muted-foreground">The program FAQ covers provider-specific questions. Use the career FAQ hub for general pathway questions and the interview resource for technical practice.</p>
            <div className="mt-5 flex flex-wrap gap-4">
              <Link to="/career-guides/financial-operations-faq/" className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Read career FAQs</Link>
              <Link to="/resources/investment-banking-interview-questions/" className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Practise interview questions</Link>
              <Link to="/resources/" className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Browse all resources</Link>
            </div>
          </aside>
        </div>
      </section>

      <InternalLinkGroup links={getInternalLinks('faqs')} />
    </>
  );
}
