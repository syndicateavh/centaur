import CareerGuidePage from '@/pages/CareerGuidePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('career-guide-custody-operations');

export default function CustodyOperationsGuideRoute() {
  return <CareerGuidePage guideId="custody-operations" />;
}
