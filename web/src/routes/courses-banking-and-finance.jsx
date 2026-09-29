import PriorityLandingPage from '@/pages/PriorityLandingPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('courses-banking-and-finance');
export default function BankingAndFinanceCoursePage() {
  return <PriorityLandingPage pageId="banking-and-finance" />;
}
