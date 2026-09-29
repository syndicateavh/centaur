import RegionalPage from '@/pages/RegionalPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('india-bengaluru');

export default function BengaluruRegionalPage() {
  return <RegionalPage regionId="bengaluru" />;
}
