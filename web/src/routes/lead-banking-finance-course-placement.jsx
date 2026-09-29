import PriorityLandingPage from '@/pages/PriorityLandingPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('lead-banking-finance-course-placement');

export default function BankingFinanceCoursePlacementRoute() {
  return <PriorityLandingPage pageId="lead-banking-finance-course-placement" />;
}
