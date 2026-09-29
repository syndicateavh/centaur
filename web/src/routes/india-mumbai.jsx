import RegionalPage from '@/pages/RegionalPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('india-mumbai');

export default function MumbaiRegionalPage() {
  return <RegionalPage regionId="mumbai" />;
}
