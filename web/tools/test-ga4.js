#!/usr/bin/env node

import assert from 'node:assert/strict';
import { GA4_MEASUREMENT_ID, sendGoogleAnalyticsEvent, trackAnalyticsEvent } from '../src/analytics/ga4.js';

const scripts = [];
const frames = [];
const idleCallbacks = [];
const browser = {
  dataLayer: [],
  requestAnimationFrame: (callback) => {
    frames.push(callback);
    return frames.length;
  },
  cancelAnimationFrame: () => {},
  requestIdleCallback: (callback) => {
    idleCallbacks.push(callback);
    return idleCallbacks.length;
  },
  cancelIdleCallback: () => {},
};
const documentRoot = {
  querySelector: () => scripts[0] || null,
  createElement: () => ({ dataset: {} }),
  head: { appendChild: (script) => scripts.push(script) },
};

sendGoogleAnalyticsEvent('page_view', { page_path: '/india/pune/' }, browser, documentRoot);
sendGoogleAnalyticsEvent('lead_cta_click', { channel: 'whatsapp' }, browser, documentRoot);
trackAnalyticsEvent('quiz_whatsapp_request_prepared', { quiz_domain: 'investment-banking' }, browser, documentRoot);

assert.equal(scripts.length, 0, 'GA4 network script should not compete with the first paint');
assert.equal(frames.length, 1, 'GA4 loader should wait for the first animation frame');
frames.shift()();
assert.equal(frames.length, 1, 'GA4 loader should wait for a second animation frame');
frames.shift()();
assert.equal(idleCallbacks.length, 1, 'GA4 loader should wait for idle time after painting');
idleCallbacks.shift()();

assert.equal(scripts.length, 1, 'GA4 script should be loaded once after painting');
assert.equal(scripts[0].src, `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`);
assert.deepEqual(Array.from(browser.dataLayer[1]), ['config', GA4_MEASUREMENT_ID, { send_page_view: false }]);
assert.deepEqual(Array.from(browser.dataLayer[2]), [
  'event', 'page_view', { page_path: '/india/pune/', send_to: GA4_MEASUREMENT_ID },
]);
assert.deepEqual(Array.from(browser.dataLayer[3]), [
  'event', 'lead_cta_click', { channel: 'whatsapp', send_to: GA4_MEASUREMENT_ID },
]);
assert.deepEqual(Array.from(browser.dataLayer[4]), [
  'event', 'quiz_whatsapp_request_prepared', { quiz_domain: 'investment-banking', send_to: GA4_MEASUREMENT_ID },
]);
assert.deepEqual(browser.dataLayer[5], {
  event: 'quiz_whatsapp_request_prepared',
  quiz_domain: 'investment-banking',
});

console.log('GA4 event queue verified: events queue immediately and one loader runs after first paint.');
