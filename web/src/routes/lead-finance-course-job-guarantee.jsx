import PriorityLandingPage from '@/pages/PriorityLandingPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('lead-finance-course-job-guarantee');

export default function FinanceCourseJobGuaranteeRoute() {
  return <PriorityLandingPage pageId="lead-finance-course-job-guarantee" />;
}
