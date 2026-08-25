import { index, route } from '@react-router/dev/routes';
import { SEO_ROUTES } from './seo/seoRoutes.js';

const routeModules = Object.freeze({
  home: 'routes/home.jsx',
  courses: 'routes/courses.jsx',
  'investment-banking-operations': 'routes/investment-banking-operations.jsx',
  'retail-banking': 'routes/retail-banking.jsx',
  'finance-operations': 'routes/finance-operations.jsx',
  placements: 'routes/placements.jsx',
  about: 'routes/about.jsx',
  contact: 'routes/contact.jsx',
  'lucknow-location': 'routes/lucknow-location.jsx',
  faqs: 'routes/faqs.jsx',
  'not-found': 'routes/not-found.jsx',
});

const publicRoutes = SEO_ROUTES.map((seoRoute) => {
  const moduleFile = routeModules[seoRoute.id];
  if (!moduleFile) {
    throw new Error(`No route module is registered for SEO route: ${seoRoute.id}`);
  }

  if (seoRoute.path === '/') {
    return index(moduleFile);
  }

  return route(seoRoute.path.slice(1, -1), moduleFile);
});

export default [
  ...publicRoutes,
  route('*', 'routes/catch-all.jsx'),
];
