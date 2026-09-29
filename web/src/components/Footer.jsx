import React from 'react';
import { Instagram, Linkedin, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Link } from 'react-router';
import { BUSINESS_DATA, SOCIAL_PROFILES } from '@/content/businessData.js';
import { PROGRAM } from '@/content/sourceContent.js';
import { ResponsiveImage } from '@/components/ui/responsive-image.jsx';
import { BRAND_LOGO_SOURCES } from '@/lib/imagePresets.js';

const programLinks = [
  { label: 'Financial Operations Masterclass', to: '/courses/' },
  { label: 'Fees and eligibility', to: '/courses/finance-course-fees-eligibility/' },
  { label: 'Job guarantee summary', to: '/placements/#job-guarantee-terms' },
  { label: 'Banking & Finance Career Quiz', to: '/quiz/' },
  { label: 'Investment Banking Ops', to: '/courses/investment-banking-operations/' },
  { label: 'Retail Banking', to: '/courses/retail-banking/' },
  { label: 'Finance Operations', to: '/courses/finance-operations/' },
];

const companyLinks = [
  { label: 'About us', to: '/about/' },
  { label: 'Placement support', to: '/placements/' },
  { label: 'Mindsprout Career Hub', to: '/locations/lucknow/' },
  { label: 'Program FAQs', to: '/faqs/' },
  { label: 'Career insights', to: '/blog/' },
  { label: 'Interview resources', to: '/resources/' },
  { label: 'Contact', to: '/contact/' },
];

const legalLinks = [
  { label: 'Privacy policy', to: '/privacy-policy/' },
  { label: 'Terms and conditions', to: '/terms-and-conditions/' },
  { label: 'Cookie policy', to: '/cookie-policy/' },
  { label: 'Refund and cancellation', to: '/refund-cancellation-policy/' },
  { label: 'Disclaimer', to: '/disclaimer/' },
];

const socialLinks = [
  { href: SOCIAL_PROFILES.linkedin, label: 'LinkedIn', icon: Linkedin },
  { href: SOCIAL_PROFILES.instagram, label: 'Instagram', icon: Instagram },
  { href: BUSINESS_DATA.whatsappUrl, label: 'WhatsApp', icon: MessageCircle },
];

function FooterHeading({ children }) {
  return (
    <div>
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">{children}</h2>
      <div className="mt-3 h-0.5 w-8 rounded-full bg-accent" aria-hidden="true" />
    </div>
  );
}

function FooterLinkList({ links }) {
  return (
    <ul className="mt-5 space-y-1">
      {links.map((link) => (
        <li key={link.to}>
          <Link to={link.to} className="site-footer-link inline-flex min-h-9 items-center rounded-md py-1 text-sm text-white/65 hover:text-accent">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function Footer() {
  return (
    <footer className="site-footer bg-navy-gradient text-white">
      <div className="site-footer-accent" aria-hidden="true" />

      <div className="design-container py-14 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-x-10">
          <div className="sm:col-span-2 lg:col-span-4 lg:pr-6">
            <Link to="/" aria-label="Centaur Careers home" className="site-footer-brand inline-flex items-center gap-3 rounded-lg">
              <span className="site-footer-logo flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white">
                <ResponsiveImage src="/images/brand/centaur-careers-logo.jpg" alt="Centaur Careers" className="h-full w-full object-cover" width="1440" height="1435" sizes="48px" sources={BRAND_LOGO_SOURCES} loading="lazy" />
              </span>
              <span className="font-display text-xl font-bold">Centaur Careers</span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-7 text-white/65">{PROGRAM.modelDescription}</p>
          </div>

          <nav aria-label="Masterclass" className="lg:col-span-3">
            <FooterHeading>Masterclass</FooterHeading>
            <FooterLinkList links={programLinks} />
          </nav>

          <nav aria-label="Company" className="lg:col-span-2">
            <FooterHeading>Company</FooterHeading>
            <FooterLinkList links={companyLinks} />
          </nav>

          <div className="sm:col-span-2 lg:col-span-3">
            <FooterHeading>Contact</FooterHeading>
            <ul className="mt-5 space-y-2 text-sm text-white/70">
              <li>
                <a href={`mailto:${BUSINESS_DATA.email}`} className="site-footer-contact group flex min-h-11 items-start gap-3 rounded-control px-3 py-3 hover:bg-white/[0.06] hover:text-white">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  <span className="min-w-0 break-words">{BUSINESS_DATA.email}</span>
                </a>
              </li>
              <li>
                <a href={`tel:${BUSINESS_DATA.telephone}`} className="site-footer-contact group flex min-h-11 items-start gap-3 rounded-control px-3 py-3 hover:bg-white/[0.06] hover:text-white">
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  <span>{BUSINESS_DATA.displayTelephone}</span>
                </a>
              </li>
              <li>
                <a href={BUSINESS_DATA.trainingLocation.mapUrl} target="_blank" rel="noopener noreferrer" className="site-footer-contact group flex min-h-11 items-start gap-3 rounded-control px-3 py-3 hover:bg-white/[0.06] hover:text-white">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                  <span><strong className="block font-semibold text-white/85">{BUSINESS_DATA.name}</strong>{BUSINESS_DATA.trainingLocation.address.streetAddress}, {BUSINESS_DATA.trainingLocation.address.addressLocality}, {BUSINESS_DATA.trainingLocation.address.addressRegion} {BUSINESS_DATA.trainingLocation.address.postalCode}</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <nav aria-label="Legal" className="mt-12 border-t border-white/10 pt-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            <h2 className="shrink-0 text-xs font-semibold uppercase tracking-[0.16em] text-white/55">Legal information</h2>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 sm:justify-end">
              {legalLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="site-footer-link inline-flex min-h-8 items-center text-xs text-white/55 hover:text-accent">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      <div className="border-t border-white/10 bg-primary/80">
        <div className="design-container flex flex-col items-center justify-between gap-4 py-5 sm:flex-row">
          <p className="text-center text-xs text-white/50 sm:text-left">© {new Date().getFullYear()} Centaur Careers. All rights reserved.</p>
          <div className="flex items-center gap-1">
            {socialLinks.map(({ href, label, icon: Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" className="site-footer-social inline-flex h-11 w-11 items-center justify-center rounded-full text-white/55 hover:bg-white/10 hover:text-accent" aria-label={label}>
                <Icon className="h-[1.125rem] w-[1.125rem]" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
