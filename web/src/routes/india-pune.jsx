import RegionalPage from '@/pages/RegionalPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('india-pune');

export default function PuneRegionalPage() {
  return <RegionalPage regionId="pune" />;
}
