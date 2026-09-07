import React from 'react';
import {
  BookOpen,
  BriefcaseBusiness,
  GraduationCap,
  MapPin,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { SectionHeading } from '@/components/PageShell.jsx';
import { HOME_COPY, PROGRAM_FEATURES } from '@/content/sourceContent.js';
import { HomeSection } from './HomeSection.jsx';

const FEATURE_ICONS = [ShieldCheck, BriefcaseBusiness, BookOpen, MapPin, Users, GraduationCap];

export function ProgramFeaturesSection() {
  return (
    <HomeSection name="program-features" className="bg-primary py-16 text-white sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" data-home-reveal-group>
        <SectionHeading eyebrow={HOME_COPY.whyEyebrow} title={HOME_COPY.whyHeading} intro={HOME_COPY.whyDescription} align="center" light />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PROGRAM_FEATURES.map(({ title, description }, index) => {
            const Icon = FEATURE_ICONS[index];
            return (
              <article data-home-reveal key={title} className="rounded-2xl border border-white/10 bg-white/[0.045] p-6 transition hover:border-accent/40 hover:bg-white/[0.075]">
                <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
                <h2 className="mt-5 text-xl font-bold text-white">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/65">{description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </HomeSection>
  );
}
