import CareerGuidePage from '@/pages/CareerGuidePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('career-guide-business-analyst-in-banking');

export default function BusinessAnalystInBankingGuideRoute() {
  return <CareerGuidePage guideId="business-analyst-in-banking" />;
}
