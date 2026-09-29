import CareerGuidePage from '@/pages/CareerGuidePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('career-guide-settlement-analyst');

export default function SettlementAnalystGuideRoute() {
  return <CareerGuidePage guideId="settlement-analyst" />;
}
