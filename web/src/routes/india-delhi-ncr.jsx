import RegionalPage from '@/pages/RegionalPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('india-delhi-ncr');

export default function DelhiNcrRegionalPage() {
  return <RegionalPage regionId="delhi-ncr" />;
}
