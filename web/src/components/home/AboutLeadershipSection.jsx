import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { ABOUT_SUMMARY, LEADERSHIP, LEADERSHIP_INTRO } from '@/content/sourceContent.js';
import { HomeSection } from './HomeSection.jsx';

export function AboutLeadershipSection() {
  return (
    <HomeSection name="about-leadership" className="bg-muted py-16 sm:py-20">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1.25fr_0.75fr] lg:px-8" data-home-reveal-group>
        <article data-home-reveal className="rounded-2xl bg-white p-7 shadow-sm sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-ink">About Centaur Careers</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-bold text-primary sm:text-4xl">{ABOUT_SUMMARY.heading}</h2>
          {ABOUT_SUMMARY.paragraphs.map((paragraph) => <p key={paragraph} className="mt-5 text-muted-foreground">{paragraph}</p>)}
          <Link to="/about/" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-primary">What Centaur Careers does and how it works <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </article>
        <aside data-home-reveal className="rounded-2xl bg-primary p-7 text-white shadow-sm sm:p-9">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Our Leadership</p>
          <h2 className="mt-3 text-3xl font-bold text-white">{LEADERSHIP_INTRO.heading}</h2>
          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-lg font-bold text-white">{LEADERSHIP[0].name}</p>
            <p className="mt-1 font-semibold text-accent">{LEADERSHIP[0].role}</p>
            <p className="mt-4 text-sm leading-relaxed text-white/65">{LEADERSHIP[0].experience}</p>
          </div>
          <Link to="/about/" className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-white">Meet the leadership team <ArrowRight className="h-4 w-4 text-accent" aria-hidden="true" /></Link>
        </aside>
      </div>
    </HomeSection>
  );
}
