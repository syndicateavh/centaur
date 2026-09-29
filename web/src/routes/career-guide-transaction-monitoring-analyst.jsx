import CareerGuidePage from '@/pages/CareerGuidePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('career-guide-transaction-monitoring-analyst');

export default function TransactionMonitoringAnalystGuideRoute() {
  return <CareerGuidePage guideId="transaction-monitoring-analyst" />;
}
