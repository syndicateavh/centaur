import PriorityLandingPage from '@/pages/PriorityLandingPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('lead-finance-course-cities-india');

export default function FinanceCourseCitiesIndiaRoute() {
  return <PriorityLandingPage pageId="lead-finance-course-cities-india" />;
}
