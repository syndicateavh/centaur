import PriorityLandingPage from '@/pages/PriorityLandingPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('lead-finance-course-duration');

export default function FinanceCourseDurationRoute() {
  return <PriorityLandingPage pageId="lead-finance-course-duration" />;
}
