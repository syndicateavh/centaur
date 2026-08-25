import React, { useEffect, useState } from 'react';
import { Instagram, Linkedin, Menu, MessageCircle, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router';
import { BUSINESS_DATA } from '@/content/businessData.js';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/courses/', label: 'Masterclass' },
  { to: '/placements/', label: 'Placements' },
  { to: '/about/', label: 'About' },
  { to: '/faqs/', label: 'FAQs' },
  { to: '/contact/', label: 'Contact' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setMobileMenuOpen(false), [location.pathname]);
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileMenuOpen]);

  const navClassName = ({ isActive }) =>
    `group relative py-2 text-sm font-semibold transition-colors duration-200 ${isActive ? 'text-primary' : 'text-foreground/75 hover:text-primary'}`;

  return (
    <>
      <div className="hidden border-b border-white/10 bg-primary px-4 py-2 text-white md:block">
        <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 text-xs font-medium text-white/80">
            <span>Financial Operations Masterclass</span>
            <span className="text-accent">•</span>
            <span>Lucknow + Pan-India Roles</span>
          </div>
          <div className="flex items-center gap-5 text-xs font-medium">
            <a href={BUSINESS_DATA.whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-white/80 transition-colors hover:text-accent"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</a>
            <a href="https://www.linkedin.com/company/centaur-careers/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-white/80 transition-colors hover:text-accent"><Linkedin className="h-3.5 w-3.5" /> LinkedIn</a>
            <a href="https://www.instagram.com/centaurcareers" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-white/80 transition-colors hover:text-accent"><Instagram className="h-3.5 w-3.5" /> Instagram</a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-border/70 bg-white py-2 shadow-sm">
        <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="Centaur Careers home" className="relative z-50 flex shrink-0 items-center gap-3">
            <img src="/images/brand/centaur-careers-logo.jpg" alt="Centaur Careers" className="h-11 w-11 rounded-full object-cover" width="1440" height="1435" decoding="async" />
            <span className="font-poppins text-lg font-bold leading-tight text-primary sm:text-xl">Centaur <span className="text-accent">Careers</span></span>
          </Link>

          <nav aria-label="Primary navigation" className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={navClassName}>
                {link.label}
                <span className="absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-accent transition-all group-hover:w-full" />
              </NavLink>
            ))}
            <a href={BUSINESS_DATA.enrollmentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center rounded-xl bg-accent px-6 text-sm font-bold text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">Start Your Application</a>
          </nav>

          <button type="button" onClick={() => setMobileMenuOpen((open) => !open)} aria-label="Toggle navigation menu" aria-expanded={mobileMenuOpen} className="relative z-50 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/5 text-primary lg:hidden">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <div className={`fixed inset-0 z-40 bg-primary transition-all duration-300 lg:hidden ${mobileMenuOpen ? 'visible translate-x-0 opacity-100' : 'invisible translate-x-full opacity-0'}`}>
          <div className="flex h-full flex-col overflow-y-auto px-6 pb-8 pt-24">
            <nav aria-label="Mobile navigation" className="mx-auto flex w-full max-w-md flex-col gap-2 text-center">
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => `rounded-xl px-4 py-4 font-poppins text-xl font-medium transition-colors ${isActive ? 'bg-white/10 text-accent' : 'text-white hover:bg-white/10 hover:text-accent'}`}>{link.label}</NavLink>
              ))}
              <div className="my-5 h-px bg-white/10" />
              <a href={BUSINESS_DATA.enrollmentUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex h-14 items-center justify-center rounded-xl bg-accent px-6 text-lg font-bold text-primary shadow-xl">Start Your Application</a>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
