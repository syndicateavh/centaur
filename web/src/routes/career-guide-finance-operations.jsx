import CareerGuidePage from '@/pages/CareerGuidePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('career-guide-finance-operations');

export default function FinanceOperationsCareerGuide() {
  return <CareerGuidePage guideId="finance-operations" />;
}
