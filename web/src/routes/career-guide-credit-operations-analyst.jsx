import CareerGuidePage from '@/pages/CareerGuidePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('career-guide-credit-operations-analyst');

export default function CreditOperationsAnalystGuideRoute() {
  return <CareerGuidePage guideId="credit-operations-analyst" />;
}
