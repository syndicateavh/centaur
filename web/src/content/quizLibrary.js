// The quiz library is intentionally organised as a curriculum, not as a
// keyword list. Every topic produces ten different assessment angles so the
// resulting question pages remain useful to learners and interview candidates.

const RBI = 'https://www.rbi.org.in/';
const SEBI = 'https://investor.sebi.gov.in/securities-stockmarket.html';
const NPCI = 'https://www.npci.org.in/product/upi';
const FATF = 'https://www.fatf-gafi.org/en/publications/Fatfrecommendations/Fatf-recommendations.html';

function topic(id, name, definition, purpose, workflow, control, risk, skill, evidence, related) {
  return Object.freeze({ id, name, definition, purpose, workflow, control, risk, skill, evidence, related });
}

function domain(id, label, primaryKeyword, summary, keywords, topics, sources) {
  return Object.freeze({
    id,
    slug: id,
    label,
    primaryKeyword,
    summary,
    keywords: Object.freeze([primaryKeyword, ...keywords]),
    hashtags: Object.freeze([`#${id.replaceAll('-', '')}`, '#BankingQuiz', '#FinanceCareers']),
    topics: Object.freeze(topics),
    sources: Object.freeze(sources),
  });
}

export const FINANCE_QUIZ_DOMAINS = Object.freeze([
  domain(
    'investment-banking-operations',
    'Investment Banking Operations',
    'investment banking operations quiz',
    'Test trade lifecycle, settlement, reconciliation, corporate-action, and post-trade operations knowledge for entry-level finance roles.',
    ['trade lifecycle quiz', 'settlement operations questions', 'investment banking interview practice', 'post-trade operations assessment'],
    [
      topic('trade-lifecycle', 'Trade lifecycle', 'the controlled path from trade execution and capture through confirmation, clearing, settlement, and post-settlement controls', 'connects front-office activity with accurate downstream processing and exception management', 'capture the trade, confirm the economics, clear obligations, settle deliverables, then reconcile and resolve exceptions', 'maintain complete trade identifiers, dates, statuses, and ownership at each stage', 'a missing or incorrect field can delay matching, settlement, reporting, or escalation', 'explain a process in sequence and identify upstream and downstream dependencies', 'trade record, confirmation, settlement status, exception queue, and reconciliation evidence', 'trade capture'),
      topic('trade-capture', 'Trade capture', 'the recording of executed transaction details in the authorised system of record', 'gives downstream teams a reliable starting point for confirmation and settlement', 'receive execution details, validate required fields, record the trade, and monitor downstream status', 'compare key economics against the approved source and restrict unauthorised amendments', 'incomplete or duplicate capture can create breaks and incorrect obligations', 'attention to detail and controlled data entry', 'execution message, trade ticket, timestamps, product fields, and amendment history', 'trade confirmation'),
      topic('trade-confirmation', 'Trade confirmation', 'the process of checking that relevant parties agree on the transaction details', 'reduces ambiguity before clearing and settlement', 'compare instrument, quantity, price, dates, parties, and instructions, then investigate mismatches', 'retain confirmation status, matching evidence, and escalation ownership', 'an unconfirmed trade may fail later because parties are working from different data', 'structured comparison and clear communication', 'confirmation message, matching status, exception notes, and counterparty response', 'trade affirmation'),
      topic('trade-affirmation', 'Trade affirmation', 'the validation or agreement of transaction details before later processing', 'creates confidence that the data used for clearing and settlement is agreed', 'send or receive affirmation data, compare responses, resolve differences, and record the result', 'use approved affirmation channels, cut-offs, and escalation rules', 'late or disputed affirmation can leave a trade at risk of missing settlement', 'timeline management and exception investigation', 'affirmation record, timestamp, response status, and unresolved difference', 'trade confirmation'),
      topic('settlement-operations', 'Settlement operations', 'the controlled completion of the exchange of cash, securities, or other contractual deliverables', 'ensures obligations are completed on the expected date and in the expected accounts', 'check instructions and availability, monitor matching, process delivery or payment, and record completion', 'validate settlement instructions and monitor cut-offs, fails, and aged items', 'insufficient assets, cash, incorrect instructions, or timing can cause a settlement fail', 'prioritisation, reconciliation, and escalation discipline', 'settlement status, account details, market messages, availability, and fail reason', 'standing settlement instructions'),
    ],
    [
      { label: 'Reserve Bank of India', url: RBI },
      { label: 'SEBI Investor securities-market material', url: SEBI },
    ],
  ),
  domain(
    'capital-markets',
    'Capital Markets',
    'capital markets quiz for finance students',
    'Build practical knowledge of securities markets, equities, bonds, derivatives, and market infrastructure through 50 questions.',
    ['securities market quiz', 'equity market questions', 'bond market assessment', 'capital markets interview questions'],
    [
      topic('primary-market', 'Primary market', 'the market in which new securities are issued to investors', 'helps issuers raise capital and gives investors access to a new offering', 'prepare the offering, complete approvals and disclosures, allocate securities, and settle investor subscriptions', 'review approved documents, allocation records, investor data, and payment status', 'inaccurate allocation or incomplete disclosures can create investor and settlement issues', 'distinguish issuance activity from later trading', 'offering document, application record, allocation statement, and settlement confirmation', 'secondary market'),
      topic('secondary-market', 'Secondary market', 'the market in which already-issued securities are traded between investors', 'provides liquidity and price discovery after the original issuance', 'receive orders, match or execute them, confirm details, clear obligations, settle, and reconcile', 'maintain order, execution, client, and settlement records with appropriate controls', 'incorrect trade data or failed settlement can affect clients and market records', 'market terminology and process mapping', 'order record, execution report, confirmation, and settlement status', 'primary market'),
      topic('equities', 'Equities', 'ownership interests in a company represented by shares or similar instruments', 'allow investors to participate in a company\'s capital and, subject to the terms, its distributions', 'capture the trade, confirm quantity and price, settle the shares and cash, and process relevant events', 'check instrument identifiers, quantity, price, market, and corporate-action eligibility', 'wrong security or quantity can affect ownership records and entitlements', 'instrument identification and numerical accuracy', 'trade confirmation, holding record, price, and event notice', 'bonds'),
      topic('fixed-income', 'Fixed-income securities', 'debt instruments that create contractual payment or redemption terms', 'allow issuers to borrow and investors to receive defined contractual cash flows', 'capture issue or trade details, calculate relevant amounts, settle, accrue, and monitor payments', 'validate coupon, maturity, day-count, currency, and payment fields', 'incorrect terms can lead to wrong accruals, cash flows, or settlement amounts', 'date, rate, and cash-flow reasoning', 'term sheet, trade details, payment schedule, and accrual calculation', 'derivatives'),
      topic('derivatives', 'Derivatives', 'contracts whose value is linked to an underlying asset, rate, index, or event', 'help eligible participants manage exposure or obtain market exposure under defined terms', 'capture contract terms, confirm them, manage margin or collateral where relevant, settle cash flows, and reconcile', 'validate underlying, notional, dates, strike, currency, and counterparty data', 'a wrong term can materially change exposure, valuation, or settlement', 'careful reading of contractual fields and escalation of uncertainty', 'trade confirmation, valuation input, margin call, and lifecycle event record', 'fixed-income securities'),
    ],
    [
      { label: 'SEBI Investor securities-market material', url: SEBI },
      { label: 'Reserve Bank of India', url: RBI },
    ],
  ),
  domain(
    'asset-management-operations',
    'Asset Management Operations',
    'asset management operations quiz',
    'Practise fund operations, NAV, portfolio records, unit pricing, and performance-reporting concepts for asset-management roles.',
    ['fund operations questions', 'NAV calculation quiz', 'portfolio operations interview questions', 'asset management fresher test'],
    [
      topic('fund-accounting', 'Fund accounting', 'the accounting and control work used to record a fund\'s assets, liabilities, income, expenses, and transactions', 'supports reliable fund valuation, reporting, and investor servicing', 'capture activity, value assets, record expenses and income, reconcile records, and produce controlled outputs', 'review source data, valuation inputs, journals, reconciliations, and approval evidence', 'a missing transaction or incorrect valuation input can affect NAV and investor records', 'reconciliation and financial-record discipline', 'portfolio statement, bank record, journal, valuation file, and review sign-off', 'NAV calculation'),
      topic('nav-calculation', 'Net asset value calculation', 'the calculation of a fund\'s net assets after considering assets and liabilities, often per unit or share', 'provides a basis for valuation, subscriptions, redemptions, and reporting', 'collect prices and positions, recognise income and expenses, calculate net assets, divide by units, and review', 'apply approved pricing sources, cut-offs, tolerance checks, and independent review', 'incorrect pricing, units, or liabilities can produce an inaccurate NAV', 'numerical accuracy and source validation', 'price source, position record, liability schedule, units, calculation, and exception report', 'unit pricing'),
      topic('portfolio-operations', 'Portfolio operations', 'the process work that keeps investment positions, transactions, cash, and reference data accurate', 'helps an asset manager understand and control portfolio activity', 'capture transactions, update positions, process cash, reconcile statements, and report exceptions', 'compare internal holdings and cash to custodian or broker records', 'position or cash breaks can distort reporting and investor outcomes', 'record comparison and issue ownership', 'custody statement, broker confirmation, position file, and cash reconciliation', 'fund accounting'),
      topic('unit-pricing', 'Unit pricing', 'the process of determining the price at which fund units are issued, redeemed, or valued under the product rules', 'applies consistent valuation and dealing terms to investor activity', 'complete the valuation, apply dealing terms, calculate the unit price, validate, publish, and record', 'control valuation time, price sources, rounding, approvals, and correction procedures', 'a pricing error can affect multiple investor transactions', 'process discipline and impact assessment', 'valuation pack, unit calculation, dealing record, approval, and correction log', 'NAV calculation'),
      topic('performance-reporting', 'Performance reporting', 'the preparation of controlled information about portfolio or fund performance over a stated period', 'helps clients and managers understand returns, benchmarks, and changes', 'collect validated data, select the period and methodology, calculate measures, review, and publish', 'document inputs, methodology, benchmark, period, and review evidence', 'inconsistent data or methodology can make comparisons misleading', 'clear numerical communication and version control', 'performance file, benchmark source, methodology note, and approval record', 'portfolio operations'),
    ],
    [
      { label: 'SEBI Investor securities-market material', url: SEBI },
      { label: 'Reserve Bank of India', url: RBI },
    ],
  ),
  domain(
    'corporate-actions-operations',
    'Corporate Actions Operations',
    'corporate actions operations quiz',
    'Learn how dividends, splits, rights issues, mergers, and elections affect securities operations and investor entitlements.',
    ['corporate actions questions', 'dividend operations quiz', 'stock split interview questions', 'securities event processing'],
    [
      topic('dividends', 'Dividends', 'distributions declared by an issuer to eligible holders under stated event terms', 'ensures eligible positions receive the correct cash or stock entitlement', 'capture the event, determine eligibility, calculate entitlement, process cash or stock, and reconcile', 'validate key dates, position data, rate, currency, tax treatment where applicable, and payment evidence', 'wrong record dates or rates can create incorrect entitlements and client complaints', 'date, rate, and position reasoning', 'issuer notice, position file, calculation, payment record, and reconciliation', 'corporate-action elections'),
      topic('stock-splits', 'Stock splits', 'an issuer event that changes the number of units and the relationship between units and price', 'updates positions accurately while preserving the event economics', 'capture event terms, identify eligible holdings, apply the ratio, update positions, and reconcile', 'check ratio, effective date, instrument identifiers, rounding, and post-event balances', 'a wrong ratio or security mapping can distort holdings', 'numerical checking and event-date control', 'issuer notice, eligible position, ratio, updated balance, and exception report', 'dividends'),
      topic('rights-issues', 'Rights issues', 'an offer that gives eligible holders rights to subscribe for additional securities under defined terms', 'processes elections, entitlements, payments, and resulting positions accurately', 'capture terms, determine eligibility, notify or route instructions, process elections, and reconcile', 'control election deadlines, instructions, payment status, and entitlement calculations', 'missed cut-offs or wrong elections can affect investor rights', 'deadline management and instruction validation', 'issuer notice, entitlement, election, payment, and allocation record', 'mergers and reorganisations'),
      topic('mergers-reorganisations', 'Mergers and reorganisations', 'issuer events that alter securities, ownership, cash, or the structure of an investment', 'updates positions and entitlements when an issuer changes', 'capture terms, identify eligible positions, process cash or stock consideration, and reconcile', 'validate event terms, effective date, security mapping, and client or fund impact', 'incorrect mapping can produce wrong positions or consideration', 'reading event notices and tracing downstream effects', 'event notice, mapping table, position update, cash record, and approval', 'stock splits'),
      topic('corporate-action-elections', 'Corporate-action elections', 'instructions from eligible holders about choices available under a voluntary event', 'ensures the holder\'s authorised choice is captured and processed on time', 'receive instruction, authenticate and validate it, record the election, submit it, and confirm the outcome', 'control authority, deadline, instruction completeness, and confirmation', 'late or unauthorised elections can create financial loss or complaints', 'instruction checking and deadline control', 'client instruction, timestamp, election status, submission proof, and result', 'rights issues'),
    ],
    [
      { label: 'SEBI Investor securities-market material', url: SEBI },
      { label: 'Reserve Bank of India', url: RBI },
    ],
  ),
  domain(
    'retail-banking-operations',
    'Retail Banking Operations',
    'retail banking operations quiz',
    'Assess knowledge of customer onboarding, branches, deposits, service operations, and NRI banking for retail finance roles.',
    ['retail banking interview questions', 'branch operations quiz', 'banking fresher assessment', 'customer onboarding questions'],
    [
      topic('customer-onboarding', 'Customer onboarding', 'the controlled process of opening a banking relationship after collecting and reviewing required information', 'establishes an accurate and compliant customer record', 'collect information, verify identity, assess risk, approve or decline, open the account, and communicate', 'validate mandatory fields, documents, approvals, and record retention', 'incomplete or inaccurate data can create service, compliance, and fraud risks', 'documentation accuracy and customer communication', 'application, identity evidence, review decision, account status, and audit trail', 'KYC review'),
      topic('branch-operations', 'Branch operations', 'the service and processing work that supports customers and controlled transactions at a branch', 'delivers reliable account service while protecting cash, records, and customer information', 'receive request, authenticate customer, process service or transaction, update record, and close the request', 'separate duties, verify authority, balance records, and document exceptions', 'cash, identity, or processing errors can affect customers and the bank', 'service discipline and control awareness', 'request record, authentication, transaction receipt, balance, and supervisor review', 'customer service requests'),
      topic('deposit-accounts', 'Deposit accounts', 'bank accounts that hold customer funds under agreed product terms', 'provide safe custody, payment access, and interest or service features where applicable', 'open the account, receive deposits, process withdrawals or transfers, calculate applicable interest, and report', 'reconcile account balances, restrict access, and validate transactions', 'unreconciled postings or unauthorised access can affect customer funds', 'numerical accuracy and careful customer support', 'account statement, transaction record, balance, product terms, and exception', 'branch operations'),
      topic('customer-service-requests', 'Customer service requests', 'tracked requests such as address changes, statements, account maintenance, or issue resolution', 'gives customers a clear owner, status, and outcome', 'log request, verify authority, assign owner, complete action, communicate, and close with evidence', 'use request identifiers, service-level monitoring, and maker-checker controls where needed', 'untracked requests can be lost, delayed, or closed incorrectly', 'clear writing, prioritisation, and handover', 'request ID, identity check, status, action record, and closure evidence', 'branch operations'),
      topic('nri-banking', 'NRI banking', 'banking services for non-resident customers with product and cross-border requirements', 'serves customers while applying the relevant account, documentation, exchange, and tax processes', 'identify status, collect documents, apply product rules, process service, and maintain records', 'validate residency, account type, authorised instructions, and current process requirements', 'incorrect status or documentation can create customer and compliance issues', 'cross-border process awareness and precise communication', 'customer status, account form, instruction, approval, and service record', 'customer onboarding'),
    ],
    [
      { label: 'Reserve Bank of India', url: RBI },
      { label: 'RBI customer education', url: RBI },
    ],
  ),
  domain(
    'lending-credit-operations',
    'Lending and Credit Operations',
    'lending and credit operations quiz',
    'Practise loan processing, credit analysis, repayment, collateral, and collections scenarios for banking and NBFC roles.',
    ['credit analyst quiz', 'loan processing questions', 'lending operations interview', 'NBFC credit assessment'],
    [
      topic('loan-processing', 'Loan processing', 'the controlled workflow from loan application and document collection through decision and fulfilment', 'moves a credit request through accurate, reviewable stages', 'intake application, validate documents, assess eligibility, complete credit review, decide, and fulfil', 'track status, required documents, approvals, conditions, and disbursement evidence', 'missing documents or wrong status can cause inappropriate decisions or delays', 'workflow tracking and document review', 'application, document checklist, credit decision, approval, and disbursement record', 'credit analysis'),
      topic('credit-analysis', 'Credit analysis', 'the assessment of repayment capacity, financial condition, purpose, and relevant risk evidence', 'supports a reasoned credit decision under lender policy', 'collect data, validate sources, analyse income and obligations, assess risk, and document conclusion', 'use approved data sources, consistent calculations, independent review, and exception escalation', 'incorrect or stale information can lead to unsuitable credit decisions', 'financial analysis and balanced judgement', 'financial statement, bureau or banking data, calculation, policy check, and recommendation', 'risk management'),
      topic('repayment-capacity', 'Repayment capacity', 'the borrower\'s ability to meet scheduled obligations from reliable income or cash flow', 'helps assess whether proposed credit is affordable and sustainable', 'review income, expenses, existing obligations, loan terms, buffers, and sensitivity where required', 'validate income evidence, assumptions, debt obligations, and approval thresholds', 'overstated income or missed obligations can increase default risk', 'numerical reasoning and evidence-based review', 'income proof, bank statements, debt schedule, affordability calculation, and review notes', 'EMI calculation'),
      topic('collateral-management', 'Collateral management', 'the controlled recording, valuation, documentation, and monitoring of assets supporting credit', 'helps protect the lender\'s position and track conditions of the facility', 'identify collateral, verify documents, value it, record details, monitor conditions, and release or enforce', 'control ownership, valuation dates, insurance, documentation, and approval', 'wrong ownership or stale valuation can weaken the protection expected', 'document control and exception follow-up', 'title or pledge document, valuation report, insurance, system record, and approval', 'loan processing'),
      topic('collections-operations', 'Collections operations', 'the structured contact, arrangement, tracking, and escalation work for overdue credit', 'supports fair and controlled recovery while maintaining accurate account status', 'identify overdue account, review status, contact appropriately, record outcome, arrange or escalate, and monitor', 'use approved contact, privacy, hardship, escalation, and recordkeeping procedures', 'poor records or inappropriate contact can create customer and conduct risk', 'empathetic communication and accurate case notes', 'delinquency status, contact record, arrangement, payment, and escalation', 'risk management'),
    ],
    [
      { label: 'Reserve Bank of India', url: RBI },
      { label: 'RBI customer education', url: RBI },
    ],
  ),
  domain(
    'corporate-commercial-banking',
    'Corporate and Commercial Banking',
    'corporate banking operations quiz',
    'Explore corporate banking relationships, cash management, working capital, trade services, and client onboarding.',
    ['corporate banking interview questions', 'commercial banking quiz', 'cash management operations', 'working capital finance questions'],
    [
      topic('relationship-management', 'Corporate relationship management', 'the structured management of a business client relationship across needs, products, service, and risk', 'coordinates useful banking support while maintaining accurate client information', 'understand client activity, assess needs, coordinate products, monitor service, and review risk', 'maintain client records, approvals, service ownership, and conflict or escalation controls', 'a weak client record can affect service, risk assessment, and suitability', 'commercial awareness and stakeholder communication', 'client profile, meeting note, product request, approval, and service review', 'client onboarding'),
      topic('cash-management', 'Cash management', 'services and operations that help businesses collect, hold, move, and monitor cash', 'improves visibility and control over business liquidity and payments', 'set up services, receive instructions, process payments or collections, reconcile, and report', 'authenticate instructions, manage limits, segregate duties, and reconcile balances', 'wrong instructions or unreconciled cash can create financial and operational exposure', 'payment process understanding and control discipline', 'mandate, instruction, limit, payment record, reconciliation, and exception', 'payment operations'),
      topic('working-capital', 'Working capital finance', 'funding and process support for a business\'s short-term operating needs', 'helps businesses manage timing between receivables, inventory, payables, and cash', 'understand cycle, review data, structure facility, monitor usage, and manage repayment', 'check borrowing base, eligibility, limits, documentation, and reporting', 'stale receivables or excessive usage can increase credit risk', 'business-process and financial-statement understanding', 'receivables ageing, inventory data, limit record, utilisation, and review', 'credit analysis'),
      topic('business-client-onboarding', 'Business client onboarding', 'the controlled process for establishing a corporate banking relationship and its authorised users', 'creates a reliable legal, ownership, product, and authority record', 'collect entity information, verify ownership and authority, assess risk, approve, and activate services', 'validate beneficial ownership, mandates, signatures, and access rights', 'wrong authority or ownership data can create fraud and compliance risk', 'entity-document review and careful escalation', 'incorporation record, ownership chart, mandate, ID, approval, and access log', 'beneficial ownership'),
      topic('service-level-management', 'Corporate service-level management', 'the monitoring and coordination of service commitments for a business client', 'keeps requests visible, owned, prioritised, and communicated', 'log issue, assess impact, assign owner, track progress, communicate, and close with evidence', 'measure ageing, escalation, root cause, and repeat issues', 'unmanaged ageing can disrupt client operations and relationship trust', 'prioritisation and concise stakeholder updates', 'case ID, service timestamp, owner, communication, resolution, and root cause', 'customer-service requests'),
    ],
    [
      { label: 'Reserve Bank of India', url: RBI },
      { label: 'RBI customer education', url: RBI },
    ],
  ),
  domain(
    'trade-finance-operations',
    'Trade Finance Operations',
    'trade finance operations quiz',
    'Assess letters of credit, documentary collections, shipping documents, export finance, and trade-compliance process knowledge.',
    ['letter of credit quiz', 'trade finance interview questions', 'documentary collections assessment', 'export finance operations'],
    [
      topic('letters-of-credit', 'Letters of credit', 'a bank-supported trade arrangement in which payment depends on complying documents and stated terms', 'reduces certain payment risks between trading parties when used and examined correctly', 'issue or receive terms, present documents, examine compliance, resolve discrepancies, and pay or refuse under rules', 'control document checklist, presentation date, authorised decision, and discrepancy record', 'a missing or inconsistent document can delay or affect payment', 'documentary examination and rule-based judgement', 'credit instrument, presentation, document checklist, discrepancy, and decision', 'documentary collections'),
      topic('documentary-collections', 'Documentary collections', 'a trade process in which banks handle documents and instructions for payment or acceptance without the same payment undertaking as a letter of credit', 'supports document-controlled trade settlement while leaving different risks with the parties', 'receive documents, check instructions, present through banks, collect or obtain acceptance, and report outcome', 'follow instructions, release rules, charges, and exception procedures', 'misunderstanding the bank\'s role can create payment or document risk', 'process comparison and precise communication', 'collection instruction, document set, presentation, payment or acceptance, and status', 'letters of credit'),
      topic('shipping-documents', 'Shipping documents', 'documents that evidence shipment, goods, transport, or title in a trade transaction', 'supports documentary processing and helps establish whether stated requirements are met', 'receive documents, identify required fields, examine consistency, record discrepancies, and route', 'use a controlled checklist and preserve document version and reviewer evidence', 'inconsistent names, dates, quantities, or transport details can create a discrepancy', 'focused document comparison', 'invoice, bill of lading, insurance, packing list, and review checklist', 'letters of credit'),
      topic('export-finance', 'Export finance', 'funding and operational support connected with a business selling goods or services abroad', 'helps manage cash-flow timing between shipment, documents, payment, and working-capital needs', 'understand transaction, verify documents, assess facility, process funds, and monitor repayment', 'check eligibility, documents, sanctions, limits, and payment evidence', 'cross-border information gaps can increase credit and compliance risk', 'trade-flow understanding and document discipline', 'export contract, shipping record, facility approval, payment, and monitoring report', 'working capital finance'),
      topic('trade-compliance', 'Trade compliance', 'the controls used to identify and manage legal, sanctions, export, and documentation risk in trade activity', 'supports lawful and controlled cross-border transactions', 'screen parties and goods where relevant, review documents, escalate alerts, and record decision', 'use current lists, approved screening, escalation, and evidence retention', 'a missed restricted party or goods issue can have serious consequences', 'careful screening and escalation judgement', 'screening result, party data, goods description, review notes, and disposition', 'sanctions screening'),
    ],
    [
      { label: 'Reserve Bank of India', url: RBI },
      { label: 'FATF Recommendations (CDD)', url: FATF },
    ],
  ),
  domain(
    'treasury-operations',
    'Treasury Operations',
    'treasury operations quiz',
    'Practise liquidity, asset-liability management, foreign exchange, money-market, and treasury risk questions.',
    ['treasury interview questions', 'liquidity management quiz', 'ALM operations assessment', 'foreign exchange operations questions'],
    [
      topic('liquidity-management', 'Liquidity management', 'the planning, monitoring, and control of available cash and funding against expected obligations', 'helps an organisation meet payments while managing the cost and risk of funding', 'forecast cash, monitor balances, arrange funding, invest surplus, and report exceptions', 'use current cash data, forecasts, limits, approvals, and contingency procedures', 'unexpected outflows or inaccurate forecasts can create funding pressure', 'numerical reasoning and prioritisation', 'cash forecast, bank balance, maturity profile, funding action, and limit report', 'asset-liability management'),
      topic('asset-liability-management', 'Asset-liability management', 'the management of timing, rate, liquidity, and other relationships between assets and liabilities', 'helps control balance-sheet exposure over different periods and scenarios', 'map balances and maturities, measure gaps, test scenarios, set actions, and report', 'use approved assumptions, limit monitoring, governance, and independent review', 'mismatch in timing or rates can affect earnings and liquidity', 'structured analysis and scenario thinking', 'maturity ladder, gap report, assumption, limit, and committee decision', 'interest-rate risk'),
      topic('foreign-exchange-operations', 'Foreign exchange operations', 'the processing and control work for transactions involving different currencies', 'ensures currency trades, payments, rates, and settlements are recorded correctly', 'capture trade, confirm currency and rate, settle accounts, revalue where relevant, and reconcile', 'validate currency pair, amount, rate, value date, counterparty, and settlement instruction', 'wrong currency or rate can create financial and settlement exposure', 'rate, date, and account accuracy', 'trade confirmation, rate source, value date, settlement record, and reconciliation', 'settlement operations'),
      topic('money-market', 'Money-market operations', 'short-term borrowing, lending, investment, and settlement activity', 'supports short-term liquidity and funding management', 'agree terms, capture instrument and maturity, settle funds, monitor maturity, and reconcile', 'control counterparty, rate, maturity, limits, confirmation, and cash settlement', 'missed maturity or wrong rate can affect liquidity and earnings', 'date management and financial product accuracy', 'deal ticket, confirmation, maturity, cash movement, and limit check', 'liquidity management'),
      topic('interest-rate-risk', 'Interest-rate risk', 'the potential effect of rate changes on earnings, value, cash flows, or funding cost', 'helps treasury understand and manage exposure to changing rates', 'identify exposures, apply assumptions, measure sensitivity or gaps, set limits, and escalate', 'use approved scenarios, data, limits, and governance records', 'model or data errors can understate exposure', 'quantitative reasoning and cautious interpretation', 'risk report, assumptions, sensitivity, limit, and action record', 'asset-liability management'),
    ],
    [
      { label: 'Reserve Bank of India', url: RBI },
      { label: 'RBI financial education', url: RBI },
    ],
  ),
  domain(
    'digital-payments-operations',
    'Digital Payments Operations',
    'digital payments operations quiz',
    'Test UPI, IMPS, RTGS, NEFT, SWIFT, and payment-exception knowledge for modern banking operations roles.',
    ['UPI quiz', 'digital payments interview questions', 'payment operations assessment', 'RTGS NEFT IMPS questions'],
    [
      topic('upi', 'UPI', 'an instant payment system developed by NPCI that supports interoperable account-to-account payment experiences', 'helps customers initiate digital payments through participating apps and institutions', 'authenticate request, validate payer and payee, route instruction, update status, and reconcile', 'control authentication, limits, status messages, dispute routing, and reconciliation', 'incorrect status or fraud can affect customer funds and trust', 'status investigation and customer communication', 'transaction reference, app and bank status, response code, and reconciliation record', 'IMPS'),
      topic('imps', 'IMPS', 'an electronic payment service used for near-real-time transfers through participating institutions', 'enables customers to transfer funds across supported channels', 'receive instruction, authenticate, process, return or complete, update status, and reconcile', 'validate beneficiary, limits, reference, response, and exception handling', 'a mismatch between customer, bank, and network status can cause disputes', 'transaction tracing and controlled escalation', 'reference number, timestamps, response, ledger entry, and case note', 'UPI'),
      topic('rtgs', 'RTGS', 'real-time gross settlement in which eligible transactions are settled individually in real time', 'supports high-value or time-sensitive transfers under the applicable system rules', 'validate instruction, perform checks, route transaction, settle, update status, and record', 'control beneficiary, amount, message, authorisation, and exception status', 'wrong account or incomplete message can delay or misdirect a transfer', 'payment-message accuracy and exception ownership', 'payment instruction, message, UTR or reference, status, and settlement record', 'NEFT'),
      topic('neft', 'NEFT', 'a payment system that processes received transactions in batches or cycles under the applicable operating model', 'supports electronic bank transfers for customers and institutions', 'receive instruction, authenticate, validate, include in processing cycle, update status, and reconcile', 'control account details, cycle status, returns, customer communication, and reconciliation', 'wrong details or a return can create delays and customer complaints', 'process timing and status explanation', 'instruction, cycle status, reference, return message, and ledger record', 'RTGS'),
      topic('swift-messaging', 'SWIFT messaging', 'standardised financial messaging used by institutions to exchange payment and transaction information', 'helps institutions communicate structured instructions and status across networks', 'create or receive message, validate fields, route, monitor response, and reconcile related records', 'control message format, authorisation, sanctions screening, and repair queues', 'wrong or incomplete message fields can delay processing', 'structured data review and message reasoning', 'message type, fields, validation, response, repair note, and settlement record', 'RTGS'),
    ],
    [
      { label: 'NPCI UPI product overview', url: NPCI },
      { label: 'Reserve Bank of India', url: RBI },
    ],
  ),
  domain(
    'payment-risk-and-reconciliation',
    'Payment Risk and Reconciliation',
    'payment reconciliation and dispute quiz',
    'Practise wallet reconciliation, payment disputes, chargebacks, fraud controls, and payment exception handling.',
    ['payment reconciliation quiz', 'chargeback operations questions', 'payment fraud analyst assessment', 'wallet operations interview'],
    [
      topic('payment-reconciliation', 'Payment reconciliation', 'the comparison of payment, ledger, bank, network, and settlement records that should agree', 'makes missing, duplicated, delayed, or misrouted activity visible', 'load records, match by identifiers and amounts, classify breaks, resolve or escalate, and report', 'use complete populations, matching rules, ageing, ownership, and evidence', 'unresolved breaks can hide financial loss or customer-impacting errors', 'investigation and root-cause analysis', 'source files, match result, break reason, ageing, owner, and resolution', 'wallet reconciliation'),
      topic('wallet-reconciliation', 'Wallet reconciliation', 'the comparison of wallet balances and activity with provider, ledger, and settlement records', 'protects the accuracy of digital-account balances and funding movements', 'extract records, match transactions, identify breaks, investigate, adjust through authority, and reconcile', 'control opening and closing balances, transaction identifiers, adjustments, and approvals', 'unapproved adjustments or missing transactions can distort customer balances', 'balance reasoning and evidence preservation', 'wallet ledger, provider file, settlement statement, adjustment, and approval', 'payment reconciliation'),
      topic('payment-disputes', 'Payment disputes', 'customer or participant cases alleging an unauthorised, failed, duplicated, or incorrect payment', 'provides a controlled method to investigate and resolve payment claims', 'intake claim, verify identity and transaction, gather evidence, route, decide, communicate, and close', 'protect customer data, preserve evidence, track ageing, and apply applicable rules', 'poor intake or premature closure can create customer and financial risk', 'empathetic communication and case management', 'claim, transaction reference, status, evidence, decision, and communication', 'chargebacks'),
      topic('chargebacks', 'Chargebacks', 'a dispute process that can reverse or contest a card or payment transaction under the applicable rules', 'allows participants to challenge eligible transactions through a structured process', 'receive dispute, check eligibility, collect evidence, submit or respond, receive decision, and record', 'control deadlines, reason codes, evidence, approvals, and representment status', 'missed timelines or weak evidence can lead to avoidable loss', 'deadline and evidence management', 'dispute record, reason code, transaction, evidence, submission, and outcome', 'payment disputes'),
      topic('payment-fraud-controls', 'Payment fraud controls', 'preventive and detective measures that identify or reduce unauthorised payment activity', 'protect customers and institutions while allowing legitimate payments to flow', 'collect signals, assess risk, apply control or review, investigate, and record outcome', 'use approved rules, access controls, monitoring, escalation, and customer protection processes', 'overly weak controls can allow loss while overly strong controls can block good customers', 'balanced risk judgement and clear escalation', 'alert, customer verification, transaction context, disposition, and review evidence', 'transaction monitoring'),
    ],
    [
      { label: 'NPCI UPI product overview', url: NPCI },
      { label: 'Reserve Bank of India', url: RBI },
    ],
  ),
  domain(
    'kyc-cdd-operations',
    'KYC and Customer Due Diligence',
    'KYC and customer due diligence quiz',
    'Assess KYC, CDD, EDD, beneficial ownership, and customer-risk review knowledge for compliance and onboarding roles.',
    ['KYC quiz for freshers', 'customer due diligence questions', 'EDD interview preparation', 'beneficial ownership assessment'],
    [
      topic('know-your-customer', 'Know Your Customer', 'the process of understanding and verifying a customer and the nature of the relationship', 'helps an institution apply appropriate onboarding, monitoring, and servicing controls', 'collect information, verify identity, understand purpose, assess risk, approve, and refresh', 'control documents, data quality, approvals, retention, and periodic review', 'inaccurate customer data can create compliance, fraud, and service risk', 'document review and clear case writing', 'identity evidence, profile, purpose, risk result, approval, and review date', 'customer due diligence'),
      topic('customer-due-diligence', 'Customer due diligence', 'a risk-informed review of customer identity, ownership, activity, purpose, and relevant risk factors', 'supports a proportionate understanding of the customer relationship', 'identify customer, verify information, understand activity, assess risk, record, and monitor', 'use current documents, approved sources, review standards, and escalation', 'incomplete evidence can produce an unreliable risk assessment', 'structured investigation and evidence mapping', 'CDD checklist, source evidence, risk rationale, approval, and review record', 'enhanced due diligence'),
      topic('enhanced-due-diligence', 'Enhanced due diligence', 'additional review applied to higher-risk relationships or situations under current policy', 'provides deeper information and approval where risk warrants it', 'identify trigger, collect additional evidence, investigate, obtain approval, and set monitoring', 'document why EDD applies, what was checked, who approved, and when it is refreshed', 'treating high-risk activity as routine can weaken controls', 'risk-based research and escalation judgement', 'risk trigger, adverse information, ownership, approval, monitoring plan, and review', 'customer due diligence'),
      topic('beneficial-ownership', 'Beneficial ownership', 'the identification of the natural person or persons who ultimately own or control an entity', 'helps an institution understand who is behind a corporate relationship', 'collect ownership structure, trace control, verify people, assess risk, and record conclusion', 'validate ownership evidence, thresholds, control rights, and unresolved gaps', 'opaque structures or stale records can hide relevant risk', 'entity-document analysis and careful escalation', 'corporate records, ownership chart, identity evidence, source, and rationale', 'politically exposed persons'),
      topic('politically-exposed-persons', 'Politically exposed persons', 'people identified under applicable definitions as holding or having held prominent public functions, including relevant family or associates where required', 'supports enhanced risk consideration and appropriate approval or monitoring', 'screen, resolve possible match, assess context, obtain approval where required, and monitor', 'distinguish a true match from a name similarity and preserve the review trail', 'treating a risk indicator as proof of wrongdoing or ignoring it can both be harmful', 'open-source research, identity comparison, and balanced writing', 'screen result, identifiers, source, risk decision, approval, and monitoring', 'sanctions screening'),
    ],
    [
      { label: 'FATF Recommendations (CDD)', url: FATF },
      { label: 'Reserve Bank of India', url: RBI },
    ],
  ),
  domain(
    'financial-crime-compliance',
    'Financial Crime Compliance',
    'financial crime compliance quiz',
    'Practise sanctions screening, transaction monitoring, suspicious-activity reporting, adverse media, and case-management scenarios.',
    ['AML quiz for analysts', 'sanctions screening questions', 'transaction monitoring assessment', 'financial crime interview questions'],
    [
      topic('sanctions-screening', 'Sanctions screening', 'the controlled comparison of relevant customers, parties, payments, or goods against applicable sanctions information', 'helps identify activity that may require investigation, restriction, or escalation', 'screen data, review possible match, compare identifiers, decide disposition, and record', 'use current lists, matching controls, four-eyes review, and escalation', 'a missed true match or unsupported false positive can create material risk', 'identifier comparison and cautious decision-making', 'screen result, list version, identifiers, review notes, disposition, and approval', 'transaction monitoring'),
      topic('transaction-monitoring', 'Transaction monitoring', 'the review of transaction activity for patterns or signals that may require further investigation', 'helps identify activity that is inconsistent, unusual, or relevant to risk controls', 'generate alert, gather context, investigate, document rationale, close or escalate, and report', 'control alert rules, case ownership, evidence, quality review, and escalation', 'closing alerts without adequate reasoning can hide risk', 'pattern recognition without jumping to conclusions', 'alert, customer profile, transaction history, rationale, decision, and reviewer', 'suspicious activity reporting'),
      topic('suspicious-activity-reporting', 'Suspicious activity reporting', 'a regulated reporting and escalation process for activity that meets applicable suspicion or reporting criteria', 'allows competent authorities and institutions to respond to relevant financial-crime risk', 'identify concern, investigate, obtain approval, file or escalate under rules, and maintain confidentiality', 'apply current requirements, deadlines, approval, confidentiality, and recordkeeping', 'unsupported conclusions or unauthorised disclosure can cause legal and customer harm', 'fact-based writing and confidentiality discipline', 'case facts, transaction context, decision, approval, filing record, and confidentiality control', 'case management'),
      topic('adverse-media-review', 'Adverse media review', 'the structured use of credible public information as one input to customer or transaction-risk assessment', 'helps identify information that may change risk understanding or require escalation', 'search relevant sources, validate identity, assess credibility and recency, record, and escalate', 'document search scope, source quality, identifiers, relevance, and decision', 'unverified or unrelated information can create unfair or inaccurate outcomes', 'source evaluation and neutral writing', 'article or source, identity match, date, relevance assessment, and disposition', 'politically exposed persons'),
      topic('case-management', 'Compliance case management', 'the organised tracking of alerts, evidence, decisions, owners, deadlines, and escalations', 'keeps investigations reviewable and prevents issues from being lost', 'open case, assign owner, gather evidence, review, decide, quality-check, and close or escalate', 'control access, ageing, approval, quality review, retention, and closure reasons', 'unmanaged cases can become overdue or lose important evidence', 'prioritisation and audit-ready documentation', 'case ID, owner, ageing, evidence, decision, approval, and closure reason', 'transaction monitoring'),
    ],
    [
      { label: 'FATF Recommendations (CDD)', url: FATF },
      { label: 'Reserve Bank of India', url: RBI },
    ],
  ),
  domain(
    'regulatory-compliance-operations',
    'Regulatory Compliance Operations',
    'regulatory compliance operations quiz',
    'Build knowledge of regulatory reporting, policy controls, compliance testing, audit trails, and conduct-risk support.',
    ['regulatory reporting quiz', 'compliance analyst questions', 'audit trail assessment', 'conduct risk interview questions'],
    [
      topic('regulatory-reporting', 'Regulatory reporting', 'the controlled preparation and submission of information required by a regulator or authority', 'gives authorities reliable information about an institution or activity', 'identify scope, collect data, validate, review, approve, submit, and retain evidence', 'control definitions, data lineage, reconciliations, sign-off, deadlines, and corrections', 'wrong, late, or unsupported data can create regulatory and governance risk', 'data interpretation and deadline management', 'reporting template, source data, validation, sign-off, submission receipt, and correction log', 'audit trail'),
      topic('policy-controls', 'Policy controls', 'procedures, approvals, restrictions, and monitoring that implement an organisation\'s requirements', 'turns policy intent into repeatable operational behaviour', 'interpret requirement, design process, train or communicate, operate control, monitor, and improve', 'assign owner, frequency, evidence, exception route, and review date', 'a control without ownership or evidence may not operate effectively', 'process thinking and concise documentation', 'policy clause, procedure, owner, control result, exception, and review', 'compliance testing'),
      topic('compliance-testing', 'Compliance testing', 'a structured review of whether an activity follows relevant requirements and controls', 'identifies gaps and supports remediation before issues become larger', 'define scope, sample or test, collect evidence, assess, report, remediate, and validate', 'use independent review, documented criteria, sample rationale, and issue tracking', 'weak testing can miss systemic or recurring problems', 'objective evidence-based review', 'test plan, sample, evidence, finding, action owner, due date, and validation', 'audit trail'),
      topic('audit-trail', 'Audit trail', 'a reliable record of what happened, who acted, which data was used, and how a decision was reached', 'makes operations reviewable, accountable, and reproducible', 'capture action, timestamp, user, source, change, approval, and outcome', 'restrict access, preserve history, and prevent untracked deletion or amendment', 'missing history can prevent investigation and accountability', 'record discipline and control awareness', 'system log, document version, approval, timestamp, and change record', 'data quality'),
      topic('conduct-risk', 'Conduct risk', 'the risk that behaviour, incentives, or processes cause unfair customer or market outcomes', 'helps institutions protect customers and trust while meeting obligations', 'identify customer or market impact, assess behaviour, control, monitor, and escalate', 'use fair-treatment standards, supervision, complaint analysis, and escalation', 'sales pressure or poor communication can cause harm even when a process completes', 'empathy, judgement, and clear communication', 'customer outcome, communication, complaint, supervision, and remediation record', 'customer service requests'),
    ],
    [
      { label: 'Reserve Bank of India', url: RBI },
      { label: 'FATF Recommendations (CDD)', url: FATF },
    ],
  ),
  domain(
    'risk-management-operations',
    'Risk Management Operations',
    'risk management operations quiz',
    'Test operational, credit, market, liquidity, and control-risk fundamentals for finance and banking analyst roles.',
    ['operational risk quiz', 'risk analyst interview questions', 'banking risk assessment', 'risk controls for freshers'],
    [
      topic('operational-risk', 'Operational risk', 'the risk of loss or harm from failed processes, people, systems, or external events', 'helps an organisation identify and reduce non-financial process exposure', 'identify event, assess impact and cause, apply control, record loss or near miss, and monitor', 'use incident reporting, control testing, issue ownership, and lessons learned', 'unreported incidents can repeat and grow in impact', 'root-cause analysis and practical control thinking', 'incident, cause, impact, control, action, owner, and closure evidence', 'control testing'),
      topic('credit-risk', 'Credit risk', 'the risk that a borrower or counterparty fails to meet agreed obligations', 'supports prudent lending, exposure management, and portfolio monitoring', 'identify exposure, assess borrower or counterparty, set terms or limits, monitor, and escalate', 'use approved data, limits, reviews, collateral or mitigation, and exception governance', 'stale or incomplete information can understate exposure', 'financial analysis and balanced judgement', 'credit file, limit, utilisation, payment history, review, and escalation', 'credit analysis'),
      topic('market-risk', 'Market risk', 'the risk that movements in prices, rates, currencies, or other market factors affect value or earnings', 'helps an institution understand and control market exposure', 'identify position, select factor, measure sensitivity or value change, compare limit, and act', 'use approved data, valuation, limits, scenarios, and independent review', 'wrong positions or assumptions can hide exposure', 'quantitative reasoning and careful interpretation', 'position, price, sensitivity, limit, scenario, and action record', 'interest-rate risk'),
      topic('risk-appetite', 'Risk appetite', 'the amount and type of risk an organisation is willing to accept in pursuit of its objectives', 'aligns decisions, limits, monitoring, and escalation with leadership intent', 'define appetite, set limits, assign ownership, monitor metrics, escalate breaches, and review', 'connect metrics to thresholds, actions, governance, and evidence', 'a limit without a response plan can allow risk to accumulate', 'clear communication and metric literacy', 'appetite statement, metric, threshold, breach, decision, and review', 'operational risk'),
      topic('control-framework', 'Control framework', 'the connected set of preventive, detective, corrective, governance, and monitoring controls', 'creates a consistent way to manage process and risk objectives', 'map objective and risk, design control, assign owner, operate, test, remediate, and report', 'document frequency, evidence, exceptions, review, and independence', 'overlapping or missing controls can create false confidence', 'process mapping and control design', 'risk-control matrix, procedure, evidence, test, finding, and remediation', 'policy controls'),
    ],
    [
      { label: 'Reserve Bank of India', url: RBI },
      { label: 'FATF Recommendations (CDD)', url: FATF },
    ],
  ),
  domain(
    'accounting-finance-operations',
    'Accounting and Finance Operations',
    'accounting and finance operations quiz',
    'Practise double-entry, general ledger, accounts payable, month-end close, and variance-analysis questions.',
    ['accounting basics quiz', 'finance operations questions', 'general ledger interview questions', 'month-end close assessment'],
    [
      topic('double-entry', 'Double-entry bookkeeping', 'an accounting method that records each transaction in at least two accounts with equal total debits and credits', 'preserves a structured record of financial effects', 'understand source transaction, identify accounts, determine treatment, post, review, and reconcile', 'use approved chart of accounts, supporting documents, narration, and review', 'a balanced entry can still use the wrong account, period, or amount', 'account classification and numerical accuracy', 'source document, journal, account code, narration, approval, and reconciliation', 'general ledger'),
      topic('general-ledger', 'General ledger', 'the central record of account balances and posted financial transactions', 'supports financial reporting, reconciliation, and management review', 'receive approved journals, post, validate balances, reconcile subledgers, and report', 'control access, period close, journal approval, and account reconciliation', 'unapproved or misclassified postings can distort reports', 'accounting logic and review discipline', 'journal, ledger balance, subledger, reconciliation, and close checklist', 'month-end close'),
      topic('accounts-payable', 'Accounts payable', 'the process of recording and paying amounts owed to suppliers or other creditors', 'ensures obligations are complete, accurate, approved, and paid on time', 'receive invoice, validate goods or service, match, approve, schedule payment, and reconcile', 'use vendor controls, duplicate checks, approval limits, and payment authorisation', 'duplicate or fraudulent invoices can create financial loss', 'document matching and exception investigation', 'invoice, purchase order, receipt, approval, payment, and vendor record', 'accounts receivable'),
      topic('month-end-close', 'Month-end close', 'the controlled sequence of checks and postings used to finalise financial records for a reporting period', 'produces complete and reviewable period-end information', 'cut off activity, post journals, reconcile accounts, review variances, approve, and close period', 'use checklist, ownership, materiality, evidence, and late-entry controls', 'missed accruals or unreconciled balances can misstate results', 'prioritisation and financial review', 'close calendar, journal, reconciliation, variance, sign-off, and exception log', 'general ledger'),
      topic('variance-analysis', 'Variance analysis', 'the comparison of actual results with budget, forecast, prior period, or another expected basis', 'helps explain changes and focus management attention', 'select comparison, calculate variance, investigate drivers, document, and communicate', 'validate data, define materiality, separate volume and rate effects, and review assumptions', 'an unexplained or incorrectly defined variance can lead to poor decisions', 'numerical storytelling and curiosity', 'actual, budget, calculation, driver analysis, source, and action', 'month-end close'),
    ],
    [
      { label: 'Reserve Bank of India', url: RBI },
      { label: 'SEBI Investor securities-market material', url: SEBI },
    ],
  ),
  domain(
    'insurance-operations',
    'Insurance Operations',
    'insurance operations quiz',
    'Explore policy administration, underwriting support, claims, premiums, and reinsurance operations through 50 questions.',
    ['insurance operations interview questions', 'claims processing quiz', 'underwriting operations assessment', 'insurance fresher test'],
    [
      topic('policy-administration', 'Policy administration', 'the record and service process for issuing, maintaining, changing, and renewing insurance policies', 'keeps customer cover, terms, premiums, and documents accurate', 'capture proposal, underwrite, issue policy, process changes, renew, and maintain records', 'control identity, product terms, approvals, documents, premiums, and effective dates', 'wrong coverage or date can create customer and claims risk', 'document accuracy and customer communication', 'proposal, underwriting decision, policy schedule, endorsement, premium, and renewal', 'underwriting'),
      topic('underwriting', 'Underwriting operations', 'the assessment of risk against product rules before agreeing insurance coverage and terms', 'supports appropriate pricing, coverage, and acceptance decisions', 'collect proposal data, validate evidence, assess risk, price or refer, approve, and document', 'use authority levels, data quality, referral, and exception controls', 'incomplete or inaccurate risk information can create unsuitable exposure', 'questioning, analysis, and disciplined referral', 'proposal, risk evidence, pricing, referral, approval, and policy terms', 'claims processing'),
      topic('claims-processing', 'Claims processing', 'the controlled intake, assessment, decision, and payment process for an insurance claim', 'provides a fair and efficient way to assess an insured event under the policy', 'register claim, validate policy, gather evidence, assess coverage, decide, pay or deny, and close', 'control identity, policy status, evidence, authority, fraud indicators, and communication', 'wrong coverage or unsupported decision can harm customer and insurer', 'fact-based investigation and empathy', 'claim form, policy, evidence, assessment, decision, payment, and communication', 'policy administration'),
      topic('premium-processing', 'Premium processing', 'the recording, collection, allocation, refund, and reconciliation of insurance premium amounts', 'keeps policy status and insurer cash records accurate', 'calculate or receive premium, allocate, update policy, reconcile, and handle return or refund', 'validate amount, policy, date, payment method, allocation, and approval', 'misallocated or missing premium can affect coverage and reporting', 'amount and policy-reference accuracy', 'premium notice, receipt, allocation, bank record, refund, and reconciliation', 'policy administration'),
      topic('reinsurance', 'Reinsurance operations', 'the process by which an insurer transfers or shares part of its risk with another insurer', 'supports capacity and risk management under agreed terms', 'record treaty or facultative terms, calculate cessions, report activity, settle, and reconcile', 'validate contract terms, eligibility, bordereaux, calculations, and settlement', 'wrong cession or reporting can affect recoveries and risk information', 'contract reading and reconciliation', 'reinsurance agreement, bordereau, calculation, claim, settlement, and reconciliation', 'underwriting'),
    ],
    [
      { label: 'Reserve Bank of India', url: RBI },
      { label: 'SEBI Investor securities-market material', url: SEBI },
    ],
  ),
  domain(
    'fintech-neo-banking',
    'FinTech and Neo-Banking',
    'FinTech and neo-banking operations quiz',
    'Test digital lending, product operations, APIs, customer success, and data-privacy control knowledge for FinTech roles.',
    ['FinTech operations questions', 'neo-banking quiz', 'digital lending assessment', 'product operations interview'],
    [
      topic('digital-lending', 'Digital lending', 'technology-enabled origination, decisioning, disbursement, servicing, and repayment of credit', 'connects customer experience with credit, compliance, risk, and operations controls', 'capture application, verify identity, assess, decide, disburse, service, collect, and report', 'control consent, data use, decision records, access, exceptions, and customer communication', 'automated decisions or data errors can scale customer harm quickly', 'process mapping and cross-functional escalation', 'application, consent, decision data, approval, disbursement, and service record', 'credit analysis'),
      topic('product-operations', 'Product operations', 'the coordination of processes, controls, incidents, users, and performance around a digital financial product', 'keeps a product usable, controlled, and connected across technology and business teams', 'monitor workflow, identify issue, assess impact, route, resolve, communicate, and learn', 'use incident ownership, access controls, release checks, metrics, and post-incident review', 'unresolved product defects can affect many users and transactions', 'structured problem-solving and stakeholder communication', 'incident, user impact, logs, owner, resolution, and prevention action', 'customer success'),
      topic('financial-apis', 'Financial APIs', 'interfaces that allow approved systems to exchange structured data or instructions', 'connects banks, payment providers, products, and services in a controlled way', 'authenticate system, validate request, exchange data, return response, log, and monitor', 'control credentials, permissions, input validation, encryption, logging, and rate limits', 'poor access or error handling can expose data or duplicate transactions', 'technical curiosity and risk awareness', 'API request, response, authentication, log, error, and reconciliation record', 'payment operations'),
      topic('customer-success', 'Customer success', 'the structured support and learning work that helps customers achieve useful outcomes with a product', 'improves adoption, service quality, retention, and feedback', 'understand goal, guide use, resolve issue, measure outcome, and feed learning to product teams', 'protect customer data, set accurate expectations, track resolution, and escalate risk', 'promising unsupported outcomes or closing unresolved issues harms trust', 'empathy, product understanding, and clear writing', 'customer goal, support record, outcome, feedback, and escalation', 'customer-service requests'),
      topic('data-privacy-controls', 'Data privacy controls', 'the practices that govern collection, access, use, retention, sharing, and protection of personal information', 'protects people while allowing a service to use necessary information lawfully and responsibly', 'identify data, define purpose, collect consent or basis, restrict access, retain, and handle requests or incidents', 'use least privilege, data minimisation, retention, monitoring, and incident escalation', 'excessive access or unnecessary retention can expose personal data', 'careful handling and privacy-aware process design', 'data inventory, access record, consent or purpose, retention decision, and incident log', 'KYC and customer due diligence'),
    ],
    [
      { label: 'Reserve Bank of India', url: RBI },
      { label: 'NPCI UPI product overview', url: NPCI },
    ],
  ),
  domain(
    'wealth-investment-operations',
    'Wealth and Investment Operations',
    'wealth management operations quiz',
    'Practise suitability, portfolio allocation, brokerage operations, client reporting, and investment-service fundamentals.',
    ['wealth management quiz', 'investment operations interview', 'portfolio management questions', 'brokerage operations assessment'],
    [
      topic('financial-planning', 'Financial planning', 'the structured process of understanding goals, resources, constraints, and actions for a client\'s financial future', 'connects client objectives with realistic planning and review', 'gather information, define goals, analyse position, prepare options, agree actions, and review', 'validate client information, assumptions, suitability, disclosures, and changes', 'incomplete goals or assumptions can make a plan unsuitable', 'listening, numerical reasoning, and clear explanation', 'fact-find, goal, cash flow, assumptions, recommendation, and review record', 'suitability'),
      topic('portfolio-allocation', 'Portfolio allocation', 'the distribution of investments across assets, products, sectors, regions, or risk exposures', 'aligns a portfolio with objectives, horizon, liquidity, and risk tolerance', 'understand profile, define allocation, implement, monitor, rebalance, and review', 'use approved limits, suitability, concentration checks, and change authority', 'concentration or mismatch can expose the client to unsuitable risk', 'risk-return reasoning and communication', 'client profile, allocation, investment instruction, holdings, and review', 'investment suitability'),
      topic('suitability', 'Investment suitability', 'the assessment of whether a product or recommendation fits a client\'s objectives, knowledge, capacity, and risk profile', 'protects clients from inappropriate products or recommendations', 'collect profile, understand product, compare fit, document rationale, disclose, and obtain instruction', 'control profile freshness, product risk, approval, disclosure, and exception', 'stale information or sales pressure can lead to unsuitable outcomes', 'client-first judgement and precise documentation', 'fact-find, product information, rationale, disclosure, and instruction', 'portfolio allocation'),
      topic('brokerage-operations', 'Brokerage operations', 'the processing, control, and servicing work that supports brokerage orders, accounts, settlement, and statements', 'keeps client trading and account records accurate and timely', 'receive order, authenticate, execute, confirm, settle, reconcile, and report', 'control order authority, identifiers, confirmations, settlement, and reconciliations', 'wrong order or settlement information can affect client assets', 'order-detail accuracy and exception handling', 'order, execution, confirmation, settlement, client account, and statement', 'trade confirmation'),
      topic('client-reporting', 'Client reporting', 'the preparation of clear information about holdings, transactions, performance, fees, or account activity', 'helps clients understand what happened and what they hold', 'collect validated data, apply reporting period, calculate or compile, review, deliver, and archive', 'control data source, period, calculation, review, privacy, and version', 'wrong holding or performance data can mislead a client', 'clear numerical communication and quality checking', 'holdings file, transaction, valuation, fee, report, and delivery record', 'performance reporting'),
    ],
    [
      { label: 'SEBI Investor securities-market material', url: SEBI },
      { label: 'Reserve Bank of India', url: RBI },
    ],
  ),
  domain(
    'banking-data-analytics',
    'Banking Data and Analytics',
    'banking data analytics quiz',
    'Assess data quality, Excel, reporting, SQL thinking, process metrics, and dashboard interpretation for finance analysts.',
    ['banking data analyst quiz', 'finance Excel assessment', 'operations reporting questions', 'data quality interview questions'],
    [
      topic('data-quality', 'Data quality', 'the completeness, accuracy, consistency, timeliness, validity, and traceability of information', 'makes operational decisions and reporting more reliable', 'define data, validate, compare sources, correct or escalate, monitor, and document', 'use field rules, reconciliation, ownership, exception reporting, and change control', 'poor data can create wrong decisions, reporting, service, or compliance outcomes', 'curiosity, checking, and root-cause analysis', 'data dictionary, validation result, source record, break, owner, and correction', 'reconciliation'),
      topic('excel-for-finance', 'Excel for finance operations', 'the use of formulas, tables, filters, lookups, pivots, and checks to analyse controlled data', 'helps analysts work efficiently while preserving reviewable calculations', 'import or receive data, clean, calculate, validate, analyse, review, and publish', 'protect formulas, label assumptions, control versions, and reconcile totals', 'hard-coded or unreviewed formulas can produce hidden errors', 'structured spreadsheet design and checking', 'source file, formula, pivot, control total, reviewer check, and version', 'variance analysis'),
      topic('sql-thinking', 'SQL and data-query thinking', 'the ability to define records, fields, joins, filters, and aggregations needed to answer an operational question', 'helps analysts retrieve and test information consistently', 'define question, identify tables, join identifiers, filter population, aggregate, validate, and communicate', 'control joins, duplicates, nulls, date ranges, access, and query version', 'a wrong join or population can produce a convincing but false result', 'logical thinking and data validation', 'query, data dictionary, row count, control total, sample, and output', 'data quality'),
      topic('operations-metrics', 'Operations metrics', 'measures used to monitor volume, timeliness, quality, ageing, productivity, or exceptions', 'helps teams understand performance and where controls or capacity need attention', 'define metric, collect data, calculate, compare, investigate movement, and act', 'document definition, population, period, owner, threshold, and source', 'ambiguous metrics can drive the wrong behaviour or hide issues', 'clear definitions and numerical storytelling', 'metric definition, data source, result, threshold, commentary, and action', 'dashboard reporting'),
      topic('dashboard-reporting', 'Dashboard reporting', 'the presentation of validated metrics and trends for operational decisions', 'makes important information easier to understand and act on', 'define audience, validate data, select measures, design view, review, publish, and refresh', 'use source links, data date, filter visibility, access, and review sign-off', 'a polished dashboard with stale or incomplete data can mislead users', 'visual communication and control awareness', 'dashboard, source, refresh date, filter, commentary, and approval', 'operations metrics'),
    ],
    [
      { label: 'Reserve Bank of India', url: RBI },
      { label: 'SEBI Investor securities-market material', url: SEBI },
    ],
  ),
  domain(
    'banking-technology-operations',
    'Banking Technology Operations',
    'banking technology operations quiz',
    'Learn about system incidents, access controls, change management, batch processing, and technology controls in banking.',
    ['banking technology quiz', 'IT operations banking questions', 'change management assessment', 'banking systems interview'],
    [
      topic('incident-management', 'Incident management', 'the controlled response to an event that disrupts or may disrupt a service or process', 'restores service, protects customers, and creates learning from failure', 'detect, record, assess impact, assign owner, contain, resolve, communicate, and review', 'use severity, escalation, evidence, customer communication, and post-incident review', 'delayed escalation can increase operational and customer impact', 'calm prioritisation and concise updates', 'incident ticket, impact, timeline, action, communication, and root cause', 'business continuity'),
      topic('access-controls', 'Access controls', 'the rules and technical or procedural checks that restrict systems and data to authorised users', 'protects confidentiality, integrity, and separation of duties', 'request access, approve, provision, review, change, and revoke', 'use least privilege, role ownership, periodic review, strong authentication, and logs', 'excessive or stale access can enable error, fraud, or data loss', 'security awareness and evidence discipline', 'access request, approval, role, review, log, and revocation record', 'data privacy controls'),
      topic('change-management', 'Change management', 'the controlled process for planning, approving, testing, releasing, and reviewing a system or process change', 'reduces unintended impact while allowing improvements', 'define change, assess risk, test, approve, schedule, release, monitor, and close', 'use segregation, rollback, evidence, release notes, and post-change review', 'uncontrolled changes can interrupt processing or corrupt data', 'planning, risk assessment, and stakeholder communication', 'change record, test result, approval, release, rollback, and review', 'incident management'),
      topic('batch-processing', 'Batch processing', 'the scheduled processing of a group of records or transactions together', 'efficiently processes recurring activity such as payments, statements, or reports', 'prepare input, validate, run, monitor, reconcile output, repair exceptions, and close', 'control input completeness, job status, access, re-runs, duplicates, and output totals', 'partial or duplicate runs can affect many records at once', 'status monitoring and reconciliation', 'input count, job log, output, control total, exception, and rerun approval', 'payment reconciliation'),
      topic('business-continuity', 'Business continuity', 'the planning and response capability that keeps important services operating through disruption', 'protects customers and critical processes when normal systems or locations fail', 'identify critical service, assess impact, prepare response, activate, operate, recover, and learn', 'test plans, roles, communications, dependencies, backups, and recovery evidence', 'an untested plan may fail under real pressure', 'calm coordination and dependency thinking', 'business-impact analysis, plan, test result, activation, recovery, and review', 'incident management'),
    ],
    [
      { label: 'Reserve Bank of India', url: RBI },
      { label: 'NPCI UPI product overview', url: NPCI },
    ],
  ),
  domain(
    'banking-customer-experience',
    'Banking Customer Experience',
    'banking customer service quiz',
    'Practise service quality, complaints, call-centre controls, accessibility, and customer communication questions for banking roles.',
    ['banking customer service questions', 'complaint handling quiz', 'call centre banking assessment', 'customer experience finance roles'],
    [
      topic('customer-service', 'Customer service operations', 'the controlled handling of customer questions, requests, transactions, and issues', 'helps customers receive accurate, timely, and respectful support', 'understand request, authenticate, resolve or route, communicate, record, and follow up', 'use identity, privacy, knowledge, quality, and escalation controls', 'wrong advice or weak records can create customer and conduct risk', 'listening, clarity, and ownership', 'customer request, authentication, advice, action, and closure', 'complaint management'),
      topic('complaint-management', 'Complaint management', 'the structured intake, investigation, response, and learning process for customer dissatisfaction', 'resolves concerns fairly and identifies recurring product or process issues', 'receive complaint, acknowledge, investigate, decide, respond, remediate where appropriate, and report', 'control ownership, deadlines, independence, evidence, and root-cause analysis', 'defensive or late handling can increase harm and regulatory risk', 'empathy, neutrality, and fact-based writing', 'complaint, evidence, response, outcome, compensation or remedy, and root cause', 'conduct risk'),
      topic('call-centre-controls', 'Call-centre controls', 'the procedures that protect customer identity, information, advice, and service quality during calls', 'allows efficient service without exposing customer data or bypassing checks', 'authenticate, understand request, apply process, communicate, record, and escalate', 'use scripts or guidance, call recording rules, access restrictions, and quality review', 'social engineering or inaccurate advice can affect customers', 'clear speaking and process adherence', 'authentication result, interaction record, advice, action, and quality review', 'data privacy controls'),
      topic('accessibility', 'Accessible banking service', 'the design and delivery of banking information and service so people with different needs can use it', 'supports fair access and a better customer outcome', 'understand need, provide accessible channel or support, verify, process, and record', 'use approved accommodations, privacy, consent, and escalation processes', 'assuming one channel works for everyone can exclude or harm customers', 'empathy and flexible problem-solving', 'customer request, accommodation, consent, service action, and feedback', 'customer service operations'),
      topic('customer-communication', 'Customer communication', 'the clear and accurate explanation of service status, requirements, decisions, and next steps', 'helps customers make informed decisions and reduces avoidable repeat contacts', 'confirm facts, choose channel, explain plainly, state next action and timing, record, and follow up', 'avoid unsupported promises, protect personal data, and use approved messages', 'ambiguous communication can create complaints or missed deadlines', 'plain-language writing and expectation management', 'message, date, required action, customer acknowledgement, and case note', 'complaint management'),
    ],
    [
      { label: 'Reserve Bank of India', url: RBI },
      { label: 'RBI customer education', url: RBI },
    ],
  ),
  domain(
    'banking-career-roles',
    'Banking Career Roles and Skills',
    'banking career roles quiz',
    'Explore analyst, operations, compliance, credit, risk, payments, and customer-success roles through practical career questions.',
    ['banking jobs quiz', 'finance roles for freshers', 'banking interview assessment', 'BFSI career skills test'],
    [
      topic('operations-analyst', 'Operations analyst', 'a role that processes, checks, reconciles, documents, and improves financial-service workflows', 'keeps activity accurate, timely, controlled, and ready for review', 'understand queue, process item, validate, resolve exception, record, and hand over', 'follow procedure, preserve evidence, monitor ageing, and escalate uncertainty', 'speed without accuracy or escalation can create operational loss', 'detail, prioritisation, and calm communication', 'queue, checklist, transaction, exception, action, and handover', 'process mapping'),
      topic('compliance-analyst', 'Compliance analyst', 'a role that reviews information and activity against compliance requirements and internal controls', 'helps identify, assess, document, and escalate relevant risk', 'screen or review, gather evidence, assess, record rationale, quality-check, and escalate', 'protect confidentiality, use current policy, document sources, and meet deadlines', 'unsupported decisions or inconsistent review can create risk', 'neutral writing, research, and evidence-based judgement', 'case file, source, review, rationale, approval, and escalation', 'KYC operations'),
      topic('credit-analyst', 'Credit analyst', 'a role that analyses borrower or counterparty information to support credit decisions and monitoring', 'helps lenders understand repayment capacity and exposure', 'collect data, validate, analyse, compare policy, recommend or refer, and monitor', 'use approved sources, calculations, limits, review, and exception controls', 'missing obligations or weak assumptions can understate risk', 'financial analysis and judgement', 'application, financial data, calculation, policy check, recommendation, and review', 'credit analysis'),
      topic('risk-analyst', 'Risk analyst', 'a role that measures, monitors, reports, or helps control financial and operational risk', 'makes exposures and actions visible to decision-makers', 'define risk, collect data, measure, compare appetite or limit, report, and follow up', 'control assumptions, data, methodology, review, and escalation', 'a precise-looking report can still mislead if inputs are wrong', 'structured analysis and clear explanation', 'risk metric, source, method, threshold, commentary, and action', 'risk management'),
      topic('process-mapping', 'Process mapping', 'the visual or written description of activities, owners, decisions, inputs, outputs, and controls', 'helps teams understand work, identify gaps, and improve consistency', 'observe process, define start and end, map steps and decisions, validate, and improve', 'include control points, systems, handoffs, exceptions, and version ownership', 'omitting exceptions or handoffs can hide the real operational risk', 'curiosity and collaborative facilitation', 'process map, procedure, control, exception, owner, and approval', 'operations analyst'),
    ],
    [
      { label: 'Reserve Bank of India', url: RBI },
      { label: 'SEBI Investor securities-market material', url: SEBI },
    ],
  ),
  domain(
    'banking-interview-preparation',
    'Banking Interview Preparation',
    'banking interview questions and quiz',
    'Prepare for finance and BFSI interviews with scenario questions on accuracy, controls, communication, teamwork, and learning.',
    ['finance interview quiz', 'banking interview practice', 'BFSI interview questions for freshers', 'operations interview assessment'],
    [
      topic('accuracy-example', 'Attention to detail examples', 'evidence that a candidate checks information carefully and notices or prevents errors', 'shows how a learner can protect quality in a controlled process', 'describe expected result, check performed, issue found, action, and learning', 'be specific about evidence and do not claim work you did not do', 'vague stories do not show whether the candidate understands control', 'truthful storytelling and process awareness', 'project, check, issue, communication, outcome, and reflection', 'operations analyst'),
      topic('exception-scenario', 'Exception scenarios', 'interview prompts that test how a candidate investigates a mismatch, delay, or unusual result', 'reveals prioritisation, evidence gathering, escalation, and communication judgement', 'define issue, assess impact, check sources, follow procedure, communicate, and document', 'separate facts from assumptions and state when you would ask for help', 'guessing or hiding an issue can make a small exception worse', 'structured thinking under uncertainty', 'issue description, evidence, procedure, owner, next action, and handover', 'reconciliation'),
      topic('teamwork', 'Teamwork in operations', 'the ability to coordinate work, share context, support handovers, and resolve issues with others', 'keeps processes moving across teams and shifts', 'align on objective, share facts, assign ownership, update, resolve, and learn', 'use clear records, respectful escalation, and confirmation of handover', 'unclear ownership can lead to duplicated or missed work', 'collaboration and concise communication', 'handover, action owner, status update, meeting note, and closure', 'customer communication'),
      topic('learning-agility', 'Learning agility', 'the ability to learn a new process, product, system, or rule and apply it responsibly', 'helps freshers adapt without guessing or bypassing controls', 'learn purpose, study procedure, practise, ask questions, verify, and apply', 'record assumptions, use approved sources, seek review, and update knowledge', 'confidently applying outdated or misunderstood information creates risk', 'curiosity with humility and verification', 'procedure, training note, question, check, practice result, and review', 'process mapping'),
      topic('professional-communication', 'Professional communication', 'clear, accurate, audience-appropriate communication about process, status, evidence, and next action', 'reduces misunderstandings and supports trustworthy work', 'state context, facts, impact, action, owner, timing, and escalation', 'avoid unsupported claims, protect data, and keep an auditable record', 'unclear or emotional communication can delay resolution', 'plain language and stakeholder awareness', 'email or case note, status, evidence, next action, and acknowledgement', 'customer communication'),
    ],
    [
      { label: 'Reserve Bank of India', url: RBI },
      { label: 'SEBI Investor securities-market material', url: SEBI },
    ],
  ),
]);

