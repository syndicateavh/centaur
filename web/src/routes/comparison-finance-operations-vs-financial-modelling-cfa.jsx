import PriorityComparisonPage from '@/pages/PriorityComparisonPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('comparison-finance-operations-vs-financial-modelling-cfa');
export default function FinancePathComparisonPage() {
  return <PriorityComparisonPage pageId="finance-operations-vs-financial-modelling-cfa" />;
}
