import { BLOG_BLOCK_TYPES } from './blog/blogSchema.js';
import {
  NEXT_CAREER_GUIDE_SPECS,
  NEXT_COMPARISON_PAGE_SPECS,
  NEXT_LANDING_PAGE_SPECS,
  NEXT_RESOURCE_SPECS,
} from './nextSeoPages.js';
import {
  NEXT_CAREER_DEPTH_BLOCKS,
  NEXT_COMPARISON_DEPTH_BLOCKS,
  NEXT_LANDING_DEPTH_BLOCKS,
  NEXT_RESOURCE_DEPTH_BLOCKS,
} from './nextSeoPageDepth.js';
import { INDIA_LEAD_INTENT_PAGES } from './indiaLeadIntentPages.js';
import { getJobIntentDepthBlocks, JOB_INTENT_GUIDE_IDS, JOB_INTENT_REVIEW_DATE } from './seo/jobIntentDepth.js';

const AUTHOR = Object.freeze({
  id: 'bharat-singh',
  name: 'Bharat Singh',
  role: 'Founder & Director',
  profilePath: '/about/',
});

const PUBLISHED_AT = '2026-09-27';
const NEW_ROLE_GUIDE_DATE = '2026-10-04';
const NEW_ROLE_GUIDE_IDS = new Set([
  'corporate-actions-analyst', 'fund-accounting-analyst', 'aml-analyst', 'client-onboarding-analyst',
  'payment-operations-analyst', 'upi-operations-analyst', 'payment-disputes-analyst',
  'branch-operations-analyst', 'banking-relationship-manager', 'loan-processing-analyst', 'nbfc-operations-analyst', 'fintech-operations-analyst',
]);

const paragraph = (text) => ({ type: BLOG_BLOCK_TYPES.PARAGRAPH, text });
const heading = (text, level = 2) => ({ type: BLOG_BLOCK_TYPES.HEADING, level, text });
const list = (items, ordered = false) => ({ type: BLOG_BLOCK_TYPES.LIST, ordered, items });
const link = (label, href, routeId) => ({ type: BLOG_BLOCK_TYPES.LINK, label, href, routeId });
const faq = (question, answer) => ({ type: BLOG_BLOCK_TYPES.FAQ, question, answer });

function appendBeforeCommonQuestions(body, additions) {
  if (!additions?.length) return body;
  const faqIndex = body.findIndex((block) => block.type === BLOG_BLOCK_TYPES.HEADING && block.text === 'Common questions');
  if (faqIndex === -1) return [...body, ...additions];
  return [...body.slice(0, faqIndex), ...additions, ...body.slice(faqIndex)];
}

function appendBeforeBodyLinks(body, additions) {
  if (!additions?.length) return body;
  const linkIndex = body.findIndex((block) => block.type === BLOG_BLOCK_TYPES.LINK);
  if (linkIndex === -1) return [...body, ...additions];
  return [...body.slice(0, linkIndex), ...additions, ...body.slice(linkIndex)];
}

// These additions are deliberately mapped by intent. They add original teaching
// value to the first-pass route copy without making every page repeat the same
// generic SEO paragraph. The page templates below append them to the core copy.
const GUIDE_DEPTH_BLOCKS = Object.freeze({
  'reconciliation-analyst': [
    heading('Daily operating rhythm and control points'),
    paragraph("A reconciliation analyst's day is usually organised around a cut-off, a queue, or a reporting deadline. The analyst confirms what should have arrived, runs or reviews the matching process, separates expected timing differences from genuine exceptions, and keeps the ageing view current. The control is not complete when a note is written: it is complete when the source evidence, responsible owner, approved action, and final verification are all visible to the team."),
    list([
      'Start with the scope and control total before reviewing individual breaks.',
      'Use stable identifiers and approved tolerances instead of informal visual matching.',
      'Prioritise material, aged, client-impacting, deadline-sensitive, or control-sensitive items.',
      'Keep investigation notes factual: state what was expected, what was observed, and what evidence was checked.',
      'Reperform or review the final match after an authorised correction or late record arrives.',
    ]),
    heading('Metrics that show whether reconciliation is healthy'),
    paragraph('Teams may track the number and value of open breaks, ageing by bucket, same-day match rates, repeat causes, unresolved items at close, and the time taken to assign ownership. These measures are useful only when their definitions are consistent. A high match rate can hide a control problem if low-value items are processed while a small number of material breaks remain unexplained. A learner should therefore ask how the team defines a break, an aged item, a closure, and an escalation.'),
    heading('How to explain a break in an interview'),
    paragraph('A strong answer follows the evidence trail rather than jumping to a fix. Explain the scope, the first field that differed, the source records consulted, the classification of the break, the owner and deadline, and the control used to verify closure. For example: "I would first confirm the account and period, compare the transaction identifier and value date, check the statement and processing log, record whether the item is a timing or data issue, then escalate through the approved route and recheck the next output." This demonstrates judgement without claiming authority to post or alter records.'),
    heading('Progression from analyst to wider operations roles'),
    paragraph('Early experience can build toward senior reconciliation, controls, settlements, trade support, fund operations, payments, or finance-operations roles. Progression is not automatic and titles differ by employer. The transferable evidence is the quality of investigations, the ability to spot recurring root causes, concise stakeholder updates, reliable control evidence, and the willingness to improve a process without bypassing approval. Build a portfolio from fictional data and describe decisions, not confidential files.'),
    faq('What should a reconciliation analyst portfolio contain?', 'Use invented records, a clear matching rule, a small exception queue, an ageing view, and a short control note. Do not include confidential customer, employer, account, or transaction data.'),
  ],
  'investment-banking-operations-roles': [
    heading('How to read an investment banking operations job description'),
    paragraph('Titles alone do not tell you whether a vacancy sits in trade support, settlements, custody, reconciliation, corporate actions, fund accounting, client operations, or a control team. Read the verbs and outputs. "Validate," "match," "settle," "investigate," "process," "monitor," and "escalate" usually point to workflow responsibilities. "Model," "value," "pitch," or "originate" may describe a different role family. The product, shift pattern, systems, location, and escalation responsibility are just as important as the title.'),
    list([
      'Identify the asset class, transaction type, or client process named in the vacancy.',
      'Separate daily processing from exception management and improvement work.',
      'Check whether the role is responsible for an input, a control, an approval, or a final output.',
      'Look for cut-offs, shift coverage, service levels, ageing, and client-impact language.',
      'Note the spreadsheet, workflow, market-data, or reporting skills actually requested.',
      'Compare eligibility and location requirements with your current profile before applying.',
    ]),
    heading('A realistic day across the role families'),
    paragraph('A trade-support analyst may begin by checking overnight exceptions and confirming that new trades contain the required fields. A settlements analyst may monitor instructions, failed deliveries, and market cut-offs. A reconciliation analyst may investigate differences between internal and external records. A corporate-actions analyst may review event terms and elections, while a fund-operations analyst may support holdings, cash, and reporting checks. These activities connect, but they are not interchangeable; the employer workflow determines the boundary.'),
    heading('Progression without assuming a title or salary'),
    paragraph('Progression usually comes from broader product knowledge, more complex exceptions, stronger control ownership, reliable stakeholder communication, and process-improvement contributions. Some organisations use analyst, associate, specialist, or team-lead labels differently. Focus your preparation on evidence you can demonstrate: a clean case note, a reconciled fictional dataset, an explained trade lifecycle, and a reasoned escalation. Do not rely on generic salary or promotion claims when comparing employers.'),
    heading('Questions to ask before accepting a role'),
    list([
      'Which products, markets, time zones, and systems does the team support?',
      'What does a successful first ninety days look like?',
      'Which decisions can an analyst make and which require approval?',
      'How are training, shifts, exceptions, and performance measures handled?',
      'Which part of the trade or client lifecycle will I own or support?',
    ]),
    faq('Should I choose a role by its investment banking title?', 'No. Compare the actual workflow, product, team, schedule, controls, and learning opportunity. The same title can describe different responsibilities across employers.'),
  ],
  'trade-support-analyst': [
    heading('Trade support controls by lifecycle stage'),
    list([
      'Capture: confirm the transaction identifier and required economic fields are present.',
      'Validation: compare instrument, quantity, price, currency, account, parties, and dates against the approved source.',
      'Confirmation: monitor matching or affirmation status and document counterparty differences.',
      'Clearing and settlement: check instructions, cut-offs, status, fails, and responsible owners.',
      'Post-settlement: verify cash or position records and route any resulting breaks to reconciliation.',
      'Reporting: preserve the status, evidence, and escalation trail needed for the next team or review.',
    ]),
    heading('How to write a useful exception update'),
    paragraph('A useful update lets the next person act without reopening the entire investigation. State the trade or case identifier, the expected value, the observed value, the first source that differs, the checks completed, the impact or deadline, the owner, and the next action. Avoid labels such as "system issue" unless the evidence supports that conclusion. A concise update might say: "Trade 123 has a settlement-date difference between the approved confirmation and the internal record; market convention and latest source checked; awaiting confirmation from the responsible desk before the 15:00 cut-off."'),
    heading('A first-ninety-day learning plan'),
    list([
      'Learn the team glossary, product scope, cut-offs, status codes, and escalation matrix.',
      'Shadow one complete transaction from capture through settlement and post-trade checks.',
      'Practise comparing fictional records and writing one evidence-based exception note.',
      'Review closed cases to identify repeat causes and the controls that prevented recurrence.',
      'Ask for feedback on accuracy, clarity, prioritisation, and use of the approved workflow.',
    ], true),
    heading('What distinguishes strong trade support work'),
    paragraph('Strong support is not just fast status chasing. It combines data accuracy, product context, deadline awareness, and disciplined hand-offs. The analyst knows when a difference is expected, when it can affect settlement or a client, when a control has been breached, and when a specialist or manager must decide. That balance is why trade-support preparation should include both transaction vocabulary and practical case reasoning.'),
    faq('What is the most important trade-support skill?', 'Accuracy is foundational, but it must be combined with clear exception writing, prioritisation around cut-offs, and the judgement to escalate when the evidence or authority is insufficient.'),
  ],
  'securities-operations': [
    heading('Key records and hand-offs in securities operations'),
    paragraph('Securities operations connects several records that describe the same economic event from different viewpoints. A trade record may describe the agreed transaction, a confirmation may describe matched terms, an instruction may tell a custodian how to settle, and a custody or accounting record may show the resulting cash or position. The analyst does not assume that one system is always correct; they identify the authoritative source for the field under the team procedure and document the comparison.'),
    list([
      'Security identifiers, account numbers, quantity, price, currency, and settlement date.',
      'Settlement instructions, market or custodian details, and status history.',
      'Cash movements, income events, holdings, and resulting position balances.',
      'Corporate-action terms, elections, entitlements, deadlines, and client instructions where applicable.',
      'Reconciliation outputs, failed items, ageing, evidence, approvals, and final closure.',
    ]),
    heading('Questions to ask about a securities-operations vacancy'),
    list([
      'Which products and markets does the team support, and during which time zones?',
      'Does the role focus on settlements, custody, reconciliations, corporate actions, or a blend?',
      'Which records and systems are considered authoritative for common fields?',
      'What are the most common exceptions and the escalation expectations?',
      'How is training provided for market conventions, instruments, and operational controls?',
    ]),
    heading('A practical skills roadmap'),
    paragraph('Begin with the trade lifecycle and the meaning of common security, cash, account, and status fields. Then practise a settlement exception, a position reconciliation, and a simple corporate-action timeline using fictional data. Finally, learn to explain the control: what should agree, what differed, which evidence was checked, who owns the next action, and how closure will be verified. This roadmap is more useful than memorising a list of systems without understanding the process.'),
    faq('Is securities operations the same as stock trading?', 'No. Securities operations generally supports the processing, settlement, custody, records, and controls around securities transactions. Trading and investment decisions are separate functions, although the teams interact.'),
  ],
  'what-is-investment-banking': [
    heading('What investment banking includes'),
    paragraph('Investment banking is an industry and service area rather than one universal job. Depending on the firm and market, it may include advisory, capital raising, mergers and acquisitions, sales and trading, research, and the operations and control functions that support transactions. A useful career search begins by separating the business activity from the role that performs or supports it.'),
    list([
      'Advisory and corporate-finance work helps clients evaluate transactions or financing decisions.',
      'Capital-markets activities support raising debt or equity and related execution processes.',
      'Markets teams may support trading, sales, research, and client activity across products.',
      'Operations teams help capture, confirm, settle, reconcile, report, and control transactions.',
      'Risk, compliance, technology, finance, and client-service teams provide connected control and support functions.',
    ]),
    heading('Where operations fits in the investment banking workflow'),
    paragraph('After a transaction is agreed or executed, information must move through controlled systems and teams. Operations may validate the record, coordinate confirmation, monitor settlement, investigate a break, process an event, maintain a position or cash record, and support reporting. This work is essential to accurate processing but should not be described as front-office deal advisory unless the actual vacancy says so.'),
    heading('How beginners can separate role labels'),
    list([
      'Read the outputs: a pitch book, model, trade status, settlement queue, reconciliation case, or client record signals different work.',
      'Read the stakeholders: clients and bankers, traders and counterparties, custodians, technology, or control teams imply different hand-offs.',
      'Read the controls: approvals, cut-offs, matching, evidence, and escalation usually point to an operations or control workflow.',
      'Read the required skills: valuation and modelling differ from transaction processing, exception management, and reconciliation.',
    ]),
    heading('A sensible career-research checklist'),
    list([
      'Choose the role family before choosing a course or keyword.',
      'Read at least five current job descriptions and record repeated responsibilities.',
      'Practise one realistic task using fictional data.',
      'Check eligibility, schedule, location, and employer-specific requirements.',
      'Ask training providers to distinguish general education from a credential or employment promise.',
    ], true),
    faq('Can a beginner enter investment banking through operations?', 'Some entry-level operations and support roles accept graduates who can demonstrate process understanding, accuracy, communication, and willingness to learn. Requirements vary by employer, product, and location, so a course cannot guarantee eligibility for every vacancy.'),
  ],
});

