import React from 'react';
import { CheckCircle2, Mail, MapPin, MessageCircle, Phone, Route } from 'lucide-react';
import { Link } from 'react-router';
import InternalLinkGroup from '@/components/InternalLinkGroup.jsx';
import { CtaSection, PageHero, SectionHeading } from '@/components/PageShell.jsx';
import { BUSINESS_DATA } from '@/content/businessData.js';
import { GENERAL_FAQS } from '@/content/faqData.js';
import { CAREER_TRACKS, LEARNING_MODES, OFFLINE_PARTNER_LINE } from '@/content/sourceContent.js';
import { getInternalLinks } from '@/seo/internalLinks.js';
import { getSeoRoute } from '@/seo/seoRoutes.js';

export default function LucknowLocationPage() {
  const seo = getSeoRoute('lucknow-location');
  const offline = LEARNING_MODES.find((mode) => mode.name === 'Offline');
  const localFaq = Object.freeze({
    question: 'Where can I attend a finance course near me in Lucknow?',
    answer: `Centaur Careers publishes in-person Financial Operations Masterclass sessions at ${BUSINESS_DATA.trainingLocation.name}, ${BUSINESS_DATA.trainingLocation.address.addressLocality}, ${BUSINESS_DATA.trainingLocation.address.addressRegion} ${BUSINESS_DATA.trainingLocation.address.postalCode}. Review the address and directions on this page, then contact the team to confirm the current cohort schedule, fees, and seat availability.`,
  });

  return (
    <>
      <PageHero
        routeId="lucknow-location"
        eyebrow="Alambagh, Lucknow"
        title={seo.h1}
        intro={OFFLINE_PARTNER_LINE}
      >
        <div data-location-facts className="mt-8 grid gap-3 sm:grid-cols-3">
          {[
            ['Learning mode', 'In-person sessions'],
            ['Training location', 'Alambagh, Lucknow'],
            ['Postal code', `${BUSINESS_DATA.trainingLocation.address.addressRegion} ${BUSINESS_DATA.trainingLocation.address.postalCode}`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl border border-white/15 bg-white/10 px-4 py-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">{label}</p>
              <p className="mt-2 font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
      </PageHero>

      <section data-location-direct-answer className="border-b border-border bg-white py-8" aria-label="Lucknow course answer">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-primary">What can you study in person in Lucknow?</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">Centaur Careers lists in-person sessions for its six-week Financial Operations Masterclass at Mindsprout Career Hub in Alambagh, Lucknow. Investment banking operations is one module within the Masterclass, alongside other banking and finance operations topics. Contact the team before travelling to confirm the current cohort, session schedule, fees, seat availability, and facilities.</p>
          <Link to="/contact/" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white">Check the Lucknow cohort <Route className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </section>

      <section data-commercial-page="lucknow-location" data-commercial-section="location-details" className="bg-white py-16 sm:py-20">
        <div className="container mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <article>
            <SectionHeading eyebrow="Training venue" title="Mindsprout Career Hub, Lucknow" />
            <address data-location-address className="rounded-2xl border border-border bg-muted p-7 not-italic text-muted-foreground">
              <strong className="text-lg text-primary">{BUSINESS_DATA.trainingLocation.name}</strong><br />
              {BUSINESS_DATA.trainingLocation.address.streetAddress}<br />
              {BUSINESS_DATA.trainingLocation.address.addressLocality}, {BUSINESS_DATA.trainingLocation.address.addressRegion} {BUSINESS_DATA.trainingLocation.address.postalCode}<br />
              India<br />
              Training provider: {BUSINESS_DATA.name}
            </address>
            <div className="mt-6 flex flex-wrap gap-3">
              <a data-location-directions href={BUSINESS_DATA.trainingLocation.mapUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white">
                <Route className="h-5 w-5" aria-hidden="true" /> Open directions
              </a>
              <a data-location-phone href={`tel:${BUSINESS_DATA.telephone}`} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-border px-6 py-3 font-bold text-primary">
                <Phone className="h-5 w-5" aria-hidden="true" /> {BUSINESS_DATA.displayTelephone}
              </a>
              <a data-location-email href={`mailto:${BUSINESS_DATA.email}`} className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-border px-6 py-3 font-bold text-primary">
                <Mail className="h-5 w-5" aria-hidden="true" /> Email the team
              </a>
              <a data-location-whatsapp href={BUSINESS_DATA.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-border px-6 py-3 font-bold text-primary">
                <MessageCircle className="h-5 w-5" aria-hidden="true" /> WhatsApp the team
              </a>
            </div>
          </article>

          <aside className="rounded-2xl bg-primary p-8 text-white">
            <MapPin className="h-8 w-8 text-accent" aria-hidden="true" />
            <h2 className="mt-5 text-2xl font-bold text-white">{offline.summary}</h2>
            <p className="mt-3 text-sm font-semibold text-white/75">Current published fee</p>
            <p className="mt-3 text-3xl font-black text-accent">{offline.price}</p>
            <p className="mt-2 text-white/70">{offline.note} Confirm the current classroom cohort and total payable amount in writing before paying.</p>
            <ul className="mt-6 space-y-3">
              {offline.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3 text-sm text-white/75">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" /> {feature}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-sm font-semibold text-white">Complete the six-week program and get a finance job through the 100% Job Guarantee Program. Open to graduates and job switchers.</p>
          </aside>
        </div>
      </section>

      <section data-high-value-page="lucknow-location" data-commercial-section="location-program-access" className="bg-white py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Financial Operations Masterclass"
            title="Banking and finance course in Lucknow"
            intro="For learners searching for a practical finance or investment banking course in Lucknow, the Financial Operations Masterclass combines live BFSI instruction, module-based learning, and career support at the published Alambagh location."
            align="center"
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {CAREER_TRACKS.map((track) => (
              <article key={track.id} className="flex flex-col rounded-2xl border border-border p-6 shadow-sm">
                <h2 className="text-xl font-bold text-primary">{track.title}</h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{track.description}</p>
                {track.route && <Link to={track.route} className="mt-5 inline-flex font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">View module details</Link>}
              </article>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/courses/" className="inline-flex min-h-12 items-center rounded-xl bg-primary px-6 py-3 font-bold text-white">View the full program</Link>
            <Link to="/contact/" className="inline-flex min-h-12 items-center rounded-xl border border-border px-6 py-3 font-bold text-primary">Contact Centaur Careers</Link>
          </div>
        </div>
      </section>

      <section data-high-value-section="local-decision" className="bg-white py-12">
        <div className="container mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Before travelling to Alambagh"
            title="Confirm the Lucknow cohort before you enrol"
            intro="A local finance course should be evaluated by its published address, learning mode, schedule, curriculum, fees, and written support terms. Contact Centaur Careers to confirm which in-person sessions and facilities apply to the current cohort."
            align="center"
          />
          <Link to="/contact/" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white">Confirm the current Lucknow option <Route className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </section>

      <section data-commercial-section="local-faq" className="bg-muted py-16 sm:py-20">
        <div className="container mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Lucknow student questions" title="Frequently Asked Questions" align="center" />
          <div className="space-y-3">
            {[localFaq, GENERAL_FAQS[0], GENERAL_FAQS[1], GENERAL_FAQS[2], GENERAL_FAQS[4]].map(({ question, answer }) => (
              <details key={question} className="group rounded-2xl border border-border bg-white p-6 shadow-sm">
                <summary className="cursor-pointer list-none pr-8 text-lg font-bold text-primary marker:hidden">{question}</summary>
                <p className="mt-4 whitespace-pre-line text-muted-foreground">{answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section data-commercial-section="location-contact" className="bg-muted py-12">
        <div className="container mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-lg text-muted-foreground">{OFFLINE_PARTNER_LINE}</p>
          <Link to="/contact/" className="mt-6 inline-block font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Contact Centaur Careers</Link>
        </div>
      </section>

      <InternalLinkGroup links={getInternalLinks('lucknow-location')} />
      <CtaSection title="Ask about the Lucknow learning option" description="Confirm the current cohort schedule, published fees, learning location, and written support terms with Centaur Careers." primaryTo="/contact/" primaryLabel="Ask about Lucknow availability" primaryAnalyticsIntent="regional_course_enquiry" secondaryTo="/courses/" secondaryLabel="Review course details" />
    </>
  );
}
