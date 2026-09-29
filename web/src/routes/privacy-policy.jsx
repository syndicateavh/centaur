import LegalPage from '@/pages/LegalPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('privacy-policy');

export default function PrivacyPolicyRoute() {
  return <LegalPage pageId="privacy-policy" />;
}
