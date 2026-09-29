import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import InternalLinkGroup from '@/components/InternalLinkGroup.jsx';
import { CtaSection, PageHero, SectionHeading } from '@/components/PageShell.jsx';
import { CAREER_GUIDES, CAREER_GUIDE_HUB, CAREER_GUIDE_TOPIC_MAP } from '@/content/careerGuides.js';
import RoleIntentPathway from '@/components/RoleIntentPathway.jsx';
import { ROLE_INTENTS, getRoleIntentByGuideId } from '@/content/roleIntent.js';
import { getInternalLinks } from '@/seo/internalLinks.js';

export default function CareerGuidesIndexPage() {
  return (
    <>
      <PageHero
        routeId="career-guides"
        eyebrow="Knowledge centre"
        title={CAREER_GUIDE_HUB.h1}
        intro={CAREER_GUIDE_HUB.description}
      />

      <section data-career-guide-cluster="hub" className="bg-white py-16 sm:py-20" aria-labelledby="career-guide-hub-title">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Start with the question you have"
            title="Practical guidance for finance operations careers"
            intro="These first-party guides explain the work, workflows, skills, and career directions behind banking and finance operations. Start with one topic, then follow the related guides to build context."
            align="center"
          />
          <div id="career-guide-hub-title" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {CAREER_GUIDES.map((guide) => (
              (() => {
                const intent = getRoleIntentByGuideId(guide.id);
                return (
                  <article key={guide.id} className="flex flex-col rounded-2xl border border-border bg-muted/30 p-6 shadow-sm">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-ink">Career guide</p>
                    <h2 className="mt-3 text-2xl font-bold text-primary">{guide.h1}</h2>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{guide.description}</p>
                    {intent && <p className="mt-4 text-sm font-semibold text-foreground/80"><span className="font-bold text-primary">Answers:</span> {intent.primaryQuestion}</p>}
                    <Link to={guide.path} className="mt-6 inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">
                      Read the guide <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    {intent && (
                      <Link to={'/quiz/?domain=' + encodeURIComponent(intent.quizDomainId) + '#quiz-round-title'} className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-accent-ink underline decoration-accent decoration-2 underline-offset-4">
                        Practise this role <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    )}
                  </article>
                );
              })()
            ))}
          </div>
        </div>
      </section>

      <section data-career-guide-topic-map className="bg-surface-warm py-16 sm:py-20" aria-labelledby="career-guide-topic-map-title">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            id="career-guide-topic-map-title"
            eyebrow="Operations topic map"
            title="Find the right guide for each finance-operations workflow"
            intro="These topic paths connect broad career questions with one useful canonical guide or resource. The topics describe general work and learning context; employer procedures, current rules, and program terms still need separate verification."
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {CAREER_GUIDE_TOPIC_MAP.map((topic) => (
              <article key={topic.id} data-career-guide-topic={topic.id} className="rounded-2xl border border-border bg-white p-6 shadow-sm">
                <h3 className="text-xl font-bold text-primary">{topic.label}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{topic.question}</p>
                <div className="mt-5 space-y-3">
                  <Link to={topic.primaryPath} className="block font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">{topic.primaryLabel} <ArrowRight className="inline h-4 w-4" aria-hidden="true" /></Link>
                  <Link to={topic.supportPath} className="block text-sm font-semibold text-accent-ink underline decoration-accent decoration-2 underline-offset-4">{topic.supportLabel} <ArrowRight className="inline h-4 w-4" aria-hidden="true" /></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section data-role-intent-specialists className="bg-surface-warm py-16 sm:py-20" aria-labelledby="specialist-role-searches-title">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Specialist role searches"
            title="Go deeper into high-intent finance workflows"
            intro="These specialist paths answer narrower role questions, then connect the learner to focused quiz practice and the relevant course direction."
            id="specialist-role-searches-title"
          />
          <div className="grid gap-6 lg:grid-cols-3">
            {ROLE_INTENTS.filter((intent) => intent.kind === 'specialist').map((intent) => (
              <RoleIntentPathway key={intent.id} intent={intent} compact />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted py-16 sm:py-20" aria-label="Next steps for finance-career learning">
        <div className="container mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <article className="rounded-2xl border border-border bg-white p-7 shadow-sm">
            <SectionHeading eyebrow="Read with purpose" title="Use the guides to compare career directions" />
            <p className="text-muted-foreground">A guide can explain the work and help you ask better questions. For provider-specific curriculum, learning modes, assessments, and support terms, review the Financial Operations Masterclass page and ask the team for current information before applying.</p>
            <Link to="/courses/" className="mt-6 inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Explore the Financial Operations Masterclass <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </article>
          <article className="rounded-2xl border border-border bg-white p-7 shadow-sm">
            <SectionHeading eyebrow="Local learning option" title="Looking for in-person learning in Lucknow?" />
            <p className="text-muted-foreground">The offline option is delivered at Mindsprout Career Hub in Lucknow. Use the location page for the verified address, directions, and contact options.</p>
            <Link to="/locations/lucknow/" className="mt-6 inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">See the Lucknow learning location <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </article>
        </div>
      </section>

      <InternalLinkGroup links={getInternalLinks('career-guides')} />
      <CtaSection title="Choose your next finance-career question" description="Explore the guides, compare the learning tracks, and contact Centaur Careers when you are ready to discuss your next step." />
    </>
  );
}
