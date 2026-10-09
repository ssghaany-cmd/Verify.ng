/**
 * Central error logging helper. Every catch block should call this instead of
 * swallowing the error, so failures are visible in the console today and can be
 * forwarded to an error tracker (Sentry, etc.) from a single place later.
 */
export function logError(context: string, err: unknown): void {
  const message = err instanceof Error ? err.message : describeUnknown(err);
  console.error(`[verify.ng] ${context}: ${message}`, err);
}

function describeUnknown(err: unknown): string {
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as { message: unknown }).message);
  }
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}
