import { getKeywordOwnership } from './seo/keywordStrategy.js';
import { TOPIC_PROGRAM_REVIEW_DATE } from './topicProgramPaths.js';

function paragraph(text) {
  return { type: 'paragraph', text };
}

function heading(text, level = 2) {
  return { type: 'heading', level, text };
}

function list(items, ordered = false) {
  return { type: 'list', ordered, items };
}

function faq(question, answer) {
  return { type: 'faq', question, answer };
}

function link(label, href, routeId) {
  return { type: 'link', label, href, routeId };
}

function createModule({ id, routeId, path, title, description, h1, breadcrumbLabel, body }) {
  const ownership = getKeywordOwnership(path);
  if (!ownership) throw new Error(`No approved keyword ownership found for module path: ${path}`);

  return Object.freeze({
    id,
    routeId,
    path,
    title,
    description,
    h1,
    breadcrumbLabel,
    primaryKeyword: ownership.primaryKeyword,
    secondaryKeywords: ownership.secondaryKeywords,
    body: Object.freeze(body),
    updatedAt: TOPIC_PROGRAM_REVIEW_DATE,
  });
}

export const INFORMATIONAL_MODULES = Object.freeze([
  createModule({
    id: 'kyc-aml-compliance',
    routeId: 'kyc-aml-compliance',
    path: '/courses/kyc-aml/',
    title: 'KYC and AML Learning Module | Centaur Careers',
    description: 'Understand customer due diligence, screening, transaction monitoring, and compliance workflows taught within Centaur Careers’ Financial Operations Masterclass.',
    h1: 'KYC & AML Compliance Learning Module',
    breadcrumbLabel: 'KYC & AML Compliance',
    body: [
      paragraph('A KYC AML course is most useful when it explains how customer information, risk checks, review evidence, and escalation fit together. This page introduces those ideas as a learning guide to the KYC / AML Compliance module in Centaur Careers’ Financial Operations Masterclass; it is not a separate course offer.'),
      heading('What KYC and AML operations involve'),
      paragraph('Know your customer training begins with understanding the purpose of customer identification and due diligence. In an operations setting, staff may review information, check required records, identify gaps, document decisions, and route cases using the organisation’s approved process. Anti money laundering course India searches often combine several different topics, so compare the actual syllabus rather than relying on a label.'),
      list([
        'Customer due diligence (CDD): collect and assess the information required by the applicable process.',
        'Enhanced due diligence (EDD): follow additional review steps when a case is assigned higher scrutiny under policy.',
        'Screening and periodic review: record results, resolve mismatches, and escalate potential concerns for authorised review.',
        'Transaction monitoring: review alerts, gather relevant context, document reasoning, and route cases under internal controls.',
        'Regulatory reporting: understand that reporting obligations and decisions belong to the regulated organisation and authorised personnel.',
      ]),
      heading('Skills explored in KYC AML training'),
      paragraph('KYC compliance training and AML compliance training share habits such as careful evidence handling, consistent checklist use, clear case notes, confidentiality, and timely escalation. A CDD analyst course or EDD analyst course should help a learner distinguish the review objective from the documents or signals used to support it. A transaction monitoring course should explain alert triage and case documentation without suggesting that one workflow applies to every institution.'),
      paragraph('These foundations can support people exploring a KYC analyst course, an AML analyst course, a compliance analyst course, or broader financial crime compliance course topics. Employer procedures, local requirements, product risks, and role responsibilities vary; this material is educational and is not legal or regulatory advice.'),
      heading('How this module relates to the Masterclass'),
      paragraph('KYC / AML Compliance is one subject within the Financial Operations Masterclass, alongside investment banking operations, retail banking, digital payments, finance operations, and FinTech. The program—not this topic page—is the current Centaur offering. Review the published program and placement terms for the complete scope, eligibility, and delivery details.'),
      faq('Is this a KYC AML certification course?', 'No separate KYC or AML certification is offered on this page. KYC / AML is a module within the Financial Operations Masterclass. Any course-completion certificate relates to the full program and its current terms; it is not an external regulatory or professional credential.'),
      faq('What should I compare when looking for a KYC AML course in India?', 'Check whether the syllabus covers due diligence, screening, monitoring, case documentation, controls, and escalation; whether practice is included; and what credential, delivery, and support terms apply. Confirm current provider information directly.'),
      faq('Is a KYC AML course online available through Centaur?', 'This page does not promise a separate online course. Check the Financial Operations Masterclass page and contact Centaur Careers to confirm the current cohort, learning mode, and availability.'),
      faq('Does a KYC AML course with placement assistance exist at Centaur?', 'Centaur Careers offers the Financial Operations Masterclass, with KYC / AML taught as one module. Career support and the 100% Job Guarantee Program apply to the full program under its published terms, not as a separate module-level promise.'),
      faq('How does an AML KYC analyst course differ from a financial crime compliance course?', 'The labels overlap in the market. Compare the underlying learning outcomes: customer onboarding and review, screening, monitoring, investigations, control documentation, and escalation. Course names alone do not establish credential recognition or job eligibility.'),
    ],
  }),
  createModule({
    id: 'digital-payments',
    routeId: 'digital-payments',
    path: '/courses/digital-payments/',
    title: 'Digital Payments Learning Module | Centaur Careers',
    description: 'Explore payment processing, reconciliation, disputes, and exception handling as topics within Centaur Careers’ Financial Operations Masterclass.',
    h1: 'Digital Payments Learning Module',
    breadcrumbLabel: 'Digital Payments',
    body: [
      paragraph('A digital payments course should explain what happens around a transaction—not only name payment rails. This learning page introduces operations concepts covered within the Digital Payments module of Centaur Careers’ Financial Operations Masterclass. It is not a separately enrolled course.'),
      heading('From payment instruction to resolution'),
      paragraph('A payment operations team may validate instructions, follow a transaction status, reconcile records, investigate a delayed or failed item, and document how an exception was resolved. The precise steps depend on the rail, participating institutions, product, and current operating rules.'),
      list([
        'Recognise common payment lifecycle stages and the parties involved.',
        'Read transaction references, timestamps, amounts, and status changes consistently.',
        'Compare internal records with statements or partner records to identify a mismatch.',
        'Support dispute or exception handling with traceable evidence and clear escalation.',
        'Apply maker-checker, access, and record-keeping controls as defined by the organisation.',
      ]),
      heading('What digital payments training can cover'),
      paragraph('Centaur’s published module topics include SWIFT, RTGS, UPI / IMPS operations, payment disputes, and wallet reconciliations. A digital payments operations course should distinguish payment processing from product design, software engineering, and regulatory decision-making; job descriptions may combine these responsibilities differently.'),
      link('Read NPCI’s UPI FAQs', 'https://www.npci.org.in/what-we-do/upi/faqs'),
      link('Read RBI’s payment systems chapter', 'https://rbi.org.in/scripts/PublicationsView.aspx?id=22459'),
      faq('Is this a digital payments certification?', 'No standalone digital payments certification is offered here. Digital Payments is a module within the Financial Operations Masterclass. A certificate, if issued, relates to completion of the full program under its current terms and is not an external credential.'),
      faq('Who may find digital payments training useful?', 'Graduates and career explorers interested in payment processing, transaction support, reconciliation, disputes, or operational controls may use these topics to understand the field. Check the requirements of current roles before choosing what to study.'),
      faq('Does Centaur offer a separate digital payments operations course?', 'No. Digital Payments is taught as a subject within the Financial Operations Masterclass. The program page describes the current offering, learning modes, and participation information.'),
    ],
  }),
  createModule({
    id: 'fintech-neo-banking',
    routeId: 'fintech-neo-banking',
    path: '/courses/fintech/',
    title: 'FinTech Operations Module for Graduates | Centaur Careers',
    description: 'Learn how digital financial services connect with product operations, compliance, customer processes, and payments within the Financial Operations Masterclass.',
    h1: 'FinTech Learning Module for Graduates',
    breadcrumbLabel: 'FinTech',
    body: [
      paragraph('A fintech course for graduates can be a useful starting point when it connects financial products with the operational work behind them. At Centaur Careers, FinTech & Neo-Banking is one module within the Financial Operations Masterclass, not a separately offered course or credential.'),
      heading('FinTech as an operating environment'),
      paragraph('Financial technology can change how customers access services and how institutions manage onboarding, transactions, servicing, controls, and support. A fintech operations course should help learners ask practical questions: which customer or business process is involved, what information moves through it, where can an exception occur, and how is it recorded and escalated?'),
      link('Read the RBI overview of FinTech', 'https://fintech.rbi.org.in/'),
      list([
        'Digital lending and customer-journey operations.',
        'Product operations and coordination between business, service, risk, and technology teams.',
        'Compliance operations, onboarding checks, and controlled case handling.',
        'Customer-success workflows, service requests, and issue resolution.',
        'Connections between FinTech products and digital-payment processes.',
      ]),
      heading('FinTech training for freshers: what to check'),
      paragraph('When comparing fintech training for freshers, look for clear learning outcomes, practice with realistic process examples, a transparent delivery plan, and honest credential wording. The course name should not imply software-engineering depth, external accreditation, or employer recognition unless the provider can document it.'),
      faq('Is this a fintech certification in India?', 'This page does not offer a separate FinTech certification. FinTech is taught as a module within the Financial Operations Masterclass. Any course-completion certificate applies to the full program under its published terms and is not an external FinTech credential.'),
      faq('What should I verify in a search for “fintech certification India”?', 'Check the credential issuer, accreditation claim, assessment method, and recognition evidence. The phrase itself does not establish that a program awards an external certification; this Centaur page describes a Masterclass module.'),
      faq('Who is this fintech course for graduates page intended for?', 'It is an informational introduction for graduates exploring financial-services operations and technology-enabled workflows. Confirm current eligibility and the complete program details with Centaur Careers.'),
      faq('Does the module guarantee a FinTech job?', 'No module-specific employment outcome is promised here. The published 100% Job Guarantee Program applies to the Financial Operations Masterclass under its stated terms; read the placement page for its complete scope.'),
    ],
  }),
]);

export function getInformationalModule(id) {
  return INFORMATIONAL_MODULES.find((module) => module.id === id || module.routeId === id) || null;
}
