import PriorityComparisonPage from '@/pages/PriorityComparisonPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('comparison-investment-banking-operations-vs-financial-analyst');

export default function InvestmentBankingOperationsVsFinancialAnalystRoute() {
  return <PriorityComparisonPage pageId="investment-banking-operations-vs-financial-analyst" />;
}