const QUESTION_BLUEPRINTS = Object.freeze([
  Object.freeze({
    id: 'definition',
    prompt: (t, d) => `What best describes ${t.name} in ${d.label}?`,
    answer: (t) => t.definition,
    explain: (t) => `${t.name} is ${t.definition}. In practice, the exact scope depends on the product, organisation, and applicable process.`,
    distractors: ['A marketing slogan with no operational record', 'An untracked shortcut that bypasses review', 'A customer outcome that needs no evidence'],
  }),
  Object.freeze({
    id: 'purpose',
    prompt: (t) => `What is the main purpose of ${t.name}?`,
    answer: (t) => t.purpose,
    explain: (t) => `The purpose is to ${t.purpose}. A strong analyst connects the purpose to accurate processing and visible controls.`,
    distractors: ['To remove the need for approvals or documentation', 'To guarantee that no risk or exception can ever occur', 'To replace every other activity in the workflow'],
  }),
  Object.freeze({
    id: 'workflow',
    prompt: (t) => `Which sequence best represents a controlled ${t.name} workflow?`,
    answer: (t) => t.workflow,
    explain: (t) => `A useful high-level sequence is to ${t.workflow}. Teams should follow their current approved procedure for detailed steps.`,
    distractors: ['Skip intake, change the record, and close the item without review', 'Approve the outcome first and look for evidence only if challenged', 'Wait for an issue to become overdue before assigning an owner'],
  }),
  Object.freeze({
    id: 'control',
    prompt: (t) => `Which control best supports reliable ${t.name}?`,
    answer: (t) => t.control,
    explain: (t) => `The relevant control is to ${t.control}. Controls should have an owner, evidence, and an escalation path.`,
    distractors: ['Allow unrestricted manual changes with no history', 'Use a different definition or identifier for every team', 'Treat a completed screen as proof that all checks passed'],
  }),
  Object.freeze({
    id: 'risk',
    prompt: (t) => `What is a realistic risk associated with ${t.name}?`,
    answer: (t) => t.risk,
    explain: (t) => `${t.risk}. The response should be evidence-based and follow the relevant procedure rather than relying on guesswork.`,
    distractors: ['There is no operational risk once a process has a name', 'Every issue can be resolved by deleting the original record', 'Risk is relevant only to senior management, not to operations'],
  }),
  Object.freeze({
    id: 'scenario',
    prompt: (t) => `You are reviewing ${t.name} and a record does not match the expected result. What is the best approach?`,
    answer: (t) => `Define the difference, check the source records, apply the relevant control, document the finding, and escalate when required`,
    explain: (t) => `For ${t.name}, start by defining the difference and then use evidence. The topic-specific risk to keep in mind is ${t.risk}.`,
    distractors: ['Edit one record until the numbers match without checking the source', 'Close the issue because the difference may resolve itself', 'Ask an unrelated team to guess the correct value'],
  }),
  Object.freeze({
    id: 'skill',
    prompt: (t) => `Which skill is most useful when working with ${t.name}?`,
    answer: (t) => t.skill,
    explain: (t) => `${t.skill} helps an analyst handle ${t.name} responsibly, especially when the facts are incomplete or an exception needs escalation.`,
    distractors: ['Confidence without checking any evidence', 'Speed without ownership or documentation', 'Memorising a definition without understanding the workflow'],
  }),
  Object.freeze({
    id: 'evidence',
    prompt: (t) => `Which evidence would best support a review of ${t.name}?`,
    answer: (t) => t.evidence,
    explain: (t) => `Useful evidence for ${t.name} includes ${t.evidence}. The reviewer should also record the conclusion and next action.`,
    distractors: ['A personal opinion with no source or timestamp', 'A screenshot that cannot identify the customer or transaction', 'An unrelated report from a different process'],
  }),
  Object.freeze({
    id: 'distinction',
    prompt: (t) => `How should a learner distinguish ${t.name} from ${t.related}?`,
    answer: (t) => `${t.name} focuses on ${t.definition}; ${t.related} is related but addresses a different part of the wider workflow`,
    explain: (t) => `These topics connect, but they are not interchangeable. ${t.name} focuses on ${t.definition}, while ${t.related} has a separate purpose and control context.`,
    distractors: ['They are always identical terms in every organisation and product', 'Neither topic requires a process, record, or owner', 'The difference is only a marketing label and never affects controls'],
  }),
  Object.freeze({
    id: 'interview',
    prompt: (t) => `Which interview answer demonstrates sound judgement about ${t.name}?`,
    answer: (t) => `Explain the purpose, use the relevant evidence, follow the approved process, and state what you would escalate or verify`,
    explain: (t) => `A strong answer connects the definition of ${t.name} to its workflow, evidence, control, and escalation boundary. Do not claim experience you do not have.`,
    distractors: ['Say you would guess the answer to avoid asking for help', 'Promise that every case will have the same outcome', 'Focus only on speed and leave documentation for someone else'],
  }),
]);

