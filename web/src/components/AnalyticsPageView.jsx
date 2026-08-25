import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import { SITE_ORIGIN } from '@/seo/siteConfig.js';

export default function AnalyticsPageView() {
  const location = useLocation();
  const isInitialPage = useRef(true);

  useEffect(() => {
    if (isInitialPage.current) {
      isInitialPage.current = false;
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'virtual_page_view',
      page_location: `${SITE_ORIGIN}${location.pathname}${location.search}`,
      page_path: `${location.pathname}${location.search}`,
      page_title: document.title,
    });
  }, [location.pathname, location.search]);

  return null;
}
