# Phase 1: offer and claims verification

Reviewed 29 September 2026. This phase aligns the local public pages with the business-owner-approved offer and removes unsupported details from the rendered site. It does not certify facts that require current private business records. Those records must stay in the restricted business system rather than this repository.

## Offer used by the local site

- One Financial Operations Masterclass, described as a six-week program.
- Published program fees: ₹35,000 for live online learning across India and ₹50,000 for the in-person Lucknow option. A written quote for the applicable cohort must confirm the total payable amount, taxes, inclusions, payment and refund terms before payment.
- Graduation is the entry requirement. The program is open to graduates and job switchers from any academic background; previous finance education or work experience is not required.
- The business owner has approved this statement: graduates and job switchers who complete the six-week program get a finance job through the 100% Job Guarantee Program. The placement page and download are **summaries**; the current written terms for a learner's cohort control.
- The public summary describes interview preparation, role guidance, and suitable-opportunity guidance. No particular employer, salary, role, city, vacancy, deadline, or remedy is added by this phase.

## Claim decisions and evidence status

| Claim | Decision in this phase | Current evidence status |
| --- | --- | --- |
| Program name and curriculum | Keep the single Masterclass and its existing subject modules. | Repository and prior business brief establish published positioning. Current syllabus/version still needs the program owner's confirmation. |
| Six-week duration and online/Lucknow delivery | Keep approved existing wording; ask for cohort schedule and location confirmation. | Published site/repository wording exists; current cohort brochure and training-partner confirmation are absent. |
| Online ₹35,000; Lucknow ₹50,000 | Show the approved published amounts consistently on the course, placement, India, Lucknow, and fee-owner pages; request a written cohort quote. | Prior business-owner instruction approved restoring pricing. Current fee sheet, effective dates, tax treatment and payment terms are absent. |
| Struck-through ₹50,000/₹70,000 reference prices and “limited-time” pricing | Stop rendering discount framing until the reference-price basis and validity dates are supplied. | Legacy source data alone is insufficient to establish a current discount period. |
| Graduation requirement | State it directly on the fee and eligibility owners. No extra program entry wall is asserted. | Explicit business-owner direction in `docs/CLAIMS_EVIDENCE_POLICY.md`. Employer job requirements remain separate. |
| 100% Job Guarantee Program | Keep the approved qualified statement. Label the placement section/download as a summary, and route key CTAs to it and to contact. | Owner approval covers the phrase and core outcome. Signed current cohort terms, completion/process details and remedies are absent. |
| 80% attendance, Bronze score, CTC acceptance and fixed interview/support windows | Remove from rendered placement terms and block their accidental return to prerendered pages. | Present in legacy source/review draft only; no current written approval. The review-status blog draft is not published. |
| Named learner quotes and employer roles | Remove the testimonial carousel from the public home page; keep historical source data untouched. | Written consent, identity and current-role verification were not provided. |
| Salary range, placement counts and outcome statistics | Keep out of rendered commercial pages. | No dated cohort records or methodology were provided. |
| Hiring-partner logos | Keep the previously owner-approved logo collection with the existing scope note; do not imply a particular vacancy. | Current relationship and logo-permission records still need business review. |
| Certificate | Keep only the Centaur Careers Course Completion Certificate description and request the template/conditions. | Current certificate template and completion rules are absent. |
| Lucknow address | Align public SEO copy with `BUSINESS_DATA` spelling (“Barabirwa”); direct learners to the location page/map. | The repository previously also used “Badabirwa”; the exact current address and map listing need business confirmation. |
| Phone, email, WhatsApp and enrollment link | Keep centralized published channels and direct contact routes. | Live delivery and ownership of all channels still need confirmation. |

## Wiring and checks

The homepage now links to the fee owner, program entry guide and guarantee summary in place of unconsented named testimonials. The course, placement, India, Lucknow, contact, footer, regional, informational and legal pages use the same summary boundary. Download labels identify the syllabus and placement files as summaries. The fee owner now answers the published price and graduation questions directly. The placement page no longer renders legacy eligibility thresholds or presents its summary as the full agreement. The disclaimer now preserves the approved finance-job promise instead of contradicting it. CTA channel classification was corrected to follow the actual outbound destination.

`npm run seo:phase1:offer:check` inspects prerendered pages for approved prices, entry wording, the summary boundary, contact paths, removed testimonials, unsupported salary/discount copy, and legacy placement thresholds. It is included in `npm run seo:check` and therefore the release QA gate. Automated checks verify rendered text and link wiring; they cannot authenticate a contract, fee sheet, consent, employer relationship, or a connected call.

## Live deployment boundary

On 29 September the [live homepage](https://centaurcareers.in/) still showed the earlier salary-range heading and named testimonials, and the [live placement page](https://centaurcareers.in/placements/) still showed 80% attendance, Bronze score and CTC conditions as published terms. These findings describe the deployed version observed during this work. The local fixes require a reviewed deployment and a fresh live check before they can be called live.

## Business evidence needed to close verification

1. Current dated fee sheet for online and Lucknow cohorts, tax/inclusion details, reference-price basis, validity dates, instalment, cancellation and refund wording.
2. Current owner-approved written Job Guarantee Program agreement: exact completion criteria, support process/window, covered outcome, exclusions and remedy language.
3. Current cohort brochure/syllabus and certificate template, with delivery schedule and the Lucknow training-partner/address confirmation.
4. Written consent and current role verification for any named testimonial to be restored; current relationship/logo permission records for the published hiring network.
5. Confirmation that the phone, email, WhatsApp and enrollment form remain active and controlled by Centaur Careers.

Until these records are reviewed, the status is **local implementation complete; external offer verification open**. Do not infer that a local release check proves the underlying commercial promise.
