import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { SITE_ORIGIN } from '@/seo/siteConfig.js';
import { sendGoogleAnalyticsEvent, trackAnalyticsEvent } from '@/analytics/ga4.js';
import { getMeasurementEventFields } from '@/analytics/measurementTaxonomy.js';

const ATTRIBUTION_STORAGE_KEY = 'centaur:marketing-attribution:v1';
const ATTRIBUTION_PARAMETERS = Object.freeze([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
]);

const CTA_CONTEXT_CLASSES = Object.freeze({
  'floating-whatsapp-link': 'floating_whatsapp',
  'site-header-cta': 'header',
  'site-mobile-cta': 'mobile_navigation',
  'home-magnetic-button': 'home_hero',
  'job-guarantee-popup-whatsapp': 'job_guarantee_popup',
  'site-footer-contact': 'footer_contact',
  'site-footer-social': 'footer_social',
});

function safeAttributionValue(value) {
  const token = String(value || '').trim().slice(0, 120);
  // Campaign labels should be short marketing tokens, never contact details or URLs.
  if (!/^[a-z0-9._ -]+$/i.test(token) || /\d{7,}/.test(token)) return '';
  return token;
}

function readAttributionStorage() {
  try {
    const stored = window.sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function writeAttributionStorage(value) {
  try {
    window.sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Storage can be unavailable in private browsing; analytics should still work.
  }
}

function getQueryAttribution(search) {
  const params = new URLSearchParams(search);
  const values = {};
  for (const key of ATTRIBUTION_PARAMETERS) {
    const value = safeAttributionValue(params.get(key));
    if (value) values[key] = value;
  }
  return values;
}

function updateAttribution(location) {
  const stored = readAttributionStorage();
  const current = getQueryAttribution(location.search);
  if (Object.keys(current).length === 0) return stored;

  const touch = {
    ...current,
    landing_path: location.pathname,
    captured_at: new Date().toISOString(),
  };
  const next = {
    first_touch: stored.first_touch || touch,
    last_touch: touch,
  };
  writeAttributionStorage(next);
  return next;
}

function attributionEventFields(attribution) {
  const first = attribution?.first_touch || {};
  const last = attribution?.last_touch || {};
  const fields = {};
  for (const [prefix, touch] of [['first_touch', first], ['last_touch', last]]) {
    if (touch.utm_source) fields[prefix + '_source'] = touch.utm_source;
    if (touch.utm_medium) fields[prefix + '_medium'] = touch.utm_medium;
    if (touch.utm_campaign) fields[prefix + '_campaign'] = touch.utm_campaign;
    if (touch.utm_content) fields[prefix + '_content'] = touch.utm_content;
    if (touch.landing_path) fields[prefix + '_landing_path'] = touch.landing_path;
  }
  return fields;
}

function getOutboundChannel(anchor) {
  const href = anchor.getAttribute('href');
  if (!href) return null;

  const normalizedHref = href.trim().toLowerCase();
  if (normalizedHref.startsWith('tel:')) return 'phone';
  if (normalizedHref.startsWith('mailto:')) return 'email';

  let destination;
  try {
    destination = new URL(href, SITE_ORIGIN);
  } catch {
    return null;
  }

  if (destination.origin === SITE_ORIGIN) return null;

  const hostname = destination.hostname.toLowerCase();
  if (
    destination.protocol === 'whatsapp:'
    || hostname === 'wa.me'
    || hostname === 'wa.link'
    || hostname === 'api.whatsapp.com'
    || hostname === 'whatsapp.com'
    || hostname.endsWith('.whatsapp.com')
  ) {
    return 'whatsapp';
  }

  if (
    hostname === 'forms.gle'
    || (hostname === 'docs.google.com' && destination.pathname.startsWith('/forms'))
    || anchor.getAttribute('data-analytics-channel') === 'enrollment'
  ) {
    return 'enrollment_form';
  }

  return null;
}

function getInternalDestination(anchor) {
  const href = anchor.getAttribute('href');
  if (!href) return null;

  try {
    const destination = new URL(href, SITE_ORIGIN);
    if (destination.origin !== SITE_ORIGIN) return null;
    return destination.pathname;
  } catch {
    return null;
  }
}

function getInternalPathwayContext(anchor) {
  if (anchor.closest('[data-conversion-cta]')) return 'conversion_section';
  if (anchor.closest('[data-role-intent-pathway]')) return 'role_intent_pathway';
  if (anchor.closest('.prose-readable')) return 'article_content';
  if (anchor.closest('[data-internal-link-group]')) return 'related_pages';
  return null;
}

function getCtaContext(anchor) {
  for (const [className, context] of Object.entries(CTA_CONTEXT_CLASSES)) {
    if (anchor.classList.contains(className)) return context;
  }

  if (anchor.hasAttribute('data-location-phone') || anchor.hasAttribute('data-location-email')) {
    return 'location_contact';
  }

  return undefined;
}

function getCtaIntent(anchor) {
  const value = anchor.getAttribute('data-analytics-intent');
  return value ? value.trim().slice(0, 80) : undefined;
}

function getCtaId(anchor, channel, path) {
  const explicitId = anchor.getAttribute('data-analytics-id');
  if (explicitId) return explicitId;
  const context = getCtaContext(anchor);
  if (context) return context;
  return (channel + ':' + path).replace(/[^a-z0-9:_/-]+/gi, '-');
}

export default function AnalyticsPageView() {
  const location = useLocation();
  const isInitialPage = useRef(true);
  const currentPath = useRef(location.pathname);
  const previousNavigationKey = useRef(null);
  const previousPageLocation = useRef(null);
  const attribution = useRef({});

  currentPath.current = location.pathname;

  useEffect(() => {
    attribution.current = updateAttribution(location);
    // Keep query strings out of analytics: they can contain arbitrary user data.
    // Still count a client-side query change because it can change page content.
    const navigationKey = `${location.pathname}${location.search}`;
    if (previousNavigationKey.current === navigationKey) return;
    const pageLocation = `${SITE_ORIGIN}${location.pathname}`;

    const pageView = {
      page_location: pageLocation,
      page_path: location.pathname,
      page_title: document.title,
      ...getMeasurementEventFields(location.pathname),
    };
    if (previousPageLocation.current) pageView.page_referrer = previousPageLocation.current;
    sendGoogleAnalyticsEvent('page_view', pageView);
    previousNavigationKey.current = navigationKey;
    previousPageLocation.current = pageLocation;

    if (isInitialPage.current) {
      isInitialPage.current = false;
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'virtual_page_view',
      page_location: pageLocation,
      page_path: location.pathname,
      page_title: document.title,
      ...getMeasurementEventFields(location.pathname),
      ...attributionEventFields(attribution.current),
    });
  }, [location.pathname, location.search, location]);

  useEffect(() => {
    function handleOutboundClick(event) {
      const target = event.target instanceof Element ? event.target : null;
      const anchor = target?.closest('a[href]');
      if (!anchor) return;

      const downloadPath = getInternalDestination(anchor);
      if (anchor.hasAttribute('download') && downloadPath?.startsWith('/downloads/')) {
        const downloadEvent = {
          page_path: currentPath.current,
          page_location: `${SITE_ORIGIN}${currentPath.current}`,
          ...getMeasurementEventFields(currentPath.current),
          download_path: downloadPath,
          download_name: anchor.getAttribute('download') || downloadPath.split('/').pop(),
          cta_id: getCtaId(anchor, 'download', currentPath.current),
          ...attributionEventFields(attribution.current),
        };
        const downloadIntent = getCtaIntent(anchor);
        if (downloadIntent) downloadEvent.cta_intent = downloadIntent;
        trackAnalyticsEvent('download_click', downloadEvent);
        return;
      }

      const channel = getOutboundChannel(anchor);
      const path = currentPath.current;
      if (!channel) {
        const destinationPath = getInternalDestination(anchor);
        const pathwayContext = getInternalPathwayContext(anchor);
        if (!destinationPath || !pathwayContext) return;

        const pathwayData = {
          event: 'internal_pathway_click',
          page_path: path,
          page_location: `${SITE_ORIGIN}${path}`,
          ...getMeasurementEventFields(path),
          destination_path: destinationPath,
          cta_context: pathwayContext,
          cta_id: getCtaId(anchor, 'internal', path),
          ...attributionEventFields(attribution.current),
        };
        const ctaIntent = getCtaIntent(anchor);
        if (ctaIntent) pathwayData.cta_intent = ctaIntent;
        const { event: pathwayEvent, ...pathwayParameters } = pathwayData;
        trackAnalyticsEvent(pathwayEvent, pathwayParameters);
        return;
      }

      const eventData = {
        event: 'lead_cta_click',
        channel,
        page_path: path,
        page_location: `${SITE_ORIGIN}${path}`,
        ...getMeasurementEventFields(path),
      };
      const ctaContext = getCtaContext(anchor);
      if (ctaContext) eventData.cta_context = ctaContext;
      eventData.cta_id = getCtaId(anchor, channel, path);
      const ctaIntent = getCtaIntent(anchor);
      if (ctaIntent) eventData.cta_intent = ctaIntent;
      Object.assign(eventData, attributionEventFields(attribution.current));

      const { event: eventName, ...eventParameters } = eventData;
      trackAnalyticsEvent(eventName, eventParameters);
    }

    document.addEventListener('click', handleOutboundClick, true);
    return () => document.removeEventListener('click', handleOutboundClick, true);
  }, []);

  return null;
}
