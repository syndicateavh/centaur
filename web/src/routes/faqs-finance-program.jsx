import PriorityFaqPage from '@/pages/PriorityFaqPage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('faqs-finance-program');
export default function FinanceProgramFaqPage() {
  return <PriorityFaqPage pageId="finance-program" />;
}