const RESOURCE_DEPTH_BLOCKS = Object.freeze({
  'bank-reconciliation-process': [
    heading('A practical bank reconciliation format'),
    paragraph('A useful reconciliation schedule makes the comparison reproducible. Record the account, period, currency, source files, opening balance, closing balance, control total, prepared date, reviewer, and status. For each difference, capture the reference, date, amount, description, classification, evidence checked, owner, expected resolution date, and closure note. The format should help a reviewer understand the conclusion without relying on the preparer\'s memory.'),
    heading('Common differences and the appropriate next question'),
    list([
      'Timing difference: when should the item appear in the other record, and does the next period clear it?',
      'Bank fee or interest: is there statement evidence and an authorised posting process?',
      'Missing transaction: which source or interface should have delivered the record?',
      'Duplicate: which identifier, amount, and status show that one record is repeated?',
      'Amount or date variance: which approved source is authoritative for the field?',
      'Unidentified item: what evidence and escalation are required before any correction?',
    ]),
    heading('Worked mini example'),
    paragraph('Worked example (all figures are fictional): at the same cut-off, the cash book is INR 47,300 and the bank statement is INR 48,950. The statement includes a customer deposit of INR 6,500 that the business recorded before the bank credited it, and an issued payment of INR 8,000 that has not yet cleared. The statement also shows a bank fee of INR 200 and interest credit of INR 350 that are not yet in the cash book.'),
    heading('Reconcile the statement side'),
    list([
      'Bank statement closing balance: INR 48,950.',
      'Add the deposit in transit recorded in the cash book but not yet credited by the bank: INR 6,500.',
      'Subtract the issued payment not yet presented to the bank: INR 8,000.',
      'Adjusted bank balance: INR 48,950 + INR 6,500 - INR 8,000 = INR 47,450.',
    ]),
    heading('Update the cash-book side through the approved process'),
    list([
      'Cash-book closing balance: INR 47,300.',
      'Record the statement-supported bank fee when authorised: subtract INR 200.',
      'Record the statement-supported interest credit when authorised: add INR 350.',
      'Adjusted cash-book balance: INR 47,300 - INR 200 + INR 350 = INR 47,450.',
    ]),
    paragraph('The adjusted balances agree at INR 47,450. The deposit and uncleared payment remain timing items to follow up; the fee and interest are book-side entries that need the entity\'s normal evidence, posting, and review controls. If a reference, cut-off, amount, or status cannot be verified, leave the item open, document what is known, and route it to the authorised owner instead of forcing the totals to agree.'),
    heading('What to include in the reconciliation note'),
    list([
      'Account and statement period, the cash-book cut-off, source versions, currency, and opening and closing balances.',
      'Each difference, its amount, explanation, source evidence, owner, ageing, and expected next check.',
      'Which items are timing differences and which require an authorised accounting entry or escalation.',
      'The adjusted-balance calculation and reviewer or approval evidence required by the organisation.',
    ]),
    heading('Reconciliation control checklist'),
    list([
      'Use the correct account, period, currency, and source version.',
      'Confirm the opening balance and explain movement to the closing balance.',
      'Separate expected timing items from unexplained exceptions.',
      'Assign ownership and ageing to every open item.',
      'Retain evidence and approvals for any authorised adjustment.',
      'Review the final schedule and confirm the next-period treatment.',
    ], true),
    faq('How often should a bank reconciliation be prepared?', 'The frequency depends on the account, volume, risk, policy, and reporting deadlines. Some accounts are reconciled daily, while others may use a different approved schedule. Follow the organisation\'s control policy rather than assuming one universal frequency.'),
  ],
  'cost-accounting-finance-operations': [
    heading('Cost concepts that matter in finance operations'),
    paragraph('Cost accounting gives a structured way to understand what resources a product, service, process, branch, project, or customer activity consumes. In finance operations, the useful question is often not only "what was spent?" but also "which activity caused it, which period does it belong to, and how should it be reported or controlled?" The answer depends on the organisation\'s accounting policy and management purpose.'),
    list([
      'Direct costs can be traced to a defined product, service, project, or activity.',
      'Indirect costs support multiple activities and require a documented allocation basis.',
      'Fixed and variable behaviour describes how a cost changes with activity, not whether it is important.',
      'Product or service cost supports pricing, profitability, budgeting, and operational review.',
      'Standard and actual cost comparisons help investigate variances, but the chosen standard must be understood.',
    ]),
    heading('Simple allocation example'),
    paragraph('Imagine a fictional service team supports two products and incurs shared software cost of INR 10,000. If management has approved active-user count as the allocation basis, Product A with 60 users receives INR 6,000 and Product B with 40 users receives INR 4,000. A different business purpose might require transactions, processing time, or revenue as the basis. The calculation is simple; the important control is documenting why the basis was selected and applying it consistently.'),
    heading('How operations teams use cost information'),
    list([
      'Investigate why a process or product is above or below its expected cost.',
      'Compare activity volumes with staffing, vendor, technology, or service costs.',
      'Support budgets, forecasts, and management reporting with traceable assumptions.',
      'Identify process steps that create rework, delays, or avoidable exceptions.',
      'Separate an educational allocation exercise from statutory reporting or tax advice.',
    ]),
    heading('A study checklist for beginners'),
    list([
      'Define the cost object and the decision the analysis is meant to support.',
      'Classify direct, indirect, fixed, variable, and period-related items carefully.',
      'Write the allocation basis and test whether it reflects the activity.',
      'Reconcile the allocated total to the source cost pool.',
      'Explain the limitation and avoid presenting the result as a universal rule.',
    ], true),
    faq('Is cost accounting the same as financial accounting?', 'No. Financial accounting focuses on records and reporting for the applicable reporting framework. Cost accounting supports internal analysis of resources, activities, products, and decisions. The two can use related records but serve different purposes.'),
  ],
  'financial-accounting-banking': [
    heading('How to read a banking-operations record'),
    paragraph('A banking-operations record usually becomes meaningful when the business event, account or sub-ledger, amount, currency, date, status, and evidence are considered together. A payment status is not automatically a completed accounting entry; a ledger balance is not automatically proof that a customer-facing process is complete. Learners should connect the operational event to the authorised accounting and reconciliation workflow without assuming that one field answers every question.'),
    list([
      'Identify the event: payment, fee, lending movement, settlement, interest, adjustment, or reporting entry.',
      'Check the source reference, value date, posting date, currency, and account or sub-ledger.',
      'Understand which record is operational, which is accounting, and which is external evidence.',
      'Reconcile related records and investigate any difference before explaining the balance.',
      'Follow approval, segregation-of-duties, access, and correction controls.',
    ]),
    heading('A fictional month-end checklist'),
    list([
      'Confirm the reporting period and cut-off instructions.',
      'Review open reconciliations, suspense items, fees, and late records.',
      'Compare general-ledger and sub-ledger or operational totals where applicable.',
      'Check unusual movements, missing evidence, and approvals for adjustments.',
      'Document unresolved limitations and the owner for the next action.',
      'Retain the review trail for the authorised reviewer or audit process.',
    ], true),
    heading('How to avoid common category errors'),
    paragraph('Beginners often treat every difference as an error, every statement line as a journal entry, or every operational status as a final financial result. A better approach is to ask what the record represents, who owns it, when it should appear, and what evidence supports the treatment. This habit helps learners communicate clearly while recognising that actual treatment depends on the entity, product, policy, standards, and authorised review.'),
    heading('A useful learning workflow'),
    paragraph('Start with a fictional event, map the expected records, identify the control totals, compare the records, classify any difference, and write a short explanation. Then review the example against authoritative accounting guidance or the organisation\'s policy. This method develops accounting logic and operations judgement together without turning an educational page into professional advice.'),
    faq('Do banking operations employees post accounting entries?', 'Some roles may prepare, review, or process entries under an approved workflow, while others investigate records or support reconciliation. The authority and segregation of duties vary by employer and process.'),
  ],
  'financial-statement-analysis': [
    heading('A repeatable financial-statement analysis workflow'),
    list([
      'Define the question: performance, liquidity, leverage, cash generation, credit risk, or another approved purpose.',
      'Confirm the period, entity, reporting basis, audit status, and completeness of the statements.',
      'Read the statements together with notes, accounting policies, commitments, and unusual items.',
      'Compare trends and ratios with a relevant prior period, peer, or sector context.',
      'Investigate the operational reason for a movement instead of treating the ratio as the conclusion.',
      'State limitations, assumptions, and the next evidence needed for a decision.',
    ], true),
    heading('Ratio interpretation example'),
    paragraph('Suppose a fictional company reports higher revenue, a lower operating margin, slower receivables collection, and increased borrowing. The combined picture raises questions about pricing, input costs, working capital, and debt service rather than proving that the business is healthy or unhealthy. An analyst would examine cash flow, customer concentration, maturity dates, accounting policies, one-off events, and sector conditions before reaching a supported conclusion.'),
    heading('Questions a junior analyst should ask'),
    list([
      'Is the comparison period genuinely comparable?',
      'Did an accounting policy, acquisition, disposal, or one-off event change the result?',
      'Does profit convert into cash, and what explains the difference?',
      'Are debt, interest, lease, or other obligations visible in the information reviewed?',
      'Which assumptions or missing notes could change the interpretation?',
      'Am I describing evidence or making a recommendation outside my authority?',
    ]),
    heading('How this skill connects to finance roles'),
    paragraph('Financial-statement analysis can support credit operations, lending administration, finance operations, reporting, risk, and investment-analysis work, but the depth expected differs by role. An entry-level operations role may require accurate extraction, comparison, documentation, and escalation. A credit or investment role may require deeper sector analysis, modelling, judgement, and formal review. Read the job description and qualification requirements rather than assuming one course covers every level.'),
    heading('Connect ratios to cash flow and operating evidence'),
    paragraph('A ratio should lead to a better question, not a shortcut conclusion. If receivable days increase, examine customer concentration, ageing, disputes, credit terms, seasonality, and subsequent collections. If leverage rises, review the debt purpose, maturity, rate, covenants, cash generation, and current obligations. If margin falls, separate price, volume, mix, input cost, one-off items, and accounting changes. This source-to-question approach is especially useful in banking and credit operations because it keeps the analysis tied to evidence and the approved decision process.'),
    heading('A reviewer-friendly analysis note'),
    list([
      'State the entity, period, source, reporting basis, audit status, and purpose of the review.',
      'Show the measure, calculation, prior-period or peer comparison, and any change in definition.',
      'Describe the operational or business evidence that may explain the movement.',
      'Record missing notes, one-off events, policy differences, data limitations, and assumptions.',
      'Separate observations from recommendations and identify the authorised owner of the next decision.',
      'Retain enough evidence for another reviewer to reproduce the calculation and challenge the conclusion.',
    ]),
    link('Understand risk management in banking operations', '/blog/risk-management-in-banking/'),
    faq('Which ratio should a beginner learn first?', 'Start with a small group of liquidity, profitability, leverage, efficiency, and coverage measures, then learn what each ratio cannot tell you. Understanding context and limitations is more useful than memorising a long list.'),
    faq('Can one ratio approve or reject a loan?', 'No. A ratio can support an approved assessment process, but a credit decision depends on the institution\'s policy, authority, evidence, product, borrower facts, risk analysis, and current requirements.'),
  ],
});

const LANDING_DEPTH_BLOCKS = Object.freeze({
  'banking-courses': [
    heading('Choose the banking-course intent before choosing the provider'),
    paragraph('The phrase banking course can attract people with very different goals. One learner may want branch or retail banking, another may want investment banking operations, and another may be searching for government-exam coaching, a degree, or a short job-oriented program. A strong comparison starts by naming the desired role and the evidence of learning required for it. This prevents a broad keyword from creating the wrong expectation.'),
    list([
      'For retail or branch work, look for customer, account, lending, service, and branch-process context.',
      'For investment banking operations, look for trade lifecycle, settlements, reconciliations, corporate actions, and controls.',
      'For finance operations, look for accounting, lending, credit, reporting, risk, and exception workflows.',
      'For compliance, look for due diligence, screening, monitoring, case documentation, and escalation.',
      'For payments or FinTech, look for payment flows, disputes, reconciliation, product operations, and service controls.',
    ]),
    heading('What a useful banking course page should make clear'),
    list([
      'The exact program or credential, duration, eligibility, and assessment approach.',
      'Whether the curriculum is a single integrated program or separate modules.',
      'The learning mode, schedule, access requirements, fees, taxes, and refund terms.',
      'The practical work a learner will complete and how feedback is provided.',
      'What career support means and which claims are subject to written conditions.',
      'Who teaches or reviews the material and when the page was last confirmed.',
    ], true),
    heading('A role-to-topic map for career starters'),
    paragraph('A learner interested in reconciliation should practise matching and break investigation. Someone considering trade support should learn transaction fields, confirmation, settlement, and exception writing. A retail-banking learner may focus on customer and lending workflows, while a compliance learner may focus on evidence, screening, monitoring, and escalation. These overlaps explain why a broad masterclass can be useful, but they also make it important to compare the syllabus with the actual vacancy.'),
    heading('How to turn research into a better enquiry'),
    paragraph('Before contacting a provider, write the target role, your background, preferred mode, available time, budget, and the questions that would change your decision. Ask for the current cohort schedule, complete curriculum, certificate wording, support scope, eligibility, and refund terms in writing. This creates a higher-quality lead for the provider and a clearer decision for the learner.'),
    link('Use the finance-program FAQ before you enquire', '/faqs/finance-program/', 'faqs-finance-program'),
  ],
  'banking-and-finance': [
    heading('How banking and finance learning connects to work'),
    paragraph('Banking and finance concepts become more useful when a learner can follow a business event through records, controls, customer or counterparty service, and reporting. For example, a lending workflow may involve application data, verification, approval, disbursement, repayment, interest, outstanding balance, and exception handling. A payments workflow may involve an instruction, status, settlement, reconciliation, dispute, and customer communication. The right course makes those hand-offs visible.'),
    list([
      'Learn the vocabulary of the product or workflow before memorising isolated definitions.',
      'Use fictional cases to trace inputs, checks, decisions, outputs, and exceptions.',
      'Practise explaining what evidence supports a conclusion and who owns the next action.',
      'Connect accounting, credit, compliance, payments, retail, and operations topics without treating them as identical jobs.',
      'Review current vacancy requirements to decide how much depth is needed in each area.',
    ]),
    heading('What to practise during a six-week learning path'),
    list([
      'A transaction or service workflow with a clear beginning, control point, and outcome.',
      'A reconciliation or exception case with evidence, ageing, ownership, and escalation.',
      'A simple accounting or financial-statement exercise with stated assumptions.',
      'A customer, credit, compliance, or payment scenario that requires careful documentation.',
      'A short interview explanation that links the task to risk, accuracy, and service quality.',
    ], true),
    heading('Who should compare alternative learning paths?'),
    paragraph('A degree, professional designation, short course, employer training, and job-oriented masterclass serve different purposes. Compare recognition, entry requirements, study time, assessment, cost, practical work, and the roles each path is designed to support. The Financial Operations Masterclass is presented as one six-week program; it should not be interpreted as a university degree, CA qualification, CFA preparation route, or external accreditation without explicit evidence.'),
    heading('Before you apply'),
    paragraph('Confirm the current curriculum, delivery mode, cohort dates, fees, certificate wording, support, eligibility, and refund terms. If your decision depends on a job guarantee or placement condition, read the published terms and ask how they apply to your cohort. A clear answer is more valuable than a broad promise that cannot be checked.'),
    link('Compare finance operations with modelling and CFA study', '/compare/finance-operations-vs-financial-modelling-cfa/', 'comparison-finance-operations-vs-financial-modelling-cfa'),
  ],
  'finance-operations-training': [
    heading('The operating model behind finance-operations topics'),
    paragraph('Finance operations sits between business activity, records, controls, and service outcomes. The work may start with an application, payment, loan, trade, statement, or reporting request and end with an approved record, reconciled balance, completed service, or escalated exception. Training is strongest when it shows the hand-offs between teams instead of presenting accounting, credit, risk, and reporting as unrelated vocabulary.'),
    list([
      'Input: capture the right customer, transaction, account, document, or source data.',
      'Process: apply the approved workflow, checks, matching rules, and service levels.',
      'Control: retain evidence, approvals, access history, and a clear exception trail.',
      'Output: produce an accurate status, record, report, reconciliation, or customer action.',
      'Improvement: identify repeat causes and improve the process without bypassing authority.',
    ]),
    heading('A practical learning sequence'),
    list([
      'Start with accounting and financial-services vocabulary.',
      'Map one workflow from source event to final record or customer outcome.',
      'Practise a reconciliation or exception case using fictional data.',
      'Add credit, risk, compliance, payments, or lending context relevant to the target role.',
      'Write an interview-ready explanation of the control and the next action.',
      'Compare the work with current vacancies and identify the next skill to build.',
    ], true),
    heading('Evidence that a learner understands the work'),
    paragraph('A learner should be able to define the purpose of a process, identify its key fields, explain what can go wrong, classify an exception, state what evidence is needed, and describe when to escalate. A certificate or attendance record may document participation, but it does not replace the ability to perform or explain the task. Ask the current provider which projects, assessments, feedback, and support are included.'),
    heading('Where this learning can lead'),
    paragraph('Depending on employer requirements, finance-operations foundations can support exploration of reconciliation, settlements, trade support, loan operations, credit administration, reporting, payments, client operations, and control roles. It does not guarantee a title, employer, salary, city, or outcome outside the current written terms. Use the career guides and vacancy requirements to narrow the direction.'),
    link('Read the reconciliation analyst career guide', '/career-guides/reconciliation-analyst/', 'career-guide-reconciliation-analyst'),
    link('Review financial accounting for banking operations', '/resources/financial-accounting-banking/', 'resource-financial-accounting-banking'),
  ],
});

