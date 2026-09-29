import { scheduleAfterPaint } from '../lib/deferredWork.js';

export const GA4_MEASUREMENT_ID = 'G-K4K93GXSX7';

function loadGoogleAnalytics(documentRoot) {
  if (documentRoot.querySelector('script[data-centaur-ga4]')) return;

  const script = documentRoot.createElement('script');
  script.async = true;
  script.dataset.centaurGa4 = 'true';
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
  documentRoot.head.appendChild(script);
}

export function ensureGoogleAnalytics(browser = window, documentRoot = document) {
  if (browser.__centaurGa4Initialized) return;
  browser.__centaurGa4Initialized = true;

  browser.dataLayer = browser.dataLayer || [];
  browser.gtag = browser.gtag || function gtag() {
    browser.dataLayer.push(arguments);
  };

  browser.gtag('js', new Date());
  browser.gtag('config', GA4_MEASUREMENT_ID, { send_page_view: false });

  browser.__centaurGa4LoadCancel = scheduleAfterPaint(
    () => loadGoogleAnalytics(documentRoot),
    browser,
  );
}

export function sendGoogleAnalyticsEvent(name, parameters, browser = window, documentRoot = document) {
  ensureGoogleAnalytics(browser, documentRoot);
  browser.gtag('event', name, { ...parameters, send_to: GA4_MEASUREMENT_ID });
}

/**
 * Send one application event to both GA4 and the site's GTM data layer.
 * Keep parameters aggregate and non-identifying; never pass form values here.
 */
export function trackAnalyticsEvent(name, parameters = {}, browser = window, documentRoot = document) {
  sendGoogleAnalyticsEvent(name, parameters, browser, documentRoot);
  browser.dataLayer = browser.dataLayer || [];
  browser.dataLayer.push({ ...parameters, event: name });
}
