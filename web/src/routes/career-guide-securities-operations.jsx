import CareerGuidePage from '@/pages/CareerGuidePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('career-guide-securities-operations');
export default function SecuritiesOperationsCareerGuide() {
  return <CareerGuidePage guideId="securities-operations" />;
}
