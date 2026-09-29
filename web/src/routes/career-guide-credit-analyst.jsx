import CareerGuidePage from '@/pages/CareerGuidePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('career-guide-credit-analyst');

export default function CreditAnalystGuideRoute() {
  return <CareerGuidePage guideId="credit-analyst" />;
}
