import React from 'react';
import { Link } from 'react-router';
import DownloadPreviewDialog from '@/components/DownloadPreviewDialog.jsx';
import { BLOG_BLOCK_TYPES } from '@/content/blog/blogSchema.js';
import { ResponsiveImage } from '@/components/ui/responsive-image.jsx';

export function getBlogHeadingId(text, index) {
  const normalized = String(text || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'section';
  return `blog-section-${normalized}-${index}`;
}

function getDownloadAsset(href, label) {
  const filename = href.split('/').pop()?.split('?')[0] || 'published-download.txt';
  return { path: href, filename, label };
}

function ContentLink({ block }) {
  const href = block.href || '/blog/';
  if (href.startsWith('/downloads/')) {
    const downloadAsset = getDownloadAsset(href, block.label);
    return (
      <DownloadPreviewDialog
        asset={downloadAsset}
        title={`Preview: ${block.label}`}
        description="Review the published file before connecting with Centaur Careers."
        triggerLabel={block.label}
        analyticsId={`blog-download-preview-${downloadAsset.filename.replace(/[^a-z0-9]+/gi, '-')}`}
        analyticsIntent="informational_support"
        triggerClassName="inline cursor-pointer border-0 bg-transparent p-0 text-left font-bold text-primary underline decoration-accent decoration-2 underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        {block.label}
      </DownloadPreviewDialog>
    );
  }
  if (href.startsWith('/')) return <Link to={href} className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">{block.label}</Link>;
  return <a href={href} target="_blank" rel="noopener noreferrer" className="font-bold text-primary underline decoration-accent decoration-2 underline-offset-4">{block.label}</a>;
}

export default function BlogContentRenderer({ blocks = [], imageSizes = '(min-width: 1024px) 896px, 100vw' }) {
  return (
    <div className="prose-readable space-y-7 text-base leading-relaxed text-foreground/85">
      {blocks.map((block, index) => {
        if (block.type === BLOG_BLOCK_TYPES.FAQ) {
          if (blocks[index - 1]?.type === BLOG_BLOCK_TYPES.FAQ) return null;
          const questions = [];
          for (let faqIndex = index; blocks[faqIndex]?.type === BLOG_BLOCK_TYPES.FAQ; faqIndex += 1) questions.push(blocks[faqIndex]);
          return <section key={`faq-group-${index}`} aria-label="Frequently asked questions" className="rounded-2xl border border-border bg-muted/40 px-5 sm:px-6"><dl className="divide-y divide-border">{questions.map((faq, faqIndex) => <div key={`faq-${faqIndex}`} className="py-5 first:pt-5 last:pb-5"><dt className="text-lg font-bold leading-snug text-primary">{faq.question}</dt><dd className="mt-2 leading-relaxed">{faq.answer}</dd></div>)}</dl></section>;
        }
        if (block.type === BLOG_BLOCK_TYPES.HEADING) {
          return block.level === 3
            ? <h3 id={getBlogHeadingId(block.text, index)} key={index} className="scroll-mt-24 pt-3 text-xl font-bold text-primary sm:text-2xl">{block.text}</h3>
            : <h2 id={getBlogHeadingId(block.text, index)} key={index} className="scroll-mt-24 border-l-4 border-accent-ink pl-4 pt-4 text-2xl font-bold leading-tight text-primary sm:text-[1.75rem]">{block.text}</h2>;
        }
        if (block.type === BLOG_BLOCK_TYPES.LIST) {
          const List = block.ordered ? 'ol' : 'ul';
          return <List key={index} className={`${block.ordered ? 'blog-steps' : 'list-disc marker:text-accent-ink'} space-y-3 pl-6`}>{block.items.map((item, itemIndex) => <li key={itemIndex} className={block.ordered ? '' : 'ps-1'}>{item}</li>)}</List>;
        }
        if (block.type === BLOG_BLOCK_TYPES.QUOTE) {
          return <blockquote key={index} className="border-l-4 border-accent-ink pl-5 font-editorial text-xl italic text-primary">{block.text}{block.cite && <cite className="mt-3 block font-body text-sm not-italic text-muted-foreground">— {block.cite}</cite>}</blockquote>;
        }
        if (block.type === BLOG_BLOCK_TYPES.LINK) return <p key={index}><ContentLink block={block} /></p>;
        if (block.type === BLOG_BLOCK_TYPES.IMAGE) {
          return <figure key={index}><ResponsiveImage src={block.image.src} alt={block.image.alt} width={block.image.width} height={block.image.height} sizes={imageSizes} loading="lazy" className="h-auto w-full rounded-2xl" /></figure>;
        }
        if (block.type === BLOG_BLOCK_TYPES.CALLOUT) {
          return <aside key={index} className="rounded-xl border-l-4 border-accent-ink bg-muted p-5"><h3 className="text-xl font-bold text-primary">{block.title}</h3><p className="mt-2">{block.text}</p></aside>;
        }
        return <p key={index}>{block.text}</p>;
      })}
    </div>
  );
}
