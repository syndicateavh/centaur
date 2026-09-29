import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import BlogPostCard from '@/components/blog/BlogPostCard.jsx';
import InternalLinkGroup from '@/components/InternalLinkGroup.jsx';
import { CtaSection, PageHero, SectionHeading } from '@/components/PageShell.jsx';
import { getPublishedBlogPosts } from '@/content/blog/blogStorage.js';
import { blogCategoryLabel, blogCategoryPath } from '@/content/blog/blogRoutes.js';
import { getInternalLinks } from '@/seo/internalLinks.js';
import { getSeoRoute } from '@/seo/seoRoutes.js';

export default function BlogIndexPage() {
  const seo = getSeoRoute('blog');
  const posts = getPublishedBlogPosts();
  const categories = [...new Set([...posts.map((post) => post.category), 'industry-updates'])].sort();
  const categoryCounts = new Map(categories.map((category) => [category, posts.filter((post) => post.category === category).length]));

  return (
    <>
      <PageHero routeId="blog" eyebrow="Knowledge centre" title={seo.h1} intro={seo.description} />

      <section className="bg-white py-16 sm:py-20" aria-labelledby="blog-posts-title">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Latest articles" title="Practical guidance for finance careers" intro="Browse structured, first-party articles for learners exploring banking and finance operations careers." align="center" />
          {posts.length > 0 ? (
            <div id="blog-posts-title" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => <BlogPostCard key={post.id} post={post} />)}
            </div>
          ) : (
            <div id="blog-posts-title" className="mx-auto max-w-3xl rounded-2xl border border-dashed border-border bg-muted/40 p-8 text-center sm:p-12">
              <h2 className="text-2xl font-bold text-primary">Articles are being prepared</h2>
              <p className="mt-4 text-muted-foreground">The Centaur Careers team is preparing original career guidance for this library. Explore the current finance career tracks while new articles are reviewed and published.</p>
              <Link to="/courses/" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-accent px-5 py-3 font-bold text-primary">Explore courses</Link>
            </div>
          )}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="bg-muted py-16 sm:py-20" aria-labelledby="blog-categories-title">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <SectionHeading eyebrow="Browse by topic" title="Choose a career topic" intro="Use the controlled topic archive to find related articles." align="center" />
            <div id="blog-categories-title" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => <Link key={category} to={blogCategoryPath(category)} className="rounded-xl border border-border bg-white p-5 transition hover:-translate-y-0.5 hover:border-accent hover:shadow-sm"><span className="block font-bold text-primary">{blogCategoryLabel(category)}</span><span className="mt-2 block text-sm text-muted-foreground">{categoryCounts.get(category) || 0} published {categoryCounts.get(category) === 1 ? 'article' : 'articles'}</span></Link>)}
            </div>
          </div>
        </section>
      )}

      <section data-career-guide-cluster-entry className="bg-white py-12" aria-labelledby="career-guide-entry-title">
        <div className="container mx-auto flex max-w-5xl flex-col items-start justify-between gap-5 rounded-2xl border border-border bg-muted p-7 sm:flex-row sm:items-center sm:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent-ink">Career guides</p>
            <h2 id="career-guide-entry-title" className="mt-2 text-2xl font-bold text-primary">Explore finance operations career guides</h2>
            <p className="mt-2 text-muted-foreground">Follow focused guides on investment banking operations, KYC and AML, finance operations, payments, retail banking, and graduate pathways.</p>
          </div>
          <Link to="/career-guides/" className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white">Browse career guides <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </section>

      <InternalLinkGroup links={getInternalLinks('blog')} />
      <CtaSection title="Build your finance career foundation" description="Explore Centaur Careers courses, placement support and the next step for your learning journey." />
    </>
  );
}
