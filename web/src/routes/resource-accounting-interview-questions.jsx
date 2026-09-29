import ResourcePage from '@/pages/ResourcePage.jsx';
import { createRouteMeta } from '@/seo/seoRoutes.js';

export const meta = () => createRouteMeta('resource-accounting-interview-questions');

export default function AccountingInterviewQuestionsResource() {
  return <ResourcePage resourceId="accounting-interview-questions" />;
}
