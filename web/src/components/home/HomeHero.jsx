import React from 'react';
import {
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router';
import { BUSINESS_DATA } from '@/content/businessData.js';
import { HeroParticleNetwork } from '@/components/home/HeroParticleNetwork.jsx';
import { ResponsiveImage } from '@/components/ui/responsive-image.jsx';
import { BRAND_LOGO_SOURCES } from '@/lib/imagePresets.js';

export function HomeHero({ seo }) {
  return (
    <section aria-labelledby="home-page-title" data-home-hero className="home-hero relative overflow-hidden bg-primary py-14 text-white sm:py-20 lg:py-24">
      <div className="home-hero-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      <HeroParticleNetwork />
      <div data-home-hero-glow className="home-hero-glow pointer-events-none absolute" aria-hidden="true" />
      <div data-home-hero-orbit className="home-hero-orbit pointer-events-none absolute hidden lg:block" aria-hidden="true" />
      <div className="home-hero-content relative z-[2] mx-auto box-border grid w-full min-w-0 max-w-7xl grid-cols-[minmax(0,1fr)] gap-12 pl-4 pr-6 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(330px,0.85fr)] lg:items-center lg:px-8">
        <div className="min-w-0 max-w-3xl">
          <p data-home-hero-reveal className="inline-flex max-w-full flex-wrap items-center gap-2 rounded-full border border-red-300/35 bg-red-400/10 px-3 py-2 text-[0.68rem] font-bold uppercase tracking-[0.1em] text-red-100 sm:px-4 sm:text-xs sm:tracking-[0.16em]">
            <span className="h-2 w-2 rounded-full bg-red-300" />
            6-Week Financial Operations Masterclass
          </p>
          <p data-home-hero-reveal className="mt-7 max-w-full text-base font-semibold text-accent sm:text-lg">Practical Banking &amp; Finance Training</p>
          <h1 id="home-page-title" data-home-lcp className="mt-3 w-full min-w-0 max-w-full font-display text-[clamp(2rem,8vw,2.75rem)] font-bold leading-[1.02] tracking-tight text-white sm:text-[clamp(2.75rem,5vw,3.75rem)] sm:leading-[1.06]">
            {seo.h1}
          </h1>
          <h2 data-home-hero-reveal className="mt-4 min-w-0 max-w-full text-lg font-semibold leading-snug text-white/90 sm:text-xl">
            Financial Operations Masterclass for Banking and Finance Careers
          </h2>
          <div data-home-hero-reveal className="mt-7 space-y-3">
            {[
              'A guaranteed finance job for graduates and job switchers who complete the six-week Financial Operations Masterclass.',
              'Build practical skills across banking operations, KYC and AML, payments, credit, and FinTech.',
              'Choose live online learning across India or in-person sessions in Lucknow.',
              'Prepare for finance interviews through structured practice, projects, and career guidance.',
            ].map((proof) => (
              <p key={proof} className="flex items-start gap-3 text-sm leading-relaxed text-white/80 sm:text-base">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                <span>{proof}</span>
              </p>
            ))}
          </div>
          <Link to="/placements/#job-guarantee-terms" className="mt-4 inline-flex text-xs font-semibold text-white/65 underline decoration-accent/70 underline-offset-4 transition hover:text-white">
            View guarantee summary
          </Link>
          <div data-home-hero-reveal className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a data-home-magnetic href={BUSINESS_DATA.whatsappUrl} target="_blank" rel="noopener noreferrer" className="home-magnetic-button inline-flex min-h-12 items-center justify-center rounded-xl bg-accent px-6 py-3 font-bold text-primary shadow-lg shadow-accent/20 transition hover:-translate-y-0.5 hover:bg-[#e4c558] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary">
              Apply Now on WhatsApp <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </a>
            <a data-home-magnetic href={BUSINESS_DATA.enrollmentUrl} target="_blank" rel="noopener noreferrer" className="home-magnetic-button inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 bg-white/5 px-6 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              Enroll Now
            </a>
          </div>
          <div data-home-hero-reveal className="mt-8 flex flex-wrap gap-x-5 gap-y-3 border-t border-white/10 pt-6 text-sm text-white/70">
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" aria-hidden="true" />6-week focused program</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" aria-hidden="true" />Online across India</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent" aria-hidden="true" />In-person in Lucknow</span>
          </div>
        </div>

        <aside data-home-hero-reveal data-home-hero-panel className="home-hero-panel relative rounded-3xl border border-white/15 bg-white/[0.07] p-5 shadow-2xl backdrop-blur sm:p-7">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <ResponsiveImage src="/images/brand/centaur-careers-logo.jpg" alt="Centaur Careers" width="72" height="72" sizes="48px" sources={BRAND_LOGO_SOURCES} loading="lazy" className="h-12 w-12 rounded-full border border-white/20 object-cover" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Financial Operations Masterclass</p>
                <p className="mt-1 text-sm text-white/65">Career-focused finance training</p>
              </div>
            </div>
          </div>
          <div className="home-hero-flow border-b border-white/10 py-6" data-home-hero-flow>
            <div className="home-hero-flow-item" data-home-hero-detail data-home-hero-flow-item data-state="active" aria-current="step">
              <svg className="home-hero-flow-border" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <rect x="1.25" y="1.25" width="97.5" height="97.5" rx="8" pathLength="100" vectorEffect="non-scaling-stroke" />
              </svg>
              <span className="home-hero-flow-index" aria-hidden="true">01</span>
              <div>
                <p className="font-semibold text-white">Apply &amp; match</p>
                <p className="mt-1 text-xs leading-relaxed text-white/55">Profile review and finance-track counselling.</p>
              </div>
            </div>
            <div className="home-hero-flow-line" data-home-hero-flow-line data-state="active" aria-hidden="true">
              <span className="home-hero-flow-arrow" />
            </div>
            <div className="home-hero-flow-item" data-home-hero-detail data-home-hero-flow-item data-state="upcoming">
              <svg className="home-hero-flow-border" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <rect x="1.25" y="1.25" width="97.5" height="97.5" rx="8" pathLength="100" vectorEffect="non-scaling-stroke" />
              </svg>
              <span className="home-hero-flow-index" aria-hidden="true">02</span>
              <div>
                <p className="font-semibold text-white">Train by doing</p>
                <p className="mt-1 text-xs leading-relaxed text-white/55">Ask about current cohort teaching and practice methods.</p>
              </div>
            </div>
            <div className="home-hero-flow-line" data-home-hero-flow-line data-state="upcoming" aria-hidden="true">
              <span className="home-hero-flow-arrow" />
            </div>
            <div className="home-hero-flow-item" data-home-hero-detail data-home-hero-flow-item data-state="upcoming">
              <svg className="home-hero-flow-border" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <rect x="1.25" y="1.25" width="97.5" height="97.5" rx="8" pathLength="100" vectorEffect="non-scaling-stroke" />
              </svg>
              <span className="home-hero-flow-index" aria-hidden="true">03</span>
              <div>
                <p className="font-semibold text-white">Get a guaranteed finance job</p>
                <p className="mt-1 text-xs leading-relaxed text-white/55">Complete the program and get a finance job through the 100% Job Guarantee Program.</p>
              </div>
            </div>
          </div>
          <div className="home-hero-support pt-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Included support</p>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
              {['Finance operations curriculum', 'Practical scenarios and projects', 'Ask about interview-preparation activities', 'Review current career-support terms'].map((detail) => (
                <span key={detail} data-home-hero-detail className="home-hero-detail text-xs text-white/70">{detail}</span>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
