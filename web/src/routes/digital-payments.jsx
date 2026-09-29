import InformationalModulePage from '@/pages/InformationalModulePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('digital-payments');

export default function DigitalPaymentsModuleRoute() {
  return <InformationalModulePage moduleId="digital-payments" />;
}
