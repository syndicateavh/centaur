import { BUSINESS_DATA, ORGANIZATION_ID, WEBSITE_ID } from '../businessData.js';
import { BLOG_CATEGORIES } from './blogSchema.js';
import { blogCategoryLabel, blogCategoryPath, blogPostPath } from './blogRoutes.js';
import { getBlogKeywordOwnership } from '../seo/blogKeywordOwnership.js';
import { createOrganizationSchema, createWebsiteSchema, personSchemaId } from '../../seo/seoRoutes.js';
import { DEFAULT_OG_IMAGE, DEFAULT_OG_IMAGE_HEIGHT, DEFAULT_OG_IMAGE_WIDTH, SITE_ORIGIN } from '../../seo/siteConfig.js';

function canonicalBlogUrl(path) {
  return `${SITE_ORIGIN}${path}`;
}

function imageMimeType(src) {
  const extension = src.split('?')[0].split('.').pop()?.toLowerCase();
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  if (extension === 'avif') return 'image/avif';
  if (extension === 'gif') return 'image/gif';
  return 'image/jpeg';
}

function baseMeta({
  title,
  description,
  canonicalPath,
  robots,
  image = DEFAULT_OG_IMAGE,
  imageAlt = `${BUSINESS_DATA.name} blog`,
  imageType = imageMimeType(image),
  imageWidth = DEFAULT_OG_IMAGE_WIDTH,
  imageHeight = DEFAULT_OG_IMAGE_HEIGHT,
  type = 'website',
}) {
  const canonical = canonicalBlogUrl(canonicalPath);
  return [
    { title },
    { name: 'description', content: description },
    { name: 'robots', content: robots },
    { tagName: 'link', rel: 'canonical', href: canonical },
    { property: 'og:type', content: type },
    { property: 'og:locale', content: BUSINESS_DATA.locale },
    { property: 'og:site_name', content: BUSINESS_DATA.name },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: canonical },
    { property: 'og:image', content: image },
    ...(image.startsWith('https://') ? [{ property: 'og:image:secure_url', content: image }] : []),
    { property: 'og:image:type', content: imageType },
    { property: 'og:image:width', content: String(imageWidth) },
    { property: 'og:image:height', content: String(imageHeight) },
    { property: 'og:image:alt', content: imageAlt },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:url', content: canonical },
    { name: 'twitter:image', content: image },
    { name: 'twitter:image:alt', content: imageAlt },
  ];
}

function getPostImage(post) {
  const coverImage = post?.coverImage;
  if (!coverImage?.src?.startsWith('/')) {
    return {
      image: DEFAULT_OG_IMAGE,
      imageAlt: `${BUSINESS_DATA.name} blog`,
      imageType: imageMimeType(DEFAULT_OG_IMAGE),
      imageWidth: DEFAULT_OG_IMAGE_WIDTH,
      imageHeight: DEFAULT_OG_IMAGE_HEIGHT,
    };
  }

  return {
    image: `${SITE_ORIGIN}${coverImage.src}`,
    imageAlt: coverImage.alt,
    imageType: imageMimeType(coverImage.src),
    imageWidth: coverImage.width,
    imageHeight: coverImage.height,
  };
}

function getPostKeywords(post) {
  const ownership = getBlogKeywordOwnership(post);
  const keywords = [
    ownership?.primaryKeyword,
    ...(ownership?.secondaryKeywords || []),
    ...(Array.isArray(post?.tags) ? post.tags : []),
    ...(Array.isArray(post?.seo?.secondaryKeywords) ? post.seo.secondaryKeywords : []),
  ];
  return [...new Set(keywords.filter((keyword) => typeof keyword === 'string' && keyword.trim()).map((keyword) => keyword.trim()))];
}

export { getBlogKeywordOwnership };

export function createBlogPostMeta(post, { slug } = {}) {
  if (!post) {
    return [
      { title: 'Blog Post Not Found | Centaur Careers' },
      { name: 'robots', content: 'noindex,follow' },
      ...(slug ? [{ tagName: 'link', rel: 'canonical', href: canonicalBlogUrl(blogPostPath(slug)) }] : []),
    ];
  }

  const postImage = getPostImage(post);
  const meta = baseMeta({
    title: post.seo.title || post.title,
    description: post.seo.description || post.excerpt,
    canonicalPath: post.seo.canonicalPath || blogPostPath(post.slug),
    robots: post.seo.noindex ? 'noindex,follow' : 'index,follow',
    ...postImage,
    type: 'article',
  });

  return [
    ...meta,
    ...(post.author?.name ? [{ name: 'author', content: post.author.name }] : []),
    ...(post.author?.name ? [{ property: 'article:author', content: post.author.profilePath ? canonicalBlogUrl(post.author.profilePath) : post.author.name }] : []),
    ...(post.publishedAt ? [{ property: 'article:published_time', content: `${post.publishedAt}T00:00:00Z` }] : []),
    ...(post.updatedAt ? [{ property: 'article:modified_time', content: `${post.updatedAt}T00:00:00Z` }] : []),
    { property: 'article:section', content: post.category },
    ...(post.tags || []).map((tag) => ({ property: 'article:tag', content: tag })),
  ];
}

