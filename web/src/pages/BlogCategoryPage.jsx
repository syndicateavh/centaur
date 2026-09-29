import React from 'react';
import { Link, useParams } from 'react-router';
import BlogPostCard from '@/components/blog/BlogPostCard.jsx';
import InternalLinkGroup from '@/components/InternalLinkGroup.jsx';
import { PageHero } from '@/components/PageShell.jsx';
import { getBlogPostsByCategory } from '@/content/blog/blogStorage.js';
import { BLOG_CATEGORIES } from '@/content/blog/blogSchema.js';
import { blogCategoryLabel } from '@/content/blog/blogRoutes.js';
import { getInternalLinks } from '@/seo/internalLinks.js';

export default function BlogCategoryPage() {
  const { category } = useParams();
  const posts = getBlogPostsByCategory(category);
  const label = blogCategoryLabel(category || 'blog');

  if (!BLOG_CATEGORIES.includes(category)) {
    return (
      <section className="bg-muted py-20" aria-labelledby="blog-category-not-found-title">
        <div className="container mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="eyebrow">Blog topic</p>
          <h1 id="blog-category-not-found-title" className="mt-3 text-4xl font-black text-primary">Topic not found</h1>
          <p className="mt-5 text-muted-foreground">This topic has no published articles yet.</p>
          <Link to="/blog/" className="mt-7 inline-flex min-h-11 items-center rounded-xl bg-accent px-5 py-3 font-bold text-primary">Back to blog</Link>
        </div>
      </section>
    );
  }

  if (category === 'industry-updates' && posts.length === 0) {
    return (
      <>
        <PageHero
          breadcrumbItems={[{ label: 'Blog', to: '/blog/' }, { label }]}
          eyebrow="Finance industry updates"
          title="Finance Industry Updates"
          intro="Dated explainers on relevant banking and financial-services developments, with primary sources and practical context for finance operations learners."
        />
        <section className="bg-white py-16 sm:py-20" aria-labelledby="industry-updates-empty-title">
          <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-2xl border border-border bg-muted/40 p-8 text-center sm:p-12">
              <h2 id="industry-updates-empty-title" className="text-2xl font-bold text-primary">The first explainer is under editorial review</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">We publish an update here only after checking the regulator source, effective dates, and relevance to finance workflows. Until then, there are no published industry updates.</p>
              <Link to="/blog/" className="mt-7 inline-flex min-h-11 items-center rounded-xl bg-accent px-5 py-3 font-bold text-primary">Browse published articles</Link>
            </div>
          </div>
        </section>
      </>
    );
  }

  if (posts.length === 0) {
    return (
      <section className="bg-muted py-20" aria-labelledby="blog-category-not-found-title">
        <div className="container mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="eyebrow">Blog topic</p>
          <h1 id="blog-category-not-found-title" className="mt-3 text-4xl font-black text-primary">Topic not found</h1>
          <p className="mt-5 text-muted-foreground">This topic has no published articles yet.</p>
          <Link to="/blog/" className="mt-7 inline-flex min-h-11 items-center rounded-xl bg-accent px-5 py-3 font-bold text-primary">Back to blog</Link>
        </div>
      </section>
    );
  }

  return (
    <>
      <PageHero
        breadcrumbItems={[{ label: 'Blog', to: '/blog/' }, { label }]}
        eyebrow="Blog topic"
        title={`${label} articles`}
        intro={`Published Centaur Careers articles about ${label.toLowerCase()}.`}
      />
      <section className="bg-white py-16 sm:py-20" aria-labelledby="blog-category-posts-title">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div id="blog-category-posts-title" className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{posts.map((post) => <BlogPostCard key={post.id} post={post} />)}</div>
        </div>
      </section>
      <InternalLinkGroup links={getInternalLinks('blog')} />
    </>
  );
}
