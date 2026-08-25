import React from 'react';
import { Instagram, Linkedin, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { Link } from 'react-router';
import { BUSINESS_DATA } from '@/content/businessData.js';
import { PROGRAM } from '@/content/sourceContent.js';

const programLinks = [
  { label: 'Financial Operations Masterclass', to: '/courses/' },
  { label: 'Investment Banking Ops', to: '/courses/investment-banking-operations/' },
  { label: 'Retail Banking', to: '/courses/retail-banking/' },
  { label: 'Finance Operations', to: '/courses/finance-operations/' },
];

const companyLinks = [
  { label: 'About us', to: '/about/' },
  { label: 'Placement guarantee', to: '/placements/' },
  { label: 'Mindsprout Careers Hub', to: '/locations/lucknow/' },
  { label: 'Program FAQs', to: '/faqs/' },
  { label: 'Contact', to: '/contact/' },
];

export default function Footer() {
  return (
    <footer className="bg-navy-gradient text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 lg:px-16">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          <div>
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-white">
                <img src="/images/brand/centaur-careers-logo.jpg" alt="Centaur Careers" className="h-full w-full object-cover" width="1440" height="1435" loading="lazy" decoding="async" />
              </div>
              <span className="font-poppins text-lg font-bold">Centaur Careers</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-white/60">{PROGRAM.modelDescription}</p>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-white">Masterclass</h2>
            <div className="mt-3 h-0.5 w-8 rounded-full bg-accent" />
            <ul className="mt-5 space-y-3">
              {programLinks.map((link) => <li key={link.to}><Link to={link.to} className="text-sm text-white/60 transition-colors hover:text-accent">{link.label}</Link></li>)}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-white">Company</h2>
            <div className="mt-3 h-0.5 w-8 rounded-full bg-accent" />
            <ul className="mt-5 space-y-3">
              {companyLinks.map((link) => <li key={link.to}><Link to={link.to} className="text-sm text-white/60 transition-colors hover:text-accent">{link.label}</Link></li>)}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-white">Contact</h2>
            <div className="mt-3 h-0.5 w-8 rounded-full bg-accent" />
            <ul className="mt-5 space-y-4 text-sm text-white/70">
              <li className="flex items-start gap-3"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-accent" /><a href={`mailto:${BUSINESS_DATA.email}`} className="hover:text-accent">{BUSINESS_DATA.email}</a></li>
              <li className="flex items-start gap-3"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-accent" /><a href={`tel:${BUSINESS_DATA.telephone}`} className="hover:text-accent">{BUSINESS_DATA.displayTelephone}</a></li>
              <li className="flex items-start gap-3"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" /><span>{BUSINESS_DATA.address.streetAddress}, {BUSINESS_DATA.address.addressLocality}, {BUSINESS_DATA.address.addressRegion} {BUSINESS_DATA.address.postalCode}</span></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 bg-primary">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-4 sm:flex-row sm:px-10 lg:px-16">
          <p className="text-xs text-white/50">© {new Date().getFullYear()} Centaur Careers. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="https://www.linkedin.com/company/centaur-careers/" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-accent" aria-label="LinkedIn"><Linkedin size={18} /></a>
            <a href="https://www.instagram.com/centaurcareers" target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-accent" aria-label="Instagram"><Instagram size={18} /></a>
            <a href={BUSINESS_DATA.whatsappUrl} target="_blank" rel="noopener noreferrer" className="text-white/50 hover:text-accent" aria-label="WhatsApp"><MessageCircle size={18} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
