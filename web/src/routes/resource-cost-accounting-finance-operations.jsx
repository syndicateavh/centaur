import ResourcePage from '@/pages/ResourcePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('resource-cost-accounting-finance-operations');
export default function CostAccountingFinanceOperationsResource() {
  return <ResourcePage resourceId="cost-accounting-finance-operations" />;
}
