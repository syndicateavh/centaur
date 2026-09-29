import React from 'react';
import { Link } from 'react-router';
import { BLOG_BLOCK_TYPES } from '@/content/blog/blogSchema.js';
import { ResponsiveImage } from '@/components/ui/responsive-image.jsx';

function headingId(text, index) {
  const normalized = String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'section';
  return `blog-section-${normalized}-${index}`;
}

function ContentLink({ block }) {
  const href = block.href || '/blog/';
  if (href.startsWith('/downloads/')) return <a href={href} download className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">{block.label}</a>;
  if (href.startsWith('/')) return <Link to={href} className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">{block.label}</Link>;
  return <a href={href} target="_blank" rel="noopener noreferrer" className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">{block.label}</a>;
}

export default function BlogContentRenderer({ blocks = [] }) {
  return (
    <div className="prose-readable space-y-7 text-base leading-relaxed text-foreground/85">
      {blocks.map((block, index) => {
        if (block.type === BLOG_BLOCK_TYPES.HEADING) {
          return block.level === 3
            ? <h3 id={headingId(block.text, index)} key={index} className="scroll-mt-24 pt-4 text-2xl font-bold text-primary">{block.text}</h3>
            : <h2 id={headingId(block.text, index)} key={index} className="scroll-mt-24 pt-5 text-3xl font-bold text-primary">{block.text}</h2>;
        }
        if (block.type === BLOG_BLOCK_TYPES.LIST) {
          const List = block.ordered ? 'ol' : 'ul';
          return <List key={index} className={`${block.ordered ? 'list-decimal' : 'list-disc'} space-y-2 pl-6`}>{block.items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}</List>;
        }
        if (block.type === BLOG_BLOCK_TYPES.QUOTE) {
          return <blockquote key={index} className="border-l-4 border-accent-ink pl-5 font-editorial text-xl italic text-primary">{block.text}{block.cite && <cite className="mt-3 block font-body text-sm not-italic text-muted-foreground">— {block.cite}</cite>}</blockquote>;
        }
        if (block.type === BLOG_BLOCK_TYPES.LINK) return <p key={index}><ContentLink block={block} /></p>;
        if (block.type === BLOG_BLOCK_TYPES.IMAGE) {
          return <figure key={index}><ResponsiveImage src={block.image.src} alt={block.image.alt} width={block.image.width} height={block.image.height} sizes="(min-width: 1024px) 896px, 100vw" loading="lazy" className="h-auto w-full rounded-2xl" /></figure>;
        }
        if (block.type === BLOG_BLOCK_TYPES.FAQ) {
          return <section key={index} aria-labelledby={`blog-faq-${index}`} className="rounded-xl bg-muted p-5"><h3 id={`blog-faq-${index}`} className="text-xl font-bold text-primary">{block.question}</h3><p className="mt-3">{block.answer}</p></section>;
        }
        if (block.type === BLOG_BLOCK_TYPES.CALLOUT) {
          return <aside key={index} className="rounded-xl border-l-4 border-accent-ink bg-muted p-5"><h3 className="text-xl font-bold text-primary">{block.title}</h3><p className="mt-2">{block.text}</p></aside>;
        }
        return <p key={index}>{block.text}</p>;
      })}
    </div>
  );
}
