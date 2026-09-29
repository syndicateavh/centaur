import BlogCategoryPage from '@/pages/BlogCategoryPage.jsx';
import { getBlogPostsByCategory } from '@/content/blog/blogStorage.js';
import { createBlogArchiveMeta } from '@/content/blog/blogSeo.js';

export const meta = ({ params }) => {
  const category = params.category;
  const posts = getBlogPostsByCategory(category);
  return createBlogArchiveMeta(category, posts);
};

export default BlogCategoryPage;
