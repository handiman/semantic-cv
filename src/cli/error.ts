/**
 * Error type for expected, user‑facing failures in the CLI.
 *
 * Throw a KnownError when the user has made a mistake they can fix
 * (missing file, invalid argument, unsupported option, etc.). The
 * top‑level error handler will print only the message, without a
 * stack trace.
 */
export class KnownError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "KnownError";
  }
}

/**
 * Centralized CLI error formatter.
 *
 * - KnownError → print the message only (clean user output)
 * - Any other error → print a generic prefix and the full error object
 *
 * This keeps user mistakes friendly while still surfacing unexpected
 * internal bugs for debugging.
 */
export const handleError = (err: unknown) => {
  if (err instanceof KnownError) {
    console.error(err.message);
  } else {
    console.error("Unexpected error:", err);
  }
};

export default handleError;
