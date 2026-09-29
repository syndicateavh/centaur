import CareerGuidePage from '@/pages/CareerGuidePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('career-guide-digital-payments-operations');

export default function DigitalPaymentsOperationsCareerGuide() {
  return <CareerGuidePage guideId="digital-payments-operations" />;
}
