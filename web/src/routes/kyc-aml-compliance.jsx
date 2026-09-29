import InformationalModulePage from '@/pages/InformationalModulePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('kyc-aml-compliance');

export default function KycAmlModuleRoute() {
  return <InformationalModulePage moduleId="kyc-aml-compliance" />;
}
