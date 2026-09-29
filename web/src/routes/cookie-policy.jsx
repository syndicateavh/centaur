import LegalPage from '@/pages/LegalPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('cookie-policy');

export default function CookiePolicyRoute() {
  return <LegalPage pageId="cookie-policy" />;
}
