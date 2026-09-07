import React from 'react';
import {
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  GraduationCap,
  MapPin,
  Users,
} from 'lucide-react';
import { SectionHeading } from '@/components/PageShell.jsx';
import { HOME_COPY, PROGRAM_BENEFITS } from '@/content/sourceContent.js';
import { HomeSection } from './HomeSection.jsx';

const BENEFIT_ICONS = [BadgeCheck, Users, BriefcaseBusiness, MapPin, GraduationCap, BookOpen];

export function ProgramBenefitsSection() {
  return (
    <HomeSection name="program-benefits" className="bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" data-home-reveal-group>
        <SectionHeading eyebrow={HOME_COPY.benefitsEyebrow} title={HOME_COPY.benefitsHeading} intro={HOME_COPY.benefitsDescription} align="center" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PROGRAM_BENEFITS.map(({ title, description }, index) => {
            const Icon = BENEFIT_ICONS[index];
            return (
              <article data-home-reveal key={title} className="rounded-2xl border border-border bg-white p-6 transition hover:border-accent/40 hover:shadow-md">
                <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
                <h2 className="mt-5 text-xl font-bold text-primary">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </article>
            );
          })}
        </div>
      </div>
    </HomeSection>
  );
}
