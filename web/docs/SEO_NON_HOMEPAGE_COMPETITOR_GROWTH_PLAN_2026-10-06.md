# Non-homepage SEO growth plan: competitor-led, evidence-first

**Date:** 6 October 2026  
**Scope:** Every indexable page group except the homepage.  
**Goal:** Grow qualified non-brand organic impressions and clicks for finance training, role research, course comparison, and practical finance-operations learning.

## Evidence and limits

Ubersuggest is connected, but its competitor report returned no domains for either India or the global lookup. The account's daily report quota was exhausted in the previous analysis. This plan therefore contains no Ubersuggest traffic, keyword-volume, difficulty, or ranking claims.

The competitor review is based on public page content and the existing competitor research in this repository. Imarticus pages connect broad investment-banking explanations and role guides to course CTAs; its operations guide uses a transaction sequence, role table, and FAQs ([operations guide](https://imarticus.org/blog/a-beginners-guide-to-understanding-investment-banking-operations/), [KYC analyst guide](https://imarticus.org/blog/kyc-analyst/)). IMS Proschool uses detailed credential comparisons and city-specific course pages with current course and location details ([qualification comparison](https://proschoolonline.com/blog/cfa-vs-mba-vs-cfp-vs-frm), [Hyderabad modelling page](https://proschoolonline.com/blog/financial-modelling-classes-hyderabad)). These are observed editorial patterns, not proof of their traffic or the cause of any ranking.

The repository already assigns one preferred URL to each search intent in `src/content/seo/searchIntentOwnership.js`. Its September 2026 competitor-led and 20-topic plans say most subject coverage has an existing owner. The existing non-homepage URLs should be improved and connected before new URLs are added.

## Competitor patterns worth applying

1. **Cover a topic as a cluster.** A reader can move from a definition, to a role or workflow, to practical preparation, to a course or comparison page.
2. **Give each page one job.** Explain a role, show a workflow, compare credentials, answer an enrolment question, or describe a program. Do not make every page a course sales page.
3. **Show the work.** Use original fictional records, worked calculations, process maps, comparison tables, interview reasoning, and self-checks. Centaur's live trade-break case already demonstrates this approach.
4. **Make comparisons specific and maintained.** Compare like with like, show publication/review dates, and link to primary provider or credential sources. Keep fees, salaries, employer claims, and cohort details out unless verified.
5. **Connect supporting content to a relevant next step.** Link naturally from a career guide to a worked resource or course page; link from a course page back to the role and practice pages.
6. **Use local intent only where the facts support it.** Keep regional finance-market pages distinct from claims about a local campus, vacancy, or placement.

## Priority roadmap

### Wave 0 — Release and index the current work

**Why first:** The live course and career-guide pages are available and contain current contextual links, but the live finance-institute comparison still shows its earlier title and H1. The source change made in this workspace is not yet reflected on that live page.

- Build and release the reviewed non-homepage changes, including the updated finance-institute comparison metadata and finance/investment-banking-operations section.
- After release, inspect the live title, H1, canonical, robots directive, rendered text, internal links, structured data, and sitemap inclusion for the updated URL.
- Inspect representative commercial, guide, regional, resource, and blog URLs in Search Console. Fix exclusions or canonical/indexing problems before adding copy to pages Google has not indexed.
- Treat a sitemap submission as discovery assistance, not proof of indexing.

### Wave 1 — Protect and strengthen commercial-intent owners

| Page owner | Query family / intent | SEO work |
| --- | --- | --- |
| `/courses/` | Finance course, job-oriented finance course, investment-banking-operations course with placement | Keep one program page as the offer owner. Lead with who the Masterclass is for, the six-week scope, its actual modules, published modes and fees, and the written job-guarantee terms. Link to role guides and original practice examples. |
| `/placements/` | Finance course with placement or job guarantee | Put the exact published promise, who it covers, six-week completion condition, and current written terms in a clear summary. Keep support and job-guarantee wording distinct. Link to course details and outcomes evidence. |
| `/compare/best-finance-institutes-india/` | Best finance institute/course in India | Keep it a neutral decision framework. Compare curriculum, practical work, cost, credential, delivery, and written outcomes. Do not self-rank Centaur without independent criteria and evidence. |
| `/best-investment-banking-course-india/` | Best investment-banking institute/course | Clarify operations versus modelling/valuation, merchant banking, and front-office paths. Use verified provider sources and dated facts. Link to Centaur's module and course pages without presenting the module as a separate program. |
| `/compare/investment-banking-operations-courses/` | Provider comparison | Maintain a dated source register and factual comparison criteria. Recheck provider facts before changing them; avoid unsupported superiority claims. |
| Fees, eligibility, duration, online access, and placement checklists | Narrow decision support | Keep these as supporting pages. Answer the specific checklist question and link to the canonical course, placement, or access owner instead of repeating its full answer. |

The supporting decision URLs include `/best-finance-course-in-india-with-placement/`, `/best-finance-course-after-graduation/`, `/best-finance-course-after-bcom/`, `/finance-course-with-placement/`, `/finance-course-with-job-guarantee/`, `/finance-course-fees-in-india/`, `/finance-course-duration/`, `/finance-course-eligibility/`, `/online-finance-course-with-placement/`, `/job-oriented-finance-course-india/`, `/banking-finance-course-with-placement/`, `/investment-banking-operations-course-with-placement/`, `/finance-institute-lucknow-with-placement/`, `/finance-course-cities-india/`, `/finance-course-vs-mba-cfa-financial-modelling/`, and `/which-finance-course-is-right-for-me/`. Keep the canonical owner choices in `src/content/seo/searchIntentOwnership.js`; do not make these supporting URLs compete with the owner.

### Wave 2 — Deepen the role-guide cluster

Prioritize these existing canonical guides: `/career-guides/investment-banking-operations/`, `/career-guides/trade-lifecycle/`, `/career-guides/kyc-aml-analyst/`, `/career-guides/finance-operations/`, `/career-guides/finance-careers-after-graduation/`, and `/career-guides/choosing-finance-career-course/`.

- Open with a direct role or workflow answer, then explain responsibilities, entry-skill evidence, controls, and how to read current job descriptions.
- Add one distinctive task example or role-to-task-to-skill table when it adds useful information.
- Link the role guide to a matching practice resource and the relevant course module. Keep job-intent pages educational; do not imply a live vacancy or a guaranteed specific job title.
- Keep the graduate guide as the owner for broad after-graduation/BCom career research; send course-selection intent to the selection guide.

Extend this pattern to credit operations, settlement, reconciliation, digital payments, retail banking, custody, and FinTech guides already registered in the site architecture. Each guide should answer its own role or workflow question and have a distinct owner.

### Module pages — Support course discovery without splitting the offer

For `/courses/investment-banking-operations/`, `/courses/retail-banking/`, `/courses/finance-operations/`, `/courses/kyc-aml/`, `/courses/digital-payments/`, `/courses/fintech/`, and other informational module pages, explain the subject's place inside the single Financial Operations Masterclass. Give each module page useful topic detail and links to its matching role/resource guide. Do not imply a separate course, credential, or module-specific job guarantee.

### Wave 3 — Use blogs and resources to earn long-tail reach

Improve the existing blog and resource inventory rather than publishing another broad finance explainer. Use `src/content/seo/blogKeywordQueue.js` and the published-post workflow to check overlap and review status first.

| Cluster | Existing page examples | Improvement pattern |
| --- | --- | --- |
| Trade and settlement | `/blog/settlement-trade-break-worked-example/`, `/career-guides/trade-lifecycle/` | Keep the fictional source records, calculation, exception note, escalation, answer key, and links to role and reconciliation owners. |
| KYC and financial crime | `/blog/kyc-onboarding-case-file-example/`, `/career-guides/kyc-aml-analyst/` | Show what evidence is missing, what an analyst can record, and when to escalate. Label examples fictional and avoid giving legal or compliance instructions for a real institution. |
| Interview preparation | `/resources/investment-banking-interview-questions/` and accounting/finance interview pages | Provide model reasoning, not just question lists. Add a self-check rubric and separate operations interviews from modelling/advisory interviews. |
| Accounting and reconciliation | `/resources/reconciliation-in-finance/`, accounting resources, relevant blogs | Maintain one process owner and one practice-resource owner where their intents differ. Include checked fictional examples and cross-links at the point of need. |
| Career decisions and qualifications | Finance-after-graduation and finance-vs-CFA/modelling comparisons | Compare job tasks, learning purpose, eligibility, time/cost questions, and credential issuer. Recheck mutable credential details against official sources. |

For the wider article library, refresh pages when query data or a factual review shows a real gap. Add a new URL only if it answers a distinct question with original material that is not already answered well by a guide or resource.

### Wave 4 — Maintain regional pages and trust pages

- Keep `/india/` as the national-access owner; use `/india/delhi-ncr/`, `/india/bengaluru/`, `/india/mumbai/`, `/india/pune/`, and `/india/hyderabad/` as sourced market/access guides. Keep `/best-finance-course-in-delhi/`, `/best-finance-course-in-bangalore/`, `/best-finance-course-in-mumbai/`, `/best-finance-course-in-pune/`, and `/best-finance-course-in-hyderabad/` aligned as supporting regional guides. State that online study is available nationally and the published in-person option is in Lucknow. Do not create extra city doorway pages or imply local classrooms or local job outcomes.
- Keep Lucknow as the local-business/location page; confirm current address and availability before changing local facts.
- Maintain About, Contact, FAQs, student-outcome, privacy, terms, refund, disclaimer, and certificate details for consistency and trust. These pages support decisions; do not force broad keywords into legal or trust pages.
- Add named authors/reviewers and meaningful update dates to substantive guides. Review any time-sensitive claims, and remove or update stale facts rather than changing dates alone.

### Wave 5 — Earn authority with useful assets

Competitor pages use related-article paths and conversion links. Centaur can add a stronger first-party reason for relevant sites to cite it: downloadable fictional case files, answer keys, interview rubrics, and clear workflow diagrams.

- Link these assets from the relevant career guides, resource pages, and course pages.
- Share them with relevant educators, career advisers, and finance-operations communities when they are genuinely useful; request editorial citations only where the recipient chooses to reference them.
- Pursue real relevant mentions and links. Do not buy bulk links, copy competitor material, or manufacture partner/employer claims.

## Page-level SEO standard

For every indexable non-homepage URL:

- Give it one search intent and one canonical owner.
- Write a distinct title, meta description, and visible H1 that accurately describe its answer.
- Put a concise direct answer near the start, then use descriptive H2s for the reader's follow-up questions.
- Include original substance: a worked example, sourced comparison, role-task map, checklist, or other page-specific value.
- Add contextual internal links to the prior and next useful page in the journey; avoid sitewide blocks of near-identical keyword links.
- Keep canonical, robots, schema, breadcrumb, sitemap, and server-rendered content aligned with the page's real purpose.
- Review facts and internal links when a course, credential, program term, or external source changes.

## Measurement and re-prioritization

After the current release, capture two equal completed 28-day Search Console windows using the same country, search type, device, and filters. For pages with relevant impressions, export the exact page-filtered queries and decide whether the next edit should improve the title/snippet, answer depth, internal links, or indexing. Match landing pages to confirmed qualified enquiries where that data is available.

Track by URL/query pair: index status, impressions, clicks, CTR, average position, qualified enquiries, and the specific change made. Revisit after the next comparable window. Do not treat raw page count, broad sitewide query exports, or third-party estimated volumes as evidence that a page is working.

## Deferred until data is available

The exact competitor domains and pages Ubersuggest sees in India's SERPs, competitor keyword gaps, volume/difficulty, and estimated traffic remain unverified because its daily report quota was exhausted and competitor discovery returned no data. Re-run that Ubersuggest analysis when report capacity is available, then map only genuinely relevant gaps to the existing canonical owners before considering new URLs.
