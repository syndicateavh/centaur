import React from 'react';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { Link } from 'react-router';
import { blogCategoryLabel, blogPostPath } from '@/content/blog/blogRoutes.js';
import { ResponsiveImage } from '@/components/ui/responsive-image.jsx';

const BLOG_DATE_FORMAT = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

function ArticleDate({ value }) {
  if (!value) return null;
  return <time className="inline-flex items-center gap-2 text-sm text-muted-foreground" dateTime={value}><CalendarDays className="h-4 w-4" aria-hidden="true" />{BLOG_DATE_FORMAT.format(new Date(`${value}T00:00:00Z`))}</time>;
}

export default function BlogPostCard({ post, layout = 'vertical', featured = false }) {
  if (featured) {
    return (
      <article className={`grid min-w-0 overflow-hidden rounded-3xl border border-border bg-white shadow-sm ${post.coverImage?.src ? 'lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.92fr)]' : ''}`}>
        <div className="flex min-w-0 flex-col items-start justify-center p-7 sm:p-9 lg:p-12">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-ink">Featured article · {blogCategoryLabel(post.category)}</p>
          <h2 className="mt-4 text-balance text-3xl font-black leading-tight text-primary sm:text-4xl">{post.title}</h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">{post.excerpt}</p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <ArticleDate value={post.publishedAt} />
            <Link to={blogPostPath(post.slug)} className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-bold text-white transition hover:bg-primary/90">
              Read featured article <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
        {post.coverImage?.src && <ResponsiveImage src={post.coverImage.src} alt={post.coverImage.alt} width={post.coverImage.width} height={post.coverImage.height} sizes="(min-width: 1024px) 42vw, 100vw" loading="lazy" decoding="async" className="h-full min-h-64 w-full object-cover lg:min-h-[25rem]" />}
      </article>
    );
  }

  if (layout === 'horizontal') {
    return (
      <article className={`grid min-w-0 overflow-hidden rounded-2xl border border-border bg-white transition hover:border-accent/70 hover:shadow-md ${post.coverImage?.src ? 'sm:grid-cols-[minmax(11rem,0.72fr)_minmax(0,1fr)]' : ''}`}>
        {post.coverImage?.src && <ResponsiveImage src={post.coverImage.src} alt={post.coverImage.alt} width={post.coverImage.width} height={post.coverImage.height} sizes="(min-width: 640px) 240px, 100vw" loading="lazy" decoding="async" className="aspect-[16/9] h-full w-full object-cover sm:aspect-auto sm:min-h-52" />}
        <div className="flex min-w-0 flex-col items-start p-5 sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent-ink">{blogCategoryLabel(post.category)}</p>
          <h2 className="mt-2 text-balance text-xl font-bold leading-snug text-primary">{post.title}</h2>
          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
          <div className="mt-auto flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-3 pt-5">
            <ArticleDate value={post.publishedAt} />
            <Link to={blogPostPath(post.slug)} className="inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">Read article <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      {post.coverImage?.src && (
        <ResponsiveImage
          src={post.coverImage.src}
          alt={post.coverImage.alt}
          width={post.coverImage.width}
          height={post.coverImage.height}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          loading="lazy"
          decoding="async"
          className="aspect-[16/9] w-full object-cover"
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-ink">{blogCategoryLabel(post.category)}</p>
        <h2 className="mt-3 break-words text-balance text-2xl font-bold leading-snug text-primary">{post.title}</h2>
        {post.tags?.length > 0 && <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground" aria-label="Article topics">{post.tags.slice(0, 3).join(' · ')}</p>}
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
        <div className="mt-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-3 text-sm">
          <ArticleDate value={post.publishedAt} />
          <Link to={blogPostPath(post.slug)} className="inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">
            Read article <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
