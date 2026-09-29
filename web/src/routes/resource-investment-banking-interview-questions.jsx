import ResourcePage from '@/pages/ResourcePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('resource-investment-banking-interview-questions');

export default function InvestmentBankingInterviewQuestionsResource() {
  return <ResourcePage resourceId="investment-banking-interview-questions" />;
}
