import ResourcePage from '@/pages/ResourcePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('resource-reconciliation-in-finance');

export default function ReconciliationInFinanceResource() {
  return <ResourcePage resourceId="reconciliation-in-finance" />;
}
