import PriorityComparisonPage from '@/pages/PriorityComparisonPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('comparison-banking-vs-finance-careers');

export default function BankingVsFinanceCareersRoute() {
  return <PriorityComparisonPage pageId="banking-vs-finance-careers" />;
}
