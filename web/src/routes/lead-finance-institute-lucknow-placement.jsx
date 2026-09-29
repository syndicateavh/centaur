import PriorityLandingPage from '@/pages/PriorityLandingPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('lead-finance-institute-lucknow-placement');

export default function FinanceInstituteLucknowPlacementRoute() {
  return <PriorityLandingPage pageId="lead-finance-institute-lucknow-placement" />;
}
