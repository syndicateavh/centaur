import { useLocation } from 'react-router';
import CareerGuidePage from '@/pages/CareerGuidePage.jsx';
import { CAREER_GUIDES } from '@/content/careerGuides.js';
import { createRouteMeta, SEO_ROUTES } from '@/seo/seoRoutes.js';

export const meta = ({ location }) => {
  const pathname = location.pathname.endsWith('/') ? location.pathname : `${location.pathname}/`;
  const route = SEO_ROUTES.find((candidate) => candidate.path === pathname);
  return route ? createRouteMeta(route.id) : [];
};

export default function CareerGuideRoleRoute() {
  const { pathname } = useLocation();
  const normalizedPathname = pathname.endsWith('/') ? pathname : `${pathname}/`;
  const guide = CAREER_GUIDES.find((candidate) => candidate.path === normalizedPathname);
  return guide ? <CareerGuidePage guideId={guide.id} /> : null;
}
