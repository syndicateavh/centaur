export function scheduleAfterPaint(callback) {
  if (typeof window === 'undefined') return () => {};

  if (typeof window.requestIdleCallback === 'function') {
    const idleId = window.requestIdleCallback(callback, { timeout: 1200 });
    return () => window.cancelIdleCallback(idleId);
  }

  const timeoutId = window.setTimeout(callback, 0);
  return () => window.clearTimeout(timeoutId);
}
