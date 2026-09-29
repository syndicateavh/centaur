import PriorityLandingPage from '@/pages/PriorityLandingPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('lead-finance-course-vs-mba-cfa-modelling');

export default function FinanceCourseVsMbaCfaModellingRoute() {
  return <PriorityLandingPage pageId="lead-finance-course-vs-mba-cfa-modelling" />;
}
