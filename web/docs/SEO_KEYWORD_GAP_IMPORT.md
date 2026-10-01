# Semrush keyword-gap inventory

The full 23 September 2026 Semrush export is stored outside the application
source tree at
`data/seo/keyword-gap/semrush-organic-competitors-keyword-gap-2026-09-23.json`.
It is an analysis inventory only: importing it does not publish pages, add
course offerings, make curriculum claims, or modify the approved 728-keyword
strategy.

## Re-import

```powershell
npm run seo:keywords:gap:import -- "C:\path\to\gap.keywords_2026-09-23T20_20_20.786Z.xlsx"
```

The importer verifies that the workbook has one visible worksheet, the expected
Semrush keyword, metric, domain-position, page, and result columns, populated
keywords, unique normalized keywords, and valid non-negative numeric values.
It retains the source position `0` as Semrush's “not ranking” value and keeps
the corresponding page cells as null when blank. It rejects duplicate
keywords rather than silently discarding rows. Source filename, SHA-256, file
timestamps, sheet name, analyzed domain, competitor domains, column names, and
validation counts are retained in the JSON. Any keyword-difficulty value of
`-1` is preserved exactly and counted separately; confirm its Semrush meaning
before treating it as an actual difficulty score.

The workbook does not identify its country/database, language, or device in its
columns or workbook properties. Those settings are recorded as `null`; they
must not be inferred from the domain or keyword text. Confirm them in the
Semrush report UI before using volumes or positions for market-specific
decisions.

The four competitor domains in this export are
`zelleducation.com`, `quintedge.com`, `proschoolonline.com`, and `imarticus.org`.
This file is deliberately not imported into the app bundle or the separate
728-keyword strategy. Any later page/content plan must stay informational where
Centaur does not offer that course; the current course is Financial Operations
Masterclass.

## Phase 2: review and classify

After importing, generate a separate, versioned classification and a spreadsheet-
friendly human-review queue:

```powershell
npm run seo:keywords:gap:classify
```

This classifies every source row and preserves the imported inventory unchanged.
The output artifacts are:

- `data/seo/keyword-gap/semrush-organic-competitors-keyword-gap-classified-2026-09-23.json` — all source keywords with topic, intent, audience relevance, content disposition, confidence, suggested existing route (where applicable), rule IDs, review flags, claim boundaries, and competitor top-10 signals.
- `data/seo/keyword-gap/semrush-keyword-gap-manual-review-2026-09-23.csv` — rows needing a human topic/SERP decision; factual-source and claim checks are listed separately from classification-review reasons.
- `data/seo/keyword-gap/semrush-keyword-gap-classification-report-2026-09-23.md` — coverage and category totals, methodology, limitations, and the next-phase handoff.

This is a rule-based first review, not a claim that a person checked all live
Google results. The report and CSV explicitly identify the pending human review
queue. Third-party certification queries remain informational-only; the single
Financial Operations Masterclass is never split into additional course
offerings. No public pages are created and no volume-based priority is assigned
while the export's country/database and device settings remain unknown.

## Phase 3: cluster and map

After reviewing the Phase 2 classification, generate a one-owner map for every
keyword:

```powershell
npm run seo:keywords:gap:map
```

The mapper uses exact normalized matches to the approved 728-keyword strategy
first, then current Phase 2 route suggestions and tightly scoped live resource
matches. Existing targets are checked against the indexable route registry.
Otherwise each row is assigned to a proposed informational cluster, a manual
review/hold queue, or an explicit out-of-scope cluster. This produces planning
artifacts only; it does not alter the 728-keyword strategy or create pages.
Course/training/certification intent is not treated as proof that Centaur offers
that subject: unless it is an exact approved strategy term or explicitly names
the Financial Operations Masterclass, it is held for current-offer and SERP
review before any route or content claim is assigned.

Outputs:

- `data/seo/keyword-gap/semrush-organic-competitors-keyword-gap-mapped-2026-09-23.json` — complete mapped records and cluster register.
- `data/seo/keyword-gap/semrush-keyword-gap-keyword-map-2026-09-23.csv` — all keyword rows with one cluster/owner decision each.
- `data/seo/keyword-gap/semrush-keyword-gap-clusters-2026-09-23.csv` — cluster-level page/hold/exclusion plan.
- `data/seo/keyword-gap/semrush-keyword-gap-phase3-cluster-and-map-report-2026-09-23.md` — totals, target routes, limitations, and claim boundaries.

Proposed page clusters have no approved URL or proposed slug until SERP review,
source review, editorial approval, and governance checks are complete. The
Phase 2 manual-review flag is retained row by row even where a tentative cluster
is suggested. Only the Financial Operations Masterclass exists as a course;
third-party qualification clusters are informational-only and must not be
described as Centaur courses or exam preparation. Semrush market/device
settings remain unknown, so volumes are not rolled up or used as a priority
forecast.
