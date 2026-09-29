const COURSE_MODULE_PATHS = Object.freeze({
  'investment-banking-operations': '/courses/investment-banking-operations/',
  'retail-banking': '/courses/retail-banking/',
  'kyc-aml-compliance': '/courses/kyc-aml/',
  'digital-payments': '/courses/digital-payments/',
  'finance-operations': '/courses/finance-operations/',
  'fintech-neo-banking': '/courses/fintech/',
});

export function getCourseModulePath(trackId) {
  return COURSE_MODULE_PATHS[trackId] || null;
}
