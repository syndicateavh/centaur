import PriorityLandingPage from '@/pages/PriorityLandingPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('courses-finance-course-fees-eligibility');

export default function FinanceCourseFeesEligibilityRoute() {
  return <PriorityLandingPage pageId="finance-course-fees-eligibility" />;
}
