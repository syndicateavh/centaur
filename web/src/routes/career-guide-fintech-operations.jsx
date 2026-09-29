import CareerGuidePage from '@/pages/CareerGuidePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('career-guide-fintech-operations');

export default function FintechOperationsCareerGuide() {
  return <CareerGuidePage guideId="fintech-operations" />;
}
