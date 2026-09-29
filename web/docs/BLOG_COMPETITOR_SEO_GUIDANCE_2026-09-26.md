# Blog competitor SEO guidance — 26 September 2026

For the competitor-led page and blog work order, wording examples and internal-link map, see [Competitor-led content and on-page SEO plan](./COMPETITOR_LED_CONTENT_PLAN_2026-09-26.md).

The [Phase 4 expansion audit](./PHASE4_EXPAND_FROM_RESULTS_2026-09-26.md) records the published-post source/link review and the evidence still needed before selecting result-led new pages or revisions.

## Scope and method

This is a **representative page review**, not a full crawl, traffic analysis, or ranking report. I inspected the public HTML for both blog home pages, Imarticus's finance archive, and selected finance articles on 26 September 2026. The sample below records the actual HTML `<title>`, meta description, canonical, headings, and JSON-LD types. Topic intent is an editorial inference from those pages; it is not evidence of which queries drive clicks.

IMS Proschool's site is [proschoolonline.com/blog](https://proschoolonline.com/blog); the requested “imsproschool” refers to that publisher.

## Representative blog list and search intent

| Publisher | Article | Apparent question or query family | Funnel role |
| --- | --- | --- | --- |
| Imarticus | [Beginner's guide to investment banking operations](https://imarticus.org/blog/a-beginners-guide-to-understanding-investment-banking-operations/) | What investment banking operations are; process; front versus back office | Broad awareness leading to its operations programme |
| Imarticus | [Top skills from an investment banking operations course](https://imarticus.org/blog/investment-banking-operations-course/) | Operations course skills and career value | Course consideration |
| Imarticus | [Investment banking degree](https://imarticus.org/blog/investment-banking-degree/) | Degree requirement, routes and alternatives | Qualification choice |
| Imarticus | [KYC analyst jobs](https://imarticus.org/blog/kyc-analyst/) | Role, duties, career path | Role exploration leading to CIBOP |
| IMS Proschool | [CFA vs MBA vs CFP vs FRM](https://proschoolonline.com/blog/cfa-vs-mba-vs-cfp-vs-frm) | Qualification comparison, costs, time and fit | High consideration comparison |
| IMS Proschool | [Financial modelling classes in Hyderabad](https://proschoolonline.com/blog/financial-modelling-classes-hyderabad) | City plus course options | Local course consideration |
| IMS Proschool | [Financial modelling for investment banking](https://proschoolonline.com/blog/financial-modelling-courses-for-investment-banking) | Course, skills and salary | Course consideration |
| IMS Proschool | [Benefits and career value of financial modelling](https://proschoolonline.com/blog/benefits-of-learning-financial-modelling) | Career paths and skill return | Skill exploration leading to a course |

The [Imarticus blog hub](https://imarticus.org/blog/) groups Finance, Analytics, Marketing, Human Resources, Operations and Technology. Its [finance category](https://imarticus.org/blog/category/finance/) explicitly lists certification and banking themes: ACCA, CMA, CFA, CPA, FRM, investment banking, financial analysis, fintech, markets, banking, trading and accounting. The [Proschool blog listing](https://proschoolonline.com/blog) prominently features finance credentials, commerce career choices, qualification comparisons, financial modelling, city course queries, and practical job questions. Both use informational articles to link the reader toward their own course paths. That last sentence is an inference from the sampled pages and their course links.

## Metadata and semantic HTML observed

| Page | HTML title | Meta description approach | H1 and page semantics |
| --- | --- | --- | --- |
| [Imarticus blog hub](https://imarticus.org/blog/) | `Job Oriented Courses for Freshers & Executives \| Imarticus Learning` | Generic provider and course description | No H1 in fetched HTML; H2 “Browse by Category”; `CollectionPage` and `BreadcrumbList` JSON-LD |
| [Imarticus finance archive](https://imarticus.org/blog/category/finance/) | `Finance - Imarticus Blog` | Short finance category promise | H1 “Finance Blogs”; `CollectionPage` and `BreadcrumbList` JSON-LD |
| [Imarticus operations beginner guide](https://imarticus.org/blog/a-beginners-guide-to-understanding-investment-banking-operations/) | `A Beginner’s Guide to Understanding Investment Banking Operations - Imarticus Blog` | Long opening excerpt, cut off mid-thought in the HTML meta description | H1 repeats the visible article title; H2s define operations, process, and front/back office; `BlogPosting` and breadcrumbs |
| [Imarticus investment banking degree](https://imarticus.org/blog/investment-banking-degree/) | `Investment Banking Degree and Why It Attracts Top Talent` | Specific question and reader benefit | H1 “Investment Banking Degree and What Makes It Worth Pursuing”; degree-path H2/H3 sections; `BlogPosting` and breadcrumbs |
| [Proschool blog hub](https://proschoolonline.com/blog) | `Finance & Analytics Blog \| IMS Proschool` | Broad finance, analytics and marketing invitation | H1 “Blog”; post links are repeated in H4 and H2 card headings; `CollectionPage` and breadcrumbs |
| [Proschool finance course comparison](https://proschoolonline.com/blog/cfa-vs-mba-vs-cfp-vs-frm) | `CFA vs MBA vs CFP vs FRM: 2026 Guide` | Names options plus cost, duration, difficulty and fit | More descriptive comparison H1; each pair gets an H2 and a comparison table; `Article` and breadcrumbs |
| [Proschool Hyderabad article](https://proschoolonline.com/blog/financial-modelling-classes-hyderabad) | `Financial Modelling Classes in Hyderabad \| Proschool` | Location, course structure, learning and choice | Matching H1; H2s cover demand, programme, credentials, career, salary and FAQs; `Article` and breadcrumbs |

All sampled pages returned self-referencing canonical URLs, except the old Proschool `/scope-of-financial-modeling` URL, which resolved to the newer [benefits-of-learning-financial-modelling](https://proschoolonline.com/blog/benefits-of-learning-financial-modelling) canonical. These are page observations, not proof that search engines index or rank them. H2s inside a popup or CTA on competitor pages should not be treated as article outline ideas.

## Guidance for Centaur Careers

1. **Keep one owner for each intent.** The existing [India keyword map](./INDIA_KEYWORD_MAP_2026-09-26.md) owns programme queries at `/courses/`, investment banking operations role queries at `/career-guides/investment-banking-operations/`, and introductory banking functions at `/blog/investment-banking-teams-operations/`. Link between them with descriptive anchors. Do not publish a second “investment banking operations course” blog page to compete with `/courses/`.
2. **Use a narrower editorial focus than the competitors.** Prioritise actual finance operations tasks, analyst skills, sample workflows, interview preparation and entry routes for graduates. Useful first-party angles include a worked trade break, a fictional KYC case decision, a reconciliation example, or an interview answer rubric. Existing [blog queue](../src/content/seo/blogKeywordQueue.js) already assigns subjects and checks overlap; review it before creating a brief.
3. **Write search metadata to match the page.** Give each indexable page a distinct, descriptive title and a concise description that states the specific answer. Use the visible H1 for the page's main subject, H2s for major questions, and H3s only within the relevant H2. A title and H1 can differ in wording while agreeing on intent. Avoid the generic hub H1 and cut-off excerpt patterns seen in the samples. Google can generate title links and snippets from more than these tags, so treat them as editorial inputs rather than fixed search-result text ([title-link guidance](https://developers.google.com/search/docs/appearance/title-link), [snippet guidance](https://developers.google.com/search/docs/appearance/snippet)).
4. **Use the existing semantic and metadata fields.** Centaur's blog hub gets its title, description and H1 from `src/seo/seoRoutes.js`. An article gets its one H1 from `PageHero` in `src/pages/BlogPostPage.jsx`; body heading blocks support H2/H3 through `BlogContentRenderer.jsx`. Set `post.title`, `post.seo.title`, `post.seo.description`, `post.seo.canonicalPath`, truthful author and substantive dates in the JSON record. `blogSeo.js` emits canonical, social metadata, `BlogPosting` and breadcrumbs. Structured data should describe visible, accurate content ([Google Article guidance](https://developers.google.com/search/docs/appearance/structured-data/article)).
5. **Separate information from conversion.** Answer the user's question first with an example, process, comparison criteria or evidence. Link once or twice to the relevant course or career guide when the next step is genuinely relevant. Avoid repeating programme sales copy in every H2.
6. **Protect factual claims.** Verify any fee, salary, placement, syllabus, credential, city access, regulation or current-year claim before publishing. Centaur's [claims evidence policy](./CLAIMS_EVIDENCE_POLICY.md) and [blog workflow](../src/content/blog/README.md) govern what may be said. For city topics, describe verified Lucknow access or live online access rather than implying another centre.

### Example editorial brief

| Field | Recommendation |
| --- | --- |
| Subject | A trade break during securities settlement: how an operations analyst investigates it |
| Primary intent | Understand a specific operations workflow, not enrol in a course |
| Proposed H1 | `Trade Breaks in Securities Settlement: A Worked Example` |
| Possible title tag | `Trade Breaks in Settlement: Example and Analyst Checklist \| Centaur Careers` |
| Meta description | `Follow a fictional settlement mismatch from detection to resolution. See the checks an operations analyst records and when the case is escalated.` |
| Outline | H2: What counts as a trade break?; H2: Worked example; H2: Investigation checklist; H2: Escalation and controls; H2: Skills this builds |
| Existing-page check | Compare with `/career-guides/trade-lifecycle/` and `/resources/reconciliation-in-finance/`; publish only if the worked example provides a distinct answer |
| Evidence | Label the example fictional; cite current primary sources for any real market or regulatory rule |

This is a **brief candidate**, not an approved new URL or a claim of search volume. Check Search Console queries and existing-page overlap before commissioning it.
