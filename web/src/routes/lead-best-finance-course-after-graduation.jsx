import PriorityLandingPage from '@/pages/PriorityLandingPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('lead-best-finance-course-after-graduation');

export default function BestFinanceCourseAfterGraduationRoute() {
  return <PriorityLandingPage pageId="lead-best-finance-course-after-graduation" />;
}
