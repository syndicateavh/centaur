import ResourcePage from '@/pages/ResourcePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('resource-corporate-actions-workflow');

export default function CorporateActionsWorkflowResourceRoute() {
  return <ResourcePage resourceId="corporate-actions-workflow" />;
}
