import { index, route } from '@react-router/dev/routes';
import { SEO_ROUTES } from './seo/seoRoutes.js';

const routeModules = Object.freeze({
  home: 'routes/home.jsx',
  blog: 'routes/blog.jsx',
  'career-guides': 'routes/career-guides.jsx',
  resources: 'routes/resources.jsx',
  quiz: 'routes/quiz.jsx',
  courses: 'routes/courses.jsx',
  'investment-banking-operations': 'routes/investment-banking-operations.jsx',
  'retail-banking': 'routes/retail-banking.jsx',
  'finance-operations': 'routes/finance-operations.jsx',
  'kyc-aml-compliance': 'routes/kyc-aml-compliance.jsx',
  'digital-payments': 'routes/digital-payments.jsx',
  'fintech-neo-banking': 'routes/fintech-neo-banking.jsx',
  placements: 'routes/placements.jsx',
  'student-outcomes': 'routes/student-outcomes.jsx',
  about: 'routes/about.jsx',
  contact: 'routes/contact.jsx',
  'privacy-policy': 'routes/privacy-policy.jsx',
  'terms-and-conditions': 'routes/terms-and-conditions.jsx',
  'cookie-policy': 'routes/cookie-policy.jsx',
  'refund-cancellation-policy': 'routes/refund-cancellation-policy.jsx',
  disclaimer: 'routes/disclaimer.jsx',
  india: 'routes/india.jsx',
  'india-delhi-ncr': 'routes/india-delhi-ncr.jsx',
  'india-bengaluru': 'routes/india-bengaluru.jsx',
  'india-mumbai': 'routes/india-mumbai.jsx',
  'india-pune': 'routes/india-pune.jsx',
  'india-hyderabad': 'routes/india-hyderabad.jsx',
  'comparison-investment-banking-operations': 'routes/comparison-investment-banking-operations.jsx',
  'comparison-best-finance-institutes-india': 'routes/comparison-best-finance-institutes-india.jsx',
  'lead-best-finance-course-placement': 'routes/lead-best-finance-course-placement.jsx',
  'lead-best-investment-banking-course-india': 'routes/lead-best-investment-banking-course-india.jsx',
  'lead-best-finance-course-after-graduation': 'routes/lead-best-finance-course-after-graduation.jsx',
  'lead-best-finance-course-after-bcom': 'routes/lead-best-finance-course-after-bcom.jsx',
  'lead-finance-course-placement': 'routes/lead-finance-course-placement.jsx',
  'lead-finance-course-job-guarantee': 'routes/lead-finance-course-job-guarantee.jsx',
  'lead-finance-course-fees-india': 'routes/lead-finance-course-fees-india.jsx',
  'lead-finance-course-duration': 'routes/lead-finance-course-duration.jsx',
  'lead-finance-course-eligibility': 'routes/lead-finance-course-eligibility.jsx',
  'lead-online-finance-course-placement': 'routes/lead-online-finance-course-placement.jsx',
  'lead-job-oriented-finance-course-india': 'routes/lead-job-oriented-finance-course-india.jsx',
  'lead-banking-finance-course-placement': 'routes/lead-banking-finance-course-placement.jsx',
  'lead-investment-banking-operations-course-placement': 'routes/lead-investment-banking-operations-course-placement.jsx',
  'lead-finance-institute-lucknow-placement': 'routes/lead-finance-institute-lucknow-placement.jsx',
  'lead-finance-course-cities-india': 'routes/lead-finance-course-cities-india.jsx',
  'lead-finance-course-vs-mba-cfa-modelling': 'routes/lead-finance-course-vs-mba-cfa-modelling.jsx',
  'lead-which-finance-course-right': 'routes/lead-which-finance-course-right.jsx',
  'lucknow-location': 'routes/lucknow-location.jsx',
  faqs: 'routes/faqs.jsx',
  'career-guide-investment-banking-operations': 'routes/career-guide-investment-banking-operations.jsx',
  'career-guide-kyc-aml-analyst': 'routes/career-guide-kyc-aml-analyst.jsx',
  'career-guide-finance-operations': 'routes/career-guide-finance-operations.jsx',
  'career-guide-trade-lifecycle': 'routes/career-guide-trade-lifecycle.jsx',
  'career-guide-finance-careers-after-graduation': 'routes/career-guide-finance-careers-after-graduation.jsx',
  'career-guide-retail-banking-operations': 'routes/career-guide-retail-banking-operations.jsx',
  'career-guide-digital-payments-operations': 'routes/career-guide-digital-payments-operations.jsx',
  'career-guide-financial-operations-faq': 'routes/career-guide-financial-operations-faq.jsx',
  'career-guide-choosing-finance-career-course': 'routes/career-guide-choosing-finance-career-course.jsx',
  'career-guide-fintech-operations': 'routes/career-guide-fintech-operations.jsx',
  'career-guide-reconciliation-analyst': 'routes/career-guide-reconciliation-analyst.jsx',
  'career-guide-investment-banking-operations-roles': 'routes/career-guide-investment-banking-operations-roles.jsx',
  'career-guide-trade-support-analyst': 'routes/career-guide-trade-support-analyst.jsx',
  'career-guide-securities-operations': 'routes/career-guide-securities-operations.jsx',
  'career-guide-what-is-investment-banking': 'routes/career-guide-what-is-investment-banking.jsx',
  'career-guide-risk-operations-analyst': 'routes/career-guide-risk-operations-analyst.jsx',
  'career-guide-credit-analyst': 'routes/career-guide-credit-analyst.jsx',
  'career-guide-business-analyst-in-banking': 'routes/career-guide-business-analyst-in-banking.jsx',
  'career-guide-custody-operations': 'routes/career-guide-custody-operations.jsx',
  'career-guide-credit-operations-analyst': 'routes/career-guide-credit-operations-analyst.jsx',
  'career-guide-transaction-monitoring-analyst': 'routes/career-guide-transaction-monitoring-analyst.jsx',
  'career-guide-middle-office-operations': 'routes/career-guide-middle-office-operations.jsx',
  'career-guide-back-office-banking-jobs': 'routes/career-guide-back-office-banking-jobs.jsx',
  'career-guide-settlement-analyst': 'routes/career-guide-settlement-analyst.jsx',
  'career-guide-finance-learning-roadmap': 'routes/career-guide-finance-learning-roadmap.jsx',
  'career-guide-operations-analyst-banking': 'routes/career-guide-operations-analyst-banking.jsx',
  'resource-investment-banking-interview-questions': 'routes/resource-investment-banking-interview-questions.jsx',
  'resource-accounting-interview-questions': 'routes/resource-accounting-interview-questions.jsx',
  'resource-finance-gk': 'routes/resource-finance-gk.jsx',
  'resource-accounting-basics': 'routes/resource-accounting-basics.jsx',
  'resource-reconciliation-in-finance': 'routes/resource-reconciliation-in-finance.jsx',
  'resource-bank-reconciliation-process': 'routes/resource-bank-reconciliation-process.jsx',
  'resource-cost-accounting-finance-operations': 'routes/resource-cost-accounting-finance-operations.jsx',
  'resource-financial-accounting-banking': 'routes/resource-financial-accounting-banking.jsx',
  'resource-financial-statement-analysis': 'routes/resource-financial-statement-analysis.jsx',
  'resource-corporate-actions-workflow': 'routes/resource-corporate-actions-workflow.jsx',
  'resource-capital-market-operations': 'routes/resource-capital-market-operations.jsx',
  'resource-financial-system-india': 'routes/resource-financial-system-india.jsx',
  'resource-kyc-aml-compliance-guide': 'routes/resource-kyc-aml-compliance-guide.jsx',
  'courses-banking-courses': 'routes/courses-banking-courses.jsx',
  'courses-banking-and-finance': 'routes/courses-banking-and-finance.jsx',
  'courses-finance-operations-training': 'routes/courses-finance-operations-training.jsx',
  'courses-finance-operations-syllabus': 'routes/courses-finance-operations-syllabus.jsx',
  'courses-finance-course-fees-eligibility': 'routes/courses-finance-course-fees-eligibility.jsx',
  'courses-finance-course-for-graduates': 'routes/courses-finance-course-for-graduates.jsx',
  'comparison-finance-operations-vs-financial-modelling-cfa': 'routes/comparison-finance-operations-vs-financial-modelling-cfa.jsx',
  'comparison-online-vs-offline-finance-training': 'routes/comparison-online-vs-offline-finance-training.jsx',
  'comparison-investment-banking-operations-vs-financial-analyst': 'routes/comparison-investment-banking-operations-vs-financial-analyst.jsx',
  'comparison-banking-vs-finance-careers': 'routes/comparison-banking-vs-finance-careers.jsx',
  'faqs-finance-program': 'routes/faqs-finance-program.jsx',
  'not-found': 'routes/not-found.jsx',
});

const publicRoutes = SEO_ROUTES.map((seoRoute) => {
  const moduleFile = routeModules[seoRoute.id]
    || (seoRoute.careerGuideId ? 'routes/career-guide-role.jsx' : null);
  const usesSharedCareerGuideRoute = !routeModules[seoRoute.id] && Boolean(seoRoute.careerGuideId);
  if (!moduleFile) {
    throw new Error(`No route module is registered for SEO route: ${seoRoute.id}`);
  }

  if (seoRoute.path === '/') {
    return index(moduleFile);
  }

  return usesSharedCareerGuideRoute
    ? route(seoRoute.path.slice(1, -1), moduleFile, { id: seoRoute.id })
    : route(seoRoute.path.slice(1, -1), moduleFile);
});

export default [
  route('blog-portal', 'routes/blog-portal.jsx'),
  ...publicRoutes,
  route('blog/category/:category', 'routes/blog-category.jsx'),
  route('blog/:slug', 'routes/blog-post.jsx'),
  route('*', 'routes/catch-all.jsx'),
];
