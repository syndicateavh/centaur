import PriorityLandingPage from '@/pages/PriorityLandingPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('courses-finance-operations-training');
export default function FinanceOperationsTrainingPage() {
  return <PriorityLandingPage pageId="finance-operations-training" />;
}
