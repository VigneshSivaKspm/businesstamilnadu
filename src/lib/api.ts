/**
 * Minimal JSON client for the Business Tamil Nadu API.
 * Requests are same-origin (`/api`, proxied by Vite in development).
 */

export const API_BASE = '/api';

/** Whether the public site reads listings and sends submissions through the API. */
export const USE_API = import.meta.env.VITE_USE_API !== 'false';

export class ApiError extends Error {
  status: number;
  fields: Record<string, string>;
  constructor(status: number, message: string, fields: Record<string, string> = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
}

export async function apiRequest<T>(path: string, { method = 'GET', body, query, signal }: RequestOptions = {}): Promise<T> {
  const qs = query
    ? new URLSearchParams(
        Object.entries(query)
          .filter(([, v]) => v !== undefined && v !== null && v !== '')
          .map(([k, v]) => [k, String(v)]),
      ).toString()
    : '';
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  // Required by the API on admin writes (CSRF defence).
  if (method !== 'GET') headers['X-BTN-Admin'] = '1';

  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}${qs ? `?${qs}` : ''}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      credentials: 'same-origin',
      signal,
    });
  } catch (error) {
    if ((error as Error).name === 'AbortError') throw error;
    throw new ApiError(0, 'Can’t reach the server. Check your connection and try again.');
  }

  const data = response.headers.get('content-type')?.includes('application/json') ? await response.json() : null;
  if (!response.ok) {
    const err = (data as { error?: { message?: string; fields?: Record<string, string> } } | null)?.error;
    throw new ApiError(response.status, err?.message ?? `Request failed (${response.status}).`, err?.fields);
  }
  return data as T;
}
