import CareerGuidePage from '@/pages/CareerGuidePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('career-guide-investment-banking-operations-roles');
export default function InvestmentBankingOperationsRolesGuide() {
  return <CareerGuidePage guideId="investment-banking-operations-roles" />;
}
