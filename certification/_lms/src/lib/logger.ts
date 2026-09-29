import "server-only";

type SafeErrorDetails = {
  errorName?: string;
  errorCode?: string;
};

/** Emit structured server-side diagnostics without recording error messages or secrets. */
export function logServerError(event: string, error: unknown) {
  const details: SafeErrorDetails = {};
  if (error instanceof Error) details.errorName = error.name.slice(0, 80);

  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string" && /^[A-Z0-9_]{1,40}$/.test(code)) details.errorCode = code;
  }

  console.error(JSON.stringify({ level: "error", event, timestamp: new Date().toISOString(), ...details }));
}
