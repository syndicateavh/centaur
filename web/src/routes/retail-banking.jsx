import CourseDetailPage from '@/pages/CourseDetailPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('retail-banking');

export default function RetailBankingRoute() {
  return <CourseDetailPage courseId="retail-banking" />;
}