function stableHash(value) {
  return [...value].reduce((hash, character) => ((hash * 31) + character.charCodeAt(0)) >>> 0, 7);
}

function shuffleOptions(options, seed) {
  const start = stableHash(seed) % options.length;
  return options.map((_, index) => options[(index + start) % options.length]);
}

function createQuestion(topicRecord, quizDomain, blueprint) {
  const correctText = blueprint.answer(topicRecord, quizDomain);
  const options = shuffleOptions([correctText, ...blueprint.distractors], `${quizDomain.id}-${topicRecord.id}-${blueprint.id}`);
  return Object.freeze({
    id: `${quizDomain.id}-${topicRecord.id}-${blueprint.id}`,
    domainId: quizDomain.id,
    domainLabel: quizDomain.label,
    topicId: topicRecord.id,
    topic: topicRecord.name,
    question: blueprint.prompt(topicRecord, quizDomain),
    options: Object.freeze(options),
    answer: options.indexOf(correctText),
    explanation: blueprint.explain(topicRecord, quizDomain),
    keywords: Object.freeze([quizDomain.primaryKeyword, topicRecord.name.toLowerCase(), blueprint.id, 'banking finance quiz']),
  });
}

export const FINANCE_QUIZ_QUESTIONS = Object.freeze(
  FINANCE_QUIZ_DOMAINS.flatMap((quizDomain) => quizDomain.topics.flatMap((topicRecord) => (
    QUESTION_BLUEPRINTS.map((blueprint) => createQuestion(topicRecord, quizDomain, blueprint))
  ))),
);

export const FINANCE_QUIZ_TOTAL = FINANCE_QUIZ_QUESTIONS.length;
export const FINANCE_QUIZ_DOMAIN_COUNT = FINANCE_QUIZ_DOMAINS.length;
export const FINANCE_QUIZ_QUESTIONS_PER_DOMAIN = FINANCE_QUIZ_QUESTIONS.length / FINANCE_QUIZ_DOMAIN_COUNT;

export function getQuizDomain(domainId) {
  return FINANCE_QUIZ_DOMAINS.find((quizDomain) => quizDomain.id === domainId) || null;
}

export function getQuizQuestions(domainId) {
  return FINANCE_QUIZ_QUESTIONS.filter((question) => question.domainId === domainId);
}

export function getQuizRouteId(domainId) {
  return `finance-quiz-${domainId}`;
}

if (FINANCE_QUIZ_TOTAL < 1000 || FINANCE_QUIZ_TOTAL % FINANCE_QUIZ_DOMAIN_COUNT !== 0) {
  throw new Error(`The finance quiz library must contain at least 1,000 evenly distributed questions; found ${FINANCE_QUIZ_TOTAL}.`);
}
