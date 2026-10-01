import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { ResponsiveImage } from '@/components/ui/responsive-image.jsx';
import { PROGRAM_PROCESS } from '@/content/sourceContent.js';
import { createImageSources } from '@/lib/imagePresets.js';
import { HomeSection } from './HomeSection.jsx';

const PROCESS_POSTERS = [
  'home-process-application-counselling',
  'home-process-practical-training',
  'home-process-placement-opportunities',
];

const PROCESS_IMAGE_SIZES = '(min-width: 960px) 20rem, (min-width: 640px) 40vw, 100vw';
const PROCESS_IMAGE_WIDTHS = [320, 480, 640, 768, 1024];

function getPosterSources(name) {
  return createImageSources({
    basePath: `/images/posters/${name}`,
    sizes: PROCESS_IMAGE_SIZES,
    widths: PROCESS_IMAGE_WIDTHS,
  });
}

export function HomeProcessSection() {
  return (
    <HomeSection
      name="process"
      data-home-process-scroll="true"
      aria-labelledby="home-process-title"
      className="border-b border-border bg-surface-warm"
    >
      <div data-home-process-pin className="home-process-pin">
        <div className="home-process-shell mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="home-process-copy">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent-ink">Our Process</p>
            <h2 id="home-process-title" className="mt-4 text-3xl font-bold leading-tight text-primary sm:text-4xl lg:text-5xl">
              How the Six-Week Finance Program and Job Guarantee Work
            </h2>
            <p className="mt-5 text-base text-muted-foreground sm:text-lg">
              Centaur Careers guarantees a finance job to graduates and job switchers who complete the six-week Financial Operations Masterclass.
            </p>

            <ol className="home-process-progress" aria-label="Placement process progress">
              {PROGRAM_PROCESS.map(({ step, title }, index) => (
                <li
                  key={step}
                  data-home-process-progress-item
                  data-state={index === 0 ? 'active' : 'upcoming'}
                  aria-current={index === 0 ? 'step' : undefined}
                  className="home-process-progress-item"
                >
                  <span className="home-process-progress-marker" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.65rem] font-bold uppercase tracking-[0.16em] text-accent-ink">{step}</span>
                    <span className="mt-1 block font-display text-sm font-semibold text-primary sm:text-base">{title}</span>
                  </span>
                </li>
              ))}
            </ol>

            <p className="home-process-scroll-hint">Scroll to follow the journey</p>
          </div>

          <div
            data-home-process-viewport
            className="home-process-stage"
            role="region"
            aria-label="Placement process steps"
          >
            <div data-home-process-track className="home-process-stack">
              {PROGRAM_PROCESS.map(({ step, title, subtitle, items }, index) => (
                <article data-home-process-step key={step} className="home-process-step">
                  <span className="home-process-step-accent" aria-hidden="true" />
                  <div className="home-process-step-layout">
                    <div data-home-process-media className="home-process-step-media" aria-hidden="true">
                      <ResponsiveImage
                        alt=""
                        className="h-full w-full object-cover"
                        height={1024}
                        sizes={PROCESS_IMAGE_SIZES}
                        sources={getPosterSources(PROCESS_POSTERS[index])}
                        src={`/images/posters/${PROCESS_POSTERS[index]}.jpg`}
                        width={1536}
                      />
                    </div>
                    <div className="home-process-step-content">
                      <div className="home-process-step-badge">
                        <span className="font-numeric text-base font-semibold">{String(index + 1).padStart(2, '0')}</span>
                        <span className="h-4 w-px bg-accent/35" aria-hidden="true" />
                        <span className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-accent-ink">{step}</span>
                      </div>
                      <h3 className="mt-6 text-2xl font-bold text-primary sm:text-3xl">{title}</h3>
                      <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{subtitle}</p>
                      <ul className="mx-auto mt-7 w-full max-w-lg space-y-3 text-left">
                        {items.map((item) => (
                          <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-foreground/75 sm:text-base">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </HomeSection>
  );
}
