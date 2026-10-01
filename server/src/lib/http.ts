import type { ErrorRequestHandler, Request } from 'express';
import { ZodError, type ZodType } from 'zod';

/** An error with an HTTP status and optional per-field messages. */
export class HttpError extends Error {
  status: number;
  fields?: Record<string, string>;
  constructor(status: number, message: string, fields?: Record<string, string>) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

export const notFound = (what = 'Resource') => new HttpError(404, `${what} not found.`);

/** Flattens zod issues into `{ "field.path": "message" }` (first message per field). */
export function zodFields(error: ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || '_';
    fields[key] ??= issue.message;
  }
  return fields;
}

/** Parses input with a zod schema, throwing a 400 with field errors on failure. */
export function parse<T>(schema: ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) throw new HttpError(400, 'Please correct the highlighted fields.', zodFields(result.error));
  return result.data;
}

export const param = (req: Request, name: string) => {
  const value = req.params[name];
  if (typeof value !== 'string' || !value) throw new HttpError(400, `Missing ${name}.`);
  return value;
};

/** Escapes user input for safe use inside a RegExp. */
export const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const errorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  void next;
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: { message: err.message, fields: err.fields } });
    return;
  }
  if (err instanceof ZodError) {
    res.status(400).json({ error: { message: 'Invalid request.', fields: zodFields(err) } });
    return;
  }
  // Malformed JSON body from express.json().
  if (err?.type === 'entity.parse.failed') {
    res.status(400).json({ error: { message: 'Malformed JSON body.' } });
    return;
  }
  if (err?.type === 'entity.too.large') {
    res.status(413).json({ error: { message: 'Request body is too large.' } });
    return;
  }
  // Duplicate key (e.g. slug already taken).
  if (err?.code === 11000) {
    const field = Object.keys(err.keyPattern ?? {})[0] ?? 'value';
    res.status(409).json({ error: { message: `That ${field} is already in use.`, fields: { [field]: `This ${field} is already in use.` } } });
    return;
  }
  console.error('[api] Unhandled error:', err);
  res.status(500).json({ error: { message: 'Something went wrong. Please try again.' } });
};
