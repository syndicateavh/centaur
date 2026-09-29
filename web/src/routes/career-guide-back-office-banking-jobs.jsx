import CareerGuidePage from '@/pages/CareerGuidePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('career-guide-back-office-banking-jobs');

export default function BackOfficeBankingJobsGuideRoute() {
  return <CareerGuidePage guideId="back-office-banking-jobs" />;
}
