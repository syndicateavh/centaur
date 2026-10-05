import React from 'react';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { Link, useParams } from 'react-router';
import BlogContentRenderer, { getBlogHeadingId } from '@/components/blog/BlogContentRenderer.jsx';
import { ResponsiveImage } from '@/components/ui/responsive-image.jsx';
import { Breadcrumbs, CtaSection } from '@/components/PageShell.jsx';
import { getBlogPostBySlug, getPublishedBlogPosts } from '@/content/blog/blogStorage.js';
import { blogCategoryLabel, blogCategoryPath, blogPostPath } from '@/content/blog/blogRoutes.js';
import RoleIntentPathway from '@/components/RoleIntentPathway.jsx';
import { getRoleIntentByCanonicalPath } from '@/content/roleIntent.js';
import { getSeoRoute } from '@/seo/seoRoutes.js';

const BLOG_DATE_FORMAT = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });

function formatBlogDate(value) {
  return value ? BLOG_DATE_FORMAT.format(new Date(`${value}T00:00:00Z`)) : '';
}

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
  const postsInCategory = getPublishedBlogPosts().filter((candidate) => candidate.slug !== post.slug);
  const relatedPostLimit = Math.max(0, 4 - relatedRoutes.length);
  const relatedPosts = [
    ...postsInCategory.filter((candidate) => candidate.category === post.category),
    ...postsInCategory.filter((candidate) => candidate.category !== post.category),
  ].slice(0, relatedPostLimit);
  const articleSections = post.body.flatMap((block, index) => block.type === 'heading' ? [{ block, index }] : []);
  const roleIntent = getRoleIntentByCanonicalPath(post.seo?.canonicalPath || `/blog/${post.slug}/`);

  return (
    <>
      <header className="bg-navy-gradient py-9 text-white sm:py-11 lg:py-12" aria-labelledby={`blog-${post.slug}-title`}>
        <div className="design-container">
          <Breadcrumbs className="mb-5" items={[{ label: 'Blog', to: '/blog/' }, { label: post.title }]} />
          <div className={`grid items-center gap-7 lg:gap-12 ${post.coverImage?.src ? 'lg:grid-cols-[minmax(0,1.08fr)_minmax(20rem,0.92fr)]' : ''}`}>
            <div className="min-w-0 max-w-3xl">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-accent">{blogCategoryLabel(post.category)}</p>
              <h1 id={`blog-${post.slug}-title`} className="text-balance break-words text-3xl font-black leading-[1.12] text-white sm:text-4xl lg:text-[2.75rem]">{post.title}</h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">{post.excerpt}</p>
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/75">
                <span className="font-bold text-white">{post.author.name}</span>
                <span>{post.author.role}</span>
                {post.publishedAt && <time className="inline-flex items-center gap-2" dateTime={post.publishedAt}><CalendarDays className="h-4 w-4" aria-hidden="true" />Published {formatBlogDate(post.publishedAt)}</time>}
                {post.updatedAt && post.updatedAt !== post.publishedAt && <time dateTime={post.updatedAt}>Updated {formatBlogDate(post.updatedAt)}</time>}
              </div>
            </div>
            {post.coverImage?.src && <ResponsiveImage priority src={post.coverImage.src} alt={post.coverImage.alt} width={post.coverImage.width} height={post.coverImage.height} sizes="(min-width: 1024px) 44vw, 100vw" decoding="async" className="aspect-[16/9] w-full rounded-2xl border border-white/10 object-cover shadow-xl" />}
          </div>
        </div>
      </header>

      <section className="bg-white py-10 sm:py-14" aria-label="Blog article">
        <div className="design-container max-w-6xl">
          <div className="grid items-start gap-10 xl:grid-cols-[minmax(0,47rem)_minmax(15rem,18rem)] xl:justify-center xl:gap-x-14">
            <article className="order-last w-full min-w-0 xl:order-1">
              <BlogContentRenderer blocks={post.body} imageSizes="(min-width: 1280px) 752px, (min-width: 768px) 88vw, 100vw" />
              {post.tags?.length > 0 && (
                <div className="mt-10 flex flex-wrap gap-2" aria-label="Article topics">
                  {post.tags.map((tag) => <span key={tag} className="rounded-full bg-muted px-3 py-1 text-sm font-bold text-primary"><span aria-hidden="true">#</span>{tag}</span>)}
                </div>
              )}
              <div className="mt-12 flex w-full flex-wrap justify-start gap-3 border-t border-border pt-6 text-left">
                <Link to={blogCategoryPath(post.category)} className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">More {blogCategoryLabel(post.category)} articles</Link>
                <Link to="/blog/" className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">All blog articles</Link>
              </div>
            </article>
            {(articleSections.length > 0 || relatedRoutes.length > 0 || relatedPosts.length > 0) && (
              <aside className="order-first min-w-0 text-left xl:order-2 xl:sticky xl:top-28 xl:max-h-[calc(100vh-8rem)] xl:overflow-y-auto xl:pb-2">
                <div className="w-full space-y-8 border-t border-border pt-5 text-left xl:space-y-7 xl:border-l-2 xl:border-t-0 xl:border-accent/70 xl:pl-5 xl:pt-0">
                  {articleSections.length > 0 && (
                    <nav aria-label="Article sections">
                      <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-ink">In this article</p>
                      <ol className="mt-4 space-y-2.5 text-sm leading-relaxed">
                        {articleSections.map(({ block, index }) => {
                          const headingId = getBlogHeadingId(block.text, index);
                          return <li key={headingId}><a className="font-medium text-primary underline decoration-border underline-offset-4 hover:decoration-accent" href={`#${headingId}`}>{block.text}</a></li>;
                        })}
                      </ol>
                    </nav>
                  )}
                  {(relatedRoutes.length > 0 || relatedPosts.length > 0) && (
                    <nav aria-label="Related Centaur Careers pages">
                      <h2 className="text-xs font-bold uppercase tracking-[0.16em] text-accent-ink">Related pages</h2>
                      <ul className="mt-4 space-y-2.5 text-sm">
                        {relatedRoutes.map((route) => <li key={route.id}><Link to={route.path} className="font-semibold text-primary underline decoration-border decoration-2 underline-offset-4 hover:decoration-accent">{route.h1}</Link></li>)}
                        {relatedPosts.map((relatedPost) => <li key={relatedPost.id}><Link to={blogPostPath(relatedPost.slug)} className="font-semibold text-primary underline decoration-border decoration-2 underline-offset-4 hover:decoration-accent">{relatedPost.title}</Link></li>)}
                      </ul>
                    </nav>
                  )}
                </div>
              </aside>
            )}
          </div>
        </div>
      </section>
      <RoleIntentPathway intent={roleIntent} />
      <CtaSection eyebrow="Next step" title="See how these topics fit the Financial Operations Masterclass" description="Compare the curriculum, learning options, published fees, certificate details, and current written support terms. Contact the team if you want help matching the program to your goal." primaryTo="/courses/" primaryLabel="Review course details" primaryAnalyticsIntent="commercial_program" secondaryTo="/contact/" secondaryLabel="Ask about the current cohort" />
    </>
  );
}