const COMPARISON_DEPTH_BLOCKS = Object.freeze({
  'finance-operations-vs-financial-modelling-cfa': [
    heading('Start with the role outcome, not the keyword'),
    paragraph('The three labels in this comparison answer different questions. Finance operations asks how controlled financial-service workflows are processed and recorded. Financial modelling asks how structured calculations, assumptions, forecasts, or valuation outputs are built. The CFA Program is a professional investment-analysis credential with its own curriculum, examination route, eligibility, and policies. A learner may value more than one direction, but the study decision should begin with the role and credential requirement that matters most.'),
    heading('Which path may fit which work?'),
    list([
      'Choose operations-focused learning when the target work involves processing, settlements, reconciliations, servicing, lending workflows, controls, or exceptions.',
      'Explore modelling when the target work explicitly requires linked spreadsheets, forecasting, scenario analysis, valuation, or management decision support.',
      'Explore the CFA Program when the goal and eligibility fit a formal investment-analysis examination pathway and its current official requirements.',
      'Combine paths only when the additional study serves a defined role or learning gap; more labels do not automatically create job readiness.',
    ]),
    heading('Questions that prevent a poor comparison'),
    list([
      'What exact output will I be expected to produce in the target role?',
      'Is the employer asking for a degree, professional qualification, modelling evidence, or operations experience?',
      'How much time and assessment can I realistically commit?',
      'Which parts of the curriculum are taught, practised, reviewed, and evidenced?',
      'Are provider claims, external credential requirements, and job outcomes clearly separated?',
    ], true),
    link('Study financial statement analysis before choosing a route', '/resources/financial-statement-analysis/', 'resource-financial-statement-analysis'),
  ],
  'online-vs-offline-finance-training': [
    heading('Compare the learning experience, not only the delivery label'),
    paragraph('Online and offline finance training can both be effective when the learning design matches the learner\'s circumstances. The useful comparison is whether the format provides live interaction, practical work, feedback, reliable access to materials, a workable schedule, and support for the target role. A classroom address alone does not prove stronger teaching, and an online label alone does not prove flexibility or quality.'),
    heading('A decision matrix for learners'),
    list([
      'Choose online when location, travel, work schedule, or access across India is the main constraint and the learner can participate reliably.',
      'Choose offline when in-person routine, local access, and face-to-face interaction are important and the published classroom schedule is workable.',
      'Ask both modes about attendance, recordings, practical tasks, feedback, assessments, devices, support channels, and missed sessions.',
      'Calculate total cost: fees, taxes, travel, accommodation, connectivity, devices, and time away from work or study.',
      'Read the current placement or guarantee terms for the exact mode and cohort rather than assuming they are identical.',
    ]),
    heading('A simple enquiry checklist'),
    list([
      'What are the next cohort dates and daily or weekly schedule?',
      'Which sessions are live and what happens if a learner misses one?',
      'What practical cases, projects, assessments, and feedback are included?',
      'What is the complete cost and what refund or cancellation terms apply?',
      'Which support is included before, during, and after the program?',
      'Where is the in-person option currently available?',
    ], true),
    link('Review the current finance-program FAQs', '/faqs/finance-program/', 'faqs-finance-program'),
  ],
});

const FAQ_DEPTH_BLOCKS = Object.freeze({
  'finance-program': [
    heading('How to use these finance-course FAQs'),
    paragraph('Use the answers to identify the questions that affect your decision, then request the current written terms for your cohort. Program details such as dates, fees, learning mode, certificate wording, support, and refund conditions can change. The purpose of this page is to make the public positioning easier to understand; it is not a substitute for the current enrolment terms or a promise beyond them.'),
    heading('A decision checklist before you enrol'),
    list([
      'Confirm the target role and why the program topics are relevant to it.',
      'Read the complete curriculum and identify the practical work or assessments included.',
      'Compare online and in-person access, schedule, total cost, and attendance expectations.',
      'Ask for the current certificate wording and issuing entity.',
      'Read the placement or 100% Job Guarantee Program terms that apply to your cohort.',
      'Keep written answers for any condition that materially affects your decision.',
    ], true),
    heading('What this page does not promise'),
    paragraph('A finance course FAQ cannot guarantee a particular employer, title, salary, city, joining date, professional designation, or individual result unless that claim is expressly supported by current written terms. A provider course-completion certificate is not automatically a university degree, CFA charter, CA qualification, or external regulatory credential. Use official awarding-body information for external qualifications and the provider\'s current terms for program-specific conditions.'),
    link('Compare online and offline finance training', '/compare/online-vs-offline-finance-training/', 'comparison-online-vs-offline-finance-training'),
    link('Review the complete Financial Operations Masterclass', '/courses/', 'courses'),
  ],
});

const GUIDE_COMPLETION_BLOCKS = Object.freeze({
  'reconciliation-analyst': [
    heading('A small portfolio exercise'),
    paragraph('Create two fictional transaction files with a common reference, date, currency, amount, account, and status. Add one timing item, one duplicate, one missing row, and one amount variance. Define the matching rule, produce an exception queue, assign ageing and ownership, and write a closure note for one item. The exercise should show how you think about scope, evidence, classification, and escalation. It should not imitate an employer system or contain any real customer or employer data.'),
    heading('What to ask when comparing vacancies'),
    list(['Which records and products will I reconcile?', 'What are the cut-offs, review controls, and escalation levels?', 'Which spreadsheet, workflow, or reporting tools are expected?', 'How is quality measured: accuracy, ageing, turnaround, rework, or another definition?', 'What training and feedback are available in the first few months?']),
  ],
  'investment-banking-operations-roles': [
    heading('A role-family matrix for career starters'),
    list(['Trade support suits learners who like transaction details, status monitoring, and stakeholder coordination.', 'Settlements suits learners who prefer deadlines, instructions, delivery, payment, and fail management.', 'Reconciliation suits learners who enjoy comparison, root-cause analysis, evidence, and ageing control.', 'Corporate actions suits learners who can follow event terms, entitlements, elections, and deadlines carefully.', 'Fund operations suits learners interested in holdings, cash, NAV inputs, reporting, and control checks.']),
    heading('A weekly practice routine'),
    paragraph('Use one day to learn the vocabulary of a product, one day to map the lifecycle, one day to work through fictional records, one day to write an exception update, and one day to review the control and escalation logic. Repeat the routine with a different workflow. This creates a more useful portfolio of reasoning than collecting isolated definitions, while keeping the examples clearly educational and fictional.'),
    heading('Warning signs when reviewing a vacancy'),
    paragraph('Be cautious when a title is broad but the duties are unclear, the expected schedule is missing, the product or team is not identified, or the role appears to combine unrelated responsibilities without explaining training. Ask for the actual outputs, reporting line, location, shift expectations, selection stages, and eligibility. A careful comparison protects both the candidate and the employer from a poor fit.'),
  ],
  'trade-support-analyst': [
    heading('Tools, records, and evidence'),
    paragraph('The exact platform changes by employer, but the control logic remains transferable. A trade-support analyst may work with an order or trade record, confirmations, status queues, settlement instructions, messages, exception reports, spreadsheets, and workflow tickets. Learn what each record represents and which source is authoritative for each field. Tool familiarity is useful, but it should not replace understanding the transaction, the hand-off, the cut-off, and the approved escalation route.'),
    heading('How to show readiness without claiming experience'),
    list(['Describe a fictional trade and its lifecycle in the correct order.', 'Show a small comparison table with one identified mismatch.', 'Write a clear exception note that names evidence and next action.', 'Explain why a correction needs authority or review.', 'State what you would verify when a product or market convention is unfamiliar.']),
    heading('A realistic preparation boundary'),
    paragraph('A learner can practise process reasoning before learning every instrument or system. Do not claim to have executed trades, approved settlements, or handled confidential records if you have not. Explain the method you would use, the questions you would ask, and the controls you would follow. Employers can then assess learning ability and accuracy rather than an exaggerated description of experience.'),
  ],
  'securities-operations': [
    heading('A securities-operations risk scenario'),
    paragraph('Imagine an internal position record shows 1,000 shares while the custody record shows 900 after a corporate action. The analyst should confirm the security identifier, event terms, record date, entitlement, election, settlement or posting status, and the relevant source documents. The analyst records the break and its potential impact, asks the responsible team to investigate, and verifies the corrected or explained position through the approved process. The scenario tests controlled investigation rather than a guess about which balance is right.'),
    heading('Entry preparation plan'),
    list(['Learn common security, account, cash, position, and settlement fields.', 'Map trade capture, confirmation, settlement, custody, and reconciliation.', 'Practise a cash break and a position break with fictional records.', 'Read a corporate-action timeline and identify deadlines and entitlements.', 'Prepare a short explanation of evidence, ownership, escalation, and closure.'], true),
    heading('How to keep the career path distinct'),
    paragraph('Securities operations can be a useful entry into financial-markets processing, but it is not the same as portfolio management, stock-picking, or investment advice. The role may build market and control knowledge while remaining focused on accurate processing and service. Compare the employer\'s responsibilities and required qualifications before describing the role to a candidate or learner.'),
  ],
  'what-is-investment-banking': [
    heading('Front office, middle office, and operations are connected but different'),
    paragraph('The labels are not perfectly standard across firms, yet they help organise a career search. Front-office teams may originate, advise, sell, trade, or analyse. Middle-office teams may support controls, risk, trade support, or process oversight. Back-office or operations teams may support confirmation, settlement, reconciliation, records, and servicing. Technology, finance, compliance, and risk functions can cut across these groups. Always use the actual responsibilities and reporting line as the source of truth.'),
    heading('Evidence to collect while researching a career'),
    list(['Save repeated responsibilities from several current job descriptions.', 'Mark the systems, products, time zones, and qualifications that recur.', 'Separate must-have requirements from preferred experience.', 'Create one fictional case that demonstrates the most common task.', 'Ask a training provider which topics are included and which are outside scope.']),
    heading('A realistic beginner conclusion'),
    paragraph('There is no single investment banking course or job title that suits every beginner. Someone may prefer operational accuracy and controlled workflows, while another learner may want valuation, research, sales, trading, or advisory analysis. Choosing a direction becomes easier when the learner compares the daily output, required preparation, time commitment, and evidence of competence instead of relying on the industry label alone.'),
  ],
});

const RESOURCE_COMPLETION_BLOCKS = Object.freeze({
  'bank-reconciliation-process': [
    heading('How to review a completed reconciliation'),
    paragraph('A reviewer can test whether the schedule is complete, whether the control total is supported, whether every open item has an owner and ageing, and whether the conclusion follows from the evidence. They can also check that adjustments are authorised, that timing items are expected to clear, and that the next-period or next-run treatment is documented. This review mindset helps a learner understand why a reconciliation is a control rather than only a spreadsheet exercise.'),
    heading('Questions for an operations interview'),
    list(['What records would you compare for a bank reconciliation?', 'How would you distinguish a timing difference from a missing entry?', 'What would you include in an escalation note?', 'When would you ask for approval before posting or correcting?', 'How would you verify that the break is actually closed?']),
  ],
  'cost-accounting-finance-operations': [
    heading('Variance analysis without overclaiming'),
    paragraph('A variance is a prompt for investigation, not automatically a failure. Compare the actual result with the approved budget, standard, forecast, or prior period, then ask whether volume, price, mix, timing, scope, allocation, or a one-off event explains the movement. State the basis used and the limitations of the data. In a learning exercise, the purpose is to explain a transparent method, not to produce a management decision for a real organisation.'),
    heading('Useful outputs from a beginner exercise'),
    list(['A defined cost object and activity period.', 'A reconciled source cost pool.', 'A documented allocation or variance method.', 'A small table showing actual, expected, and difference.', 'A short explanation of the driver, evidence, and limitation.']),
    heading('Connection with finance-operations roles'),
    paragraph('Cost awareness can support budgeting, vendor management, product operations, reporting, and process improvement. It does not by itself qualify someone for a statutory accounting, audit, tax, or management-accounting role. Match the learning depth to the target vacancy and use professional guidance for formal reporting decisions.'),
  ],
  'financial-accounting-banking': [
    heading('A record-to-report example'),
    paragraph('Consider a fictional service fee charged to a customer account. The operations team may first capture the event and status, a ledger or sub-ledger may record the amount, a bank or payment record may show the movement, and a reconciliation may test whether the related records agree. The correct treatment depends on the entity policy, product, period, tax, and applicable standards. The learning objective is to trace the event and its controls, not to prescribe a journal entry for every bank.'),
    heading('Evidence and review questions'),
    list(['What business event created the record?', 'Which source is authoritative for the amount, date, and status?', 'Is the item in the correct period and currency?', 'Which ledger, sub-ledger, statement, or operational record should agree?', 'Who reviews an exception or authorised adjustment?', 'What evidence will remain after closure?']),
    heading('Skills to carry into interviews'),
    paragraph('Explain the difference between an operational record, an accounting record, and external evidence. Then describe how you would compare them, document a difference, and escalate outside your authority. This answer demonstrates accounting foundations and process discipline without presenting a general article as a substitute for standards, policy, or professional review.'),
  ],
  'financial-statement-analysis': [
    heading('Build an analysis note that another person can review'),
    paragraph('A useful analysis note states the question, source period, measures reviewed, trend or ratio result, context, limitation, and next question. For example, instead of writing "liquidity is weak," describe the period, the measure used, the movement, the cash or working-capital evidence checked, and what information is still missing. This makes the work easier to challenge and prevents a ratio from being presented as a universal threshold.'),
    heading('Common beginner errors'),
    list(['Comparing entities with different accounting policies or business models.', 'Ignoring notes, cash flow, maturity, or one-off events.', 'Treating a peer average as a rule.', 'Using incomplete or unaudited information without a limitation.', 'Turning an educational observation into an investment or credit recommendation.']),
    heading('Next step for role preparation'),
    paragraph('Choose a fictional company, prepare a one-page trend and ratio note, and explain three questions that require more evidence. Then compare that exercise with a current vacancy. Credit operations may emphasise documentation and policy checks, while modelling or investment roles may require deeper assumptions, forecasts, valuation, and formal review.'),
  ],
});

