import CareerGuidePage from '@/pages/CareerGuidePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('career-guide-financial-operations-faq');

export default function FinancialOperationsFaqGuide() {
  return <CareerGuidePage guideId="financial-operations-faq" />;
}
