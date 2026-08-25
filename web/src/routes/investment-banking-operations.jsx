import CourseDetailPage from '@/pages/CourseDetailPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('investment-banking-operations');

export default function InvestmentBankingOperationsRoute() {
  return <CourseDetailPage courseId="investment-banking-operations" />;
}
