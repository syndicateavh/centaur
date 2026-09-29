# India regional page governance

The regional cluster contains five selective market-and-access guides:

| Route | Regional focus | Local search scope |
| --- | --- | --- |
| `/india/delhi-ncr/` | GCC, BFSI operations, lending, payments, and controls | Delhi, Gurugram, Noida, Ghaziabad, Faridabad |
| `/india/bengaluru/` | FinTech, payments, GCC, data, and process operations | Whitefield, Outer Ring Road, Electronic City, Manyata Tech Park, central Bengaluru |
| `/india/mumbai/` | Capital markets, settlements, custody, and asset servicing | Bandra Kurla Complex, Lower Parel, Andheri, Navi Mumbai, Thane |
| `/india/pune/` | Technology-enabled finance operations and shared services | Hinjawadi, Kharadi, Viman Nagar, Magarpatta, central Pune |
| `/india/hyderabad/` | GCC, lending, payments, KYC, and process operations | HITEC City, Gachibowli, Financial District, Madhapur, Secunderabad |

## Page requirements

Every published regional page must have:

- a unique title, description, H1, direct answer, market context, FAQs, and public evidence;
- a local search scope based on real business areas, not a keyword list;
- role and workflow vocabulary that reflects the region’s market context;
- a clear statement that Centaur Careers’ published in-person location is in Lucknow;
- no claim of a local Centaur office, classroom, vacancy, salary, or city-specific placement outcome;
- canonical metadata, sitemap inclusion, contextual internal links, and `index,follow` status;
- `spatialCoverage` structured data describing the market guide’s region without turning it into a `LocalBusiness` entity.

The local-area section is a decision aid for comparing job postings. It is not a claim that Centaur Careers has a facility in any listed area.

## Expansion rule

Do not create a new city page from keyword volume alone. A new page requires distinct public evidence, a unique learner-access explanation, enough original market context, and a verified internal-link and schema path. The current five-page limit remains in force until the evidence and maintenance capacity justify expansion.

## Verification

```text
npm run seo:regional:check
node tools/verify-structured-data.js
```
