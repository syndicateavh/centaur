import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CheckCircle2, Download, Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog.jsx';
import { trackAnalyticsEvent } from '@/analytics/ga4.js';
import { getMeasurementEventFields } from '@/analytics/measurementTaxonomy.js';
import { DOWNLOAD_ASSETS } from '@/content/downloads.js';
import { SITE_ORIGIN } from '@/seo/siteConfig.js';

const READING_END_TOLERANCE = 24;
const DEFAULT_TRIGGER_CLASS = 'inline-flex min-h-12 items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-6 py-3 font-bold text-white transition hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary';

function getFilename(path) {
  const filename = String(path || '').split('/').pop() || 'published-download.txt';
  try {
    return decodeURIComponent(filename.split('?')[0]);
  } catch {
    return filename.split('?')[0];
  }
}

function getPreviewEventName(assetPath, stage) {
  const prefix = assetPath === DOWNLOAD_ASSETS.syllabus.path ? 'syllabus_preview' : 'download_preview';
  return `${prefix}_${stage}`;
}

function trackPreviewEvent(eventName, fields = {}) {
  if (typeof window === 'undefined') return;

  const pagePath = window.location.pathname || '/contact/';
  trackAnalyticsEvent(eventName, {
    page_path: pagePath,
    page_location: `${SITE_ORIGIN}${pagePath}`,
    ...getMeasurementEventFields(pagePath),
    preview_funnel: 'published_download',
    ...fields,
  });
}

