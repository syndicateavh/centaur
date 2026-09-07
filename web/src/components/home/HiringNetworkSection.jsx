import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { HiringPartnerMarquee } from '@/components/HiringPartnerMarquee.jsx';
import { HIRING_PARTNERS, HOME_COPY } from '@/content/sourceContent.js';
import { HomeSection } from './HomeSection.jsx';

const HIRING_NETWORK_STATS = [
  ['200+', 'Partner Companies'],
  ['100+', 'Students Placed'],
  ['3–12 LPA', 'Average CTC Range'],
];

export function HiringNetworkSection() {
  return (
    <HomeSection name="hiring-network" className="bg-[#fbfaf5] py-12 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8" data-home-reveal-group>
        <div data-home-reveal className="grid items-center gap-6 rounded-2xl border border-accent/20 bg-white p-6 shadow-sm md:grid-cols-[1fr_auto] md:p-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">{HOME_COPY.hiringNetworkEyebrow}</p>
            <h2 className="mt-2 text-2xl font-bold text-primary sm:text-3xl">{HOME_COPY.hiringNetworkHeading}</h2>
            <p className="mt-2 text-muted-foreground">{HOME_COPY.hiringNetworkDescription}</p>
          </div>
          <div className="grid grid-cols-3 divide-x divide-border text-center">
            {HIRING_NETWORK_STATS.map(([value, label]) => (
              <div key={label} className="min-w-24 px-3 sm:px-5">
                <p className="font-poppins text-lg font-bold text-primary sm:text-xl">{value}</p>
                <p className="mt-1 text-[0.62rem] font-bold uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-5 text-center"><Link to="/placements/" className="inline-flex items-center gap-2 text-sm font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">View hiring network and placement outcomes <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div>
        <div className="mt-10 border-t border-border pt-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Our Hiring Partners</p>
          <HiringPartnerMarquee partners={HIRING_PARTNERS} />
        </div>
      </div>
    </HomeSection>
  );
}
