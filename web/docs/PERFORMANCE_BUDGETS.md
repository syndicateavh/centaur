# Performance budgets

Run performance validation only after the new static output is built and deployed to staging. Test the homepage, course hub, one course detail page, placements, Lucknow location and contact pages three times on mobile settings and use the median run.

## Release thresholds

- Lighthouse mobile performance score: 90 or higher.
- Largest Contentful Paint: 2,500 ms or less.
- Total Blocking Time: 200 ms or less.
- Cumulative Layout Shift: 0.10 or less.
- No first-party JavaScript, CSS, font or image request may return 403 without a Referer.
- No critical image or font may depend on a third-party origin.
- Primary page content must remain present in raw HTML.

## Investigation order

1. Confirm the LCP element and split LCP into server response, resource delay, resource duration and render delay.
2. Attribute every task longer than 50 ms to first-party or third-party JavaScript.
3. Check font and CSS requests for render blocking.
4. Confirm below-the-fold media is lazy-loaded and sized.
5. Confirm hashed assets receive immutable caching and compression.
6. Compare the staging results with field Core Web Vitals after production receives sufficient traffic.

Performance thresholds are release gates, not ranking promises. If one fails, retain the current production deployment and investigate before switching traffic.
