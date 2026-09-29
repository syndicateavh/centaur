import PriorityComparisonPage from '@/pages/PriorityComparisonPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('comparison-online-vs-offline-finance-training');
export default function OnlineOfflineFinanceComparisonPage() {
  return <PriorityComparisonPage pageId="online-vs-offline-finance-training" />;
}
