import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, MessageCircle, ShieldCheck, X } from 'lucide-react';
import { useLocation } from 'react-router';
import { BUSINESS_DATA } from '@/content/businessData.js';
import { trackAnalyticsEvent } from '@/analytics/ga4.js';

const POPUP_VERSION = 'job-guarantee-v13';
const SHOWN_KEY = `centaur:${POPUP_VERSION}:shown-at`;
const CONVERTED_KEY = `centaur:${POPUP_VERSION}:whatsapp-clicked-at`;
const TEN_SECONDS = 10_000;
const ONE_DAY = 24 * 60 * 60 * 1000;
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

const whatsappNumber = BUSINESS_DATA.telephone.replace(/\D/g, '');
const whatsappMessage = 'Hi Centaur Careers, I am interested in the 100% Job Guarantee Program. Please share the program details, fees, and next cohort information.';
const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

function isCommercialPage(pathname) {
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');

  return normalizedPath === '/'
    || normalizedPath === '/courses'
    || normalizedPath.startsWith('/courses/')
    || normalizedPath === '/india'
    || normalizedPath === '/placements';
}

function readTimestamp(key) {
  try {
    const value = Number(window.localStorage.getItem(key));
    return Number.isFinite(value) ? value : 0;
  } catch {
    return 0;
  }
}

function writeTimestamp(key) {
  try {
    window.localStorage.setItem(key, String(Date.now()));
  } catch {
    // The popup still works when storage is unavailable.
  }
}

function trackPopupEvent(event, pathname) {
  trackAnalyticsEvent(event, {
    popup_version: POPUP_VERSION,
    page_path: pathname,
    lead_intent_group: 'commercial_placement',
    conversion_stage: 'decide',
  });
}

export default function JobGuaranteePopup() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const actionInProgress = useRef(false);
  const dialogRef = useRef(null);

  useEffect(() => {
    setOpen(false);
    actionInProgress.current = false;

    if (!isCommercialPage(pathname)) return undefined;

    const now = Date.now();
    if (
      now - readTimestamp(SHOWN_KEY) < ONE_DAY
      || now - readTimestamp(CONVERTED_KEY) < SEVEN_DAYS
    ) {
      return undefined;
    }

    let remaining = TEN_SECONDS;
    let startedAt = 0;
    let timeoutId;

    const stopTimer = () => {
      if (!timeoutId) return;
      window.clearTimeout(timeoutId);
      timeoutId = undefined;
      remaining = Math.max(0, remaining - (Date.now() - startedAt));
    };

    const startTimer = () => {
      if (timeoutId || remaining <= 0 || document.visibilityState !== 'visible') return;
      startedAt = Date.now();
      timeoutId = window.setTimeout(() => {
        timeoutId = undefined;
        remaining = 0;
        writeTimestamp(SHOWN_KEY);
        setOpen(true);
        trackPopupEvent('job_guarantee_popup_view', pathname);
      }, remaining);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') startTimer();
      else stopTimer();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startTimer();

    return () => {
      stopTimer();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [pathname]);

  useEffect(() => {
    if (open) document.body.dataset.jobGuaranteePopupOpen = 'true';
    else delete document.body.dataset.jobGuaranteePopupOpen;

    return () => delete document.body.dataset.jobGuaranteePopupOpen;
  }, [open]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!open || !dialog || dialog.open) return;

    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    dialog.focus({ preventScroll: true });
  }, [open]);

  const handleOpenChange = (nextOpen) => {
    if (nextOpen) {
      setOpen(true);
      return;
    }

    setOpen(false);
    if (actionInProgress.current) return;
    trackPopupEvent('job_guarantee_popup_dismiss', pathname);
  };

  const handleWhatsAppClick = () => {
    actionInProgress.current = true;
    writeTimestamp(CONVERTED_KEY);
    trackPopupEvent('job_guarantee_popup_whatsapp_click', pathname);
    setOpen(false);
  };

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      className="job-guarantee-popup overflow-hidden border border-accent/30 bg-white p-0 shadow-2xl"
      tabIndex={-1}
      aria-labelledby="job-guarantee-popup-title"
      aria-describedby="job-guarantee-popup-description"
      onCancel={(event) => {
        event.preventDefault();
        handleOpenChange(false);
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) handleOpenChange(false);
      }}
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => handleOpenChange(false)}
          className="job-guarantee-popup-close"
          aria-label="Close job guarantee offer"
        >
          <X className="h-4 w-4" strokeWidth={1.5} aria-hidden="true" />
        </button>
        <div className="bg-navy-gradient px-6 pb-7 pt-8 text-white sm:px-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-primary shadow-lg shadow-black/10">
            <ShieldCheck className="h-7 w-7" aria-hidden="true" />
          </div>
          <div className="mt-5 text-left">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-accent">Career assurance</p>
            <h2 id="job-guarantee-popup-title" className="font-display text-3xl font-bold leading-tight text-white">100% Job Guarantee Program</h2>
            <p id="job-guarantee-popup-description" className="mt-3 text-base leading-relaxed text-white/75">
              Complete the six-week program and get a finance job through our 100% Job Guarantee Program.
            </p>
          </div>
        </div>

        <div className="px-6 pb-6 pt-5 sm:px-8 sm:pb-8">
          <ul className="space-y-3 text-sm text-foreground/80">
            {['Six-week practical finance training', 'Interview preparation and career guidance', 'Live online across India or in person in Lucknow'].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent-ink" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <p className="mt-5 rounded-xl border border-accent/30 bg-accent/10 px-4 py-3 text-sm font-semibold text-primary">
            Open to graduates and job switchers across India.
          </p>

          <a href="/placements/#job-guarantee-terms" className="mt-3 inline-flex text-xs font-semibold text-primary/70 underline decoration-accent-ink/60 underline-offset-4 transition hover:text-primary">
            View guarantee summary
          </a>

          <div className="mt-6">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWhatsAppClick}
              data-analytics-channel="whatsapp"
              className="job-guarantee-popup-whatsapp inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-5 py-3 font-bold text-white shadow-sm transition hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-700 focus-visible:ring-offset-2"
            >
              <MessageCircle className="h-5 w-5" aria-hidden="true" />
              Get Program Details on WhatsApp
            </a>
          </div>
        </div>
      </div>
    </dialog>
  );
}
