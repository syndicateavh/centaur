import PriorityLandingPage from '@/pages/PriorityLandingPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('lead-investment-banking-operations-course-placement');

export default function InvestmentBankingOperationsCoursePlacementRoute() {
  return <PriorityLandingPage pageId="lead-investment-banking-operations-course-placement" />;
}
