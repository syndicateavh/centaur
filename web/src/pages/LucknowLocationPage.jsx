import React from 'react';
import { CheckCircle2, MapPin, Phone, Route } from 'lucide-react';
import { Link } from 'react-router';
import { CtaSection, PageHero, SectionHeading } from '@/components/PageShell.jsx';
import { BUSINESS_DATA } from '@/content/businessData.js';
import { LEARNING_MODES, OFFLINE_PARTNER_LINE } from '@/content/sourceContent.js';
import { getSeoRoute } from '@/seo/seoRoutes.js';

export default function LucknowLocationPage() {
  const seo = getSeoRoute('lucknow-location');
  const offline = LEARNING_MODES.find((mode) => mode.name === 'Offline');

  return (
    <>
      <PageHero
        routeId="lucknow-location"
        eyebrow="Alambagh, Lucknow"
        title={seo.h1}
        intro={OFFLINE_PARTNER_LINE}
      />

      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <article>
            <SectionHeading eyebrow="Centre address" title="Mindsprout Careers Hub, Lucknow" />
            <address className="rounded-2xl border border-border bg-muted p-7 not-italic text-muted-foreground">
              <strong className="text-lg text-primary">{BUSINESS_DATA.trainingPartner}</strong><br />
              {BUSINESS_DATA.address.streetAddress}<br />
              {BUSINESS_DATA.address.addressLocality}, {BUSINESS_DATA.address.addressRegion} {BUSINESS_DATA.address.postalCode}<br />
              India
            </address>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={BUSINESS_DATA.mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white">
                <Route className="h-5 w-5" /> Open directions
              </a>
              <a href={`tel:${BUSINESS_DATA.telephone}`} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-border px-6 py-3 font-bold text-primary">
                <Phone className="h-5 w-5" /> {BUSINESS_DATA.displayTelephone}
              </a>
            </div>
          </article>

          <aside className="rounded-2xl bg-primary p-8 text-white">
            <MapPin className="h-8 w-8 text-accent" />
            <h2 className="mt-5 text-2xl font-bold text-white">{offline.summary}</h2>
            <p className="mt-3 text-3xl font-black text-accent">{offline.price}</p>
            <p className="mt-2 text-sm text-white/60 line-through">{offline.originalPrice}</p>
            <p className="mt-3 text-white/70">{offline.note}</p>
            <ul className="mt-6 space-y-3">
              {offline.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-white/75">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" /> {feature}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm font-semibold text-white">Placement guarantee subject to terms.</p>
          </aside>
        </div>
      </section>

      <section className="bg-muted py-12">
        <div className="container mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-lg text-muted-foreground">{OFFLINE_PARTNER_LINE}</p>
          <Link to="/contact/" className="mt-6 inline-block font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Contact Centaur Careers</Link>
        </div>
      </section>

      <CtaSection title="Start Your Application" description="Fill out the enrollment form and our team will reach out within 24 hours." />
    </>
  );
}
