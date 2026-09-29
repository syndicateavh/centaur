import React from 'react';
import { CalendarDays } from 'lucide-react';
import { Link } from 'react-router';
import BlogContentRenderer from '@/components/blog/BlogContentRenderer.jsx';
import InternalLinkGroup from '@/components/InternalLinkGroup.jsx';
import { CtaSection, PageHero } from '@/components/PageShell.jsx';
import { getCareerGuide } from '@/content/careerGuides.js';
import RoleIntentPathway from '@/components/RoleIntentPathway.jsx';
import { getRoleIntentByGuideId } from '@/content/roleIntent.js';
import { getInternalLinks } from '@/seo/internalLinks.js';
import { getSeoRoute } from '@/seo/seoRoutes.js';

export default function CareerGuidePage({ guideId }) {
  const guide = getCareerGuide(guideId);
  if (!guide) return null;

  const route = getSeoRoute(guide.routeId);
  const relatedGuides = guide.relatedGuideIds.map((relatedId) => getCareerGuide(relatedId)).filter(Boolean);
  const roleIntent = getRoleIntentByGuideId(guide.id);

  return (
    <>
      <PageHero routeId={route.id} eyebrow="Career guide" title={guide.h1} intro={guide.description} />

      <article data-career-guide={guide.id} data-high-value-page={guide.id === 'choosing-finance-career-course' ? 'career-guide-choosing-finance-career-course' : undefined} data-high-value-section={guide.id === 'choosing-finance-career-course' ? 'course-selection' : undefined} className="bg-white py-14 sm:py-20">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-wrap items-center gap-4 border-b border-border pb-6 text-sm text-muted-foreground">
            <span className="font-bold text-primary">{guide.author.name}</span>
            <span aria-hidden="true">·</span>
            <span>{guide.author.role}</span>
            <span aria-hidden="true">·</span>
            <time className="inline-flex items-center gap-2" dateTime={guide.updatedAt}><CalendarDays className="h-4 w-4" aria-hidden="true" />Updated {guide.updatedAt}</time>
          </div>
          <BlogContentRenderer blocks={guide.body} />

          {relatedGuides.length > 0 && (
            <nav data-career-guide-related aria-label="Related career guides" className="mt-12 rounded-2xl bg-muted p-6">
              <h2 className="text-xl font-bold text-primary">Related career guides</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {relatedGuides.map((relatedGuide) => (
                  <li key={relatedGuide.id}>
                    <Link to={relatedGuide.path} className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">{relatedGuide.h1}</Link>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <p className="mt-10 text-sm text-muted-foreground">This guide explains a career topic in general terms. Program-specific curriculum, delivery, and support information belongs to the current Financial Operations Masterclass details.</p>
        </div>
      </article>

      <RoleIntentPathway intent={roleIntent} />
      <InternalLinkGroup links={getInternalLinks(guide.routeId)} />
      <CtaSection secondaryTo={guide.id === 'choosing-finance-career-course' ? '/courses/' : '/contact/'} title="Continue your finance career research" description="Compare the Financial Operations Masterclass with the career direction you are exploring, then contact Centaur Careers with your questions." />
    </>
  );
}
