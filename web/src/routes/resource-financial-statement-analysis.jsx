import ResourcePage from '@/pages/ResourcePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('resource-financial-statement-analysis');
export default function FinancialStatementAnalysisResource() {
  return <ResourcePage resourceId="financial-statement-analysis" />;
}
