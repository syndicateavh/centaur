import InformationalModulePage from '@/pages/InformationalModulePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('fintech-neo-banking');

export default function FintechModuleRoute() {
  return <InformationalModulePage moduleId="fintech-neo-banking" />;
}
