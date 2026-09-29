import CareerGuidePage from '@/pages/CareerGuidePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('career-guide-trade-lifecycle');

export default function TradeLifecycleCareerGuide() {
  return <CareerGuidePage guideId="trade-lifecycle" />;
}
