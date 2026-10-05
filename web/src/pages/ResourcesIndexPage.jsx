import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import InternalLinkGroup from '@/components/InternalLinkGroup.jsx';
import { CtaSection, PageHero, SectionHeading } from '@/components/PageShell.jsx';
import { RESOURCE_HUB, RESOURCES } from '@/content/resources.js';
import { LINKABLE_AUTHORITY_ASSETS } from '@/content/seo/authorityBuilding.js';
import { getInternalLinks } from '@/seo/internalLinks.js';

const RESOURCE_AUTHORITY_ASSETS = LINKABLE_AUTHORITY_ASSETS.filter((asset) => asset.targetPath.startsWith('/resources/'));

export default function ResourcesIndexPage() {
  return (
    <>
      <PageHero
        routeId="resources"
        eyebrow="Finance learning resources"
        title={RESOURCE_HUB.h1}
        intro={RESOURCE_HUB.description}
      />

      <section data-resource-cluster="hub" className="bg-white py-16 sm:py-20" aria-label="Finance career resource collection">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Prepare with context"
            title="Practical resources for finance-career learning"
            intro="Use these first-party resources to learn BFSI concepts, understand operations work, practise interview explanations, and prepare questions before choosing a learning path. Each resource has a defined topic and links back to relevant program or career information."
            align="center"
          />
          <div className="grid gap-6 md:grid-cols-2">
            {RESOURCES.map((resource) => (
              <article key={resource.id} className="flex flex-col rounded-2xl border border-border bg-muted/30 p-7 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-ink">{resource.label}</p>
                <h2 className="mt-3 text-2xl font-bold text-primary">{resource.h1}</h2>
                <p className="mt-3 flex-1 leading-relaxed text-muted-foreground">{resource.description}</p>
                <Link to={resource.path} className="mt-6 inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">
                  Open resource <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-authority-resource-toolkit className="bg-muted py-16 sm:py-20" aria-label="Shareable finance learning references">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Useful reference assets"
            title="Share practical finance-learning references"
            intro="These original guides are designed to answer a real learner question clearly. Use them as study references or editorial resources; they are not a list of empty pages created for links."
            align="center"
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {RESOURCE_AUTHORITY_ASSETS.map((asset) => (
              <article key={asset.id} data-authority-asset={asset.id} className="flex flex-col rounded-2xl border border-border bg-white p-6 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-ink">{asset.format}</p>
                <h2 className="mt-3 text-xl font-bold text-primary">{asset.audience}</h2>
                <p className="mt-3 flex-1 leading-relaxed text-muted-foreground">{asset.editorialValue}</p>
                <p className="mt-4 border-t border-border pt-4 text-sm leading-relaxed text-foreground/75"><span className="font-bold text-primary">Reader outcome:</span> {asset.readerOutcome}</p>
                <Link to={asset.targetPath} className="mt-5 inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">
                  Open reference <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted py-16 sm:py-20" aria-label="Related finance career information">
        <div className="container mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <article className="rounded-2xl border border-border bg-white p-7 shadow-sm">
            <SectionHeading eyebrow="Understand the work" title="Read the career guides first" />
            <p className="text-muted-foreground">The career-guide cluster explains investment banking operations, trade lifecycle, KYC and AML, finance operations, and graduate pathways. Use those guides for role context, then use an interview resource for focused practice.</p>
            <Link to="/career-guides/" className="mt-6 inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Browse finance career guides <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </article>
          <article className="rounded-2xl border border-border bg-white p-7 shadow-sm">
            <SectionHeading eyebrow="Choose carefully" title="Review current program information" />
            <p className="text-muted-foreground">Resources explain general career and interview topics. For provider-specific curriculum, delivery modes, assessments, and support terms, review the current Financial Operations Masterclass information and ask the Centaur Careers team about the details that matter to you.</p>
            <div className="mt-6 flex flex-wrap gap-4">
              <Link to="/courses/" className="inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Explore the Masterclass <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
              <Link to="/faqs/" className="inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Read program FAQs <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
            </div>
          </article>
        </div>
      </section>

      <InternalLinkGroup links={getInternalLinks('resources')} />
      <CtaSection title="Take your finance learning research further" description="Connect these resources to the Financial Operations Masterclass syllabus and review current learning options, fees, and written support terms." primaryTo="/courses/" primaryLabel="Review course details" primaryAnalyticsIntent="commercial_program" secondaryTo="/contact/" secondaryLabel="Ask a course question" />
    </>
  );
}