export function createBlogArticleStructuredData(post) {
  if (!post) return null;
  const canonical = canonicalBlogUrl(post.seo.canonicalPath || blogPostPath(post.slug));
  const postImage = getPostImage(post);
  const breadcrumb = {
    '@type': 'BreadcrumbList',
    '@id': `${canonical}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_ORIGIN}/blog/` },
      { '@type': 'ListItem', position: 3, name: post.title, item: canonical },
    ],
  };
  const article = {
    '@type': 'BlogPosting',
    '@id': `${canonical}#article`,
    url: canonical,
    headline: post.title,
    description: post.seo.description || post.excerpt,
    image: [{
      '@type': 'ImageObject',
      url: postImage.image,
      width: Number(postImage.imageWidth),
      height: Number(postImage.imageHeight),
      caption: postImage.imageAlt,
    }],
    datePublished: post.publishedAt ? `${post.publishedAt}T00:00:00Z` : undefined,
    dateModified: `${post.updatedAt || post.publishedAt}T00:00:00Z`,
    author: post.author.type === 'Organization'
      ? {
        '@type': 'Organization',
        '@id': ORGANIZATION_ID,
        name: post.author.name,
        url: canonicalBlogUrl(post.author.profilePath || '/'),
      }
      : {
        '@type': 'Person',
        '@id': personSchemaId(post.author),
        name: post.author.name,
        url: post.author.profilePath ? canonicalBlogUrl(post.author.profilePath) : undefined,
        worksFor: { '@id': ORGANIZATION_ID },
      },
    publisher: { '@id': ORGANIZATION_ID },
    isPartOf: { '@id': WEBSITE_ID },
    mainEntityOfPage: { '@id': `${canonical}#webpage` },
    inLanguage: BUSINESS_DATA.language,
    articleSection: blogCategoryLabel(post.category),
    keywords: getPostKeywords(post).length > 0 ? getPostKeywords(post).join(', ') : undefined,
    wordCount: Array.isArray(post.body)
      ? post.body.map((block) => [block?.text, ...(Array.isArray(block?.items) ? block.items : []), block?.question, block?.answer].filter(Boolean).join(' ')).join(' ').trim().split(/\s+/).filter(Boolean).length
      : undefined,
  };
  const webpage = {
    '@type': 'WebPage',
    '@id': `${canonical}#webpage`,
    url: canonical,
    name: post.seo.title || post.title,
    description: post.seo.description || post.excerpt,
    inLanguage: BUSINESS_DATA.language,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORGANIZATION_ID },
    mainEntity: { '@id': article['@id'] },
    breadcrumb: { '@id': breadcrumb['@id'] },
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [
      createOrganizationSchema(),
      createWebsiteSchema(),
      webpage,
      breadcrumb,
      article,
    ],
  };
}

export function createBlogArchiveMeta(category, posts = []) {
  const knownCategory = BLOG_CATEGORIES.includes(category);
  const label = knownCategory ? blogCategoryLabel(category) : 'Blog Category';
  const indexable = knownCategory && posts.length > 0;
  const description = `Centaur Careers articles and resources about ${label.toLowerCase()}.`;
  const structuredData = indexable ? createBlogArchiveStructuredData(category, posts) : null;

  return [
    ...baseMeta({
      title: `${label} | Centaur Careers Blog`,
      description,
      canonicalPath: blogCategoryPath(category),
      robots: indexable ? 'index,follow' : 'noindex,follow',
      imageAlt: `${label} articles from ${BUSINESS_DATA.name}`,
    }),
    ...(structuredData ? [{ 'script:ld+json': structuredData }] : []),
  ];
}

export function createBlogArchiveStructuredData(category, posts = []) {
  const label = blogCategoryLabel(category);
  const canonical = canonicalBlogUrl(blogCategoryPath(category));
  const breadcrumb = {
    '@type': 'BreadcrumbList',
    '@id': `${canonical}#breadcrumb`,
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_ORIGIN}/` },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${SITE_ORIGIN}/blog/` },
      { '@type': 'ListItem', position: 3, name: label, item: canonical },
    ],
  };
  const collection = {
    '@type': 'CollectionPage',
    '@id': `${canonical}#webpage`,
    url: canonical,
    name: `${label} | Centaur Careers Blog`,
    description: `Centaur Careers articles and resources about ${label.toLowerCase()}.`,
    inLanguage: BUSINESS_DATA.language,
    isPartOf: { '@id': WEBSITE_ID },
    about: { '@id': ORGANIZATION_ID },
    breadcrumb: { '@id': breadcrumb['@id'] },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: posts.map((post, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'BlogPosting',
          '@id': `${canonicalBlogUrl(post.seo.canonicalPath || blogPostPath(post.slug))}#article`,
          url: canonicalBlogUrl(post.seo.canonicalPath || blogPostPath(post.slug)),
          name: post.title,
        },
      })),
    },
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [createOrganizationSchema(), createWebsiteSchema(), collection, breadcrumb],
  };
}
