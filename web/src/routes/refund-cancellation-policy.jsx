import LegalPage from '@/pages/LegalPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('refund-cancellation-policy');

export default function RefundCancellationPolicyRoute() {
  return <LegalPage pageId="refund-cancellation-policy" />;
}