const LANDING_COMPLETION_BLOCKS = Object.freeze({
  'banking-courses': [
    heading('A high-quality banking-course comparison template'),
    paragraph('Create a one-page comparison with the target role, learning outcomes, practical exercises, duration, delivery mode, support, assessment, credential wording, total cost, and current terms. Then mark each item as verified, unclear, or not included. This approach helps a learner distinguish a course that explains banking from one that provides practice for a defined workflow. It also helps the provider understand which information a prospective student needs before making contact.'),
    heading('Good internal-link journeys'),
    paragraph('A learner who begins with the broad banking-courses page should be able to move to a role guide, a practical resource, the complete program page, the FAQ, and current placement terms. That journey is intentional: understand the work first, test fit, then enquire with specific questions. It avoids presenting every broad banking keyword as a separate promise.'),
    link('Compare banking and finance learning topics', '/courses/banking-and-finance/', 'courses-banking-and-finance'),
    link('Explore the course selection checklist', '/career-guides/choosing-finance-career-course/', 'career-guide-choosing-finance-career-course'),
  ],
  'banking-and-finance': [
    heading('How to assess practical value'),
    paragraph('Ask whether a lesson produces something you can explain or review: a mapped workflow, a control checklist, a reconciliation, a credit-analysis note, a documented case, or an interview response. Practical value does not require access to confidential systems. Carefully designed fictional scenarios can teach the sequence of events, evidence, ownership, and escalation while keeping personal and employer data protected.'),
    heading('Questions for a provider conversation'),
    list(['Which modules are taught inside the current program?', 'How are learners assessed and how is feedback delivered?', 'What does a completed project look like?', 'Which learning mode, schedule, and support apply to my cohort?', 'What certificate and placement terms will I receive in writing?']),
    heading('Keep the page useful after the lead'),
    paragraph('A strong commercial page should not stop at an enquiry button. It should help a learner self-qualify, understand the role direction, prepare the right questions, and choose a suitable next page. Clear expectations improve lead quality and reduce confusion between a short professional program, a degree, a qualification, and employer training.'),
  ],
  'finance-operations-training': [
    heading('A finance-operations practice brief'),
    paragraph('Choose a fictional process such as a payment, loan application, or reconciliation. Define the inputs, the required fields, the controls, the possible exceptions, the owner for each hand-off, the output, and the evidence retained. Then write a short status update for a case that cannot be completed on time. This single exercise connects accounting, process, risk, communication, and operational judgement in a way that a list of keywords cannot.'),
    heading('What to compare before choosing training'),
    list(['Role alignment: which vacancy or career direction does the syllabus support?', 'Practice: are there cases, projects, exercises, and feedback?', 'Depth: does the program explain concepts as well as workflow decisions?', 'Support: what interview, resume, or opportunity support is currently included?', 'Terms: what are the current fees, mode, certificate, refund, and guarantee conditions?']),
    heading('A realistic outcome statement'),
    paragraph('Training can help a learner understand finance-operations work and prepare to discuss it. Hiring still depends on the employer, vacancy, eligibility, assessment, location, schedule, and the applicable written program terms. This distinction keeps the page credible while still giving a motivated learner a clear route from research to preparation and enquiry.'),
  ],
});

const COMPARISON_COMPLETION_BLOCKS = Object.freeze({
  'finance-operations-vs-financial-modelling-cfa': [
    heading('A side-by-side study decision'),
    paragraph('Write the target job title, expected output, entry requirement, study time, assessment, and proof of skill for each option. If the target job asks for daily controls and reconciliations, a modelling-heavy curriculum may not answer the main need. If it asks for forecasts or valuation, operations-only study may leave a gap. If it requires the CFA Program or another recognised qualification, a provider certificate should not be presented as equivalent. The best choice is the one that closes the most relevant gap.'),
    heading('Use official sources for external credentials'),
    paragraph('External qualification rules, exam structures, eligibility, and curriculum can change. Verify them on the awarding organisation\'s official site. Use Centaur Careers\' current program pages for provider-specific curriculum, delivery, fees, and support terms. Keeping those sources separate prevents accidental credential or affiliation claims.'),
  ],
  'online-vs-offline-finance-training': [
    heading('A total-cost and access example'),
    paragraph('An online option may reduce travel and accommodation while requiring reliable connectivity, a suitable device, and a quiet study environment. An offline option may provide a local routine and face-to-face access but add travel, housing, and fixed attendance costs. Neither calculation is complete until missed-session rules, materials, assessments, support, and the learner\'s available time are included. Ask for the current written terms rather than relying on an old fee or schedule.'),
    heading('Make the decision personal and measurable'),
    list(['Rate your access, interaction, practice, feedback, schedule, cost, and support needs.', 'Identify the one constraint that could stop completion.', 'Ask the provider how that constraint is handled in the current cohort.', 'Choose the mode that you can attend consistently and use productively.', 'Recheck the published terms before payment if the cohort details change.']),
  ],
});

const FAQ_COMPLETION_BLOCKS = Object.freeze({
  'finance-program': [
    heading('Questions to keep in writing'),
    paragraph('When a decision depends on a condition, ask the provider to confirm the exact wording, scope, date, and cohort that it applies to. Keep the response with the enrolment information. This is especially important for fees, discounts, refunds, attendance, certificate completion, learning mode, career support, and the 100% Job Guarantee Program. Clear documentation protects the learner and keeps future page updates accurate.'),
    heading('How this FAQ supports the rest of the site'),
    paragraph('Use the course page for the complete program overview, the comparison pages for learning decisions, the career guides for role research, and the resources for practical concepts. Internal links are arranged so a visitor can move from a broad question to a specific explanation and then to a relevant enquiry. That structure supports both user experience and search-engine discovery without creating duplicate pages for every keyword variation.'),
    heading('Before submitting an enquiry'),
    list(['Write the role or learning goal you are exploring.', 'Mention your education, experience, preferred mode, and availability.', 'Ask the two or three current-term questions that affect your decision.', 'Request written confirmation for any important condition.', 'Use the published terms as the final reference before payment.']),
  ],
});

function imageDimensions(image) {
  if (!image) return {};
  if (image.includes('/images/courses/')) return { imageWidth: 1536, imageHeight: 1024 };
  if (image.includes('placement-support-career-counselling-india')) return { imageWidth: 1673, imageHeight: 940 };
  return { imageWidth: 1672, imageHeight: 941 };
}

function guide(data) {
  const body = [
    ...data.body,
    ...(GUIDE_DEPTH_BLOCKS[data.id] || []),
    ...(GUIDE_COMPLETION_BLOCKS[data.id] || []),
  ];
  return Object.freeze({
    ...data,
    keywordOwnerUrl: data.keywordOwnerUrl ?? null,
    ...imageDimensions(data.image),
    author: AUTHOR,
    publishedAt: NEW_ROLE_GUIDE_IDS.has(data.id) ? NEW_ROLE_GUIDE_DATE : PUBLISHED_AT,
    updatedAt: JOB_INTENT_GUIDE_IDS.includes(data.id)
      ? JOB_INTENT_REVIEW_DATE
      : (NEW_ROLE_GUIDE_IDS.has(data.id) ? NEW_ROLE_GUIDE_DATE : (data.updatedAt || (NEXT_CAREER_DEPTH_BLOCKS[data.id] ? '2026-09-28' : PUBLISHED_AT))),
    secondaryKeywords: Object.freeze(data.secondaryKeywords),
    body: Object.freeze([
      ...appendBeforeCommonQuestions(body, NEXT_CAREER_DEPTH_BLOCKS[data.id]),
      ...getJobIntentDepthBlocks(data.id),
    ]),
    relatedGuideIds: Object.freeze(data.relatedGuideIds || []),
    relatedRouteIds: Object.freeze(data.relatedRouteIds || []),
    seo: Object.freeze({ title: data.title, description: data.description }),
  });
}

function resource(data) {
  const body = [
    ...data.body,
    ...(RESOURCE_DEPTH_BLOCKS[data.id] || []),
    ...(RESOURCE_COMPLETION_BLOCKS[data.id] || []),
  ];
  return Object.freeze({
    ...data,
    keywordOwnerUrl: data.keywordOwnerUrl ?? null,
    ...imageDimensions(data.image),
    author: AUTHOR,
    publishedAt: PUBLISHED_AT,
    updatedAt: data.updatedAt || (NEXT_RESOURCE_DEPTH_BLOCKS[data.id] ? '2026-09-28' : PUBLISHED_AT),
    secondaryKeywords: Object.freeze(data.secondaryKeywords),
    body: Object.freeze(appendBeforeCommonQuestions(body, NEXT_RESOURCE_DEPTH_BLOCKS[data.id])),
    relatedRouteIds: Object.freeze(data.relatedRouteIds || []),
    seo: Object.freeze({ title: data.title, description: data.description }),
  });
}

function landing(data) {
  const body = [
    ...data.body,
    ...(LANDING_DEPTH_BLOCKS[data.id] || []),
    ...(LANDING_COMPLETION_BLOCKS[data.id] || []),
  ];
  return Object.freeze({
    ...data,
    author: AUTHOR,
    updatedAt: data.updatedAt || PUBLISHED_AT,
    body: Object.freeze(appendBeforeCommonQuestions(body, NEXT_LANDING_DEPTH_BLOCKS[data.id])),
  });
}

function comparison(data) {
  const body = [
    ...(data.body || []),
    ...(COMPARISON_DEPTH_BLOCKS[data.id] || []),
    ...(COMPARISON_COMPLETION_BLOCKS[data.id] || []),
  ];
  return Object.freeze({
    ...data,
    author: AUTHOR,
    updatedAt: data.updatedAt || PUBLISHED_AT,
    body: Object.freeze(appendBeforeBodyLinks(body, NEXT_COMPARISON_DEPTH_BLOCKS[data.id])),
  });
}

function faqPage(data) {
  return Object.freeze({
    ...data,
    body: Object.freeze([
      ...(FAQ_DEPTH_BLOCKS[data.id] || []),
      ...(FAQ_COMPLETION_BLOCKS[data.id] || []),
    ]),
  });
}

