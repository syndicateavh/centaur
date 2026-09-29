import PriorityLandingPage from '@/pages/PriorityLandingPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('courses-finance-course-for-graduates');

export default function FinanceCourseForGraduatesRoute() {
  return <PriorityLandingPage pageId="finance-course-for-graduates" />;
}
