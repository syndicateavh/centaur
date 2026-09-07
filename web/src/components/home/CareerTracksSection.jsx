import React from 'react';
import { ArrowRight, BriefcaseBusiness } from 'lucide-react';
import { Link } from 'react-router';
import { HOME_COPY, CAREER_TRACKS } from '@/content/sourceContent.js';
import { HomeSection } from './HomeSection.jsx';
import { SectionHeading } from '@/components/PageShell.jsx';

export function CareerTracksSection() {
  return (
    <HomeSection name="career-tracks" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" data-home-reveal-group>
        <SectionHeading eyebrow={HOME_COPY.tracksEyebrow} title={HOME_COPY.tracksHeading} intro={HOME_COPY.tracksDescription} align="center" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CAREER_TRACKS.map((track) => (
            <article data-home-reveal key={track.id} className="group flex min-h-52 flex-col rounded-2xl border border-border bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg">
              <div className="flex items-center justify-between gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/5 text-primary"><BriefcaseBusiness className="h-5 w-5" aria-hidden="true" /></div>
                <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-bold text-primary">{track.ctc}</span>
              </div>
              <h2 className="mt-5 text-xl font-bold text-primary">{track.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{track.description}</p>
              {track.route ? (
                <Link to={track.route} className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-primary transition group-hover:text-accent-foreground">
                  View track details <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              ) : <span className="mt-5 text-sm font-semibold text-muted-foreground">{track.ctc}</span>}
            </article>
          ))}
        </div>
        <div className="mt-8 text-center"><Link to="/courses/" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-primary/15 px-5 py-3 text-sm font-bold text-primary transition hover:border-accent hover:bg-accent/10">View the Financial Operations Masterclass</Link></div>
      </div>
    </HomeSection>
  );
}