export const PRIORITY_CAREER_GUIDES = Object.freeze([
  guide({
    id: 'reconciliation-analyst',
    routeId: 'career-guide-reconciliation-analyst',
    path: '/career-guides/reconciliation-analyst/',
    title: 'Reconciliation Analyst Career Guide | Centaur Careers',
    description: 'Learn what a reconciliation analyst does, how breaks are investigated, which skills matter, and how the role connects to finance operations careers.',
    h1: 'Reconciliation Analyst: Role, Skills and Career Path',
    breadcrumbLabel: 'Reconciliation Analyst',
    primaryKeyword: 'reconciliation analyst',
    secondaryKeywords: ['reconciliation analyst job description', 'reconciliation analyst skills', 'reconciliation process in finance', 'bank reconciliation analyst', 'finance operations jobs for freshers'],
    image: '/images/blog/settlement-trade-break-worked-example.png',
    imageAlt: 'Illustration of a finance operations reconciliation break and settlement workflow',
    body: [
      paragraph('A reconciliation analyst compares records that should agree, identifies the reason for a difference, documents the evidence, and follows the authorised process to resolve or escalate the break. The work appears in banking, payments, securities, accounting, fund operations, and other finance teams.'),
      heading('What does a reconciliation analyst do?'),
      paragraph('The analyst starts with a defined scope: account or portfolio, date range, currency, source systems, matching rules, and ageing expectations. They compare records using identifiers, dates, amounts, balances, positions, and status fields. When an item does not match, the analyst investigates the source event rather than changing a value simply to make two reports agree.'),
      heading('A practical reconciliation workflow'),
      list([
        'Confirm the account, reporting period, currency, source files, and expected matching basis.',
        'Match transactions or balances using approved identifiers and documented tolerances.',
        'Classify the break as timing, missing, duplicate, incorrect reference, amount variance, or unresolved.',
        'Trace the difference to source records, processing history, statements, or approved evidence.',
        'Record the owner, ageing, next action, supporting evidence, and escalation route.',
        'Verify that the correction or late record clears correctly and retain the review trail.',
      ], true),
      heading('Skills employers commonly look for'),
      list([
        'Careful comparison of structured data, dates, amounts, and references.',
        'Spreadsheet literacy and the ability to explain a check clearly.',
        'Root-cause thinking without assuming that the newest record is correct.',
        'Concise case notes and professional communication with upstream teams.',
        'Prioritisation based on materiality, ageing, deadline, and operational risk.',
        'Control discipline: evidence, approvals, access rules, and escalation.',
      ]),
      heading('Illustrative break investigation'),
      paragraph('Suppose an internal cash ledger shows a customer payment one day before the bank statement. The analyst checks the payment reference, value date, statement cut-off, and subsequent statement. If the evidence supports a timing difference, the analyst records that explanation and verifies that it clears in the next period. A missing bank fee is a different issue and may require an authorised accounting entry.'),
      link('Read the bank reconciliation process guide', '/resources/bank-reconciliation-process/', 'resource-bank-reconciliation-process'),
      link('Understand reconciliation in finance more broadly', '/resources/reconciliation-in-finance/', 'resource-reconciliation-in-finance'),
      heading('How to prepare for this career direction'),
      paragraph('Start with accounting basics, bank statements, ledger balances, payment statuses, and the trade lifecycle. Practise with fictional records: build a matching key, list unmatched items, identify the first differing field, and write a short escalation. Never use confidential customer or employer data in a portfolio exercise.'),
      link('Practise finance operations interview questions', '/resources/investment-banking-interview-questions/', 'resource-investment-banking-interview-questions'),
      link('Explore finance operations careers', '/career-guides/finance-operations/', 'career-guide-finance-operations'),
      heading('How Centaur Careers relates to this role'),
      paragraph('Reconciliation is taught through the Financial Operations Masterclass alongside investment banking operations, finance operations, payments, KYC / AML, retail banking, and FinTech topics. This guide explains the role generally; it is not a promise of a particular employer, salary, title, or vacancy.'),
      link('Review the Financial Operations Masterclass', '/courses/', 'courses'),
      faq('Is a reconciliation analyst an accounting role?', 'It can sit in accounting, banking operations, payments, securities, fund operations, or control teams. The job description matters more than the title because the records, systems, and approval responsibilities vary.'),
      faq('Can a fresher become a reconciliation analyst?', 'Some entry-level roles accept graduates who can demonstrate accuracy, spreadsheet skills, process discipline, and clear communication. Always compare the employer criteria and practise explaining a complete break-investigation workflow.'),
      faq('What is the difference between reconciliation and correction?', 'Reconciliation identifies and explains a difference. A correction, if needed, must use an authorised process with evidence and approvals; the analyst should not overwrite source records to force a match.'),
    ],
    relatedGuideIds: ['finance-operations', 'trade-lifecycle', 'investment-banking-operations'],
    relatedRouteIds: ['resources', 'resource-bank-reconciliation-process', 'resource-reconciliation-in-finance', 'career-guide-finance-operations', 'courses'],
  }),
  guide({
    id: 'investment-banking-operations-roles',
    routeId: 'career-guide-investment-banking-operations-roles',
    path: '/career-guides/investment-banking-operations-roles/',
    title: 'Investment Banking Roles and Career Paths | Centaur Careers',
    description: 'Map investment banking operations roles from trade support and settlements to reconciliation, corporate actions and fund accounting.',
    h1: 'Investment Banking Operations Roles and Career Paths',
    breadcrumbLabel: 'Investment Banking Operations Roles',
    primaryKeyword: 'investment banking roles',
    secondaryKeywords: ['investment banking operations roles', 'investment banking jobs for freshers', 'trade support roles', 'settlements analyst career', 'investment banking career path'],
    image: '/images/blog/investment-banking-teams-operations.png',
    imageAlt: 'Map of investment banking teams and operations role families',
    body: [
      paragraph('Investment banking is a broad industry label. Front-office advisory and markets roles are different from the operations roles that help transactions, records, controls, and settlement workflows move accurately. This guide focuses on the operations and post-trade career families a learner may see in job descriptions.'),
      heading('Common investment banking operations role families'),
      list([
        'Trade support: validate trade details, monitor status, coordinate with stakeholders, and resolve exceptions.',
        'Settlements: support the exchange of cash and securities, instructions, cut-offs, and failed settlements.',
        'Reconciliation: compare internal and external records, investigate breaks, and maintain ageing and evidence.',
        'Corporate actions: process issuer events, entitlements, elections, and resulting cash or position records.',
        'Fund accounting: support fund records, NAV inputs, cash, holdings, and control checks according to the team process.',
        'KYC / AML and client operations: review information, monitor cases, maintain records, and escalate under approved controls.',
      ]),
      heading('How the roles connect'),
      paragraph('A trade can move through several teams. Trade support checks the economic details and status, settlements monitors delivery and payment, reconciliation compares resulting records, and corporate-actions or fund-accounting teams process later events where relevant. Team boundaries differ by institution, product, location, and operating model, so candidates should read the actual responsibilities.'),
      heading('Skills that transfer across the role families'),
      list(['Accuracy with transactions, dates, quantities, prices, and identifiers.', 'Clear written updates that state the issue, evidence, owner, and next action.', 'Spreadsheet and workflow-system confidence.', 'Prioritisation around market cut-offs, ageing, risk, and client impact.', 'Understanding of controls, audit trails, confidentiality, and escalation.']),
      link('Read the investment banking operations career guide', '/career-guides/investment-banking-operations/', 'career-guide-investment-banking-operations'),
      link('Explore trade support analyst duties', '/career-guides/trade-support-analyst/', 'career-guide-trade-support-analyst'),
      link('Explore securities operations work', '/career-guides/securities-operations/', 'career-guide-securities-operations'),
      heading('How to choose a starting direction'),
      paragraph('Choose based on the workflow you are willing to practise, not only the prestige of a job title. A learner who enjoys investigation may prefer reconciliation or trade support; a learner who likes deadline-driven processing may prefer settlements; someone interested in records and event calculations may explore corporate actions or fund accounting. Compare each role description, shift pattern, tools, and entry requirements.'),
      link('Practise investment banking operations interview questions', '/resources/investment-banking-interview-questions/', 'resource-investment-banking-interview-questions'),
      link('Review the Masterclass curriculum', '/courses/', 'courses'),
      faq('Are investment banking operations roles the same as investment banking analyst roles?', 'Not always. Some employers use analyst titles for operations or middle-office work, while others use them for front-office analysis. Read the duties, team, products, and workflow in the actual job description.'),
      faq('Which investment banking operations role is best for a fresher?', 'There is no universal best role. Compare the workflow, skills, schedule, product exposure, training, and eligibility with your strengths and target employers.'),
      faq('Does this page promise investment banking employment?', 'No. It is a general career guide. Program-specific access, support, and guarantee terms belong to the current Centaur Careers program and its published placement terms.'),
    ],
    relatedGuideIds: ['investment-banking-operations', 'trade-lifecycle', 'finance-operations', 'reconciliation-analyst', 'trade-support-analyst', 'securities-operations'],
    relatedRouteIds: ['courses', 'investment-banking-operations', 'resource-investment-banking-interview-questions', 'career-guide-trade-support-analyst', 'career-guide-securities-operations'],
  }),
  guide({
    id: 'trade-support-analyst',
    routeId: 'career-guide-trade-support-analyst',
    path: '/career-guides/trade-support-analyst/',
    title: 'Trade Support Analyst Career Guide | Centaur Careers',
    description: 'Understand trade support analyst duties, trade capture checks, exception handling, stakeholder hand-offs and entry-level preparation.',
    h1: 'Trade Support Analyst: Duties, Skills and Career Path',
    breadcrumbLabel: 'Trade Support Analyst',
    primaryKeyword: 'trade support analyst',
    secondaryKeywords: ['trade support analyst job description', 'trade support career', 'trade operations analyst', 'trade lifecycle jobs', 'investment banking operations jobs'],
    image: '/images/blog/settlement-trade-break-worked-example.png',
    imageAlt: 'Trade support analyst workflow from trade capture to settlement',
    body: [
      paragraph('A trade support analyst helps a financial-markets workflow move from a recorded trade toward confirmation, settlement, reconciliation, or the next controlled process step. The analyst works with transaction data and stakeholders; they are not automatically a trader, investment adviser, or front-office deal professional.'),
      heading('Trade support analyst duties'),
      list(['Review trade capture for instrument, quantity, price, parties, dates, and account.', 'Monitor confirmation, affirmation, settlement, and exception statuses.', 'Compare source records and identify missing or conflicting fields.', 'Coordinate with trading, sales, operations, custodians, counterparties, or technology teams as assigned.', 'Document the issue, evidence, owner, deadline, and escalation.', 'Track the outcome and verify that downstream records are correct.']),
      heading('A simple exception example'),
      paragraph('If an internal record shows a different settlement date from a confirmation, the analyst first checks the trade identifier, market convention, source timestamp, and latest approved record. They record the mismatch and contact the responsible team under the workflow. They do not edit the source record or assume which date is correct without evidence.'),
      link('Follow the full trade lifecycle', '/career-guides/trade-lifecycle/', 'career-guide-trade-lifecycle'),
      link('Understand reconciliation breaks', '/resources/reconciliation-in-finance/', 'resource-reconciliation-in-finance'),
      heading('Skills for the role'),
      list(['Transaction and spreadsheet accuracy.', 'Professional written communication.', 'Prioritisation around cut-offs and failed processing.', 'Basic financial-markets vocabulary.', 'Evidence-based investigation and escalation.', 'Confidentiality and control awareness.']),
      heading('How to prepare as a fresher'),
      paragraph('Learn the difference between execution, capture, confirmation, clearing, settlement, and reconciliation. Practise with fictional trade records and explain what you would check when a quantity, date, counterparty, or status does not match. Prepare interview answers that show the purpose of the control and the next action, rather than only memorising definitions.'),
      link('Practise operations interview questions', '/resources/investment-banking-interview-questions/', 'resource-investment-banking-interview-questions'),
      link('Review the Investment Banking Operations module', '/courses/investment-banking-operations/', 'investment-banking-operations'),
      faq('Is trade support a front-office role?', 'It depends on the organisation, but trade support is generally a middle-office or operations function that supports the transaction workflow. Job titles and team boundaries differ, so read the employer description.'),
      faq('What should a trade support analyst learn first?', 'Start with trade lifecycle stages, common transaction fields, confirmation, settlement, reconciliation, exception writing, and escalation discipline.'),
      faq('Can this role suit a commerce graduate?', 'It can, if the employer accepts the background and the candidate can demonstrate process understanding, accuracy, communication, and willingness to learn the relevant products and systems.'),
    ],
    relatedGuideIds: ['investment-banking-operations', 'trade-lifecycle', 'investment-banking-operations-roles', 'reconciliation-analyst'],
    relatedRouteIds: ['courses', 'investment-banking-operations', 'career-guide-investment-banking-operations-roles', 'resource-investment-banking-interview-questions', 'resource-reconciliation-in-finance'],
  }),
  guide({
    id: 'securities-operations',
    routeId: 'career-guide-securities-operations',
    path: '/career-guides/securities-operations/',
    title: 'Securities Operations Career Guide | Centaur Careers',
    description: 'Learn how securities operations supports trade processing, settlement, custody, reconciliation, corporate actions and operational controls.',
    h1: 'Securities Operations: Workflow, Roles and Skills',
    breadcrumbLabel: 'Securities Operations',
    primaryKeyword: 'securities operations',
    secondaryKeywords: ['securities operations jobs', 'securities operations analyst', 'securities settlement process', 'custody operations career', 'securities operations for freshers'],
    image: '/images/blog/financial-markets-participant-map.png',
    imageAlt: 'Financial markets participants connected through securities operations workflows',
    body: [
      paragraph('Securities operations is the processing and control work behind securities transactions and holdings. Depending on the organisation, it can include trade capture, confirmation, clearing, settlement, custody records, income events, reconciliations, and exception management.'),
      heading('What does securities operations include?'),
      list(['Trade and instruction validation.', 'Matching and settlement status monitoring.', 'Custody and position record maintenance.', 'Cash and securities reconciliation.', 'Corporate-action and income-event processing.', 'Failed-trade investigation, controls, and escalation.']),
      heading('Why settlement and custody accuracy matters'),
      paragraph('A securities workflow depends on accurate security identifiers, quantity, price, currency, account, settlement date, instruction, and status. A small mismatch can delay settlement or create a record difference. Analysts should compare authoritative sources, retain evidence, and follow the organisation-approved correction path.'),
      link('Read the investment banking operations roles guide', '/career-guides/investment-banking-operations-roles/', 'career-guide-investment-banking-operations-roles'),
      link('Understand the trade lifecycle', '/career-guides/trade-lifecycle/', 'career-guide-trade-lifecycle'),
      heading('Skills for securities operations careers'),
      list(['Attention to identifiers, dates, quantities, and cut-offs.', 'Ability to investigate unmatched cash, positions, or settlement statuses.', 'Understanding of records, controls, and audit trails.', 'Clear communication with internal teams and service providers.', 'Comfort with queues, spreadsheets, and workflow tools.', 'Patience with repeated checks while maintaining urgency for aged or high-impact exceptions.']),
      heading('Entry-level preparation'),
      paragraph('Build a process map for one fictional equity trade: execution, capture, confirmation, settlement instruction, delivery-versus-payment, custody record, and reconciliation. Then add one exception, such as a failed settlement or wrong account, and explain what evidence and escalation you would need. This demonstrates operational thinking without using confidential data.'),
      link('Practise finance operations interview questions', '/resources/investment-banking-interview-questions/', 'resource-investment-banking-interview-questions'),
      link('Explore the Investment Banking Operations module', '/courses/investment-banking-operations/', 'investment-banking-operations'),
      faq('Is securities operations the same as stock trading?', 'No. Trading is the activity of buying or selling securities; securities operations supports the processing, settlement, records, servicing, and controls connected with transactions and holdings.'),
      faq('What background helps in securities operations?', 'Commerce, finance, economics, mathematics, or another relevant degree may be accepted depending on the employer. Accuracy, process discipline, communication, and willingness to learn the product are important.'),
      faq('Does securities operations involve investment advice?', 'This guide is about operations workflows, not investment recommendations. Role responsibilities depend on the employer and must be read separately from investment-advisory activities.'),
    ],
    relatedGuideIds: ['investment-banking-operations', 'trade-lifecycle', 'investment-banking-operations-roles', 'trade-support-analyst'],
    relatedRouteIds: ['courses', 'investment-banking-operations', 'career-guide-investment-banking-operations-roles', 'resource-reconciliation-in-finance', 'resource-investment-banking-interview-questions'],
  }),
  guide({
    id: 'what-is-investment-banking',
    routeId: 'career-guide-what-is-investment-banking',
    path: '/career-guides/what-is-investment-banking/',
    title: 'What Is Investment Banking? | Centaur Careers',
    description: 'Understand what investment banking means, how business lines differ, where operations roles fit, and which skills support an entry-level path.',
    h1: 'What Is Investment Banking? Meaning, Roles and Career Paths',
    breadcrumbLabel: 'What Is Investment Banking?',
    primaryKeyword: 'what is investment banking',
    secondaryKeywords: ['investment banking meaning', 'investment banking roles', 'investment banking career', 'investment banking operations', 'investment banking for freshers'],
    image: '/images/blog/investment-banking-teams-operations.png',
    imageAlt: 'Investment banking business lines and operations career pathway',
    body: [
      paragraph('Investment banking is a part of financial services that can include advisory, capital markets, underwriting, financing, research, and related transaction-support functions. The phrase describes an industry and set of business activities, not one job. A learner should separate front-office, middle-office, and operations responsibilities before choosing a career direction.'),
      heading('Investment banking in simple terms'),
      paragraph('Investment banks help organisations and institutional clients raise capital, evaluate transactions, access markets, manage securities activity, and complete related financial work. The exact services depend on the institution, jurisdiction, client, product, and team. This educational definition is not investment advice.'),
      heading('Investment banking roles'),
      list(['Advisory and corporate-finance roles may support mergers, acquisitions, valuation, or capital decisions.', 'Capital-markets roles may support equity or debt issuance and market transactions.', 'Markets roles may work with products, clients, execution, and risk.', 'Operations and middle-office roles support trade capture, controls, settlement, reconciliation, records, and exception management.', 'Compliance, risk, technology, and client-service roles support the wider financial-services operating model.']),
      heading('Where investment banking operations fits'),
      paragraph('Investment banking operations helps agreed transactions move through controlled processing. Common topics include trade lifecycle, confirmation, settlement, reconciliation, corporate actions, and fund or asset servicing. The day-to-day work is usually process, data, control, and stakeholder focused rather than deal origination or investment recommendation.'),
      link('Read the investment banking operations career guide', '/career-guides/investment-banking-operations/', 'career-guide-investment-banking-operations'),
      link('Explore operations role families', '/career-guides/investment-banking-operations-roles/', 'career-guide-investment-banking-operations-roles'),
      heading('Skills that help a beginner'),
      list(['Financial terminology and process mapping.', 'Accuracy with structured records and deadlines.', 'Basic accounting and reconciliation.', 'Clear written communication and escalation.', 'Spreadsheet, data, and workflow literacy.', 'Curiosity about products while respecting controls and confidentiality.']),
      heading('How to choose an investment banking learning path'),
      paragraph('Start with the role you want to understand. If you are exploring operations, study transaction flow, settlement, reconciliation, controls, and exception handling. If you are exploring modelling or advisory, compare the relevant syllabus and credential separately. Course labels are not interchangeable and a general operations program should not be presented as a CFA preparation or front-office investment-banking qualification.'),
      link('Compare finance operations, financial modelling and CFA paths', '/compare/finance-operations-vs-financial-modelling-cfa/', 'comparison-finance-operations-vs-financial-modelling-cfa'),
      link('Review the Financial Operations Masterclass', '/courses/', 'courses'),
      faq('Is investment banking the same as commercial or retail banking?', 'No. Investment banking commonly focuses on advisory, capital markets, markets, and related services, while commercial and retail banking focus on deposits, lending, payments, branches, and customer banking. Institutions can offer several businesses, so the team and role matter.'),
      faq('Can a fresher enter investment banking operations?', 'Some entry-level operations roles accept graduates who demonstrate process understanding, accuracy, communication, and relevant preparation. Employer requirements and hiring decisions vary.'),
      faq('Does investment banking mean stock-market investing?', 'No. Investment banking services and securities investing are different concepts. This page explains the industry and careers; it does not provide investment advice.'),
    ],
    relatedGuideIds: ['investment-banking-operations', 'investment-banking-operations-roles', 'trade-support-analyst', 'securities-operations'],
    relatedRouteIds: ['courses', 'investment-banking-operations', 'career-guide-investment-banking-operations-roles', 'comparison-finance-operations-vs-financial-modelling-cfa', 'resource-investment-banking-interview-questions'],
  }),
  ...NEXT_CAREER_GUIDE_SPECS.map(guide),
]);

