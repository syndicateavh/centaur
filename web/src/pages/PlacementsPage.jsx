import React from 'react';
import {
  ArrowRight,
  BriefcaseBusiness,
  CheckCircle2,
  GraduationCap,
  Laptop,
  MapPin,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router';
import InternalLinkGroup from '@/components/InternalLinkGroup.jsx';
import { CtaSection, PageHero, SectionHeading } from '@/components/PageShell.jsx';
import { BUSINESS_DATA } from '@/content/businessData.js';
import { DOWNLOAD_ASSETS } from '@/content/downloads.js';
import { HIRING_PARTNER_LOGOS } from '@/content/hiringPartnerLogos.js';
import { CAREER_TRACKS, LEARNING_MODES, PLACEMENT_PROMISE, PROGRAM } from '@/content/sourceContent.js';
import { getInternalLinks } from '@/seo/internalLinks.js';
import { getSeoRoute } from '@/seo/seoRoutes.js';

const whatsappNumber = BUSINESS_DATA.telephone.replace(/\D/g, '');
const whatsappMessage = 'Hi Centaur Careers, I am interested in the 100% Job Guarantee Program. Please share the program details, fees, and next cohort information.';
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

const JOURNEY = Object.freeze([
  Object.freeze({ step: '01', title: 'Join the program', description: 'Graduates and job switchers from any academic background can speak with the team, choose a learning mode, and join the next available cohort.' }),
  Object.freeze({ step: '02', title: 'Train for six weeks', description: 'Build practical understanding across banking operations, KYC and AML, payments, credit, retail banking, and FinTech workflows.' }),
  Object.freeze({ step: '03', title: 'Get your guaranteed finance job', description: 'Graduates and job switchers who complete the six-week program receive a finance job through the 100% Job Guarantee Program.' }),
]);

const GUARANTEE_TERMS = Object.freeze([
  Object.freeze({ title: 'Who can join', description: 'The program is open to graduates and job switchers across India. Graduation is the entry requirement; a previous finance background is not required.' }),
  Object.freeze({ title: 'Completion requirement', description: 'The job guarantee applies after the learner completes the six-week Financial Operations Masterclass.' }),
  Object.freeze({ title: 'Guaranteed outcome', description: 'A graduate or job switcher who completes the program receives a finance job through the 100% Job Guarantee Program.' }),
  Object.freeze({ title: 'Learning access', description: 'Live online learning is available across India, with an in-person learning option in Lucknow.' }),
  Object.freeze({ title: 'Scope of the guarantee', description: 'The published summary guarantees a finance job after completion; it does not name a particular employer, salary, role, or city. Request the full written terms for your cohort.' }),
  Object.freeze({ title: 'Written cohort terms', description: 'Ask for the current written conditions for your cohort before paying, including any attendance, assessment, support-period, or process details.' }),
]);

const SUPPORT_ITEMS = Object.freeze([
  Object.freeze({ title: 'Interview preparation', description: 'Ask how interview practice and feedback are delivered for your cohort.' }),
  Object.freeze({ title: 'Role guidance', description: 'Explore finance role families connected with the program and your own background.' }),
  Object.freeze({ title: 'Suitable-opportunity guidance', description: 'Ask how relevant opportunities are identified and communicated under the current written terms.' }),
]);

const SECTORS = Object.freeze([
  'Investment banks and global capability centres',
  'Private and retail banks',
  'NBFC and lending operations',
  'FinTech and digital-banking teams',
  'Payments and reconciliation operations',
  'KYC, AML, compliance, and risk operations',
]);

function PlacementPartnerCard({ name, src }) {
  const [hasError, setHasError] = React.useState(false);

  if (!src || hasError) return null;

  return (
    <article className="placement-partner-card flex min-h-36 items-center justify-center rounded-xl border border-border bg-white p-[18px] text-center">
      <img
        src={src}
        alt={`${name} logo`}
        width="240"
        height="96"
        className="h-16 w-full max-w-[13rem] object-contain"
        loading="lazy"
        decoding="async"
        onError={() => setHasError(true)}
      />
    </article>
  );
}

export default function PlacementsPage() {
  const seo = getSeoRoute('placements');

  return (
    <>
      <PageHero
        routeId="placements"
        eyebrow="Your finance career pathway"
        title={seo.h1}
        intro="Complete our six-week finance program and get a finance job. Centaur Careers’ 100% Job Guarantee Program is open to graduates and job switchers across India."
      >
        <div className="mt-8 flex flex-wrap gap-3">
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent px-6 py-3 font-bold text-primary shadow-lg transition hover:-translate-y-0.5">
            <MessageCircle className="h-5 w-5" aria-hidden="true" /> Get Program Details on WhatsApp
          </a>
          <Link to="/courses/" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3 font-bold text-white transition hover:bg-white/15">
            Explore the six-week program <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <Link to="#job-guarantee-terms" className="mt-4 inline-flex text-sm font-semibold text-white/70 underline decoration-accent underline-offset-4 transition hover:text-white">
          View guarantee summary
        </Link>
        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-white/10 pt-6 text-sm text-white/75">
          <span className="flex items-center gap-2"><GraduationCap className="h-4 w-4 text-accent" aria-hidden="true" />Graduates and job switchers</span>
          <span className="flex items-center gap-2"><Laptop className="h-4 w-4 text-accent" aria-hidden="true" />Live online across India</span>
          <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent" aria-hidden="true" />In-person option in Lucknow</span>
        </div>
      </PageHero>

      <section className="bg-white py-16 sm:py-20" aria-label="Job guarantee overview">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Our commitment" title={PLACEMENT_PROMISE.heading} intro="Complete the six-week Financial Operations Masterclass and get a finance job through our 100% Job Guarantee Program. Open to graduates and job switchers from any academic background." align="center" />
          <div className="grid gap-6 md:grid-cols-3">
            {[
              ['Open access', 'Graduation is the entry requirement. Previous finance education or work experience is not required.'],
              ['Practical preparation', 'Complete the six-week learning journey with projects, workflow practice, and interview preparation.'],
              ['Guaranteed finance job', 'After completing the six-week program, get a finance job through the 100% Job Guarantee Program.'],
            ].map(([title, description]) => (
              <article key={title} className="rounded-2xl border border-border p-7 shadow-sm">
                <ShieldCheck className="h-7 w-7 text-accent-ink" aria-hidden="true" />
                <h2 className="mt-5 text-xl font-bold text-primary">{title}</h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted py-16 sm:py-20" aria-label="Who can join">
        <div className="container mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent-ink">Who can join?</p>
            <h2 className="mt-3 text-3xl font-bold text-primary sm:text-4xl">A welcoming route into finance careers</h2>
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">The program is designed for graduates starting their careers and working professionals planning a job switch. You do not need a finance background; the learning journey begins with foundations and progresses into practical BFSI workflows.</p>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white">
              Talk to the program team <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <article className="rounded-2xl bg-white p-7 shadow-sm">
              <GraduationCap className="h-8 w-8 text-accent-ink" aria-hidden="true" />
              <h2 className="mt-5 text-xl font-bold text-primary">Graduates</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">Build practical finance knowledge and prepare to explain your skills confidently in interviews.</p>
            </article>
            <article className="rounded-2xl bg-white p-7 shadow-sm">
              <BriefcaseBusiness className="h-8 w-8 text-accent-ink" aria-hidden="true" />
              <h2 className="mt-5 text-xl font-bold text-primary">Job switchers</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground">Translate your existing experience into a stronger story for banking, finance operations, compliance, and FinTech roles.</p>
            </article>
          </div>
        </div>
      </section>

      <section data-commercial-section="placement-assistance-process" className="bg-primary py-16 text-white sm:py-20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="100% Job Guarantee Program" title="Complete the program. Get a finance job." intro="The job is guaranteed after completing the six-week Financial Operations Masterclass." align="center" light />
          <div className="grid gap-6 lg:grid-cols-3">
            {JOURNEY.map(({ step, title, description }) => (
              <article key={step} className="rounded-2xl border border-white/10 bg-white/[0.06] p-7">
                <p className="text-sm font-black uppercase tracking-[0.2em] text-accent">Step {step}</p>
                <h2 className="mt-4 text-2xl font-bold text-white">{title}</h2>
                <p className="mt-4 leading-relaxed text-white/70">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20" aria-label="Placement support included">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Career support pathway" title="Preparation alongside the job guarantee" intro="The published summary describes interview preparation, role guidance, and suitable-opportunity guidance. Ask the team for the current written support process for your cohort." align="center" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SUPPORT_ITEMS.map(({ title, description }) => (
              <article key={title} className="rounded-2xl border border-border bg-muted/30 p-6">
                <CheckCircle2 className="h-6 w-6 text-accent-ink" aria-hidden="true" />
                <h2 className="mt-4 text-xl font-bold text-primary">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted py-16 sm:py-20" aria-label="Finance career directions">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Career directions" title="Prepare for roles across the BFSI ecosystem" intro="Explore career directions connected with the subjects taught in the Financial Operations Masterclass." align="center" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CAREER_TRACKS.map((track) => (
              <article key={track.id} className="rounded-2xl bg-white p-7 shadow-sm">
                <BriefcaseBusiness className="h-7 w-7 text-accent-ink" aria-hidden="true" />
                <h2 className="mt-5 text-xl font-bold text-primary">{track.title}</h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">{track.description}</p>
                {track.route && <Link to={track.route} className="mt-5 inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Explore this module <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20" aria-label="Finance employment sectors">
        <div className="container mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent-ink">Where these skills connect</p>
            <h2 className="mt-3 text-3xl font-bold text-primary sm:text-4xl">Opportunities across banking, finance operations, and FinTech</h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">The program develops transferable finance-operations knowledge for multiple employer types. Specific vacancies depend on current hiring requirements, role fit, location, and employer decisions.</p>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {SECTORS.map((sector) => (
              <li key={sector} className="flex items-start gap-3 rounded-xl border border-border p-5 font-semibold text-primary">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-accent-ink" aria-hidden="true" /> {sector}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-muted py-16 sm:py-20" aria-label="Learning access across India">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Flexible access" title={`${PROGRAM.duration} of focused learning, accessible across India`} intro="Choose the format that fits your current location and schedule." align="center" />
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="rounded-2xl bg-white p-8 shadow-sm">
              <Laptop className="h-8 w-8 text-accent-ink" aria-hidden="true" />
              <h2 className="mt-5 text-2xl font-bold text-primary">Live online across India</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">Join the live national-access learning option from your city and participate in the program’s training and career-preparation activities.</p>
              <Link to="/india/" className="mt-6 inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Explore India-wide access <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </article>
            <article className="rounded-2xl bg-white p-8 shadow-sm">
              <MapPin className="h-8 w-8 text-accent-ink" aria-hidden="true" />
              <h2 className="mt-5 text-2xl font-bold text-primary">In person in Lucknow</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">Attend the published classroom option at Mindsprout Career Hub in Lucknow for an in-person learning environment.</p>
              <Link to="/locations/lucknow/" className="mt-6 inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">View the Lucknow location <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20" aria-label="Program pricing">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Program fees" title="Choose online or in-person learning" intro="Published prices for the six-week Financial Operations Masterclass. Confirm the applicable cohort, total payable amount, and payment terms in writing before paying." align="center" />
          <div className="grid gap-6 lg:grid-cols-2">
            {LEARNING_MODES.map((mode) => (
              <article key={mode.name} className="rounded-3xl border border-border bg-muted/30 p-8 shadow-sm sm:p-10">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent-ink">{mode.name} program</p>
                <div className="mt-4 flex flex-wrap items-end gap-x-4 gap-y-2">
                  <p className="text-4xl font-black text-primary">{mode.price}</p>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">Request a current written fee quote for your cohort.</p>
                <p className="mt-2 text-muted-foreground">{mode.summary}</p>
                <ul className="mt-6 space-y-3">
                  {mode.features.slice(0, 4).map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-foreground/80">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent-ink" aria-hidden="true" /> {feature}
                    </li>
                  ))}
                </ul>
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white">
                  Ask about the {mode.name.toLowerCase()} cohort <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted py-16 sm:py-20" aria-label="Hiring partners">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Career network" title="Hiring partners" intro="The program prepares learners for finance roles across banking, global financial services, consulting, and FinTech. Specific openings and employer decisions vary by role, location, and hiring demand." align="center" />
          <div className="placement-partner-grid">
            {HIRING_PARTNER_LOGOS.map((partner) => (
              <PlacementPartnerCard key={partner.src} {...partner} />
            ))}
          </div>
          <p className="mx-auto mt-8 max-w-4xl text-center text-sm leading-relaxed text-muted-foreground">Employer logos identify the published hiring network. They do not promise a particular vacancy, interview, role, salary, or location for every learner.</p>
        </div>
      </section>

      <section id="job-guarantee-terms" className="scroll-mt-24 bg-white py-16 sm:py-20" aria-labelledby="job-guarantee-terms-title">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-border bg-muted/30 p-7 shadow-sm sm:p-10">
            <div className="max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-accent-ink">Published program summary</p>
              <h2 id="job-guarantee-terms-title" className="mt-3 text-3xl font-bold text-primary sm:text-4xl">100% Job Guarantee Program summary</h2>
              <p className="mt-5 text-lg leading-relaxed text-muted-foreground">Centaur Careers publishes a finance job guarantee for graduates and job switchers after completing the six-week Financial Operations Masterclass. Request the current written terms for your cohort before enrolling; this page and the downloadable summary do not replace them.</p>
              <p className="mt-3 leading-relaxed text-muted-foreground"><strong>Salary opportunity:</strong> Centaur advertises ₹3–12 LPA as an indicative opportunity range, separate from the job guarantee. The guarantee summary does not promise a salary; actual compensation depends on the role, employer, location, experience, and applicable cohort terms. Confirm role-specific details in writing before enrolling.</p>
              <p className="mt-3 text-sm font-semibold text-foreground/70">Last reviewed: 30 September 2026</p>
            </div>

            <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {GUARANTEE_TERMS.map(({ title, description }) => (
                <article key={title} className="rounded-2xl border border-border bg-white p-6">
                  <CheckCircle2 className="h-6 w-6 text-accent-ink" aria-hidden="true" />
                  <h3 className="mt-4 text-lg font-bold text-primary">{title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{description}</p>
                </article>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-white p-6 sm:p-7">
              <h3 className="text-xl font-bold text-primary">What to confirm before enrolling</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Graduation is the program entry requirement. The guarantee applies to graduates and job switchers after completing the six-week program. Ask the team to confirm any cohort-specific details in writing.</p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {['Attendance and assessment expectations', 'Support period and application process', 'Role and location scope', 'Fees, refunds, and cancellation terms'].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-foreground/85">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent-ink" aria-hidden="true" /> Ask about {item.toLowerCase()}
                  </li>
                ))}
              </ul>
              <a href={DOWNLOAD_ASSETS.placementTerms.path} download={DOWNLOAD_ASSETS.placementTerms.filename} data-analytics-id="placement-terms-download" data-analytics-intent="commercial_placement" className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white transition hover:bg-primary/90">
                {DOWNLOAD_ASSETS.placementTerms.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            </div>

            <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-2xl bg-primary p-6 text-white sm:flex-row sm:items-center">
              <p className="max-w-3xl text-sm leading-relaxed text-white/75">Before paying, confirm the applicable cohort, fee, schedule, and learning mode, and retain the written enrollment details shared with you.</p>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-bold text-white shadow-md transition hover:bg-green-700">
                <MessageCircle className="h-5 w-5" aria-hidden="true" /> Ask a question
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary py-14 text-white">
        <div className="container mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <ShieldCheck className="mx-auto h-10 w-10 text-accent" aria-hidden="true" />
          <h2 className="mt-5 text-3xl font-bold text-white">{PLACEMENT_PROMISE.accountabilityHeading}</h2>
          <p className="mt-4 text-lg text-white/70">{PLACEMENT_PROMISE.accountabilityDescription}</p>
        </div>
      </section>

      <InternalLinkGroup links={getInternalLinks('placements')} />
      <CtaSection
        eyebrow="Start your finance career journey"
        title="Get the complete 100% Job Guarantee Program details"
        description="Open to graduates and job switchers across India. Ask about the next cohort, learning mode, and fees."
        primaryLabel="Chat on WhatsApp"
        primaryHref={whatsappUrl}
        secondaryLabel="Explore the Course"
        secondaryTo="/courses/"
      />
    </>
  );
}
