import React from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { SectionHeading } from '@/components/SectionHeading.jsx';
import { HomeSection } from './HomeSection.jsx';

const PLACED_LEARNERS = Object.freeze([
  Object.freeze({
    name: 'Aman Ullah Khan',
    role: 'Executive',
    company: 'Coforge',
    companyLogo: '/images/partners/coforge.svg',
    image: '/images/profiles/optimized/amanullah-khan-coforge.webp',
    alt: 'Aman Ullah Khan, Executive at Coforge',
  }),
  Object.freeze({
    name: 'Aryan Kalra',
    role: 'Senior Associate',
    company: 'Genpact',
    companyLogo: '/images/ogpartners/Genpact_Logo_Black_(3).png',
    image: '/images/profiles/optimized/aryan-kalra-genpact.webp',
    alt: 'Aryan Kalra, Senior Associate at Genpact',
  }),
  Object.freeze({
    name: 'Aashi Gupta',
    role: 'KYC Analyst',
    company: 'American Express',
    companyLogo: '/images/partners/american-express.svg',
    image: '/images/profiles/optimized/asshi-amex-analyst.webp',
    alt: 'Aashi Gupta, KYC Analyst at American Express',
  }),
  Object.freeze({
    name: 'Avneesh Pratap Singh',
    role: 'Investor Service Specialist',
    company: 'Citi',
    companyLogo: '/images/ogpartners/citi-testimonial.webp',
    image: '/images/profiles/optimized/avneesh-pratap-singh-citi.webp',
    alt: 'Avneesh Pratap Singh, Investor Service Specialist at Citi',
  }),
  Object.freeze({
    name: 'Mansi Kansal',
    role: 'Fund Accounting Specialist',
    company: 'State Street Bank',
    companyLogo: '/images/ogpartners/State-street-logo-final.svg.webp',
    companyLogoClassName: 'w-36 sm:w-40',
    image: '/images/profiles/optimized/mansi-kansal-state-street.webp',
    alt: 'Mansi Kansal, Fund Accounting Specialist at State Street Bank',
  }),
  Object.freeze({
    name: 'Nikita Bohra',
    role: 'Fund Accounting Specialist',
    company: 'Citi',
    companyLogo: '/images/ogpartners/citi-testimonial.webp',
    image: '/images/profiles/optimized/nikita-citi-fund-accounting.webp',
    alt: 'Nikita Bohra, Fund Accounting Specialist at Citi',
  }),
  Object.freeze({
    name: 'Rohit Singh Yadav',
    role: 'Fund Accounting Specialist',
    company: 'Citi',
    companyLogo: '/images/ogpartners/citi-testimonial.webp',
    image: '/images/profiles/optimized/rohit-singh-yadav-citi.webp',
    alt: 'Rohit Singh Yadav, Fund Accounting Specialist at Citi',
  }),
  Object.freeze({
    name: 'Tanmay Singh',
    role: 'Relationship Manager',
    company: 'ICICI Bank',
    companyLogo: '/images/partners/icici-bank.svg',
    image: '/images/profiles/optimized/tanmay-icici-rhs.webp',
    alt: 'Tanmay Singh, Relationship Manager at ICICI Bank',
  }),
]);

export function HomePlacementShowcase({
  sectionName = 'learner-placements',
  eyebrow = 'Learner placements',
  title = 'Our learners, building finance careers',
  intro = 'Meet learners who have moved into roles across banking and financial services.',
  linkTo = '/placements/student-outcomes/',
  linkLabel = 'Explore student placements',
  showLink = true,
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    containScroll: 'trimSnaps',
    loop: true,
  });
  const [isPaused, setIsPaused] = React.useState(false);

  React.useEffect(() => {
    if (!emblaApi || isPaused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    const intervalId = window.setInterval(() => {
      if (!document.hidden) emblaApi.scrollNext();
    }, 4500);
    return () => window.clearInterval(intervalId);
  }, [emblaApi, isPaused]);

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setIsPaused(true);
      emblaApi?.scrollPrev();
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      setIsPaused(true);
      emblaApi?.scrollNext();
    }
  };

  return (
    <HomeSection name={sectionName} className="bg-slate-50 py-6 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            eyebrow={eyebrow}
            title={title}
            intro={intro}
            align="left"
          />
          {showLink && (
            <Link
              to={linkTo}
              className="group mb-10 inline-flex min-h-11 shrink-0 items-center gap-2 self-start font-bold text-primary transition hover:text-accent-ink sm:self-auto"
            >
              {linkLabel}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          )}
        </div>

        <div
          className="relative"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onPointerDown={() => setIsPaused(true)}
          onPointerUp={() => setIsPaused(false)}
          onPointerCancel={() => setIsPaused(false)}
          onFocusCapture={() => setIsPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setIsPaused(false);
          }}
        >
          <div
            ref={emblaRef}
            className="overflow-hidden py-3 sm:px-1"
            role="region"
            aria-label="Student placements"
            aria-roledescription="carousel"
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            <div className="flex touch-pan-y sm:-ml-5">
              {PLACED_LEARNERS.map((learner, index) => (
                <div
                  key={learner.name}
                  className="min-w-0 shrink-0 grow-0 basis-full sm:basis-1/2 sm:pl-5 lg:basis-1/3"
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${PLACED_LEARNERS.length}: ${learner.name}`}
                >
                  <article className="group h-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
                    <div className="aspect-square overflow-hidden bg-slate-100 sm:aspect-[7/8]">
                      <img
                        src={learner.image}
                        alt={learner.alt}
                        loading={index === 0 ? 'eager' : 'lazy'}
                        fetchPriority={index === 0 ? 'high' : undefined}
                        decoding="async"
                        className="h-full w-full object-contain object-center transition duration-500 group-hover:scale-[1.025]"
                      />
                    </div>
                    <div className="min-h-32 p-4 sm:min-h-28 sm:p-5">
                      <div className="flex min-w-0 items-center justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="break-words text-lg font-bold leading-tight text-primary sm:text-xl">{learner.name}</h3>
                          <p className="mt-1 text-sm font-semibold leading-snug text-foreground/75">{learner.role}</p>
                        </div>
                        <img
                          src={learner.companyLogo}
                          alt={`${learner.company} logo`}
                          loading="lazy"
                          decoding="async"
                          className={`h-14 shrink-0 object-contain ${learner.companyLogoClassName ?? 'w-28 sm:w-36'}`}
                        />
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </HomeSection>
  );
}
