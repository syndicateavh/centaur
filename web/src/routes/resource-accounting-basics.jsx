import ResourcePage from '@/pages/ResourcePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('resource-accounting-basics');

export default function AccountingBasicsResource() {
  return <ResourcePage resourceId="accounting-basics" />;
}
