import ResourcePage from '@/pages/ResourcePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('resource-finance-gk');

export default function FinanceBFSIBasicsResource() {
  return <ResourcePage resourceId="finance-gk" />;
}
