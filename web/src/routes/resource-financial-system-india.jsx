import ResourcePage from '@/pages/ResourcePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('resource-financial-system-india');

export default function FinancialSystemIndiaResourceRoute() {
  return <ResourcePage resourceId="financial-system-india" />;
}
