import ResourcePage from '@/pages/ResourcePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('resource-financial-accounting-banking');
export default function FinancialAccountingBankingResource() {
  return <ResourcePage resourceId="financial-accounting-banking" />;
}
