import CareerGuidePage from '@/pages/CareerGuidePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('career-guide-choosing-finance-career-course');

export default function ChoosingFinanceCareerCourseGuide() {
  return <CareerGuidePage guideId="choosing-finance-career-course" />;
}
