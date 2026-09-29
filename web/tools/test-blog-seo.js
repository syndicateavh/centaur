#!/usr/bin/env node

import assert from 'node:assert/strict';
import {
  createBlogArchiveMeta,
  createBlogArticleStructuredData,
  createBlogPostMeta,
} from '../src/content/blog/blogSeo.js';

const post = {
  slug: 'sample-career-guide',
  title: 'Sample career guide',
  excerpt: 'A short sample description for the blog SEO contract.',
  category: 'career-guides',
  author: {
    name: 'Centaur Careers Editorial Team',
    role: 'Editorial team',
    profilePath: '/about/',
  },
  coverImage: {
    src: '/images/blog/sample-guide.webp',
    alt: 'Sample guide cover',
    width: 1600,
    height: 900,
  },
  publishedAt: '2026-09-01',
  updatedAt: '2026-09-02',
  seo: {
    title: 'Sample career guide | Centaur Careers',
    description: 'A sample description for verifying blog metadata.',
    canonicalPath: '/blog/sample-career-guide/',
    noindex: false,
  },
};

const meta = createBlogPostMeta(post);
const metaByName = new Map(meta.filter((item) => item.name).map((item) => [item.name, item.content]));
const metaByProperty = new Map(meta.filter((item) => item.property).map((item) => [item.property, item.content]));
assert.equal(meta.find((item) => item.title)?.title, post.seo.title);
assert.equal(metaByName.get('robots'), 'index,follow');
assert.equal(metaByName.get('twitter:card'), 'summary_large_image');
assert.equal(metaByName.get('twitter:url'), 'https://centaurcareers.in/blog/sample-career-guide/');
assert.equal(metaByProperty.get('og:image:type'), 'image/webp');
assert.equal(metaByProperty.get('og:image:secure_url'), 'https://centaurcareers.in/images/blog/sample-guide.webp');
assert.equal(metaByProperty.get('og:image:width'), '1600');
assert.equal(metaByProperty.get('og:image:height'), '900');
assert.equal(metaByProperty.get('article:published_time'), '2026-09-01T00:00:00Z');
assert.equal(metaByProperty.get('article:author'), 'https://centaurcareers.in/about/');

const articleSchema = createBlogArticleStructuredData(post);
assert.equal(articleSchema['@context'], 'https://schema.org');
assert.ok(articleSchema['@graph'].some((entity) => entity['@type'] === 'EducationalOrganization'));
assert.ok(articleSchema['@graph'].some((entity) => entity['@type'] === 'WebSite'));
assert.ok(articleSchema['@graph'].some((entity) => entity['@type'] === 'BlogPosting'));
assert.ok(articleSchema['@graph'].some((entity) => entity['@type'] === 'BreadcrumbList'));
assert.equal(articleSchema['@graph'].filter((entity) => entity['@id']).length, 5);

const organizationPost = {
  ...post,
  author: {
    type: 'Organization',
    id: 'centaur-careers',
    name: 'Centaur Careers',
    role: 'Publisher',
    profilePath: '/',
  },
};
const organizationArticle = createBlogArticleStructuredData(organizationPost)['@graph']
  .find((entity) => entity['@type'] === 'BlogPosting');
assert.equal(organizationArticle.author['@type'], 'Organization');
assert.equal(organizationArticle.author['@id'], 'https://centaurcareers.in/#organization');
assert.equal(organizationArticle.author.name, 'Centaur Careers');

const archiveMeta = createBlogArchiveMeta('career-guides', [post]);
assert.equal(archiveMeta.find((item) => item.title)?.title, 'Career Guides | Centaur Careers Blog');
assert.equal(archiveMeta.find((item) => item.name === 'robots')?.content, 'index,follow');
assert.ok(archiveMeta.some((item) => item['script:ld+json']?.['@graph']?.some((entity) => entity['@type'] === 'CollectionPage')));

console.log('Blog SEO metadata and structured-data contracts verified.');