export default function DownloadPreviewDialog({
  asset = DOWNLOAD_ASSETS.syllabus,
  title = 'Financial Operations Masterclass syllabus',
  description = 'Review the published syllabus summary before connecting with Centaur Careers.',
  triggerLabel,
  triggerClassName = DEFAULT_TRIGGER_CLASS,
  analyticsId = 'download-preview',
  analyticsIntent,
  children,
}) {
  const assetPath = asset?.path || DOWNLOAD_ASSETS.syllabus.path;
  const filename = asset?.filename || getFilename(assetPath);
  const label = triggerLabel || asset?.label || 'Preview published file';
  const isSyllabus = assetPath === DOWNLOAD_ASSETS.syllabus.path;
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('idle');
  const [documentText, setDocumentText] = useState('');
  const [readingComplete, setReadingComplete] = useState(false);
  const readingAreaRef = useRef(null);
  const completionTrackedRef = useRef(false);

  const markReadingComplete = useCallback(() => {
    if (completionTrackedRef.current) return;

    completionTrackedRef.current = true;
    setReadingComplete(true);
    trackPreviewEvent(getPreviewEventName(assetPath, 'completed'), {
      download_path: assetPath,
      download_name: filename,
    });
  }, [assetPath, filename]);

  const handleReadingScroll = useCallback((event) => {
    const readingArea = event.currentTarget;
    const reachedEnd = readingArea.scrollTop + readingArea.clientHeight
      >= readingArea.scrollHeight - READING_END_TOLERANCE;

    if (reachedEnd) markReadingComplete();
  }, [markReadingComplete]);

  const handleOpenChange = useCallback((nextOpen) => {
    setOpen(nextOpen);

    if (nextOpen) {
      setStatus('loading');
      setDocumentText('');
      setReadingComplete(false);
      completionTrackedRef.current = false;
      trackPreviewEvent(getPreviewEventName(assetPath, 'open'), {
        download_path: assetPath,
        download_name: filename,
      });
    } else {
      setReadingComplete(false);
      completionTrackedRef.current = false;
    }
  }, [assetPath, filename]);

  useEffect(() => {
    if (!open) return undefined;

    const controller = new AbortController();

    fetch(assetPath, {
      signal: controller.signal,
      headers: { Accept: 'text/plain, text/csv;q=0.9, */*;q=0.1' },
    })
      .then((response) => {
        if (!response.ok) throw new Error(`Download request failed with status ${response.status}`);
        return response.text();
      })
      .then((text) => {
        if (!text.trim()) throw new Error('The published file was empty.');
        setDocumentText(text);
        setStatus('ready');
      })
      .catch((error) => {
        if (error.name === 'AbortError') return;
        setStatus('error');
      });

    return () => controller.abort();
  }, [assetPath, open]);

  useEffect(() => {
    if (!open || status !== 'ready' || !documentText) return undefined;

    const frame = window.requestAnimationFrame(() => {
      const readingArea = readingAreaRef.current;
      if (readingArea && readingArea.scrollHeight <= readingArea.clientHeight + READING_END_TOLERANCE) {
        markReadingComplete();
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [documentText, markReadingComplete, open, status]);

  const saveCopyId = `${analyticsId}-save-copy`;
  const resolvedDescription = description || `Review the published ${filename} before connecting with Centaur Careers.`;
  const defaultTrigger = (
    <>
      <Eye className="h-5 w-5" aria-hidden="true" />
      {label}
    </>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          type="button"
          data-analytics-id={analyticsId}
          data-preview-asset={assetPath}
          {...(analyticsIntent ? { 'data-analytics-intent': analyticsIntent } : {})}
          className={triggerClassName}
        >
          {children || defaultTrigger}
        </button>
      </DialogTrigger>

      <DialogContent className="grid h-[min(44rem,90dvh)] max-h-[90dvh] w-[calc(100%_-_1rem)] max-w-3xl grid-rows-[auto_minmax(0,1fr)_auto] gap-0 overflow-hidden p-0 sm:h-[min(44rem,calc(100dvh_-_3rem))] sm:max-h-[min(44rem,calc(100dvh_-_3rem))] sm:w-full sm:rounded-2xl">
        <DialogHeader className="border-b border-border px-6 pb-4 pr-14 pt-6 text-left sm:px-8 sm:pt-7">
          <DialogTitle className="font-display text-2xl font-bold text-primary sm:text-3xl">{title}</DialogTitle>
          <DialogDescription className="mt-2 leading-relaxed">{resolvedDescription}</DialogDescription>
        </DialogHeader>

        <div
          ref={readingAreaRef}
          tabIndex={0}
          role="region"
          aria-label={`${title} preview`}
          onScroll={handleReadingScroll}
          className="min-h-0 overflow-y-auto overscroll-contain px-6 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent sm:px-8 sm:py-6"
        >
          {status === 'loading' && (
            <p role="status" className="py-10 text-center text-sm text-muted-foreground">Loading the published file...</p>
          )}

          {status === 'error' && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-relaxed text-red-900">
              <p>We could not load this preview. You can save the published file from this dialog.</p>
              <a
                href={assetPath}
                download={filename}
                data-analytics-id={saveCopyId}
                {...(analyticsIntent ? { 'data-analytics-intent': analyticsIntent } : {})}
                className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-bold text-white"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                Save a copy
              </a>
            </div>
          )}

          {status === 'ready' && (
            <pre className="m-0 whitespace-pre-wrap break-words font-sans text-sm leading-7 text-foreground/85">{documentText}</pre>
          )}
        </div>

        <DialogFooter className="border-t border-border bg-muted/40 px-6 py-4 sm:px-8">
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {readingComplete ? (
              <p role="status" className="flex items-center gap-2 text-sm font-semibold text-primary">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-accent-ink" aria-hidden="true" />
                {isSyllabus ? 'Syllabus reviewed' : 'File reviewed'}
              </p>
            ) : (
              <p role="status" className="text-sm text-muted-foreground">
                {status === 'ready' ? 'Read the full file here, or save a copy.' : 'The file preview opens here on this page.'}
              </p>
            )}
            {status === 'ready' && (
              <a
                href={assetPath}
                download={filename}
                data-analytics-id={saveCopyId}
                {...(analyticsIntent ? { 'data-analytics-intent': analyticsIntent } : {})}
                className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-bold text-white"
              >
                <Download className="h-4 w-4" aria-hidden="true" /> Save a copy
              </a>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
