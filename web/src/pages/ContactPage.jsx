import React from 'react';
import { Mail, MapPin, MessageCircle, Phone, Route, Send } from 'lucide-react';
import { Link } from 'react-router';
import InternalLinkGroup from '@/components/InternalLinkGroup.jsx';
import { PageHero, SectionHeading } from '@/components/PageShell.jsx';
import { BUSINESS_DATA } from '@/content/businessData.js';
import { DOWNLOAD_ASSETS } from '@/content/downloads.js';
import { CONTACT_COPY, OFFLINE_PARTNER_LINE } from '@/content/sourceContent.js';
import { getInternalLinks } from '@/seo/internalLinks.js';
import { getSeoRoute } from '@/seo/seoRoutes.js';

const contacts = [
  { label: 'Phone', value: BUSINESS_DATA.displayTelephone, href: `tel:${BUSINESS_DATA.telephone}`, icon: Phone },
  { label: 'Email', value: BUSINESS_DATA.email, href: `mailto:${BUSINESS_DATA.email}`, icon: Mail },
  { label: CONTACT_COPY.whatsapp, value: CONTACT_COPY.whatsappDescription, href: BUSINESS_DATA.whatsappUrl, icon: MessageCircle, external: true },
];

export default function ContactPage() {
  const seo = getSeoRoute('contact');

  return (
    <>
      <PageHero
        routeId="contact"
        eyebrow={CONTACT_COPY.eyebrow}
        title={seo.h1}
        intro={CONTACT_COPY.description}
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={BUSINESS_DATA.whatsappUrl} target="_blank" rel="noopener noreferrer" data-analytics-id="contact-whatsapp" data-analytics-intent="commercial_program" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent px-6 py-3 font-bold text-primary">
            <MessageCircle className="h-5 w-5" aria-hidden="true" /> Ask on WhatsApp
          </a>
          <a href={BUSINESS_DATA.enrollmentUrl} target="_blank" rel="noopener noreferrer" data-analytics-id="contact-application" data-analytics-channel="enrollment" data-analytics-intent="commercial_program" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent px-6 py-3 font-bold text-primary">
            <Send className="h-5 w-5" aria-hidden="true" /> Start Your Application
          </a>
          <a href={DOWNLOAD_ASSETS.syllabus.path} download={DOWNLOAD_ASSETS.syllabus.filename} data-analytics-id="contact-syllabus-download" data-analytics-intent="commercial_program" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3 font-bold text-white">
            Download syllabus summary
          </a>
        </div>
        <nav aria-label="Review before applying" className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-white/80">
          <Link to="/courses/finance-course-fees-eligibility/" className="underline decoration-accent underline-offset-4 hover:text-white">Fees and eligibility</Link>
          <Link to="/placements/#job-guarantee-terms" className="underline decoration-accent underline-offset-4 hover:text-white">Job guarantee summary</Link>
          <Link to="/refund-cancellation-policy/" className="underline decoration-accent underline-offset-4 hover:text-white">Refund and cancellation</Link>
        </nav>
      </PageHero>

      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Contact channels" title={CONTACT_COPY.heading} intro="Call, email, or message the team. Choose the channel that works best for your course or enrolment question." />
          <div className="grid gap-5 md:grid-cols-3">
            {contacts.map(({ label, value, href, icon: Icon, external }) => (
              <a key={label} href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="rounded-2xl border border-border p-6 shadow-sm transition hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg">
                <Icon className="h-7 w-7 text-accent-ink" aria-hidden="true" />
                <h2 className="mt-5 text-lg font-bold text-primary">{label}</h2>
                <p className="mt-2 break-words text-sm text-muted-foreground">{value}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted py-16 sm:py-20">
        <div className="container mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <article className="rounded-2xl bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3">
              <MapPin className="h-7 w-7 text-accent-ink" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-primary">Published in-person learning location</h2>
            </div>
            <address className="mt-6 not-italic text-muted-foreground">
              <strong className="text-primary">{BUSINESS_DATA.trainingLocation.name}</strong><br />
              {BUSINESS_DATA.trainingLocation.address.streetAddress}<br />
              {BUSINESS_DATA.trainingLocation.address.addressLocality}, {BUSINESS_DATA.trainingLocation.address.addressRegion} {BUSINESS_DATA.trainingLocation.address.postalCode}<br />
              India<br />
              Training provider: {BUSINESS_DATA.name}
            </address>
            <a href={BUSINESS_DATA.trainingLocation.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">
              <Route className="h-4 w-4" aria-hidden="true" /> Open directions
            </a>
          </article>
          <article className="rounded-2xl bg-primary p-8 text-white">
            <h2 className="text-2xl font-bold text-white">Online access across India</h2>
            <p className="mt-5 text-white/70">{OFFLINE_PARTNER_LINE}</p>
            <p className="mt-6 text-white/70">The published program has a live online option across India and an in-person option in Lucknow. Contact Centaur Careers to confirm current cohort availability, schedule, fees, and written support terms.</p>
            <Link to="/courses/" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/25 px-5 py-3 font-bold text-white">View the course details <Route className="h-4 w-4" aria-hidden="true" /></Link>
          </article>
        </div>
      </section>

      <InternalLinkGroup links={getInternalLinks('contact')} />
    </>
  );
}
