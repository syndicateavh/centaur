import PriorityLandingPage from '@/pages/PriorityLandingPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('lead-finance-course-placement');

export default function FinanceCoursePlacementRoute() {
  return <PriorityLandingPage pageId="lead-finance-course-placement" />;
}
