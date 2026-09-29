import RegionalPage from '@/pages/RegionalPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('india-hyderabad');

export default function HyderabadRegionalPage() {
  return <RegionalPage regionId="hyderabad" />;
}
