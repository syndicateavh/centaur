import PriorityLandingPage from '@/pages/PriorityLandingPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('lead-online-finance-course-placement');

export default function OnlineFinanceCoursePlacementRoute() {
  return <PriorityLandingPage pageId="lead-online-finance-course-placement" />;
}
