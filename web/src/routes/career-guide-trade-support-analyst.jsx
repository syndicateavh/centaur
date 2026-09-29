import CareerGuidePage from '@/pages/CareerGuidePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('career-guide-trade-support-analyst');
export default function TradeSupportAnalystCareerGuide() {
  return <CareerGuidePage guideId="trade-support-analyst" />;
}
