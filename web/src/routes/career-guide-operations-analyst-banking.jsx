import CareerGuidePage from '@/pages/CareerGuidePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('career-guide-operations-analyst-banking');

export default function OperationsAnalystBankingGuideRoute() {
  return <CareerGuidePage guideId="operations-analyst-banking" />;
}