export const PRIORITY_RESOURCES = Object.freeze([
  resource({
    id: 'bank-reconciliation-process',
    routeId: 'resource-bank-reconciliation-process',
    path: '/resources/bank-reconciliation-process/',
    kind: 'learning',
    label: 'Accounting and finance resource',
    title: 'Bank Reconciliation Process and Example | Centaur Careers',
    description: 'Learn the bank reconciliation process, timing differences, outstanding items, bank fees, controls and a practical educational example.',
    h1: 'Bank Reconciliation Process: Steps, Differences and Example',
    breadcrumbLabel: 'Bank Reconciliation Process',
    updatedAt: '2026-10-05',
    primaryKeyword: 'bank reconciliation',
    secondaryKeywords: ['bank reconciliation process', 'bank reconciliation example', 'bank reconciliation statement', 'bank reconciliation in accounting', 'bank reconciliation for freshers'],
    image: '/images/blog/financial-accounting-cycle.png',
    imageAlt: 'Accounting cycle showing bank reconciliation and ledger checks',
    body: [
      paragraph('Bank reconciliation is the controlled comparison of an organisation\'s cash-book or ledger records with the bank statement for the same account and period. The purpose is to identify, explain, and resolve differences through evidence and authorised procedures. It is one form of reconciliation; securities, payments, and trade teams use related ideas with different records.'),
      heading('Bank reconciliation process'),
      list(['Confirm the bank account, statement period, currency, opening balance, and ledger cut-off.', 'Compare deposits, withdrawals, transfers, fees, interest, and other entries using references and dates.', 'Separate timing differences from missing, duplicate, incorrect, or unauthorised records.', 'Trace unmatched items to source documents, payment confirmations, journals, or the bank statement.', 'Prepare the reconciliation with clear explanations, ageing, owner, and supporting evidence.', 'Post or escalate only through the organisation\'s approved accounting and control process.', 'Review the closing position and confirm that unresolved items are followed up in the next cycle.'], true),
      heading('Common differences'),
      list(['Deposits recorded in the cash book but credited by the bank later.', 'Payments issued by the organisation but not yet presented or cleared.', 'Bank charges, interest, or direct debits not yet recorded in the ledger.', 'Errors in amount, account, date, reference, or duplicate entry.', 'Transfers recorded on one side before the other account or statement updates.']),
      heading('Fictional example'),
      paragraph('A cash book shows a customer receipt of INR 20,000 on 31 March, but the bank statement shows it on 1 April. The analyst checks the payment reference and cut-off, records the item as a supported timing difference, and confirms that it clears in April. If the statement also shows a bank fee absent from the ledger, that is investigated and posted only with the required approval.'),
      link('Read the broader reconciliation in finance guide', '/resources/reconciliation-in-finance/', 'resource-reconciliation-in-finance'),
      link('Learn the accounting cycle and debit-credit basics', '/resources/accounting-basics/', 'resource-accounting-basics'),
      link('Explore reconciliation analyst careers', '/career-guides/reconciliation-analyst/', 'career-guide-reconciliation-analyst'),
      heading('Controls and quality checks'),
      paragraph('A good reconciliation has a defined owner, frequency, preparer and reviewer where required, clear source records, documented explanations, ageing, escalation, and evidence of review. Equal totals do not by themselves prove that the correct account, date, amount, or supporting document was used.'),
      link('Explore finance operations training topics', '/courses/finance-operations-training/', 'courses-finance-operations-training'),
      link('Read ICAI study material for bank-reconciliation learning', 'https://kb.icai.org/pdfs/PDFFile5b27976545f667.12985834.pdf'),
      faq('What is the main purpose of bank reconciliation?', 'It compares the organisation\'s cash records with the bank statement, explains differences, identifies errors or missing entries, and supports accurate records through an authorised process.'),
      faq('Is a bank reconciliation the same as a bank statement?', 'No. The statement is issued by the bank; the reconciliation is the organisation\'s comparison and explanation of the statement against its own records.'),
      faq('Can I change the cash book until it matches?', 'No. Source records should not be changed simply to force agreement. Investigate the evidence and use the approved correction, posting, and review process.'),
    ],
    relatedRouteIds: ['resources', 'resource-reconciliation-in-finance', 'resource-accounting-basics', 'career-guide-reconciliation-analyst', 'courses-finance-operations-training'],
  }),
  resource({
    id: 'cost-accounting-finance-operations',
    routeId: 'resource-cost-accounting-finance-operations',
    path: '/resources/cost-accounting-finance-operations/',
    kind: 'learning',
    label: 'Accounting and finance resource',
    title: 'Cost Accounting for Finance Operations | Centaur Careers',
    description: 'Understand cost accounting basics, cost behaviour, allocation, variances and how the concepts support finance operations and control work.',
    h1: 'Cost Accounting for Finance Operations: Concepts and Uses',
    breadcrumbLabel: 'Cost Accounting for Finance Operations',
    primaryKeyword: 'cost accounting',
    secondaryKeywords: ['cost accounting basics', 'cost accounting methods', 'cost allocation', 'cost accounting for finance students', 'finance operations accounting'],
    image: '/images/blog/cost-accounting-worked-example.png',
    imageAlt: 'Cost accounting worked example with allocation and variance concepts',
    body: [
      paragraph('Cost accounting organises and analyses the costs of products, services, activities, departments, or processes. In finance operations, the concepts help teams understand how amounts are classified, allocated, monitored, and explained. The right method depends on the organisation, purpose, data, and accounting policy.'),
      heading('Cost accounting basics'),
      list(['Direct cost: a cost that can be traced reasonably to a defined product, service, or activity.', 'Indirect cost: a shared cost that needs a rational allocation basis.', 'Fixed cost: a cost that does not change in direct proportion to short-term activity within a relevant range.', 'Variable cost: a cost that changes with a relevant activity measure.', 'Cost centre: a defined area used to collect and monitor costs.', 'Cost driver: a factor used to explain or allocate cost, such as transactions, hours, or units.']),
      heading('Cost allocation example'),
      paragraph('Suppose a shared operations team costs INR 100,000 for a month and processes 10,000 cases. A simple educational allocation would be INR 10 per case. Real organisations may use several cost pools, different drivers, service-level measures, and approved management-accounting policies. The example is not a universal accounting treatment.'),
      heading('Why finance operations learners should know the concepts'),
      paragraph('Operations teams may support budgets, invoices, reconciliations, management reporting, vendor records, profitability analysis, or control checks. Understanding cost behaviour helps an analyst ask whether a variance comes from volume, price, timing, classification, allocation, or a missing record. It also helps connect transaction-level data to management reporting without confusing a cost model with statutory financial statements.'),
      link('Review financial accounting for banking operations', '/resources/financial-accounting-banking/', 'resource-financial-accounting-banking'),
      link('Study finance operations careers', '/career-guides/finance-operations/', 'career-guide-finance-operations'),
      link('Explore the finance operations training page', '/courses/finance-operations-training/', 'courses-finance-operations-training'),
      heading('Cost accounting versus financial accounting'),
      paragraph('Financial accounting focuses on reporting an entity\'s financial position and performance under the applicable reporting framework. Cost accounting and management accounting support internal planning, analysis, control, and decisions. The terms overlap in practice, but the purpose, audience, and required framework should be identified before interpreting a number.'),
      faq('Is cost accounting a separate course at Centaur Careers?', 'This page is an educational resource, not a separate cost-accounting course. Accounting and finance operations topics are connected to the broader Financial Operations Masterclass and current program terms should be confirmed directly.'),
      faq('What are common cost accounting methods?', 'Examples include job costing, process costing, activity-based costing, standard costing, and absorption approaches. The appropriate method depends on the activity, data, purpose, and applicable policy.'),
      faq('Does cost accounting provide investment advice?', 'No. It is an accounting and internal-analysis topic, not investment advice or a recommendation about a security or financial product.'),
    ],
    relatedRouteIds: ['resources', 'resource-financial-accounting-banking', 'resource-financial-statement-analysis', 'career-guide-finance-operations', 'courses-finance-operations-training'],
  }),
  resource({
    id: 'financial-accounting-banking',
    routeId: 'resource-financial-accounting-banking',
    path: '/resources/financial-accounting-banking/',
    kind: 'learning',
    label: 'Accounting and finance resource',
    title: 'Financial Accounting for Banking | Centaur Careers',
    description: 'Learn how the accounting cycle, reconciliations, reporting hand-offs and controls connect with banking and finance operations work.',
    h1: 'Financial Accounting for Banking Operations',
    breadcrumbLabel: 'Financial Accounting for Banking Operations',
    primaryKeyword: 'financial accounting',
    secondaryKeywords: ['financial accounting basics', 'financial accounting for banking', 'accounting cycle in banking', 'finance operations accounting', 'accounting jobs in banking'],
    image: '/images/blog/financial-accounting-cycle.png',
    imageAlt: 'Financial accounting cycle from source transaction to reporting',
    body: [
      paragraph('Financial accounting records and summarises transactions so an entity can prepare financial information under its applicable framework. Banking operations teams interact with these records through cash, fees, payments, lending, settlements, reconciliations, customer or counterparty balances, and reporting controls.'),
      heading('The accounting cycle in an operations context'),
      list(['Identify the business event and retain the source evidence.', 'Classify the accounts and record the transaction through the approved system or journal process.', 'Post to ledgers and supporting sub-ledgers where required.', 'Reconcile balances and investigate differences between related records.', 'Apply period-end checks, adjustments, reviews, and approvals.', 'Prepare or support reports while preserving the audit trail.'], true),
      heading('Banking operations examples'),
      paragraph('A payment may create a cash movement and a corresponding operational status. A bank fee may appear on the statement before it is recorded in the ledger. A lending workflow can connect an application, approval, disbursement, repayment, interest, and outstanding balance. The accounting treatment, controls, and reporting requirements depend on the entity, product, policy, and applicable standards.'),
      link('Study the bank reconciliation process', '/resources/bank-reconciliation-process/', 'resource-bank-reconciliation-process'),
      link('Review accounting basics and debit-credit logic', '/resources/accounting-basics/', 'resource-accounting-basics'),
      heading('Controls that matter'),
      list(['Source evidence and transaction references.', 'Maker-checker or review controls where required.', 'Cut-off, period, currency, and account checks.', 'Reconciliation of general ledger, sub-ledger, bank, and operational records.', 'Access controls, segregation of duties, and traceable corrections.', 'Clear escalation when a record is incomplete, inconsistent, or outside authority.']),
      heading('How to learn this topic without overclaiming'),
      paragraph('Use fictional transactions to practise journal logic, ledger movement, reconciliation, and reporting hand-offs. Do not treat a basic example as a substitute for the entity\'s accounting policy, regulator requirements, audit advice, or professional qualification curriculum.'),
      link('Read ICAI accounting and bank-reconciliation material', 'https://www.icai.org/post/17894'),
      link('Explore finance operations careers', '/career-guides/finance-operations/', 'career-guide-finance-operations'),
      link('Review finance operations training topics', '/courses/finance-operations-training/', 'courses-finance-operations-training'),
      faq('Is financial accounting the same as finance operations?', 'No. Financial accounting is a reporting and record-keeping discipline. Finance operations is a wider set of processes that may include transaction processing, controls, reconciliations, lending, payments, client service, and reporting support.'),
      faq('Do banking operations jobs require a CA qualification?', 'Requirements vary by role and employer. Some roles may seek professional qualifications or experience, while entry-level operations roles may focus on graduate education, process skills, communication, and training.'),
      faq('Can this page replace accounting standards or professional advice?', 'No. It is a general learning guide. Use the applicable standards, entity policy, professional guidance, and authorised review process for real accounting decisions.'),
    ],
    relatedRouteIds: ['resources', 'resource-bank-reconciliation-process', 'resource-accounting-basics', 'career-guide-finance-operations', 'courses-finance-operations-training'],
  }),
  resource({
    id: 'financial-statement-analysis',
    routeId: 'resource-financial-statement-analysis',
    path: '/resources/financial-statement-analysis/',
    kind: 'learning',
    label: 'Finance analysis resource',
    title: 'Financial Statement Analysis: Ratios | Centaur Careers',
    description: 'Learn financial statement analysis, key ratio groups, limitations, comparison methods and a banking or credit-operations example.',
    h1: 'Financial Statement Analysis: Ratios, Methods and Limits',
    breadcrumbLabel: 'Financial Statement Analysis',
    primaryKeyword: 'financial statement analysis',
    secondaryKeywords: ['financial statement analysis methods', 'financial statement ratios', 'financial analysis basics', 'credit analysis fundamentals', 'financial statements for banking'],
    image: '/images/blog/financial-statement-analysis-ratios-limits.png',
    imageAlt: 'Illustration of financial statements, ratio checks, and analysis limits',
    body: [
      paragraph('Financial statement analysis is the structured review of an entity\'s income statement, balance sheet, cash-flow information, notes, and related context. It helps a reader ask how performance, liquidity, leverage, cash generation, and operating trends have changed. A ratio is a signal for investigation, not a complete conclusion.'),
      { type: BLOG_BLOCK_TYPES.IMAGE, image: { src: '/images/blog/financial-statement-analysis-ratios-limits.png', alt: 'Illustration of financial statements, ratio checks, and analysis limits', width: 1672, height: 941 } },
      heading('Main methods of analysis'),
      list(['Horizontal analysis compares the same measure across periods.', 'Vertical or common-size analysis expresses line items as a proportion of a base.', 'Ratio analysis groups measures such as liquidity, profitability, leverage, efficiency, and coverage.', 'Cash-flow analysis checks how operating, investing, and financing activity affect cash.', 'Peer or sector comparison adds context, but the businesses and accounting policies must be comparable.']),
      heading('Important ratio groups'),
      list(['Liquidity: asks whether short-term obligations can be met from available resources.', 'Profitability: considers margins, return measures, and the relationship between income and resources used.', 'Leverage: examines debt and capital structure in context.', 'Efficiency: reviews turnover, working-capital use, and operating activity.', 'Coverage: considers the ability to meet interest or other fixed obligations.']),
      heading('Fictional credit-operations example'),
      paragraph('Use this fictional example to connect the statements. A business reports revenue of ₹1,000, cost of sales of ₹600, operating expenses of ₹280, interest of ₹20, and tax of ₹30, leaving net income of ₹70 and a net margin of 7%. At year-end, current assets are ₹300 (cash ₹80, receivables ₹100, inventory ₹120), current liabilities are ₹150, long-term debt is ₹250, and equity is ₹400. Total assets of ₹800 equal liabilities plus equity. The current ratio is 2.0 (₹300 ÷ ₹150); a quick ratio excluding inventory is 1.2 ((₹80 + ₹100) ÷ ₹150). If opening assets were ₹700 and opening equity ₹350, average assets are ₹750 and average equity ₹375, giving approximate ROA of 9.3% and ROE of 18.7%. All figures are fictional and simplified; definitions, tax treatment, averaging conventions, and ratio policies vary.'),
      paragraph('A lender reviewing this fictional business would not approve or reject a facility from one ratio. The analyst would check reporting periods, accounting policies, cash-flow evidence, debt maturity, customer concentration, industry conditions, and the organisation\'s approved credit procedure.'),
      heading('Limits and common mistakes'),
      list(['Comparing periods with different accounting policies or unusual events.', 'Treating a ratio threshold as universal across sectors or products.', 'Ignoring cash flow because profit appears positive.', 'Using unaudited or incomplete information without stating the limitation.', 'Confusing an educational analysis with an investment recommendation or credit decision.']),
      link('Review financial accounting for banking operations', '/resources/financial-accounting-banking/', 'resource-financial-accounting-banking'),
      link('Explore finance operations and credit analysis', '/courses/finance-operations-training/', 'courses-finance-operations-training'),
      link('Read the finance operations career guide', '/career-guides/finance-operations/', 'career-guide-finance-operations'),
      faq('What are the three main financial statements?', 'The income statement, balance sheet, and cash-flow statement are commonly discussed together. Notes and supporting schedules are also important for understanding definitions, policies, commitments, and limitations.'),
      faq('Is financial statement analysis the same as financial modelling?', 'No. Analysis interprets reported information and context. Financial modelling builds a structured calculation or forecast using assumptions and data. They can support one another but are different skills.'),
      faq('Does this page teach investment analysis or provide recommendations?', 'No. It is an educational overview for finance and operations learning. It does not recommend a security, issuer, loan, or investment action.'),
    ],
    relatedRouteIds: ['resources', 'resource-financial-accounting-banking', 'career-guide-finance-operations', 'courses-finance-operations-training', 'comparison-finance-operations-vs-financial-modelling-cfa'],
  }),
  ...NEXT_RESOURCE_SPECS.map(resource),
]);

