import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { HiringPartnerMarquee } from '@/components/HiringPartnerMarquee.jsx';
import { HIRING_PARTNER_LOGOS } from '@/content/hiringPartnerLogos.js';
import { HOME_COPY } from '@/content/sourceContent.js';
import { HomeSection } from './HomeSection.jsx';

export function HiringNetworkSection() {
  return (
    <HomeSection id="hiring-network" name="hiring-network" className="home-hiring-network py-16 sm:py-20 lg:py-24">
      <div className="relative" data-home-reveal-group>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div data-home-reveal className="home-hiring-overview relative overflow-hidden rounded-[2rem] bg-navy-gradient p-6 text-white shadow-panel sm:p-8 lg:p-10">
            <div className="home-hiring-overview-glow pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />
            <div className="home-hiring-overview-grid pointer-events-none absolute inset-0 opacity-60" aria-hidden="true" />
            <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(390px,0.95fr)] lg:items-end lg:gap-14">
              <div>
              <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-accent">
                <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_0_4px_rgba(212,175,55,0.14)]" aria-hidden="true" />
                {HOME_COPY.hiringNetworkEyebrow}
              </p>
              <h2 className="mt-4 max-w-xl text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[2.75rem]">{HOME_COPY.hiringNetworkHeading}</h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">{HOME_COPY.hiringNetworkDescription}</p>
              <Link to="/placements/" className="group mt-7 inline-flex items-center gap-3 rounded-full border border-accent/45 bg-accent px-5 py-3 text-sm font-bold text-primary shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-0.5 hover:bg-[#e4c558] focus-visible:ring-2 focus-visible:ring-accent">
                See Your 100% Job Guarantee
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:gap-4">
                {[
                  ['Interview preparation', 'Practise explaining finance workflows and your own experience.'],
                  ['Role guidance', 'Compare responsibilities with current employer descriptions.'],
                ].map(([title, description]) => (
                  <article key={title} className="rounded-2xl border border-white/15 bg-white/[0.07] p-5 backdrop-blur-sm">
                    <h3 className="font-semibold text-white">{title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/65">{description}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>

        </div>

        <div data-home-reveal className="home-hiring-partners mt-10 w-full overflow-hidden sm:mt-12">
          <div className="flex flex-col items-center text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent-ink">Our Hiring Partners</p>
            <div className="mt-3 h-1 w-16 rounded-full bg-accent" aria-hidden="true" />
          </div>
          <HiringPartnerMarquee partners={HIRING_PARTNER_LOGOS} />
        </div>
      </div>
    </HomeSection>
  );
}
