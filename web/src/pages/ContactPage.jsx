import React from 'react';
import { Mail, MapPin, MessageCircle, Phone, Route, Send } from 'lucide-react';
import { PageHero, SectionHeading } from '@/components/PageShell.jsx';
import { BUSINESS_DATA } from '@/content/businessData.js';
import { CONTACT_COPY, OFFLINE_PARTNER_LINE } from '@/content/sourceContent.js';
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
        <a href={BUSINESS_DATA.enrollmentUrl} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-xl bg-accent px-6 py-3 font-bold text-primary">
          <Send className="h-5 w-5" /> Start Your Application
        </a>
      </PageHero>

      <section className="bg-white py-16 sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow={CONTACT_COPY.eyebrow} title={CONTACT_COPY.heading} intro={CONTACT_COPY.description} />
          <div className="grid gap-5 md:grid-cols-3">
            {contacts.map(({ label, value, href, icon: Icon, external }) => (
              <a key={label} href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})} className="rounded-2xl border border-border p-6 shadow-sm transition hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg">
                <Icon className="h-7 w-7 text-accent" />
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
              <MapPin className="h-7 w-7 text-accent" />
              <h2 className="text-2xl font-bold text-primary">{BUSINESS_DATA.trainingPartner}</h2>
            </div>
            <address className="mt-6 not-italic text-muted-foreground">
              {BUSINESS_DATA.address.streetAddress}<br />
              {BUSINESS_DATA.address.addressLocality}, {BUSINESS_DATA.address.addressRegion} {BUSINESS_DATA.address.postalCode}<br />
              India
            </address>
            <a href={BUSINESS_DATA.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">
              <Route className="h-4 w-4" /> Open directions
            </a>
          </article>
          <article className="rounded-2xl bg-primary p-8 text-white">
            <h2 className="text-2xl font-bold text-white">{CONTACT_COPY.quickContact}</h2>
            <p className="mt-5 text-white/70">{OFFLINE_PARTNER_LINE}</p>
            <p className="mt-6 text-white/70">Free counselling call with our advisor</p>
          </article>
        </div>
      </section>
    </>
  );
}
