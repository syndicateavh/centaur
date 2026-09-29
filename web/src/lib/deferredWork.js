/**
 * Run non-critical work only after the browser has had two opportunities to
 * paint. The idle phase keeps larger downloads and setup work away from the
 * critical rendering path while the timeout guarantees eventual execution.
 */
export function scheduleAfterPaint(
  callback,
  browser = typeof window === 'undefined' ? undefined : window,
  { timeout = 2000 } = {},
) {
  if (!browser) return () => {};

  let cancelled = false;
  let firstFrame;
  let secondFrame;
  let idleHandle;
  let timeoutHandle;

  const run = () => {
    if (cancelled) return;
    cancelled = true;
    callback();
  };

  const scheduleIdleWork = () => {
    if (cancelled) return;

    if (typeof browser.requestIdleCallback === 'function') {
      idleHandle = browser.requestIdleCallback(run, { timeout });
      return;
    }

    if (typeof browser.setTimeout === 'function') {
      timeoutHandle = browser.setTimeout(run, 0);
      return;
    }

    run();
  };

  if (typeof browser.requestAnimationFrame === 'function') {
    firstFrame = browser.requestAnimationFrame(() => {
      secondFrame = browser.requestAnimationFrame(scheduleIdleWork);
    });
  } else {
    scheduleIdleWork();
  }

  return () => {
    cancelled = true;
    if (firstFrame !== undefined && typeof browser.cancelAnimationFrame === 'function') {
      browser.cancelAnimationFrame(firstFrame);
    }
    if (secondFrame !== undefined && typeof browser.cancelAnimationFrame === 'function') {
      browser.cancelAnimationFrame(secondFrame);
    }
    if (idleHandle !== undefined && typeof browser.cancelIdleCallback === 'function') {
      browser.cancelIdleCallback(idleHandle);
    }
    if (timeoutHandle !== undefined && typeof browser.clearTimeout === 'function') {
      browser.clearTimeout(timeoutHandle);
    }
  };
}
