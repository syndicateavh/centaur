import ResourcePage from '@/pages/ResourcePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('resource-capital-market-operations');

export default function CapitalMarketOperationsResourceRoute() {
  return <ResourcePage resourceId="capital-market-operations" />;
}
