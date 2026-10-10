export type ErrorLogEntry = {
  context: string;
  message: string;
  name?: string;
  code?: string;
  details?: string;
  hint?: string;
  cause: unknown;
};

const str = (value: unknown): string | undefined =>
  typeof value === 'string' || typeof value === 'number' ? String(value) : undefined;

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

/** Builds a structured entry; Supabase errors carry code/details/hint, which we keep. */
export function toLogEntry(context: string, err: unknown): ErrorLogEntry {
  const fields = err && typeof err === 'object' ? (err as Record<string, unknown>) : {};
  return {
    context,
    message: err instanceof Error ? err.message : describeUnknown(err),
    name: str(fields.name),
    code: str(fields.code),
    details: str(fields.details),
    hint: str(fields.hint),
    cause: err,
  };
}

/**
 * Central error logging helper. Every catch block should call this instead of
 * swallowing the error, so failures are visible in the console today and can be
 * forwarded to an error tracker (Sentry, etc.) from this single place later.
 */
export function logError(context: string, err: unknown): void {
  const entry = toLogEntry(context, err);
  console.error(`[verify.ng] ${context}: ${entry.message}`, entry);
}
