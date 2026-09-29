import PriorityLandingPage from '@/pages/PriorityLandingPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('lead-finance-course-fees-india');

export default function FinanceCourseFeesIndiaRoute() {
  return <PriorityLandingPage pageId="lead-finance-course-fees-india" />;
}
