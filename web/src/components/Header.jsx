import React, { useEffect, useState } from 'react';
import { Instagram, Linkedin, Menu, MessageCircle, X } from 'lucide-react';
import { Link, NavLink, useLocation } from 'react-router';

const navLinks = [
  { to: '/', label: 'Home', end: true },
  { to: '/courses/', label: 'Courses' },
  { to: '/placements/', label: 'Placements' },
  { to: '/about/', label: 'About' },
  { to: '/contact/', label: 'Contact' },
];

const logoUrl =
  'https://horizons-cdn.hostinger.com/cffb4313-a439-4b6d-a0e2-eb0a66a950b9/743152148dd3f6734568a106bb709d06.jpg';

const enrollmentUrl = 'https://forms.gle/S27eFPLigM2gwumVA';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const navClassName = ({ isActive }) =>
    `group relative py-2 text-sm font-semibold transition-colors duration-200 ${
      isActive ? 'text-primary' : 'text-foreground/75 hover:text-primary'
    }`;

  return (
    <>
      <div className="hidden border-b border-white/10 bg-primary px-4 py-2 text-white md:block">
        <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 text-xs font-medium text-white/80">
            <span>Banking &amp; Finance Training</span>
            <span className="text-accent">•</span>
            <span>Lucknow and Live Online</span>
          </div>
          <div className="flex items-center gap-5 text-xs font-medium">
            <a href="https://wa.link/aviltt" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-white/80 transition-colors hover:text-accent">
              <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
            </a>
            <a href="https://www.linkedin.com/company/centaur-careers/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-white/80 transition-colors hover:text-accent">
              <Linkedin className="h-3.5 w-3.5" /> LinkedIn
            </a>
            <a href="https://www.instagram.com/centaurcareers" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-white/80 transition-colors hover:text-accent">
              <Instagram className="h-3.5 w-3.5" /> Instagram
            </a>
          </div>
        </div>
      </div>

      <header className={`sticky top-0 z-50 w-full bg-white transition-all duration-300 ${isScrolled ? 'border-b border-border/70 py-2 shadow-md' : 'border-b border-border py-3'}`}>
        <div className="container mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" aria-label="Centaur Careers home" className="relative z-50 flex shrink-0 items-center gap-3">
            <img src={logoUrl} alt="Centaur Careers" className={`rounded-full object-cover transition-all ${isScrolled ? 'h-10 w-10 sm:h-11 sm:w-11' : 'h-11 w-11 sm:h-12 sm:w-12'}`} width="48" height="48" />
            <span className="font-poppins text-lg font-bold leading-tight text-primary sm:text-xl">Centaur <span className="text-accent">Careers</span></span>
          </Link>

          <nav aria-label="Primary navigation" className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <NavLink key={link.to} to={link.to} end={link.end} className={navClassName}>
                {link.label}
                <span className="absolute bottom-0 left-0 h-0.5 w-0 rounded-full bg-accent transition-all group-hover:w-full group-[.active]:w-full" />
              </NavLink>
            ))}
            <a href={enrollmentUrl} target="_blank" rel="noopener noreferrer" className="inline-flex h-11 items-center justify-center rounded-xl bg-accent px-6 text-sm font-bold text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
              Apply for details
            </a>
          </nav>

          <button type="button" onClick={() => setMobileMenuOpen((open) => !open)} aria-label="Toggle navigation menu" aria-expanded={mobileMenuOpen} className="relative z-50 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/5 text-primary lg:hidden">
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <div className={`fixed inset-0 z-40 bg-primary transition-all duration-300 lg:hidden ${mobileMenuOpen ? 'visible translate-x-0 opacity-100' : 'invisible translate-x-full opacity-0'}`}>
          <div className="flex h-full flex-col overflow-y-auto px-6 pb-8 pt-24">
            <nav aria-label="Mobile navigation" className="mx-auto flex w-full max-w-md flex-col gap-2 text-center">
              {navLinks.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => `rounded-xl px-4 py-4 font-poppins text-xl font-medium transition-colors ${isActive ? 'bg-white/10 text-accent' : 'text-white hover:bg-white/10 hover:text-accent'}`}>
                  {link.label}
                </NavLink>
              ))}
              <div className="my-5 h-px bg-white/10" />
              <a href={enrollmentUrl} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex h-14 items-center justify-center rounded-xl bg-accent px-6 text-lg font-bold text-primary shadow-xl">
                Apply for details
              </a>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
