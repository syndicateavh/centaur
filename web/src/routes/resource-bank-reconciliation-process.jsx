import ResourcePage from '@/pages/ResourcePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('resource-bank-reconciliation-process');
export default function BankReconciliationProcessResource() {
  return <ResourcePage resourceId="bank-reconciliation-process" />;
}
