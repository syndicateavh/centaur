import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { SectionHeading } from '@/components/SectionHeading.jsx';
import { TESTIMONIALS } from '@/content/sourceContent.js';
import { HomeSection } from './HomeSection.jsx';

const TESTIMONIAL_COMPANY_LOGOS = Object.freeze({
  Citi: '/images/ogpartners/citi-testimonial.webp',
  'JP Morgan': '/images/brand/jp-morgan.svg',
  HSBC: '/images/ogpartners/hsbc-testimonial.svg',
  Kotak: '/images/ogpartners/kotak-testimonial.svg',
});

export function HomeTestimonialsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'center',
    loop: true,
  });
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [autoRotationPaused, setAutoRotationPaused] = React.useState(false);

  React.useEffect(() => {
    if (!emblaApi) return undefined;

    const updateSelectedIndex = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    updateSelectedIndex();
    emblaApi.on('select', updateSelectedIndex);
    emblaApi.on('reInit', updateSelectedIndex);

    return () => {
      emblaApi.off('select', updateSelectedIndex);
      emblaApi.off('reInit', updateSelectedIndex);
    };
  }, [emblaApi]);

  React.useEffect(() => {
    if (!emblaApi || autoRotationPaused) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const intervalId = window.setInterval(() => {
      if (!document.hidden) emblaApi.scrollNext();
    }, 5000);

    return () => window.clearInterval(intervalId);
  }, [autoRotationPaused, emblaApi]);

  const handleCarouselKeyDown = React.useCallback((event) => {
    if (!emblaApi) return;

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      emblaApi.scrollPrev();
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      emblaApi.scrollNext();
    }
  }, [emblaApi]);

  const pauseAutoRotation = React.useCallback(() => setAutoRotationPaused(true), []);
  const resumeAutoRotation = React.useCallback(() => setAutoRotationPaused(false), []);
  const scrollPrevious = React.useCallback(() => {
    if (!emblaApi) return;
    pauseAutoRotation();
    emblaApi.scrollPrev();
  }, [emblaApi, pauseAutoRotation]);
  const scrollNext = React.useCallback(() => {
    if (!emblaApi) return;
    pauseAutoRotation();
    emblaApi.scrollNext();
  }, [emblaApi, pauseAutoRotation]);
  const handleCarouselBlur = React.useCallback((event) => {
    if (!event.currentTarget.contains(event.relatedTarget)) resumeAutoRotation();
  }, [resumeAutoRotation]);

  return (
    <HomeSection
      name="testimonials"
      aria-labelledby="home-testimonials-title"
      className="home-testimonials py-16 text-white sm:py-20 lg:py-24"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" data-home-reveal-group>
        <div data-home-reveal className="home-testimonials-heading">
          <SectionHeading
            id="home-testimonials-title"
            eyebrow="Learner testimonials"
            title="What learners say about Centaur"
            intro="Read how learners describe their training, interview preparation, and transition into finance roles."
            align="center"
            light
          />
        </div>

        <div
          className="home-testimonial-carousel-shell mt-12"
          onMouseEnter={pauseAutoRotation}
          onMouseLeave={resumeAutoRotation}
          onFocusCapture={pauseAutoRotation}
          onBlurCapture={handleCarouselBlur}
          onPointerDown={pauseAutoRotation}
          onPointerUp={resumeAutoRotation}
          onPointerCancel={resumeAutoRotation}
        >
          <button
            type="button"
            className="home-testimonial-nav home-testimonial-nav--previous"
            onClick={scrollPrevious}
            aria-label="Show previous learner testimonial"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Previous testimonial</span>
          </button>

          <div
            className="home-testimonial-carousel"
            ref={emblaRef}
            role="region"
            aria-label="Learner testimonials"
            aria-roledescription="carousel"
            tabIndex={0}
            onKeyDown={handleCarouselKeyDown}
          >
          <div className="home-testimonial-track">
            {TESTIMONIALS.map(({ name, role, quote }, index) => {
              const [jobTitle, ...companyParts] = role.split(', ');
              const company = companyParts.join(', ') || role;
              const companyLogo = TESTIMONIAL_COMPANY_LOGOS[company];
              return (
                <div
                  data-home-reveal
                  key={name}
                  role="group"
                  aria-label={`Testimonial ${index + 1} of ${TESTIMONIALS.length}: ${name}`}
                  aria-roledescription="slide"
                  className={`home-testimonial-slide home-testimonial-card rounded-2xl border border-white/10 bg-white/[0.055]${selectedIndex === index ? ' is-selected' : ''}`}
                >
                  <div className="home-testimonial-copy p-6 sm:p-8">
                    <p className="home-testimonial-label mx-0 text-xs font-bold uppercase tracking-[0.16em] text-accent">Student story</p>
                    <blockquote className="mt-4 text-lg leading-relaxed text-white/90">“{quote}”</blockquote>

                    <div className="home-testimonial-footer mt-auto">
                      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                          <p className="mx-0 text-xl font-bold text-slate-900">{name}</p>
                          <p className="mx-0 mt-1 text-sm leading-relaxed text-slate-600">{jobTitle}</p>
                        </div>
                        <div className="home-testimonial-company">
                          <span className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-slate-500">Company</span>
                          <span className="home-testimonial-company-mark">
                            {companyLogo ? (
                              <img
                                src={companyLogo}
                                alt={`${company} logo`}
                                width="160"
                                height="72"
                                decoding="async"
                                loading="lazy"
                                className="home-testimonial-company-logo"
                              />
                            ) : (
                              <span className="home-testimonial-company-text">{company}</span>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          </div>

          <button
            type="button"
            className="home-testimonial-nav home-testimonial-nav--next"
            onClick={scrollNext}
            aria-label="Show next learner testimonial"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
            <span className="sr-only">Next testimonial</span>
          </button>
        </div>

        <div data-home-reveal className="mt-8 flex flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:items-center">
          <p className="max-w-2xl text-sm leading-relaxed text-white/60">The 100% Job Guarantee Program is open to graduates and job switchers who complete the six-week program.</p>
          <Link to="/faqs/" className="group inline-flex shrink-0 items-center gap-2 text-sm font-bold text-white transition hover:text-accent">
            Read job-guarantee FAQs
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </HomeSection>
  );
}
