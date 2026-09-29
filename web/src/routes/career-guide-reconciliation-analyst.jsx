import CareerGuidePage from '@/pages/CareerGuidePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('career-guide-reconciliation-analyst');
export default function ReconciliationAnalystCareerGuide() {
  return <CareerGuidePage guideId="reconciliation-analyst" />;
}
