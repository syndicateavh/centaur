import React from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { blogCategoryLabel, blogPostPath } from '@/content/blog/blogRoutes.js';
import { ResponsiveImage } from '@/components/ui/responsive-image.jsx';

export default function BlogPostCard({ post }) {
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
      <div className="flex flex-1 flex-col p-6">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-accent-ink">{blogCategoryLabel(post.category)}</p>
        <h2 className="mt-3 text-2xl font-bold text-primary">{post.title}</h2>
        {post.tags?.length > 0 && <p className="mt-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground" aria-label="Article topics">{post.tags.slice(0, 3).join(' · ')}</p>}
        <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
        <div className="mt-6 flex items-center justify-between gap-4 text-sm">
          <time dateTime={post.publishedAt}>{post.publishedAt}</time>
          <Link to={blogPostPath(post.slug)} className="inline-flex items-center gap-2 font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">
            Read article <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