export const PRIORITY_LANDING_PAGES = Object.freeze([
  landing({
    id: 'banking-courses', routeId: 'courses-banking-courses', parentId: 'courses', path: '/courses/banking-courses/',
    title: 'Banking Courses for Finance Careers | Centaur Careers',
    description: 'Compare banking career directions and explore how operations, retail banking, lending, KYC, payments and FinTech fit within one finance masterclass.',
    h1: 'Banking Courses and Career Directions', breadcrumbLabel: 'Banking Courses', primaryKeyword: 'banking courses',
    image: '/images/courses/retail-banking.jpg', imageAlt: 'Banking operations learning topics for finance career starters', updatedAt: PUBLISHED_AT,
    body: [
      paragraph('Banking courses can describe very different goals: bank operations, retail banking, lending, compliance, payments, investment banking operations, finance accounting, or competitive-exam preparation. This page helps a learner identify the right direction before requesting current course details.'),
      heading('Banking topics connected to finance careers'),
      list(['Retail banking: customer service, branch operations, relationship workflows, loans, and NRI banking.', 'Investment banking operations: trade lifecycle, settlement, reconciliation, corporate actions, and fund accounting.', 'Finance operations and credit: loan processing, credit analysis, reporting, risk, and operational controls.', 'KYC and AML: onboarding, due diligence, screening, monitoring, case documentation, and escalation.', 'Digital payments and FinTech: payment flows, reconciliation, disputes, digital products, and service operations.']),
      heading('One program, several career directions'),
      paragraph('Centaur Careers presents these subjects as connected topics within the six-week Financial Operations Masterclass. The modules are not separate standalone classes on this page. The right fit depends on the learner\'s target roles, background, location, schedule, learning mode, and current program terms.'),
      link('Review the full Financial Operations Masterclass', '/courses/', 'courses'),
      link('Read the retail banking operations guide', '/career-guides/retail-banking-operations/', 'career-guide-retail-banking-operations'),
      link('Explore finance operations careers', '/career-guides/finance-operations/', 'career-guide-finance-operations'),
      link('Check published placement terms', '/placements/', 'placements'),
      heading('Questions to ask before enrolling'),
      list(['Which role families and workflows does the syllabus actually cover?', 'Are sessions live, recorded, online, in person, or a combination for the current cohort?', 'What practical exercises, projects, assessments, and feedback are included?', 'What certificate wording, eligibility, fees, refund terms, and schedule apply?', 'What career support is included, and where are the current guarantee terms published?']),
      faq('Is this a government bank exam coaching course?', 'No. This page explains private finance-operations and banking-career learning directions. Government-exam preparation is a different product and should not be assumed from the phrase banking course.'),
      faq('Which banking course is best for a fresher?', 'Choose by target role, syllabus, learning mode, practice, schedule, support, and published terms rather than by the title alone. Contact Centaur Careers to confirm the current Masterclass details.'),
    ],
  }),
  landing({
    id: 'banking-and-finance', routeId: 'courses-banking-and-finance', parentId: 'courses', path: '/courses/banking-and-finance/',
    title: 'Banking and Finance Course | Centaur Careers',
    description: 'Explore a practical banking and finance masterclass covering operations, accounting, credit, compliance, payments, retail banking and FinTech topics.',
    h1: 'Banking and Finance Course for Career Starters', breadcrumbLabel: 'Banking and Finance Course', primaryKeyword: 'banking and finance course',
    image: '/images/courses/finance-operations.jpg', imageAlt: 'Finance operations and banking course topics for career starters', updatedAt: PUBLISHED_AT,
    body: [
      paragraph('A banking and finance course is most useful when it connects concepts to the workflows employers use. Learners need to understand not only definitions, but also how a transaction is recorded, checked, reconciled, escalated, reported, or serviced.'),
      heading('What this learning path covers'),
      list(['Investment banking operations and post-trade workflows.', 'Retail banking, branch, relationship, loan, and NRI banking topics.', 'Finance operations, credit analysis, loan processing, risk, and reporting.', 'KYC, AML, customer due diligence, screening, and transaction monitoring.', 'Digital payments, reconciliation, disputes, and FinTech / neo-banking operations.', 'Accounting foundations that support records, controls, and financial reporting.']),
      heading('How the program is positioned'),
      paragraph('Centaur Careers currently presents the Financial Operations Masterclass as one six-week program with these subjects. This page is an orientation page, not a separate class, degree, CA pathway, CFA preparation route, or external accreditation claim. Confirm the current curriculum, fees, mode, cohort dates, and support terms before enrolling.'),
      link('View the complete Masterclass page', '/courses/', 'courses'),
      link('Compare adjacent finance learning paths', '/compare/finance-operations-vs-financial-modelling-cfa/', 'comparison-finance-operations-vs-financial-modelling-cfa'),
      link('Read program FAQs and current terms', '/faqs/finance-program/', 'faqs-finance-program'),
      link('Contact Centaur Careers', '/contact/', 'contact'),
      heading('Who may explore this path?'),
      paragraph('Graduates, commerce learners, job switchers, and people exploring entry-level BFSI roles may use the pathway to compare role families. Eligibility and hiring outcomes are not automatic: the learner should match the current employer requirements and practise the actual tasks described in vacancies.'),
      faq('Is this a banking and finance degree?', 'No. It is an informational page about the Financial Operations Masterclass. It does not claim to award a university degree or replace a recognised academic or professional qualification.'),
      faq('Does the course cover only investment banking?', 'No. The published learning path includes investment operations, retail banking, finance operations, compliance, payments, and FinTech topics. Confirm the current program detail before enrolling.'),
    ],
  }),
  landing({
    id: 'finance-operations-training', routeId: 'courses-finance-operations-training', parentId: 'courses', path: '/courses/finance-operations-training/',
    title: 'Finance Operations Training for Graduates | Centaur Careers',
    description: 'Explore finance operations training topics including accounting, loan processing, credit analysis, reporting, reconciliations, controls and risk.',
    h1: 'Finance Operations Training: Skills, Topics and Career Fit', breadcrumbLabel: 'Finance Operations Training', primaryKeyword: 'finance operations training topics',
    image: '/images/courses/finance-operations.jpg', imageAlt: 'Finance operations training topics including accounting and credit workflows', updatedAt: PUBLISHED_AT,
    body: [
      paragraph('Finance operations training connects financial records and customer or business workflows to the controls that keep them accurate. Depending on the team, the work can include loan processing, credit documentation, accounting hand-offs, reconciliations, reporting, risk checks, and exception resolution.'),
      heading('Finance operations topics'),
      list(['Accounting cycle, debit-credit logic, ledgers, and reporting hand-offs.', 'Loan and lending operations from application data to repayment and servicing records.', 'Credit analysis fundamentals and responsible use of financial statements.', 'Reconciliation, breaks, evidence, ageing, root cause, and escalation.', 'Operational risk, controls, access, maker-checker, and audit-friendly records.', 'Communication, spreadsheet work, queues, and structured process documentation.']),
      heading('What the training does and does not mean'),
      paragraph('Finance Operations is one subject within the Financial Operations Masterclass, not a separate course or promise of a particular finance operations job. This page does not claim to provide a CA qualification, CFA preparation, investment advice, or an employer-recognised certification. Current curriculum and support details should be confirmed directly.'),
      link('Read the finance operations career guide', '/career-guides/finance-operations/', 'career-guide-finance-operations'),
      link('Study financial accounting for banking operations', '/resources/financial-accounting-banking/', 'resource-financial-accounting-banking'),
      link('Learn financial statement analysis', '/resources/financial-statement-analysis/', 'resource-financial-statement-analysis'),
      link('Review the full program', '/courses/', 'courses'),
      heading('How to prepare for finance operations roles'),
      paragraph('Practise one end-to-end workflow with fictional records. For example, review a loan application, identify missing information, record a status, explain a credit-document check, and escalate an exception. Add a reconciliation exercise and a short written case note. This creates evidence of thinking without exposing real customer information.'),
      faq('Is finance operations training useful for freshers?', 'It can help a learner understand entry-level workflows, but employers set their own education, tool, communication, shift, and experience requirements. Use current job descriptions when choosing what to practise.'),
      faq('Is finance operations the same as financial modelling?', 'No. Finance operations focuses on controlled processing, records, service, and workflow. Financial modelling focuses on structured calculations, assumptions, forecasts, or valuation. Some roles use both, but they are distinct learning goals.'),
    ],
  }),
  ...INDIA_LEAD_INTENT_PAGES.map(landing),
  ...NEXT_LANDING_PAGE_SPECS.map(landing),
]);

