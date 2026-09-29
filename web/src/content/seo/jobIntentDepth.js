// Role-specific practice for existing career-guide owners. These are invented
// exercises, not vacancies, employer assessments, or claims of hiring outcomes.
import { JOB_GUARANTEE, PROGRAM } from '../sourceContent.js';
const heading = (text) => ({ type: 'heading', level: 2, text });
const paragraph = (text) => ({ type: 'paragraph', text });
const list = (items) => ({ type: 'list', items });
const link = (label, href) => ({ type: 'link', label, href });

export const JOB_INTENT_REVIEW_DATE = '2026-09-29';

const ROLE_PACKS = Object.freeze({
  'investment-banking-operations': {
    vacancy: 'Before applying, identify whether the vacancy owns trade capture, confirmation, settlement, reconciliation, custody, fund accounting, or a control queue. Note its product, market, cut-off, shift, systems, degree or experience rule, and approval boundary. A Citi Haryana fund-accounting role posted 4 September 2026 asks for 3–4 years of relevant experience and financial-reporting work. It is an experienced adjacent example, not a fresher opening or a requirement for every investment-operations role.',
    tools: ['Trace trade ID, instrument, side, quantity, price, currency, trade date, settlement date, and instruction status.', 'Practise Excel filters and a comparison sheet that preserves both source values and the reviewer decision.', 'Explain who can confirm an amendment and who can release a settlement instruction.'],
    task: 'Practice brief: an internal trade capture shows 100 units at INR 250, while a counterparty confirmation shows 10 units at the same price. What is the difference, which record would you inspect first, and can you release the queued instruction?',
    answer: 'The quantity difference is 90 units and the simplified gross difference is INR 22,500. Check execution and allocation history, log both source IDs, and refer the queued instruction to the authorised owner. Neither record can be silently overwritten; release depends on the employer control.',
    interview: 'Interview prompt: How would you distinguish a capture error from an allocation or confirmation-version difference before a market cut-off?',
    case: ['/blog/settlement-trade-break-worked-example/', 'Work through the trade-break source records and answer key'],
    course: ['/courses/investment-banking-operations/', 'Compare the investment banking operations module'],
    source: ['Citi fund-accounting analyst posting, Haryana, posted 4 September 2026; an experienced adjacent role', 'https://jobs.citi.com/job/haryana/fund-accounting-analyst-1/287/99795551184'],
  },
  'kyc-aml-analyst': {
    vacancy: 'Compare each KYC vacancy with its customer segment, onboarding versus periodic-review scope, screening tools, case-writing duties, qualification and experience rule, and who owns approval. A Citi Mumbai KYC Operations Analyst 1 listing posted 24 September 2026 describes sourcing KYC records, coordination with relationship management and compliance, a bachelor\'s degree or equivalent experience, and 1–3 years of relevant experience. Its exact requirements apply to that posting only; the title alone does not establish fresher eligibility.',
    tools: ['Build a document inventory with source, retrieval date, validity and missing-evidence status.', 'Distinguish an unanswered screening check from a clear result.', 'Write a neutral case note and route a possible ownership or authority inconsistency to the approved reviewer.'],
    task: 'Practice brief: a fictional company file has an unsigned ownership declaration, one unverified signatory, and screening still pending. Is the file ready for approval?',
    answer: 'No conclusion about approval is supported. Record the three separate gaps, request the approved evidence, leave screening as pending, and send the case to the designated reviewer. Do not infer that a missing result means a clear result.',
    interview: 'Interview prompt: Which facts belong in an escalation note when beneficial-ownership evidence conflicts with a signatory record?',
    case: ['/blog/kyc-onboarding-case-file-example/', 'Review the fictional KYC case packet and model note'],
    course: ['/courses/kyc-aml/', 'Compare the KYC and AML module'],
    source: ['Citi KYC Operations Analyst 1 posting, Mumbai, posted 24 September 2026', 'https://jobs.citi.com/job/mumbai/kyc-operations-analyst/287/101076905504'],
  },
  'finance-operations': {
    vacancy: 'A finance operations analyst title may mean accounting controls, lending support, payments, reporting, or reconciliations. Read the actual processing verbs, degree and experience rules, Excel or workflow-system requirement, shift, and approval rights. For example, a Citi Chennai reconciliation posting dated 18 September 2026 asks for settled-trade, cash and suspense break controls and welcomes fresh graduates despite listing 1–3 years as relevant experience. That is one team, not a blanket finance-operations eligibility rule.',
    tools: ['Build a small exception register with reference, source, date, amount, owner, ageing and status.', 'Separate a timing difference from an amount or reference mismatch.', 'Write a hand-off that states evidence checked and the next controlled action.'],
    task: 'Practice brief: a ledger line is absent after a payment gateway reports success. What can the analyst state, and what evidence is still needed?',
    answer: 'State only that the ledger line is absent from the defined extract. Check the bank, settlement, gateway and posting queue for the same reference and period. Keep the case open until an authorised owner confirms the cause and verifies a posting or carry-forward.',
    interview: 'Interview prompt: How would you prioritise a high-value aged break over a larger queue of low-value same-day items?',
    case: ['/blog/payment-reconciliation-process-breaks-controls/', 'Practise a payment-to-ledger reconciliation break'],
    course: ['/courses/finance-operations/', 'Compare the finance operations module'],
    source: ['Citi reconciliation and proofing posting, Chennai, posted 18 September 2026', 'https://jobs.citi.com/job/chennai/rec-and-proofing-rep-c04-chennai/287/100801470336'],
  },
  'retail-banking-operations': {
    vacancy: 'Check whether a retail banking vacancy is customer service, onboarding, branch processing, lending administration, or controls. Read the product scope, customer-contact requirement, location, hours, eligibility, system access, and escalation authority. A Citi Chennai card/payment operations support posting dated 9 September 2026 asks for 0–3 years, a bachelor\'s degree or equivalent experience, spreadsheets and careful processing. It is one retail-product support example, not a branch-role or loan-approval requirement.',
    tools: ['Map request intake, identity check, supporting documents, authorised decision, customer update and record closure.', 'Practise a concise status note without copying real customer identifiers.', 'Separate what the associate can check from what a supervisor or credit officer must approve.'],
    task: 'Practice brief: a fictional account-service request lists two different mobile numbers and the authorisation evidence is incomplete. Would you update the record?',
    answer: 'No. Preserve both source values, identify the missing authorisation, and route the request through the approved verification process. Give only a factual pending status until the authorised owner decides.',
    interview: 'Interview prompt: What would you do if a customer asks for a change that is urgent but lacks required verification?',
    case: ['/blog/loan-operations-banking-roles-skills-career-path/', 'Try the fictional loan-file completeness exercise'],
    course: ['/courses/retail-banking/', 'Compare the retail banking module'],
    source: ['Citi card and payment operations support posting, Chennai, posted 9 September 2026', 'https://jobs.citi.com/job/chennai/ops-support-specialist/287/100386520176'],
  },
  'digital-payments-operations': {
    vacancy: 'For payments roles, identify the rail or product: UPI, cards, gateway settlement, reconciliation, disputes, or fraud operations. Check which system owns the status, which team handles complaints, the data tools requested, support hours, and any network-specific rulebook. A Citi Chennai card/payment operations support posting dated 9 September 2026 lists settlement, reconciliation, reversals, spreadsheets and 0–3 years of relevant experience; it is a card/payments example, not a UPI-wide rule. A card chargeback is not the same workflow as a failed UPI transaction.',
    tools: ['Match a gateway reference to bank settlement and ledger records without matching on amount alone.', 'Track the payment event, fee, refund and dispute as separate records.', 'Keep an unresolved customer-facing status accurate and route the case to the right payments queue.'],
    task: 'Practice brief: gateway success is INR 2,500, bank settlement is INR 2,475, and the ledger has no line. What two differences must be investigated?',
    answer: 'The INR 25 amount difference may be a fee but requires the approved fee schedule or settlement detail. The missing ledger line is a separate posting break. Neither should be closed from the gateway status alone.',
    interview: 'Interview prompt: How would you explain a payment break to a reviewer without promising the customer a refund?',
    case: ['/blog/payment-reconciliation-process-breaks-controls/', 'Work the payment-break packet and answer key'],
    course: ['/courses/digital-payments/', 'Compare the digital payments module'],
    source: ['Citi card and payment operations support posting, Chennai, posted 9 September 2026', 'https://jobs.citi.com/job/chennai/ops-support-specialist/287/100386520176'],
  },
  'reconciliation-analyst': {
    vacancy: 'Read the source systems, frequency, account or product, cut-off, matching tolerances, Excel or reconciliation-platform requirement, and review authority in each vacancy. A Citi Chennai posting dated 18 September 2026 names cash/Nostro, stock and suspense breaks, a NAM shift and 1–3 years of relevant experience while welcoming fresh graduates. Its eligibility is specific to that role. Do not assume a bank-statement reconciliation is identical to securities position reconciliation.',
    tools: ['Define the opening population, control total, matching key and date window.', 'Classify unmatched, duplicate, timing, fee and data-quality breaks separately.', 'Record ageing, evidence, owner, reviewer and final re-performance.'],
    task: 'Practice brief: the internal amount is INR 25,000 and the external record is INR 2,500 for the same trade reference. Is the break a timing difference?',
    answer: 'No timing conclusion follows from those two amounts. Compare quantity and price, verify the source version, calculate the INR 22,500 difference and keep it open until an authorised correction is independently checked.',
    interview: 'Interview prompt: When is an exception genuinely closed, and what evidence would make your reviewer comfortable?',
    case: ['/blog/settlement-trade-break-worked-example/', 'Investigate a worked reconciliation break'],
    course: ['/courses/finance-operations/', 'Compare the finance operations module'],
    source: ['Citi reconciliation and proofing posting, Chennai, posted 18 September 2026', 'https://jobs.citi.com/job/chennai/rec-and-proofing-rep-c04-chennai/287/100801470336'],
  },
  'credit-operations-analyst': {
    vacancy: 'Separate loan processing, credit analysis and credit-system maintenance in the job description. A Citi credit-maintenance posting in Warsaw dated 15 September 2026 asks for accurate facility and client records, approved changes, Excel, attention to detail and business/risk coordination. It lists relevant degree fields and says prior banking or operations experience is a plus, not required. This overseas posting illustrates one credit-operations family; it is not an India-wide eligibility rule.',
    tools: ['Build a document and condition checklist against a fictional sanctioned facility.', 'Check obligor, facility amount, tenor, rate, approval date and disbursement request without making a credit decision.', 'Preserve approval evidence and route any missing condition to the credit or operations owner.'],
    task: 'Practice brief: a fictional sanction states INR 5 lakh for 36 months, but the booking screen shows INR 6 lakh and the disbursement request is unsigned. What is the safe next action?',
    answer: 'Record the INR 1 lakh difference and unsigned request as separate exceptions. Check the approved sanction and amendment trail; do not book or disburse from the mismatched screen. Escalate to the authorised credit/loan owner and verify the corrected record after approval.',
    interview: 'Interview prompt: What is the difference between checking an approved facility and deciding whether a customer should receive credit?',
    case: ['/blog/loan-operations-banking-roles-skills-career-path/', 'Check the fictional loan file and model answer'],
    course: ['/courses/finance-operations/', 'Compare the finance operations module'],
    source: ['Citi Credit Maintenance Analyst posting, Warsaw, posted 15 September 2026; overseas example', 'https://jobs.citi.com/job/warsaw/credit-maintenance-analyst/287/100661695904'],
  },
  'back-office-banking-jobs': {
    vacancy: 'Back office banking is a broad search term, not one vacancy. Sort real listings into payments, lending, securities, KYC, reconciliations, finance, or reporting before comparing qualifications. For contrast, a Citi Chennai card/payment support posting dated 9 September 2026 lists 0–3 years and spreadsheet skills; a different KYC or securities role can set different eligibility. Record location, shift, product, tools and customer-contact expectations for the individual posting.',
    tools: ['Take three genuine listings and highlight each processing verb and output.', 'Group them by workflow rather than relying on the shared back-office label.', 'Choose one practice case that matches the selected workflow.'],
    task: 'Practice brief: one advert asks for KYC record refresh and another for cash-break investigation. Are they interchangeable entry roles?',
    answer: 'No. The first centres on customer due diligence and document review; the second on source-record matching and exception control. Compare each vacancy’s actual eligibility and build different evidence for each.',
    interview: 'Interview prompt: Which daily output and control does the role own, and how would you demonstrate that skill from fictional work?',
    case: ['/blog/finance-operations-portfolio-projects-freshers/', 'Choose a role-matched portfolio exercise'],
    course: ['/courses/', 'Compare the single Masterclass and its modules'],
    source: ['Citi card and payment operations support posting, Chennai, posted 9 September 2026', 'https://jobs.citi.com/job/chennai/ops-support-specialist/287/100386520176'],
  },
  'trade-lifecycle': {
    vacancy: 'Trade support postings differ by product, market, time zone and lifecycle stage. Check whether the analyst validates capture, matches confirmations, monitors settlement, investigates fails, or reconciles final positions. A Citi Chennai reconciliation posting dated 18 September 2026 explicitly covers settled-trade records and cash/stock breaks, showing a post-settlement control rather than the whole lifecycle. Note the cut-off and source systems; do not call every post-trade role a front-office investment banking job.',
    tools: ['Draw execution, capture, confirmation, clearing, settlement and reconciliation as separate hand-offs.', 'Label each source record, owner, status and approval boundary.', 'Investigate a quantity mismatch before treating it as a settlement fail.'],
    task: 'Practice brief: a confirmation has a quantity difference while the instruction is still queued. Has settlement already failed?',
    answer: 'No. The packet supports an unresolved pre-settlement confirmation break, not a completed settlement failure. Record the differences, check execution/allocation evidence and refer the queued instruction to its authorised owner.',
    interview: 'Interview prompt: How do you distinguish a confirmation break from a failed settlement and a later reconciliation break?',
    case: ['/blog/settlement-trade-break-worked-example/', 'Work the pre-settlement trade-break example'],
    course: ['/courses/investment-banking-operations/', 'Compare the investment banking operations module'],
    source: ['Citi settled-trade reconciliation posting, Chennai, posted 18 September 2026', 'https://jobs.citi.com/job/chennai/rec-and-proofing-rep-c04-chennai/287/100801470336'],
  },
});

