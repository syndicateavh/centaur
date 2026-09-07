import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { PROGRAM_PROCESS } from '@/content/sourceContent.js';
import { HomeSection } from './HomeSection.jsx';

export function HomeProcessSection() {
  return (
    <HomeSection
      name="process"
      data-home-process-scroll="true"
      aria-labelledby="home-process-title"
      className="border-b border-border bg-[#fbfaf5]"
    >
      <div data-home-process-pin className="home-process-pin">
        <div className="home-process-shell mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="home-process-copy">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Our Process</p>
            <h2 id="home-process-title" className="mt-4 text-3xl font-bold leading-tight text-primary sm:text-4xl lg:text-5xl">
              From Applicant to Placed — In 3 Steps
            </h2>
            <p className="mt-5 text-base text-muted-foreground sm:text-lg">
              One clear path. One outcome: your first ₹3–12 LPA finance job.
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
                    <span className="block text-[0.65rem] font-bold uppercase tracking-[0.16em] text-accent">{step}</span>
                    <span className="mt-1 block font-poppins text-sm font-bold text-primary sm:text-base">{title}</span>
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
                  <div className="relative mx-auto flex h-full w-full max-w-xl flex-col items-center justify-center text-center">
                    <div className="home-process-step-badge">
                      <span className="font-poppins text-base font-black">{String(index + 1).padStart(2, '0')}</span>
                      <span className="h-4 w-px bg-accent/35" aria-hidden="true" />
                      <span className="text-[0.65rem] font-bold uppercase tracking-[0.16em] text-accent">{step}</span>
                    </div>
                    <h3 className="mt-6 text-2xl font-bold text-primary sm:text-3xl">{title}</h3>
                    <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{subtitle}</p>
                    <ul className="mx-auto mt-7 w-full max-w-lg space-y-3 text-left">
                      {items.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-foreground/75 sm:text-base">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
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
