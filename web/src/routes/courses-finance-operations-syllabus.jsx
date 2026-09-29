import PriorityLandingPage from '@/pages/PriorityLandingPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('courses-finance-operations-syllabus');

export default function FinanceOperationsSyllabusRoute() {
  return <PriorityLandingPage pageId="finance-operations-syllabus" />;
}