export const JOB_INTENT_GUIDE_IDS = Object.freeze(Object.keys(ROLE_PACKS));

export function getJobIntentDepthBlocks(guideId) {
  const pack = ROLE_PACKS[guideId];
  if (!pack) return [];
  return [
    heading('How to judge a real vacancy in this role'),
    paragraph(pack.vacancy),
    paragraph(`Role evidence reviewed ${JOB_INTENT_REVIEW_DATE}. A job posting may close or change. Check the employer's current listing for exact eligibility; this career guide does not advertise an opening.`),
    ...(pack.source ? [link(...pack.source)] : []),
    heading('Skills and tools to demonstrate'),
    list(pack.tools),
    heading('Try a fictional work sample'),
    paragraph(pack.task),
    paragraph(`Model reasoning: ${pack.answer}`),
    link(pack.case[1], pack.case[0]),
    heading('Interview question and next step'),
    paragraph(pack.interview),
    paragraph('Use your answer to show what you checked, what is still unknown, who can approve the next action, and how you would verify closure. Use invented data only. Compare the published module scope and written programme terms before deciding whether training fits your target role.'),
    link(pack.course[1], pack.course[0]),
    heading('How the full program guarantee applies'),
    paragraph(`${JOB_GUARANTEE.description} ${pack.roleBoundary || 'This career topic is one possible direction; the program does not promise this exact role, employer, salary or location.'} The subject above is part of the ${PROGRAM.name}, not a separately guaranteed course or vacancy.`),
    link('Read the published guarantee summary and request current written terms', JOB_GUARANTEE.termsPath),
  ];
}
