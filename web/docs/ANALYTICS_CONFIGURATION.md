# Analytics configuration

The source loads Google Tag Manager container `GTM-T3QHF5HQ` as the only analytics loader. It does not load GA4 or Ahrefs directly.

## Required GTM setup

1. Keep one Google tag for the production GA4 measurement ID.
2. Allow that tag to send the initial page view once.
3. Create a custom-event trigger named `virtual_page_view`.
4. On that event, send one GA4 `page_view` using the `page_location`, `page_path` and `page_title` data-layer values.
5. Disable any overlapping History Change page-view trigger or GA4 enhanced-measurement history tracking.
6. Do not add a second direct `gtag.js` snippet through Hostinger.

Before publishing, use GTM Preview, Tag Assistant, GA4 DebugView and browser network requests to confirm exactly one page view for the initial load and one for each React Router navigation.
