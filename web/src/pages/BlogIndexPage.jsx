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
  const [featuredPost, ...recentPosts] = posts;

  return (
    <>
      <PageHero routeId="blog" eyebrow="Knowledge centre" title={seo.h1} intro={seo.description} />

      <>
        {categories.length > 0 && (
          <nav className="border-b border-border bg-muted/40" aria-label="Browse blog topics">
            <div className="design-container flex flex-col items-stretch gap-2 py-4 sm:flex-row sm:items-center sm:gap-3">
              <span className="shrink-0 text-sm font-bold text-primary">Browse topics</span>
              <div className="w-full min-w-0 sm:flex-1">
                <div className="topic-slider flex min-w-0 snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth py-1" role="group" aria-label="Blog topic categories" tabIndex={0}>
                  {categories.map((category) => (
                    <Link key={category} to={blogCategoryPath(category)} className="shrink-0 snap-start rounded-full border border-border bg-white px-4 py-2.5 text-sm font-semibold text-primary transition hover:border-accent hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                      {blogCategoryLabel(category)} <span className="text-muted-foreground">({categoryCounts.get(category) || 0})</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </nav>
        )}

        <section className="design-section" aria-labelledby="blog-featured-title">
          <div className="design-container">
            {featuredPost ? (
              <>
                <h2 id="blog-featured-title" className="sr-only">Featured article</h2>
                <BlogPostCard post={featuredPost} featured />
              </>
            ) : (
              <div className="mx-auto max-w-3xl rounded-2xl border border-dashed border-border bg-muted/40 p-8 text-center sm:p-12">
                <h2 id="blog-featured-title" className="text-2xl font-bold text-primary">Articles are being prepared</h2>
                <p className="mt-4 text-muted-foreground">The Centaur Careers team is preparing original career guidance for this library. Explore the current finance career tracks while new articles are reviewed and published.</p>
                <Link to="/courses/" className="mt-6 inline-flex min-h-11 items-center rounded-xl bg-accent px-5 py-3 font-bold text-primary">Explore courses</Link>
              </div>
            )}
          </div>
        </section>

        {recentPosts.length > 0 && (
          <section className="bg-surface-subtle py-14 sm:py-20" aria-labelledby="blog-posts-title">
            <div className="design-container">
              <SectionHeading eyebrow="The library" title="More practical finance career guides" intro="Explore role explainers, skill guides, and career comparisons written for finance learners." align="left" id="blog-posts-title" />
              <div className="grid gap-5 lg:grid-cols-2">
                {recentPosts.map((post) => <BlogPostCard key={post.id} post={post} layout="horizontal" />)}
              </div>
            </div>
          </section>
        )}
      </>

      <section data-career-guide-cluster-entry className="bg-white py-12" aria-labelledby="career-guide-entry-title">
        <div className="design-container flex flex-col items-start justify-between gap-5 rounded-2xl border border-border bg-muted p-7 sm:flex-row sm:items-center sm:px-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-accent-ink">Career guides</p>
            <h2 id="career-guide-entry-title" className="mt-2 text-2xl font-bold text-primary">Explore finance operations career guides</h2>
            <p className="mt-2 max-w-3xl text-muted-foreground">Follow focused guides on investment banking operations, KYC and AML, finance operations, payments, retail banking, and graduate pathways.</p>
          </div>
          <Link to="/career-guides/" className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-3 font-bold text-white">Browse career guides <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        </div>
      </section>

      <InternalLinkGroup links={getInternalLinks('blog')} />
      <CtaSection title="Build your finance career foundation" description="Explore Centaur Careers courses, placement support and the next step for your learning journey." />
    </>
  );
}
