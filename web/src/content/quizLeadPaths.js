import { getRoleIntentById } from './roleIntent.js';

function createQuizLeadPath(domainId, roleIntentId) {
  const roleIntent = getRoleIntentById(roleIntentId);
  if (!roleIntent) throw new Error('Quiz lead path references an unknown role intent: ' + roleIntentId);

  return Object.freeze({
    domainId,
    roleIntentId,
    roleLabel: roleIntent.label,
    rolePath: roleIntent.canonicalPath,
    coursePath: roleIntent.coursePath,
    nextStep: roleIntent.primaryQuestion,
  });
}

// Every quiz domain must hand the learner to one relevant, owned role path.
// Multiple domains may share a destination when the underlying career
// direction is genuinely the same; the validator prevents missing mappings.
export const QUIZ_LEAD_PATHS = Object.freeze({
  all: createQuizLeadPath('all', 'finance-careers-after-graduation-role'),
  'investment-banking-operations': createQuizLeadPath('investment-banking-operations', 'investment-banking-operations-role'),
  'capital-markets': createQuizLeadPath('capital-markets', 'investment-banking-operations-role'),
  'asset-management-operations': createQuizLeadPath('asset-management-operations', 'fund-accounting-analyst-role'),
  'corporate-actions-operations': createQuizLeadPath('corporate-actions-operations', 'corporate-actions-analyst-role'),
  'retail-banking-operations': createQuizLeadPath('retail-banking-operations', 'retail-banking-operations-role'),
  'lending-credit-operations': createQuizLeadPath('lending-credit-operations', 'loan-operations-analyst-role'),
  'corporate-commercial-banking': createQuizLeadPath('corporate-commercial-banking', 'finance-operations-role'),
  'trade-finance-operations': createQuizLeadPath('trade-finance-operations', 'finance-operations-role'),
  'treasury-operations': createQuizLeadPath('treasury-operations', 'finance-operations-role'),
  'digital-payments-operations': createQuizLeadPath('digital-payments-operations', 'digital-payments-operations-role'),
  'payment-risk-and-reconciliation': createQuizLeadPath('payment-risk-and-reconciliation', 'digital-payments-operations-role'),
  'kyc-cdd-operations': createQuizLeadPath('kyc-cdd-operations', 'kyc-aml-analyst-role'),
  'financial-crime-compliance': createQuizLeadPath('financial-crime-compliance', 'kyc-aml-analyst-role'),
  'regulatory-compliance-operations': createQuizLeadPath('regulatory-compliance-operations', 'kyc-aml-analyst-role'),
  'risk-management-operations': createQuizLeadPath('risk-management-operations', 'finance-operations-role'),
  'accounting-finance-operations': createQuizLeadPath('accounting-finance-operations', 'finance-operations-role'),
  'insurance-operations': createQuizLeadPath('insurance-operations', 'finance-operations-role'),
  'fintech-neo-banking': createQuizLeadPath('fintech-neo-banking', 'finance-careers-after-graduation-role'),
  'wealth-investment-operations': createQuizLeadPath('wealth-investment-operations', 'investment-banking-operations-role'),
  'banking-data-analytics': createQuizLeadPath('banking-data-analytics', 'finance-careers-after-graduation-role'),
  'banking-technology-operations': createQuizLeadPath('banking-technology-operations', 'digital-payments-operations-role'),
  'banking-customer-experience': createQuizLeadPath('banking-customer-experience', 'retail-banking-operations-role'),
  'banking-career-roles': createQuizLeadPath('banking-career-roles', 'finance-careers-after-graduation-role'),
  'banking-interview-preparation': createQuizLeadPath('banking-interview-preparation', 'financial-operations-faq-role'),
});

export const QUIZ_LEAD_PATH_COUNT = Object.keys(QUIZ_LEAD_PATHS).length;

export function getQuizLeadPath(domainId) {
  return QUIZ_LEAD_PATHS[domainId] || QUIZ_LEAD_PATHS.all;
}
