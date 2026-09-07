import React from 'react';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { Link } from 'react-router';
import { BUSINESS_DATA } from '@/content/businessData.js';
import {
  HERO_STEPS,
  HIRING_PARTNERS,
  PROGRAM,
} from '@/content/sourceContent.js';

const HERO_PANEL_STATS = [
  { value: '₹3–12 LPA', label: 'Target Salary' },
  { value: '105+', label: 'Roles' },
  { value: '6 Wks', label: 'Program' },
];

export function HomeHero({ seo }) {
  return (
    <section data-home-hero className="home-hero relative overflow-hidden bg-primary py-14 text-white sm:py-20 lg:py-24">
      <div className="home-hero-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(330px,0.85fr)] lg:items-center lg:px-8">
        <div className="max-w-3xl">
          <p data-home-hero-reveal className="inline-flex items-center gap-2 rounded-full border border-red-300/35 bg-red-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-red-100">
            <span className="h-2 w-2 rounded-full bg-red-300" />
            {PROGRAM.badge}
          </p>
          <p data-home-hero-reveal className="mt-7 text-base font-semibold text-accent sm:text-lg">{PROGRAM.challenge}</p>
          <h1 data-home-hero-reveal className="mt-3 max-w-3xl font-poppins text-4xl font-extrabold leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {seo.h1}
          </h1>
          <div data-home-hero-reveal className="mt-7 space-y-3">
            {[PROGRAM.modelDescription, PROGRAM.trainingDescription, PROGRAM.guaranteeDescription].map((proof) => (
              <p key={proof} className="flex items-start gap-3 text-sm leading-relaxed text-white/80 sm:text-base">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                <span>{proof}</span>
              </p>
            ))}
          </div>
          <div data-home-hero-reveal className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a data-home-magnetic href={BUSINESS_DATA.whatsappUrl} target="_blank" rel="noopener noreferrer" className="home-magnetic-button inline-flex min-h-12 items-center justify-center rounded-xl bg-accent px-6 py-3 font-bold text-primary shadow-lg shadow-accent/20 transition hover:-translate-y-0.5 hover:bg-[#e4c558] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary">
              Apply Now on WhatsApp <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </a>
            <a data-home-magnetic href={BUSINESS_DATA.enrollmentUrl} target="_blank" rel="noopener noreferrer" className="home-magnetic-button inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 bg-white/5 px-6 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              Enroll Now
            </a>
          </div>
          <div data-home-hero-reveal className="mt-8 grid gap-3 sm:grid-cols-3">
            {HERO_STEPS.map(({ number, title, detail }) => (
              <div key={number} className="border-l border-white/15 pl-4 first:border-l-0 first:pl-0">
                <p className="text-xs font-bold tracking-[0.18em] text-accent">{number}</p>
                <p className="mt-1 font-semibold text-white">{title}</p>
                <p className="mt-1 text-xs text-white/55">{detail}</p>
              </div>
            ))}
          </div>
          <div data-home-hero-reveal className="mt-8 flex flex-wrap gap-x-5 gap-y-3 border-t border-white/10 pt-6 text-sm text-white/70">
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />100% Placement Guarantee</span>
            <span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-accent" aria-hidden="true" />100+ Students Placed</span>
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" aria-hidden="true" />Lucknow + Pan-India Roles</span>
          </div>
        </div>

        <aside data-home-hero-reveal className="home-hero-panel rounded-3xl border border-white/15 bg-white/[0.07] p-5 shadow-2xl backdrop-blur sm:p-7">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <img src="/images/brand/centaur-careers-logo.jpg" alt="Centaur Careers" width="72" height="72" className="h-12 w-12 rounded-full border border-white/20 object-cover" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Financial Operations Masterclass</p>
                <p className="mt-1 text-sm text-white/65">{PROGRAM.model}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 py-6">
            {HERO_PANEL_STATS.map(({ value, label }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-primary/30 px-3 py-4 text-center">
                <p className="font-poppins text-lg font-bold text-white sm:text-xl">{value}</p>
                <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white/45">{label}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-accent/25 bg-accent/10 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Our Hiring Partners</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {HIRING_PARTNERS.slice(0, 4).map(({ name }) => (
                <span key={name} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-semibold text-white/80">{name}</span>
              ))}
            </div>
          </div>
          <Link to="/placements/" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white transition hover:text-accent">
            View hiring network <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </aside>
      </div>
    </section>
  );
}
