// Distinct learning decisions for the six subjects in the single Masterclass.
// The guarantee belongs to the full program, never to an individual module.
export const TOPIC_PROGRAM_REVIEW_DATE = '2026-09-30';

export const TOPIC_PROGRAM_PATHS = Object.freeze({
  'investment-banking-operations': Object.freeze({
    label: 'Investment Banking Operations',
    decision: 'Compare post-trade work with front-office finance roles. This module covers operations concepts such as trade records, settlement and reconciliation within the full Masterclass.',
    practice: 'Two fictional trade records disagree on quantity before settlement. Calculate the break, check the original execution and allocation evidence, then explain who may approve the next action.',
    answer: 'Keep the instruction pending under the employer control until the authorised owner verifies the trade and any correction. A matching internal record alone cannot prove the counterparty is wrong.',
    casePath: '/blog/settlement-trade-break-worked-example/',
    caseLabel: 'Try the trade-break source records and answer key',
    rolePath: '/career-guides/investment-banking-operations/',
    roleLabel: 'Check investment banking operations role fit',
    roleBoundary: 'Completion of this module does not promise a trade support, settlement, investment banking, employer, salary or location outcome.',
  }),
  'retail-banking': Object.freeze({
    label: 'Retail Banking',
    decision: 'Compare branch and customer-service work with retail product operations, onboarding and lending administration. The exact duties and authority vary by employer.',
    practice: 'A fictional account-service request has conflicting contact details and incomplete authorisation. Record the conflict, identify the missing verification and draft a neutral status update.',
    answer: 'Do not change the customer record to clear the queue. Preserve the source values and route the request to the authorised verification owner.',
    casePath: '/blog/loan-operations-banking-roles-skills-career-path/',
    caseLabel: 'Practise the adjacent loan-file review exercise',
    rolePath: '/career-guides/retail-banking-operations/',
    roleLabel: 'Check retail banking operations role fit',
    roleBoundary: 'Completion of this module does not promise a bank branch, lender, city, salary or retail banking role.',
  }),
  'finance-operations': Object.freeze({
    label: 'Finance Operations',
    decision: 'Compare accounting controls, reconciliations, loan processing, credit support and reporting by the actual work a vacancy describes. This module sits inside the full Masterclass.',
    practice: 'A fictional loan sanction is INR 500,000 while a draft booking is INR 600,000 and the disbursement request is unsigned. Find each separate exception and write the next controlled action.',
    answer: 'The amount differs by INR 100,000. Keep booking and disbursement pending under lender procedure, check the approved amendment trail, and refer the unsigned request to the authorised owner.',
    casePath: '/blog/loan-operations-banking-roles-skills-career-path/',
    caseLabel: 'Download the loan-file records and model answer',
    rolePath: '/career-guides/finance-operations/',
    roleLabel: 'Check finance operations role fit',
    roleBoundary: 'Completion of this module does not promise a credit, lender, analyst, salary or location outcome.',
  }),
  'kyc-aml-compliance': Object.freeze({
    label: 'KYC and AML Compliance',
    decision: 'Explore onboarding, due diligence, screening and case escalation as operational subjects. Exact regulatory requirements and approval decisions remain with the relevant institution.',
    practice: 'A fictional business file has an unsigned ownership declaration, an unverified signatory and a screening result still pending. Decide what the analyst can record and who must review it.',
    answer: 'Keep the three gaps separate. Do not treat a missing screening result as clear or approve the file from incomplete evidence. Route the case through the institution\'s authorised process.',
    casePath: '/blog/kyc-onboarding-case-file-example/',
    caseLabel: 'Work the fictional KYC packet and model note',
    rolePath: '/career-guides/kyc-aml-analyst/',
    roleLabel: 'Check KYC analyst role fit',
    roleBoundary: 'Completion of this module does not promise a KYC analyst post, regulated credential, employer, salary or location.',
  }),
  'digital-payments': Object.freeze({
    label: 'Digital Payments',
    decision: 'Trace a transaction across a payment provider, bank and ledger. Compare payment operations and card dispute roles with the requirements of a current posting.',
    practice: 'A fictional gateway shows INR 2,500 success, bank settlement is INR 2,475 and the ledger has no matching line. Identify the amount difference and the separate posting break.',
    answer: 'The INR 25 difference could be a fee but needs approved evidence. The missing ledger line is a second open exception; neither break closes from gateway status alone.',
    casePath: '/blog/payment-reconciliation-process-breaks-controls/',
    caseLabel: 'Try the payment reconciliation packet and answer key',
    rolePath: '/career-guides/digital-payments-operations/',
    roleLabel: 'Check digital payments operations role fit',
    roleBoundary: 'Completion of this module does not promise a payments, UPI, card-dispute, employer, salary or city outcome.',
  }),
  'fintech-neo-banking': Object.freeze({
    label: 'FinTech and Neo-Banking',
    decision: 'Explore technology-enabled onboarding, service, payments and lending workflows as finance operations subjects. This is not a software-engineering qualification.',
    practice: 'A fictional digital onboarding dashboard shows a completed application, but identity verification is pending and the service queue lists an unresolved data mismatch. What can an operations associate state?',
    answer: 'State that the application was submitted, not approved. Keep verification and data mismatches visible, identify the responsible queue and wait for the authorised decision before giving a completion status.',
    casePath: '/blog/kyc-onboarding-case-file-example/',
    caseLabel: 'Practise the adjacent onboarding evidence case',
    rolePath: '/career-guides/fintech-operations/',
    roleLabel: 'Check FinTech operations role fit',
    roleBoundary: 'Completion of this module does not promise a FinTech role, technical credential, employer, salary or city outcome.',
  }),
});

export const TOPIC_PROGRAM_IDS = Object.freeze(Object.keys(TOPIC_PROGRAM_PATHS));

export function getTopicProgramPath(id) {
  return TOPIC_PROGRAM_PATHS[id] || null;
}
