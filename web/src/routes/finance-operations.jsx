import CourseDetailPage from '@/pages/CourseDetailPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('finance-operations');

export default function FinanceOperationsRoute() {
  return <CourseDetailPage courseId="finance-operations" />;
}
