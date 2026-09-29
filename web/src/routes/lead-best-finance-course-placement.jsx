import PriorityLandingPage from '@/pages/PriorityLandingPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('lead-best-finance-course-placement');

export default function BestFinanceCoursePlacementRoute() {
  return <PriorityLandingPage pageId="lead-best-finance-course-placement" />;
}
