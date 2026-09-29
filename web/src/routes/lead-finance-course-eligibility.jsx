import PriorityLandingPage from '@/pages/PriorityLandingPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('lead-finance-course-eligibility');

export default function FinanceCourseEligibilityRoute() {
  return <PriorityLandingPage pageId="lead-finance-course-eligibility" />;
}
