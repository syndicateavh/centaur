import PriorityLandingPage from '@/pages/PriorityLandingPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('lead-which-finance-course-right');

export default function WhichFinanceCourseRightRoute() {
  return <PriorityLandingPage pageId="lead-which-finance-course-right" />;
}
