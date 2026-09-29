import LegalPage from '@/pages/LegalPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('disclaimer');

export default function DisclaimerRoute() {
  return <LegalPage pageId="disclaimer" />;
}
