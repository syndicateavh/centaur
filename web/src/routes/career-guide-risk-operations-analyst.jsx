import CareerGuidePage from '@/pages/CareerGuidePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('career-guide-risk-operations-analyst');

export default function RiskOperationsAnalystGuideRoute() {
  return <CareerGuidePage guideId="risk-operations-analyst" />;
}
