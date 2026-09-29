import CareerGuidePage from '@/pages/CareerGuidePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('career-guide-finance-careers-after-graduation');

export default function FinanceCareersAfterGraduationGuide() {
  return <CareerGuidePage guideId="finance-careers-after-graduation" />;
}
