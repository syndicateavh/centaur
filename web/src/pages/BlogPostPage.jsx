import React from 'react';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { Link, useParams } from 'react-router';
import BlogContentRenderer from '@/components/blog/BlogContentRenderer.jsx';
import { ResponsiveImage } from '@/components/ui/responsive-image.jsx';
import { CtaSection, PageHero } from '@/components/PageShell.jsx';
import { getBlogPostBySlug } from '@/content/blog/blogStorage.js';
import { blogCategoryLabel, blogCategoryPath } from '@/content/blog/blogRoutes.js';
import RoleIntentPathway from '@/components/RoleIntentPathway.jsx';
import { getRoleIntentByCanonicalPath } from '@/content/roleIntent.js';
import { getSeoRoute } from '@/seo/seoRoutes.js';

export default function BlogPostPage() {
  const { slug } = useParams();
  const post = getBlogPostBySlug(slug);

  if (!post) {
    return (
      <section className="bg-muted py-20" aria-labelledby="blog-post-not-found-title">
        <div className="container mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <p className="eyebrow">Blog</p>
          <h1 id="blog-post-not-found-title" className="mt-3 text-4xl font-black text-primary">Blog post not found</h1>
          <p className="mt-5 text-muted-foreground">This article may still be in editorial review or the address may be incorrect.</p>
          <Link to="/blog/" className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-xl bg-accent px-5 py-3 font-bold text-primary"><ArrowLeft className="h-4 w-4" aria-hidden="true" />Back to blog</Link>
        </div>
      </section>
    );
  }

  const relatedRoutes = (post.relatedRouteIds || []).map((routeId) => {
    try {
      return getSeoRoute(routeId);
    } catch {
      return null;
    }
  }).filter(Boolean);
  const roleIntent = getRoleIntentByCanonicalPath(post.seo?.canonicalPath || '/blog/' + post.slug + '/');

  return (
    <>
      <PageHero
        breadcrumbItems={[
          { label: 'Blog', to: '/blog/' },
          { label: post.title },
        ]}
        eyebrow={blogCategoryLabel(post.category)}
        title={post.title}
        intro={post.excerpt}
      />
      <section className="bg-white py-14 sm:py-20" aria-label="Blog article">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="font-bold text-primary">{post.author.name}</span>
            <span aria-hidden="true">·</span>
            <span>{post.author.role}</span>
            {post.publishedAt && <><span aria-hidden="true">·</span><time className="inline-flex items-center gap-2" dateTime={post.publishedAt}><CalendarDays className="h-4 w-4" aria-hidden="true" />Published {post.publishedAt}</time></>}
            {post.updatedAt && post.updatedAt !== post.publishedAt && <><span aria-hidden="true">·</span><time dateTime={post.updatedAt}>Updated {post.updatedAt}</time></>}
          </div>
          {post.coverImage?.src && <ResponsiveImage priority src={post.coverImage.src} alt={post.coverImage.alt} width={post.coverImage.width} height={post.coverImage.height} sizes="(min-width: 1024px) 896px, 100vw" decoding="async" className="mb-10 aspect-[16/7] w-full rounded-2xl object-cover" />}
          <BlogContentRenderer blocks={post.body} />
          {post.tags?.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2" aria-label="Article topics">
              {post.tags.map((tag) => <span key={tag} className="rounded-full bg-muted px-3 py-1 text-sm font-bold text-primary"><span aria-hidden="true">#</span>{tag}</span>)}
            </div>
          )}
          <div className="mt-12 flex flex-wrap gap-3 border-t border-border pt-6">
            <Link to={blogCategoryPath(post.category)} className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">More {blogCategoryLabel(post.category)} articles</Link>
            <Link to="/blog/" className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">All blog articles</Link>
          </div>
          {relatedRoutes.length > 0 && (
            <nav aria-label="Related Centaur Careers pages" className="mt-12 rounded-2xl bg-muted p-6">
              <h2 className="text-xl font-bold text-primary">Related Centaur Careers pages</h2>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">{relatedRoutes.map((route) => <li key={route.id}><Link to={route.path} className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">{route.h1}</Link></li>)}</ul>
            </nav>
          )}
        </div>
      </section>
      <RoleIntentPathway intent={roleIntent} />
      <CtaSection title="Continue your finance career journey" description="Explore the learning tracks and placement support available through Centaur Careers." />
    </>
  );
}
