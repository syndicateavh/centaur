import CareerGuidePage from '@/pages/CareerGuidePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('career-guide-kyc-aml-analyst');

export default function KycAmlCareerGuide() {
  return <CareerGuidePage guideId="kyc-aml-analyst" />;
}
