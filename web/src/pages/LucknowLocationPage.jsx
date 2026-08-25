import React from 'react';
import { BookOpenCheck, Building2, MapPin, Monitor, Phone, Route } from 'lucide-react';
import { Link } from 'react-router';
import { CtaSection, PageHero, SectionHeading } from '@/components/PageShell.jsx';
import { BUSINESS_DATA } from '@/content/businessData.js';
import { getSeoRoute } from '@/seo/seoRoutes.js';

export default function LucknowLocationPage() {
  const seo = getSeoRoute('lucknow-location');

  return (
    <>
      <PageHero
        routeId="lucknow-location"
        eyebrow="Alambagh, Lucknow"
        title={seo.h1}
        intro="Find the centre address, plan a visit and understand which banking and finance learning pathways are presented by Centaur Careers in Lucknow."
      />

      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <article>
            <SectionHeading
              eyebrow="Centre address"
              title="Visit the Alambagh training centre"
              intro="Please contact admissions before travelling so the team can confirm the current centre timetable and appointment availability."
            />
            <address className="rounded-2xl border border-border bg-muted p-7 not-italic text-muted-foreground">
              <strong className="text-lg text-primary">Centaur Careers × Mindsprout Career Hub</strong><br />
              {BUSINESS_DATA.address.streetAddress}<br />
              {BUSINESS_DATA.address.addressLocality}, {BUSINESS_DATA.address.addressRegion} {BUSINESS_DATA.address.postalCode}<br />
              India
            </address>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={BUSINESS_DATA.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white"
              >
                <Route className="h-5 w-5" aria-hidden="true" /> Open directions
              </a>
              <a
                href={`tel:${BUSINESS_DATA.telephone}`}
                className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-border bg-white px-6 py-3 font-bold text-primary"
              >
                <Phone className="h-5 w-5" aria-hidden="true" /> Call before visiting
              </a>
            </div>
          </article>

          <aside className="rounded-2xl bg-primary p-8 text-white">
            <MapPin className="h-8 w-8 text-accent" aria-hidden="true" />
            <h2 className="mt-5 text-2xl font-bold text-white">Plan your visit</h2>
            <ul className="mt-6 space-y-4 text-white/75">
              <li>Confirm the date and time with admissions.</li>
              <li>Ask which learning pathway and batch you want to discuss.</li>
              <li>Bring questions about eligibility, curriculum, fees and attendance.</li>
              <li>Request the current written course and support terms before enrolling.</li>
            </ul>
            <Link to="/contact/" className="mt-7 inline-block font-bold text-white underline decoration-accent decoration-2 underline-offset-4">
              View every contact option
            </Link>
          </aside>
        </div>
      </section>

      <section className="bg-muted py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Learning options"
            title="Discuss practical banking and finance pathways"
            intro="Published course pages explain the curriculum before you contact the centre for current batch details."
            align="center"
          />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              ['Investment Banking Operations', '/courses/investment-banking-operations/', BookOpenCheck],
              ['Retail Banking', '/courses/retail-banking/', Building2],
              ['Finance Operations', '/courses/finance-operations/', Monitor],
            ].map(([title, to, Icon]) => (
              <article key={title} className="rounded-2xl bg-white p-7 text-center shadow-sm">
                <Icon className="mx-auto h-7 w-7 text-accent" aria-hidden="true" />
                <h2 className="mt-5 text-xl font-bold text-primary">{title}</h2>
                <Link to={to} className="mt-5 inline-block font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">
                  Review the course
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaSection
        title="Confirm your visit to the Lucknow centre"
        description="Ask admissions about current schedules, centre access and the documents or questions useful for your discussion."
      />
    </>
  );
}
