import LegalPage from '@/pages/LegalPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('terms-and-conditions');

export default function TermsAndConditionsRoute() {
  return <LegalPage pageId="terms-and-conditions" />;
}
