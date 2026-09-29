import ResourcePage from '@/pages/ResourcePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('resource-kyc-aml-compliance-guide');

export default function KycAmlComplianceGuideResourceRoute() {
  return <ResourcePage resourceId="kyc-aml-compliance-guide" />;
}
