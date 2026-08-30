import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  CheckCircle2,
  GraduationCap,
  MapPin,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { Link } from 'react-router';
import { HiringPartnerMarquee } from '@/components/HiringPartnerMarquee.jsx';
import { CtaSection, SectionHeading } from '@/components/PageShell.jsx';
import { BUSINESS_DATA } from '@/content/businessData.js';
import {
  ABOUT_SUMMARY,
  CAREER_TRACKS,
  HERO_STEPS,
  HIRING_PARTNERS,
  HOME_COPY,
  LEADERSHIP,
  LEADERSHIP_INTRO,
  PROGRAM,
  PROGRAM_BENEFITS,
  PROGRAM_FEATURES,
  PROGRAM_PROCESS,
} from '@/content/sourceContent.js';
import { getSeoRoute } from '@/seo/seoRoutes.js';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const featureIcons = [ShieldCheck, BriefcaseBusiness, BookOpen, MapPin, Users, GraduationCap];
const benefitIcons = [BadgeCheck, Users, BriefcaseBusiness, MapPin, GraduationCap, BookOpen];

function HomeHero({ seo }) {
  const heroPanelStats = [
    { value: '₹3–12 LPA', label: 'Target Salary' },
    { value: '105+', label: 'Roles' },
    { value: '6 Wks', label: 'Program' },
  ];

  return (
    <section data-home-hero className="home-hero relative overflow-hidden bg-primary py-14 text-white sm:py-20 lg:py-24">
      <div className="home-hero-grid pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(330px,0.85fr)] lg:items-center lg:px-8">
        <div className="max-w-3xl">
          <p data-home-hero-reveal className="inline-flex items-center gap-2 rounded-full border border-red-300/35 bg-red-400/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-red-100">
            <span className="h-2 w-2 rounded-full bg-red-300" />
            {PROGRAM.badge}
          </p>
          <p data-home-hero-reveal className="mt-7 text-base font-semibold text-accent sm:text-lg">{PROGRAM.challenge}</p>
          <h1 data-home-hero-reveal className="mt-3 max-w-3xl font-poppins text-4xl font-extrabold leading-[1.04] tracking-tight text-white sm:text-5xl lg:text-6xl">
            {seo.h1}
          </h1>
          <div data-home-hero-reveal className="mt-7 space-y-3">
            {[PROGRAM.modelDescription, PROGRAM.trainingDescription, PROGRAM.guaranteeDescription].map((proof) => (
              <p key={proof} className="flex items-start gap-3 text-sm leading-relaxed text-white/80 sm:text-base">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                <span>{proof}</span>
              </p>
            ))}
          </div>
          <div data-home-hero-reveal className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a data-home-magnetic href={BUSINESS_DATA.whatsappUrl} target="_blank" rel="noopener noreferrer" className="home-magnetic-button inline-flex min-h-12 items-center justify-center rounded-xl bg-accent px-6 py-3 font-bold text-primary shadow-lg shadow-accent/20 transition hover:-translate-y-0.5 hover:bg-[#e4c558] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary">
              Apply Now on WhatsApp <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </a>
            <a data-home-magnetic href={BUSINESS_DATA.enrollmentUrl} target="_blank" rel="noopener noreferrer" className="home-magnetic-button inline-flex min-h-12 items-center justify-center rounded-xl border border-white/25 bg-white/5 px-6 py-3 font-bold text-white transition hover:-translate-y-0.5 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
              Enroll Now
            </a>
          </div>
          <div data-home-hero-reveal className="mt-8 grid gap-3 sm:grid-cols-3">
            {HERO_STEPS.map(({ number, title, detail }) => (
              <div key={number} className="border-l border-white/15 pl-4 first:border-l-0 first:pl-0">
                <p className="text-xs font-bold tracking-[0.18em] text-accent">{number}</p>
                <p className="mt-1 font-semibold text-white">{title}</p>
                <p className="mt-1 text-xs text-white/55">{detail}</p>
              </div>
            ))}
          </div>
          <div data-home-hero-reveal className="mt-8 flex flex-wrap gap-x-5 gap-y-3 border-t border-white/10 pt-6 text-sm text-white/70">
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />100% Placement Guarantee</span>
            <span className="flex items-center gap-2"><BadgeCheck className="h-4 w-4 text-accent" aria-hidden="true" />100+ Students Placed</span>
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" aria-hidden="true" />Lucknow + Pan-India Roles</span>
          </div>
        </div>

        <aside data-home-hero-reveal data-home-tilt-panel className="home-hero-panel rounded-3xl border border-white/15 bg-white/[0.07] p-5 shadow-2xl backdrop-blur sm:p-7">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div className="flex items-center gap-3">
              <img src="/images/brand/centaur-careers-logo.jpg" alt="Centaur Careers" width="72" height="72" className="h-12 w-12 rounded-full border border-white/20 object-cover" />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Financial Operations Masterclass</p>
                <p className="mt-1 text-sm text-white/65">{PROGRAM.model}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 py-6">
            {heroPanelStats.map(({ value, label }) => (
              <div key={label} className="rounded-2xl border border-white/10 bg-primary/30 px-3 py-4 text-center">
                <p className="font-poppins text-lg font-bold text-white sm:text-xl">{value}</p>
                <p className="mt-1 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-white/45">{label}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-accent/25 bg-accent/10 p-5">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-accent">Our Hiring Partners</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {HIRING_PARTNERS.slice(0, 4).map(({ name }) => (
                <span key={name} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-semibold text-white/80">{name}</span>
              ))}
            </div>
          </div>
          <Link to="/placements/" className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-white transition hover:text-accent">
            View hiring network <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </aside>
      </div>
    </section>
  );
}

export default function SeoHomePage() {
  const seo = getSeoRoute('home');
  const homeRef = useRef(null);

  useGSAP(() => {
    const media = gsap.matchMedia();

    media.add(
      {
        desktop: '(min-width: 960px)',
        finePointer: '(hover: hover) and (pointer: fine)',
        reducedMotion: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const { desktop, finePointer, reducedMotion } = context.conditions;
        if (reducedMotion) return undefined;

        const homeElement = homeRef.current;
        const heroItems = homeElement?.querySelectorAll('[data-home-hero-reveal]') ?? [];
        const heroTimeline = gsap.timeline({ defaults: { ease: 'power2.out' } });
        heroTimeline.from(heroItems, {
          duration: 0.48,
          stagger: 0.09,
          y: desktop ? 18 : 12,
        });

        const revealGroups = homeElement?.querySelectorAll('[data-home-reveal-group]') ?? [];
        revealGroups.forEach((group) => {
          const cards = group.querySelectorAll('[data-home-reveal]');
          if (!cards.length) return;

          gsap.from(cards, {
            duration: 0.5,
            ease: 'power2.out',
            stagger: desktop ? 0.08 : 0.05,
            y: desktop ? 20 : 12,
            scrollTrigger: {
              trigger: group,
              start: 'top 82%',
              once: true,
            },
          });
        });

        if (!finePointer) return undefined;

        const cleanups = [];
        const hero = homeElement?.querySelector('[data-home-hero]');
        const tiltPanel = homeElement?.querySelector('[data-home-tilt-panel]');

        if (hero && tiltPanel) {
          gsap.set(tiltPanel, { transformPerspective: 1200, transformOrigin: 'center center' });
          const rotateXTo = gsap.quickTo(tiltPanel, 'rotationX', { duration: 0.45, ease: 'power3.out' });
          const rotateYTo = gsap.quickTo(tiltPanel, 'rotationY', { duration: 0.45, ease: 'power3.out' });
          const onHeroPointerMove = (event) => {
            const bounds = hero.getBoundingClientRect();
            const x = (event.clientX - bounds.left) / bounds.width - 0.5;
            const y = (event.clientY - bounds.top) / bounds.height - 0.5;
            rotateXTo(y * -5);
            rotateYTo(x * 7);
          };
          const onHeroPointerLeave = () => {
            rotateXTo(0);
            rotateYTo(0);
          };
          hero.addEventListener('pointermove', onHeroPointerMove);
          hero.addEventListener('pointerleave', onHeroPointerLeave);
          cleanups.push(() => {
            hero.removeEventListener('pointermove', onHeroPointerMove);
            hero.removeEventListener('pointerleave', onHeroPointerLeave);
          });
        }

        const magneticButtons = homeElement?.querySelectorAll('[data-home-magnetic]') ?? [];
        magneticButtons.forEach((button) => {
          const xTo = gsap.quickTo(button, 'x', { duration: 0.32, ease: 'power3.out' });
          const yTo = gsap.quickTo(button, 'y', { duration: 0.32, ease: 'power3.out' });
          const onButtonPointerMove = (event) => {
            const bounds = button.getBoundingClientRect();
            xTo((event.clientX - bounds.left - bounds.width / 2) * 0.13);
            yTo((event.clientY - bounds.top - bounds.height / 2) * 0.18);
          };
          const onButtonPointerLeave = () => {
            xTo(0);
            yTo(0);
          };
          button.addEventListener('pointermove', onButtonPointerMove);
          button.addEventListener('pointerleave', onButtonPointerLeave);
          cleanups.push(() => {
            button.removeEventListener('pointermove', onButtonPointerMove);
            button.removeEventListener('pointerleave', onButtonPointerLeave);
          });
        });

        return () => cleanups.forEach((cleanup) => cleanup());
      },
    );

    return () => media.revert();
  }, { scope: homeRef });

  return (
    <div ref={homeRef} className="home-page overflow-hidden bg-white">
      <HomeHero seo={seo} />

      <section className="border-b border-border bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" data-home-reveal-group>
          <SectionHeading eyebrow="Our Process" title="From Applicant to Placed — In 3 Steps" intro="One clear path. One outcome: your first ₹3–12 LPA finance job." align="center" />
          <div className="relative grid gap-5 lg:grid-cols-3">
            <div className="home-process-rule absolute left-[16.66%] right-[16.66%] top-12 hidden h-px bg-border lg:block" aria-hidden="true" />
            {PROGRAM_PROCESS.map(({ step, title, subtitle, items }, index) => (
              <article data-home-reveal key={step} className="relative rounded-2xl border border-border bg-white p-6 shadow-[0_12px_32px_rgba(10,25,49,0.06)] sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-sm font-black text-primary">0{index + 1}</div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">{step}</p>
                </div>
                <h2 className="mt-7 text-2xl font-bold text-primary">{title}</h2>
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">{subtitle}</p>
                <ul className="mt-6 space-y-3">
                  {items.map((item) => <li key={item} className="flex items-start gap-3 text-sm text-foreground/75"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden="true" />{item}</li>)}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fbfaf5] py-12 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8" data-home-reveal-group>
          <div data-home-reveal className="grid items-center gap-6 rounded-2xl border border-accent/20 bg-white p-6 shadow-sm md:grid-cols-[1fr_auto] md:p-8">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">{HOME_COPY.hiringNetworkEyebrow}</p>
              <h2 className="mt-2 text-2xl font-bold text-primary sm:text-3xl">{HOME_COPY.hiringNetworkHeading}</h2>
              <p className="mt-2 text-muted-foreground">{HOME_COPY.hiringNetworkDescription}</p>
            </div>
            <div className="grid grid-cols-3 divide-x divide-border text-center">
              {[
                ['200+', 'Partner Companies'],
                ['100+', 'Students Placed'],
                ['3–12 LPA', 'Average CTC Range'],
              ].map(([value, label]) => (
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
      </section>

      <section className="bg-white py-16 sm:py-20">
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
      </section>

      <section className="bg-primary py-16 text-white sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" data-home-reveal-group>
          <SectionHeading eyebrow={HOME_COPY.whyEyebrow} title={HOME_COPY.whyHeading} intro={HOME_COPY.whyDescription} align="center" light />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PROGRAM_FEATURES.map(({ title, description }, index) => {
              const Icon = featureIcons[index];
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
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" data-home-reveal-group>
          <SectionHeading eyebrow={HOME_COPY.benefitsEyebrow} title={HOME_COPY.benefitsHeading} intro={HOME_COPY.benefitsDescription} align="center" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PROGRAM_BENEFITS.map(({ title, description }, index) => {
              const Icon = benefitIcons[index];
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
      </section>

      <section className="bg-muted py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 lg:grid-cols-[1.25fr_0.75fr] lg:px-8" data-home-reveal-group>
          <article data-home-reveal className="rounded-2xl bg-white p-7 shadow-sm sm:p-9">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">About Centaur Careers</p>
            <h2 className="mt-3 max-w-2xl text-3xl font-bold text-primary sm:text-4xl">{ABOUT_SUMMARY.heading}</h2>
            {ABOUT_SUMMARY.paragraphs.map((paragraph) => <p key={paragraph} className="mt-5 text-muted-foreground">{paragraph}</p>)}
            <Link to="/about/" className="mt-7 inline-flex items-center gap-2 text-sm font-bold text-primary">About Centaur Careers <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
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
      </section>

      <CtaSection
        eyebrow={HOME_COPY.finalCtaEyebrow}
        title={HOME_COPY.finalCtaHeading}
        description={HOME_COPY.finalCtaDescription}
        primaryLabel="Enroll Now — Secure Your Seat"
        secondaryLabel="Chat on WhatsApp"
        secondaryHref={BUSINESS_DATA.whatsappUrl}
      />
    </div>
  );
}
