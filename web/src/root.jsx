import React, { useEffect } from 'react';
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useNavigation } from 'react-router';
// Vite resolves stylesheet URL imports during the React Router build.
// eslint-disable-next-line import/no-unresolved
import stylesheet from './index.css?url';
import AnalyticsPageView from '@/components/AnalyticsPageView.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import FloatingWhatsAppButton from '@/components/FloatingWhatsAppButton.jsx';
import JobGuaranteePopup from '@/components/JobGuaranteePopup.jsx';
import ScrollToTop from '@/components/ScrollToTop.jsx';
import { BUSINESS_DATA } from '@/content/businessData.js';
import { scheduleAfterPaint } from '@/lib/deferredWork.js';

const NAVIGATION_LOADER_DISPLAY_MS = 520;

function CinematicCentaur() {
  return (
    <div className="centaur-vfx-stage" aria-hidden="true">
      <span className="centaur-sprite" />
    </div>
  );
}

function RouteLoadingScreen() {
  const navigation = useNavigation();
  // Do not cover the prerendered document on first paint. The transition
  // loader remains available for client-side navigations without becoming the
  // page's largest visible element during Core Web Vitals measurement.
  const [visible, setVisible] = React.useState(false);
  const firstRunRef = React.useRef(true);
  const shownAtRef = React.useRef(0);
  const hideTimerRef = React.useRef(null);

  const showLoader = React.useCallback((minimumDuration = NAVIGATION_LOADER_DISPLAY_MS) => {
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    shownAtRef.current = Date.now();
    setVisible(true);
    hideTimerRef.current = window.setTimeout(() => setVisible(false), minimumDuration);
  }, []);

  useEffect(() => {
    if (firstRunRef.current) {
      firstRunRef.current = false;
      return undefined;
    }

    if (navigation.state !== 'idle') {
      showLoader(NAVIGATION_LOADER_DISPLAY_MS);
      return undefined;
    }

    const elapsed = Date.now() - shownAtRef.current;
    const remaining = Math.max(0, NAVIGATION_LOADER_DISPLAY_MS - elapsed);
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => setVisible(false), remaining);
    return undefined;
  }, [navigation.state, showLoader]);

  useEffect(() => {
    const handleInternalNavigation = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target.closest('a[href]');
      if (!link || link.target === '_blank' || link.hasAttribute('download')) return;

      const destination = new URL(link.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (`${destination.pathname}${destination.search}` === `${window.location.pathname}${window.location.search}`) return;
      showLoader(NAVIGATION_LOADER_DISPLAY_MS);
    };

    const handleHistoryNavigation = () => showLoader(NAVIGATION_LOADER_DISPLAY_MS);

    document.addEventListener('click', handleInternalNavigation, true);
    window.addEventListener('popstate', handleHistoryNavigation);
    return () => {
      document.removeEventListener('click', handleInternalNavigation, true);
      window.removeEventListener('popstate', handleHistoryNavigation);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, [showLoader]);

  if (!visible) return null;

  return (
    <div className="route-loading-screen" role="status" aria-live="polite" aria-label="Loading page">
      <div className="route-loading-content">
        <div className="route-loading-mark">
          <CinematicCentaur />
        </div>
        <p className="route-loading-title">Centaur Careers</p>
        <p className="route-loading-caption">Preparing your next opportunity</p>
        <div className="route-loading-track" aria-hidden="true"><span /></div>
      </div>
    </div>
  );
}

export const links = () => [
  { rel: 'stylesheet', href: stylesheet },
  {
    rel: 'alternate',
    type: 'text/plain',
    href: '/llms.txt',
    title: 'LLM and answer-system discovery index',
  },
  {
    rel: 'icon',
    type: 'image/png',
    sizes: '48x48',
    href: '/images/brand/centaur-careers-logo-48.png',
  },
];

function GoogleTagManager() {
  useEffect(() => {
    let cancelled = false;

    const loadGtm = () => {
      if (cancelled || document.querySelector('script[data-centaur-gtm]')) return;

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });

      const script = document.createElement('script');
      script.async = true;
      script.dataset.centaurGtm = 'true';
      script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-T3QHF5HQ';
      document.head.appendChild(script);
    };

    const cancelLoad = scheduleAfterPaint(loadGtm, window, { timeout: 2500 });

    return () => {
      cancelled = true;
      cancelLoad();
    };
  }, []);

  return null;
}

export function Layout({ children }) {
  return (
    <html lang={BUSINESS_DATA.language}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="author" content={BUSINESS_DATA.name} />
        <meta name="theme-color" content="#081b36" />
        <meta name="generator" content="Centaur Careers" />
        <Meta />
        <Links />
      </head>
      <body>
        <a className="skip-link" href="#main-content">Skip to main content</a>
        <noscript>
          <style>{'.route-loading-screen{display:none!important}'}</style>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-T3QHF5HQ"
            height="0"
            width="0"
            title="Google Tag Manager"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {children}
        <GoogleTagManager />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <AnalyticsPageView />
      <RouteLoadingScreen />
      <div className="flex min-h-screen flex-col">
        <Header />
        <main id="main-content" className="flex-grow">
          <Outlet />
        </main>
        <Footer />
      </div>
      <JobGuaranteePopup />
      <FloatingWhatsAppButton />
    </>
  );
}

export function ErrorBoundary() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="max-w-xl text-center">
        <h1 className="text-4xl font-black text-primary">We could not load this page</h1>
        <p className="mt-4 text-muted-foreground">Please return to the homepage or contact Centaur Careers if the problem continues.</p>
        <a href="/" className="mt-7 inline-flex min-h-12 items-center rounded-xl bg-accent px-6 py-3 font-bold text-primary">Return home</a>
      </div>
    </div>
  );
}
