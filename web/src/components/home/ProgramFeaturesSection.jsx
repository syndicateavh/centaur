import React from 'react';
import {
  BookOpen,
  BriefcaseBusiness,
  GraduationCap,
  MapPin,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading.jsx';
import { ResponsiveImage } from '@/components/ui/responsive-image.jsx';
import { HOME_COPY, PROGRAM_FEATURES } from '@/content/sourceContent.js';
import { HomeSection } from './HomeSection.jsx';

const FEATURE_ICONS = [ShieldCheck, BriefcaseBusiness, BookOpen, MapPin, Users, GraduationCap];
const FEATURE_POSTER = '/images/posters/home-feature-hands-on-workshop';

export function ProgramFeaturesSection() {
  return (
    <HomeSection name="program-features" className="bg-primary py-16 text-white sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" data-home-reveal-group>
        <div className="home-program-features-intro grid items-center gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(28rem,1.1fr)] lg:gap-12">
          <div data-home-reveal className="home-program-features-heading">
            <SectionHeading eyebrow={HOME_COPY.whyEyebrow} title={HOME_COPY.whyHeading} intro={HOME_COPY.whyDescription} align="left" light />
          </div>
          <div data-home-reveal data-home-image-reveal className="home-program-features-media overflow-hidden rounded-[1.75rem] border border-white/15 bg-white/[0.06] shadow-panel">
            <ResponsiveImage
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover"
              height={1024}
              sizes="(min-width: 1024px) 44vw, 100vw"
              sources={[
                { srcSet: `${FEATURE_POSTER}.avif`, type: 'image/avif' },
                { srcSet: `${FEATURE_POSTER}.webp`, type: 'image/webp' },
              ]}
              src={`${FEATURE_POSTER}.jpg`}
              width={1536}
            />
          </div>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:mt-12 lg:grid-cols-3">
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
