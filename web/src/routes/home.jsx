import SeoHomePage from '@/pages/SeoHomePage.jsx';
import { createRouteMeta } from '@/seo/homeSeo.js';

export const meta = () => createRouteMeta('home');

export const links = () => [
  {
    rel: 'preload',
    as: 'image',
    href: '/images/profiles/optimized/amanullah-khan-coforge.webp',
    fetchPriority: 'high',
  },
];

export default SeoHomePage;