export const PRIORITY_COMPARISON_PAGES = Object.freeze([
  comparison({
    id: 'best-finance-institutes-india', routeId: 'comparison-best-finance-institutes-india', parentId: 'home', path: '/compare/best-finance-institutes-india/',
    title: 'Best Finance Institute in India for Finance Jobs? | Centaur Careers',
    description: 'Compare finance institutes in India for finance and investment banking operations jobs by curriculum, practical work, fees, eligibility, credentials, and written placement terms.',
    h1: 'Best Finance Institute in India? Compare Programs for Finance and Investment Banking Jobs', breadcrumbLabel: 'Best Finance Institutes in India', primaryKeyword: 'best finance institute in India', updatedAt: '2026-10-06',
    image: '/images/blog/best-finance-institutes-india.webp', imageAlt: 'Learner comparing finance institutes in India using curriculum, fees and placement evidence',
    directAnswer: 'There is no universal top finance institute or program for every learner. Compare the role fit, current syllabus, practical work, eligibility, total cost, learning mode, and written placement terms. A reported 100% cohort placement rate and an individual 100% job guarantee are different claims: check the cohort, denominator, outcome definition, eligibility, exclusions, and written terms before comparing providers.',
    criteria: [
      { name: 'Curriculum and role fit', detail: 'Match the published modules to the work you want to understand: finance operations, investment banking operations, retail banking, KYC and AML, digital payments, credit, risk, or FinTech. Look for workflow detail, not only broad subject names.' },
      { name: 'Practical evidence', detail: 'Ask what learners actually practise, submit, review, or discuss. Case studies, fictional records, reconciliations, interview practice, and feedback are more useful comparison points than a long list of tools or buzzwords.' },
      { name: 'Placement and career terms', detail: 'Separate placement assistance, interview guidance, opportunity access, and a job guarantee. Read eligibility, completion requirements, exclusions, role scope, employer scope, location, salary wording, and the current written terms before relying on an outcome claim.' },
      { name: 'Fees, duration and total commitment', detail: 'Compare the current fee, taxes, instalments, refund conditions, duration, weekly workload, travel, device, connectivity, and any required examination or material costs. A lower headline fee is not automatically a lower total cost.' },
      { name: 'Eligibility and learning access', detail: 'Check academic background, experience, language, schedule, live or recorded access, support channels, attendance expectations, and whether online access is genuinely available from your city. Do not infer a classroom from a city keyword.' },
      { name: 'Trust and accountability', detail: 'Verify the legal or business identity, author or faculty information, current address where relevant, contact path, certificate issuer, source dates, review method, and a written answer to material enrolment questions.' },
    ],
    body: [
      heading('How Indian learners should interpret “best”'),
      paragraph('The word best usually hides a more specific need. One learner may want a short practical programme after BCom, another may need a recognised degree, another may be comparing investment banking operations, and another may want online access with career support. A useful page should therefore replace a universal ranking with a transparent fit test. Start with the role, qualification level, time available, budget, location, and evidence you need to see before contacting an institute.'),
      heading('Placement claims require the most careful checking'),
      paragraph('Placement assistance may mean resume guidance, interview preparation, vacancy sharing, interview opportunities, recruiter introductions, or a written guarantee with conditions. These are not interchangeable. Ask who is eligible, what completion means, which roles and employers are in scope, how location and salary are treated, what exclusions apply, and where the terms were last reviewed. If a provider cannot show the applicable written terms, treat the claim as unverified rather than assuming the strongest interpretation.'),
      heading('A all-learner placement rate is not automatically a 100% job guarantee'),
      paragraph('A placement rate usually describes outcomes for a defined group or cohort over a stated period. To evaluate it, ask how many learners were eligible, how many were counted, what counted as a placement, which programs and graduating batch were included, and whether the result was independently checked. A job guarantee is a separate provider commitment with its own eligibility, completion conditions, process, exclusions, and written terms. Compare like with like; do not assume a percentage statistic promises an individual job.'),
      heading('Before choosing an institute that advertises a 100% job guarantee'),
      paragraph('A guarantee headline is a reason to inspect the offer, not enough evidence to rank providers. Ask who can use it, what course completion means, what outcome is promised, what limits are stated, and where the current written terms can be read. Compare those answers with the syllabus, practical work, fees, schedule, and your target role.'),
      list([
        'Who is covered, and what qualification or course-completion requirement applies?',
        'What outcome is guaranteed, and which details are not promised?',
        'Where can I read the terms that apply to my cohort before paying?',
        'Do the course content, fee, schedule, and learning mode fit my goal?',
      ]),
      heading('A practical comparison worksheet'),
      list([
        'Write the role or workflow you want to practise before comparing institute names.',
        'Save the current syllabus, fee page, terms page, refund policy, certificate wording and contact answer with the date checked.',
        'Mark each claim as published fact, provider statement, learner review, independent evidence, or unanswered question.',
        'Score only criteria that matter to your decision, and explain the scoring method instead of publishing an unexplained ranking.',
        'Ask the same questions to each provider and keep a written record of material answers.',
      ], true),
      heading('Choose a finance jobs program by the work it prepares you to understand'),
      paragraph('Finance and investment banking jobs cover different work. An investment banking operations program should make its focus clear through workflows such as trade lifecycle, settlement, reconciliation, corporate actions, or fund operations. That preparation is different from financial modelling, valuation, research, or deal advisory. Compare the actual exercises and current vacancy requirements before deciding whether a course fits your target role.'),
      paragraph('Centaur Careers presents Investment Banking Operations as one subject within its six-week Financial Operations Masterclass. Graduates and job switchers who complete the full Masterclass are covered by the published 100% Job Guarantee Program for a finance job, subject to the current written terms. The public promise does not name a specific investment banking role, employer, salary, or city. Read the applicable terms before enrolling.'),
      link('Compare investment banking institutes by career goal', '/best-investment-banking-course-india/', 'lead-best-investment-banking-course-india'),
      heading('Where Centaur Careers fits in the comparison'),
      paragraph('Centaur Careers currently presents one six-week Financial Operations Masterclass with subjects covering investment banking operations, retail banking, KYC and AML, digital payments, finance operations, and FinTech. The current online and Lucknow access model, fees, certificate wording, and career-support terms should be confirmed with the team for the applicable cohort. This comparison page is a decision aid; it does not claim that Centaur is universally best or replace the current written programme terms.'),
      link('Review the Financial Operations Masterclass', '/courses/', 'courses'),
      link('Read the published 100% Job Guarantee Program terms', '/placements/#job-guarantee-terms', 'placements'),
      link('Compare fees, eligibility and programme terms', '/courses/finance-course-fees-eligibility/', 'courses-finance-course-fees-eligibility'),
      link('Use the finance-course selection guide', '/career-guides/choosing-finance-career-course/', 'career-guide-choosing-finance-career-course'),
      faq('What is the best finance institute in India with a 100% job guarantee?', 'There is no universal best institute based on a guarantee headline alone. Centaur Careers publishes a 100% Job Guarantee Program open to graduates and job switchers, with a finance job guaranteed after completion of the six-week Financial Operations Masterclass. Compare the course fit and read the current written terms; the published scope does not promise a particular employer, salary, role, or city.'),
      faq("What should I verify in a finance program's job guarantee terms?", 'Compare the current written terms rather than relying on a ranking or headline. Check who is eligible, what course completion requires, whether the provider guarantees an individual job or reports a cohort placement rate, what counts as a placement, and which role, location, salary, exclusions, and timeline apply. Centaur Careers publishes a finance-job guarantee after completion of its six-week Financial Operations Masterclass; see the placement page for the current scope.'),
      faq('Which finance institute is best for a fresher?', 'There is no universal answer. Compare the target role, curriculum, practical work, eligibility, schedule, total cost, support terms, evidence and the requirements of current vacancies. A provider should explain its current terms in writing.'),
      faq('How do I verify a finance institute placement claim?', 'Read the current written terms and check eligibility, completion requirements, role and employer scope, exclusions, location, salary wording, process, review date and contact route. Do not treat a logo, testimonial or headline percentage as complete proof.'),
      faq('Should I choose an online or offline finance institute?', 'Choose the mode that gives you workable live interaction, practice, feedback, schedule, support and access. Verify whether a city has a real current classroom; online access across India is not the same as a local branch.'),
    ],
    faqs: [
      { question: 'What is the best finance institute in India with a 100% job guarantee?', answer: 'There is no universal best institute based on a guarantee headline alone. Centaur Careers publishes a 100% Job Guarantee Program open to graduates and job switchers, with a finance job guaranteed after completion of the six-week Financial Operations Masterclass. Compare the course fit and read the current written terms; the published scope does not promise a particular employer, salary, role, or city.' },
      { question: "What should I verify in a finance program's job guarantee terms?", answer: 'Compare the current written terms rather than relying on a ranking or headline. Check who is eligible, what course completion requires, whether the provider guarantees an individual job or reports a cohort placement rate, what counts as a placement, and which role, location, salary, exclusions, and timeline apply. Centaur Careers publishes a finance-job guarantee after completion of its six-week Financial Operations Masterclass; see the placement page for the current scope.' },
      { question: 'Which finance institute is best for a fresher?', answer: 'There is no universal answer. Compare the target role, curriculum, practical work, eligibility, schedule, total cost, support terms, evidence and the requirements of current vacancies. A provider should explain its current terms in writing.' },
      { question: 'How do I verify a finance institute placement claim?', answer: 'Read the current written terms and check eligibility, completion requirements, role and employer scope, exclusions, location, salary wording, process, review date and contact route. Do not treat a logo, testimonial or headline percentage as complete proof.' },
      { question: 'Should I choose an online or offline finance institute?', answer: 'Choose the mode that gives you workable live interaction, practice, feedback, schedule, support and access. Verify whether a city has a real current classroom; online access across India is not the same as a local branch.' },
    ],
    sources: [
      { label: 'Centaur Careers: Financial Operations Masterclass', href: 'https://centaurcareers.in/courses/' },
      { label: 'Centaur Careers: placement and guarantee terms', href: 'https://centaurcareers.in/placements/' },
      { label: 'AIMA: Investment Banking Operations Program', href: 'https://pgcourses.aima.in/programs/investment-banking-operation-program' },
      { label: 'TimesPro: Investment Banking Operations Program', href: 'https://timespro.com/early-career/investment-banking-operations-program' },
    ],
    relatedRouteIds: ['courses', 'courses-banking-and-finance', 'courses-finance-course-for-graduates', 'courses-finance-course-fees-eligibility', 'placements', 'career-guide-choosing-finance-career-course', 'contact'],
  }),
  comparison({
    id: 'finance-operations-vs-financial-modelling-cfa', routeId: 'comparison-finance-operations-vs-financial-modelling-cfa', parentId: 'home', path: '/compare/finance-operations-vs-financial-modelling-cfa/',
    title: 'Finance Operations vs Modelling vs CFA | Centaur Careers',
    description: 'Compare finance operations, financial modelling and CFA paths by goal, skills, credential, time commitment and role fit before choosing.',
    h1: 'Finance Operations vs Financial Modelling vs CFA', breadcrumbLabel: 'Finance Path Comparison', primaryKeyword: 'financial modelling course', updatedAt: PUBLISHED_AT,
    image: '/images/blog/choose-finance-career-course-india.jpg', imageAlt: 'Decision framework for choosing a finance career learning path',
    directAnswer: 'These are different pathways. Finance operations focuses on controlled workflows and records; financial modelling focuses on structured calculations and forecasts; the CFA Program is a professional investment-analysis credential with its own curriculum, exams, eligibility, and policies. Choose based on the role you want, the depth of study you need, and the credential or experience the target employer expects.',
    criteria: [
      { name: 'Primary goal', detail: 'Operations is for processing, controls, reconciliation, settlement, lending, payments, and support workflows. Modelling is for spreadsheet analysis, forecasts, scenarios, and valuation. CFA study is a professional investment-analysis pathway.' },
      { name: 'Typical outputs', detail: 'Operations produces accurate records, status updates, exception cases, reconciliations, and controlled processing. Modelling produces linked calculations, assumptions, forecasts, or valuation outputs. CFA assessment tests a broad curriculum through its own examination route.' },
      { name: 'Credential status', detail: 'A Centaur completion certificate, if applicable, relates to its full Masterclass terms. It is not the CFA charter. A modelling course has the recognition stated by its own provider. Verify every credential directly.' },
      { name: 'Role fit', detail: 'Map operations to trade support, settlements, reconciliation, payments, banking operations, and finance operations. Map modelling to roles whose job descriptions request modelling, forecasting, valuation, or transaction analysis.' },
      { name: 'Time and assessment', detail: 'Compare the published duration, practice, assessment, study hours, fees, exam rules, and support. Do not compare a short practical program with a multi-level professional qualification as though they are interchangeable.' },
    ],
    faqs: [
      { question: 'Does Centaur Careers provide CFA preparation?', answer: 'This page does not claim CFA preparation or affiliation. The Financial Operations Masterclass is a separate program focused on finance and BFSI operations topics. Confirm the current program and credential wording directly.' },
      { question: 'Should I choose financial modelling or finance operations?', answer: 'Choose by target role. Select operations if you want controlled processing, reconciliation, settlement, lending, payments, or service workflows. Select modelling if the target role explicitly requires spreadsheet modelling, forecasting, valuation, or scenario analysis.' },
      { question: 'Is a financial modelling course the same as a finance degree?', answer: 'No. A short course, degree, professional qualification, and employer training have different curriculum, assessment, recognition, and entry requirements.' },
    ],
    sources: [
      { label: 'CFA Institute: CFA Program', href: 'https://www.cfainstitute.org/programs/cfa-program' },
      { label: 'CFA Institute: Program curriculum and policies', href: 'https://www.cfainstitute.org/programs/cfa-program/curriculum' },
    ],
    relatedRouteIds: ['courses', 'courses-finance-operations-training', 'resource-financial-statement-analysis', 'career-guide-finance-operations', 'faqs-finance-program'],
  }),
  comparison({
    id: 'online-vs-offline-finance-training', routeId: 'comparison-online-vs-offline-finance-training', parentId: 'home', path: '/compare/online-vs-offline-finance-training/',
    title: 'Online vs Offline Finance Training | Centaur Careers',
    description: 'Compare online and offline finance training by access, interaction, practice, schedule, travel, support and the current Centaur delivery model.',
    h1: 'Online vs Offline Finance Training in India', breadcrumbLabel: 'Online vs Offline Finance Training', primaryKeyword: 'online finance course', updatedAt: PUBLISHED_AT,
    image: '/images/blog/centaur-careers-bfsi-training-india.jpg', imageAlt: 'Online and classroom finance training access across India',
    directAnswer: 'Online and offline learning can both work. The right choice depends on live interaction, schedule, travel, study environment, practice, support, connectivity, and the actual mode offered for the cohort. Centaur Careers currently describes live online access across India and an in-person option at its published Lucknow location; confirm current dates and terms before enrolling.',
    criteria: [
      { name: 'Access and location', detail: 'Online can support learners across India when the required connection and schedule are workable. Offline requires travel or residence near the published classroom. Check whether a city page describes a real current cohort.' },
      { name: 'Interaction', detail: 'Ask whether sessions are live, how questions are handled, whether recordings are available, and how feedback is delivered. Classroom presence does not automatically prove practical feedback.' },
      { name: 'Practice', detail: 'Compare exercises, case work, projects, assessment, review, and access to tools. A mode should be judged by learning design, not only by the label online or offline.' },
      { name: 'Schedule and cost', detail: 'Include fees, taxes, travel, accommodation, devices, connectivity, attendance, time zone, and any missed-session rules. Request current written terms.' },
      { name: 'Career support', detail: 'Ask what resume, interview, opportunity, or guarantee support means for the exact program and mode. Review the published placement terms before relying on a claim.' },
    ],
    faqs: [
      { question: 'Does Centaur Careers offer an online finance course?', answer: 'The public program positioning describes live online sessions for learners across India. Confirm the current cohort, schedule, fees, and learning-mode details directly.' },
      { question: 'Where is offline finance training available?', answer: 'The published in-person option is at Mindsprout Career Hub in Lucknow. Do not assume offline access in another city without written confirmation for the relevant cohort.' },
      { question: 'Is online or offline better for finance operations?', answer: 'Neither is universally better. Choose the mode that provides workable live interaction, practice, feedback, schedule, access, and support for your circumstances.' },
    ],
    sources: [
      { label: 'Centaur Careers: current Financial Operations Masterclass', href: 'https://centaurcareers.in/courses/' },
      { label: 'Centaur Careers: published Lucknow access information', href: 'https://centaurcareers.in/best-finance-course-in-lucknow/' },
    ],
    relatedRouteIds: ['courses', 'india', 'lucknow-location', 'faqs-finance-program', 'placements'],
  }),
  ...NEXT_COMPARISON_PAGE_SPECS.map(comparison),
]);

export const PRIORITY_FAQ_PAGES = Object.freeze([
  faqPage({
    id: 'finance-program', routeId: 'faqs-finance-program', parentId: 'home', path: '/faqs/finance-program/',
    title: 'Finance Course FAQs and Current Terms | Centaur Careers',
    description: 'Get clear answers about the Financial Operations Masterclass, duration, eligibility, online and Lucknow access, fees, certificate wording and support terms.',
    h1: 'Financial Operations Masterclass FAQs and Current Terms', breadcrumbLabel: 'Finance Program FAQs', primaryKeyword: 'finance course FAQ',
    image: '/images/blog/placement-support-career-counselling-india.jpg', imageAlt: 'Finance course counselling and program terms information', updatedAt: PUBLISHED_AT,
    questions: [
      { question: 'What is the Financial Operations Masterclass?', answer: 'It is the published six-week Centaur Careers program covering finance and BFSI operations topics such as investment banking operations, retail banking, KYC / AML, digital payments, finance operations, credit, risk, and FinTech. Confirm the current curriculum before enrolling.' },
      { question: 'Who can explore the program?', answer: 'The public program information is aimed at graduates and job switchers across India. Eligibility, documents, cohort availability, and any role-specific conditions should be confirmed with Centaur Careers.' },
      { question: 'Is the program online or offline?', answer: 'The published access model describes live online sessions across India and an in-person option at Mindsprout Career Hub in Lucknow. Confirm the exact cohort, schedule, facilities, fees, and included support.' },
      { question: 'What does the certificate mean?', answer: 'Ask for the current certificate wording and issuing entity before enrolling. A program-completion certificate should not be described as a university degree, CFA charter, CA qualification, or external regulatory credential unless the provider can document that claim.' },
      { question: 'What are the fees and refund terms?', answer: 'Fees, taxes, instalment options, cohort timing, and refund or cancellation terms can change. Request the current written terms and read the published refund policy before paying.' },
      { question: 'How does the 100% Job Guarantee Program work?', answer: 'The current published placement page contains the scope and conditions of the Job Guarantee Program. Read those terms carefully; do not assume a module-level promise, employer, salary, city, or role outcome beyond the written terms.' },
      { question: 'What should I compare before joining?', answer: 'Compare the current syllabus, live or recorded format, practical work, assessments, certificate wording, schedule, total cost, refund terms, support duration, eligibility, and guarantee conditions. Ask questions in writing when a decision depends on a specific promise.' },
    ],
    relatedRouteIds: ['courses', 'courses-banking-and-finance', 'courses-banking-courses', 'placements', 'contact', 'comparison-online-vs-offline-finance-training'],
  }),
]);

export const PRIORITY_NON_ARTICLE_ROUTES = Object.freeze([
  ...PRIORITY_LANDING_PAGES.map((page) => ({
    id: page.routeId, parentId: page.parentId, path: page.path, title: page.title, description: page.description, h1: page.h1, breadcrumbLabel: page.breadcrumbLabel,
    schemaType: 'WebPage', landingPageId: page.id, keywordPurpose: 'Commercial topic and career-direction landing page', primaryKeyword: page.primaryKeyword, keywordOwnerUrl: null,
    image: page.image, imageAlt: page.imageAlt, ...imageDimensions(page.image), indexable: true, lastModified: page.updatedAt,
  })),
  ...PRIORITY_COMPARISON_PAGES.map((page) => ({
    id: page.routeId, parentId: page.parentId, path: page.path, title: page.title, description: page.description, h1: page.h1, breadcrumbLabel: page.breadcrumbLabel,
    schemaType: 'WebPage', comparisonPageId: page.id, comparison: true, keywordPurpose: 'Decision-support comparison page', primaryKeyword: page.primaryKeyword, keywordOwnerUrl: null,
    image: page.image, imageAlt: page.imageAlt, ...imageDimensions(page.image), indexable: true, lastModified: page.updatedAt,
  })),
  ...PRIORITY_FAQ_PAGES.map((page) => ({
    id: page.routeId, parentId: page.parentId, path: page.path, title: page.title, description: page.description, h1: page.h1, breadcrumbLabel: page.breadcrumbLabel,
    schemaType: 'WebPage', faqPageId: page.id, keywordPurpose: 'Program trust and decision-support FAQ page', primaryKeyword: page.primaryKeyword, keywordOwnerUrl: null,
    image: page.image, imageAlt: page.imageAlt, ...imageDimensions(page.image), indexable: true, lastModified: page.updatedAt,
  })),
]);

export function getPriorityLandingPage(id) {
  return PRIORITY_LANDING_PAGES.find((page) => page.id === id || page.routeId === id) || null;
}

export function getPriorityComparisonPage(id) {
  return PRIORITY_COMPARISON_PAGES.find((page) => page.id === id || page.routeId === id) || null;
}

export function getPriorityFaqPage(id) {
  return PRIORITY_FAQ_PAGES.find((page) => page.id === id || page.routeId === id) || null;
}
