import PriorityLandingPage from '@/pages/PriorityLandingPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('courses-banking-courses');
export default function BankingCoursesPage() {
  return <PriorityLandingPage pageId="banking-courses" />;
}
