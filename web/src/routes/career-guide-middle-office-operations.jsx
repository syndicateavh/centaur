import CareerGuidePage from '@/pages/CareerGuidePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('career-guide-middle-office-operations');

export default function MiddleOfficeOperationsGuideRoute() {
  return <CareerGuidePage guideId="middle-office-operations" />;
}
