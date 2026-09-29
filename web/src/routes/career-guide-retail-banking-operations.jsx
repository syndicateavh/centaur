import CareerGuidePage from '@/pages/CareerGuidePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('career-guide-retail-banking-operations');

export default function RetailBankingOperationsCareerGuide() {
  return <CareerGuidePage guideId="retail-banking-operations" />;
}
