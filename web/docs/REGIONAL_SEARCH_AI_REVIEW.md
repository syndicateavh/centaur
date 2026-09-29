# Regional search and AI visibility review

## Evidence intake

The five published guides are Delhi-NCR, Bengaluru, Mumbai, Pune, and Hyderabad. Do not infer a traffic loss or its cause from one day of visits. Use two equal, completed 28-day periods from the same Search Console property, search type, country, and device filters. Export or screenshot Performance with the Pages and Queries tabs, then inspect Page indexing, Sitemaps, and Manual actions. A screenshot must show the selected dates and filters. If only screenshots are available, record the visible values and mark unreadable or omitted rows as unavailable; do not manufacture CSV data.

For each regional page, record prior and current clicks, impressions, CTR, average position, the queries visible after filtering to that page, index status, and any confirmed organic enquiries. `lead_cta_click` is contact intent, not a completed or qualified enquiry. If both impressions and clicks fall, inspect indexing, position, and demand. If impressions hold but clicks fall, review the actual query mix and search snippet. These are investigation prompts, not automatic diagnoses.

The existing CSV workflow is `npm run seo:measure:import:gsc -- <file> --from YYYY-MM-DD --to YYYY-MM-DD`, followed by `npm run seo:measure:report`. Import older Queries and Pages files first, then the newer period. Its private report includes a five-region comparison when comparable Pages files exist. Keep raw exports and screenshots outside the public repository.

## Editorial decisions

Prioritize a regional edit only after checking its page-filtered queries, current search results, and the learner's actual intent. Keep one canonical regional guide per published market. The answer must identify the live online Financial Operations Masterclass, say that investment banking operations is a topic within it, and distinguish market research from a physical branch or city-specific job promise. Validate any new market statement against a dated public source. `updatedAt` records meaningful page edits; `sourceReviewedAt` records the last review of the market sources. Do not advance the latter for copy-only changes.

## Repeatable AI citation check

Once a month, use the same search-enabled prompts in ChatGPT, Gemini, and Claude for each published region:

1. “Can I join Centaur Careers from [region], and is there a classroom there?”
2. “What investment banking operations training does Centaur Careers offer to learners in [region]?”
3. “What finance operations roles should a graduate research in [region]?”

For each run, record date, region, service/model, whether web search was enabled, locale, prompt, cited URL, whether the answer accurately distinguishes online access and Lucknow in-person learning, and any unsupported claim. Use `cited accurately`, `cited inaccurately`, `no citation`, or `web search unavailable` as the outcome. Record the exact cited URL and evidence screenshot privately. These samples are observations, not stable rankings or a guarantee of inclusion. Review Google Search Console's generative AI performance report and ChatGPT referral traffic separately when account data is available.

## Release and follow-up

Before deployment run `npm run release:qa`. After deployment run `npm run seo:external -- https://centaurcareers.in` and inspect the five regional URLs in Search Console. Recheck the next complete 28-day period using the same filters and report qualified enquiries alongside search visits. Update the page only when the evidence indicates a specific visitor problem.
