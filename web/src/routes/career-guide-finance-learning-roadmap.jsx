import CareerGuidePage from '@/pages/CareerGuidePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('career-guide-finance-learning-roadmap');

export default function FinanceLearningRoadmapGuideRoute() {
  return <CareerGuidePage guideId="finance-learning-roadmap" />;
}
