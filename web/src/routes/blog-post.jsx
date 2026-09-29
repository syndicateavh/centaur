import BlogPostPage from '@/pages/BlogPostPage.jsx';
import { getBlogPostBySlug } from '@/content/blog/blogStorage.js';
import { createBlogArticleStructuredData, createBlogPostMeta } from '@/content/blog/blogSeo.js';

export const meta = ({ params }) => {
  const post = getBlogPostBySlug(params.slug);
  const metadata = createBlogPostMeta(post, { slug: params.slug });
  const structuredData = post?.seo?.noindex ? null : createBlogArticleStructuredData(post);
  return structuredData ? [...metadata, { 'script:ld+json': structuredData }] : metadata;
};

export default BlogPostPage;
