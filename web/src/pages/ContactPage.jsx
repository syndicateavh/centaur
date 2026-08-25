import React from 'react';
import { Mail, MapPin, MessageCircle, Phone, Route, Send } from 'lucide-react';
import { PageHero, SectionHeading } from '@/components/PageShell.jsx';
import { BUSINESS_DATA } from '@/content/businessData.js';
import { getSeoRoute } from '@/seo/seoRoutes.js';

const contacts = [
  {
    label: 'Call admissions',
    value: BUSINESS_DATA.displayTelephone,
    href: `tel:${BUSINESS_DATA.telephone}`,
    icon: Phone,
  },
  {
    label: 'Email',
    value: BUSINESS_DATA.email,
    href: `mailto:${BUSINESS_DATA.email}`,
    icon: Mail,
  },
  {
    label: 'WhatsApp',
    value: 'Message Centaur Careers',
    href: 'https://wa.link/aviltt',
    icon: MessageCircle,
    external: true,
  },
];

export default function ContactPage() {
  const seo = getSeoRoute('contact');

  return (
    <>
      <PageHero
        routeId="contact"
        eyebrow="Admissions and directions"
        title={seo.h1}
        intro="Ask about course suitability, current schedules, learning modes, fees and visits to the Lucknow training centre."
      />

      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Contact options" title="Speak with the admissions team" />
          <div className="grid gap-5 md:grid-cols-3">
            {contacts.map(({ label, value, href, icon: Icon, external }) => (
              <a
                key={label}
                href={href}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="rounded-2xl border border-border p-6 shadow-sm transition hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg"
              >
                <Icon className="h-7 w-7 text-accent" aria-hidden="true" />
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
              <MapPin className="h-7 w-7 text-accent" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-primary">Lucknow training centre</h2>
            </div>
            <address className="mt-6 not-italic text-muted-foreground">
              <strong className="text-primary">Centaur Careers × Mindsprout Career Hub</strong><br />
              {BUSINESS_DATA.address.streetAddress}<br />
              {BUSINESS_DATA.address.addressLocality}, {BUSINESS_DATA.address.addressRegion} {BUSINESS_DATA.address.postalCode}<br />
              India
            </address>
            <p className="mt-5 text-sm text-muted-foreground">Contact the team before visiting to confirm the current centre schedule and appointment availability.</p>
            <a
              href={BUSINESS_DATA.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4"
            >
              <Route className="h-4 w-4" /> Open directions
            </a>
          </article>
          <article className="rounded-2xl bg-primary p-8 text-white">
            <div className="flex items-center gap-3">
              <Send className="h-7 w-7 text-accent" aria-hidden="true" />
              <h2 className="text-2xl font-bold text-white">What to ask before enrolling</h2>
            </div>
            <ul className="mt-6 space-y-4 text-white/75">
              <li>Which course matches my education and preferred work area?</li>
              <li>What are the current batch dates, timetable and learning mode?</li>
              <li>What fees and written terms apply to this batch?</li>
              <li>What assignments and attendance expectations should I plan for?</li>
              <li>What career-support activities are included?</li>
            </ul>
          </article>
        </div>
      </section>
    </>
  );
}
