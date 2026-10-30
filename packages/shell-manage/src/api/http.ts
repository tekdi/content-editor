import type { ShellManageConfig } from '../types';

export class ApiError extends Error {
  constructor(message: string, readonly status?: number, readonly cause?: unknown) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ServerResponse<T> {
  params?: { status?: string; errmsg?: string | null; err?: string | null };
  responseCode?: string;
  result?: T;
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** The host app keeps the user's session in localStorage (`token`, `tenantId`). */
function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Calls `{baseurl}/{path}` and unwraps the Sunbird-style `result`.
 * Browser-controlled headers (Cookie, Origin, Referer, sec-*) can't be set from JS.
 */
export async function requestJson<T>(
  config: ShellManageConfig,
  method: 'POST' | 'PATCH',
  path: string,
  body: unknown
): Promise<T> {
  const base = (config.baseurl ?? '').replace(/\/+$/, '');
  const url = `${base}/${path.replace(/^\/+/, '')}`;
  const token = readStorage('token');
  const tenantId = readStorage('tenantId');

  let res: Response;
  try {
    res = await fetch(url, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Source': 'web',
        'X-msgid': generateId(),
        ts: new Date().toISOString(),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(tenantId ? { tenantid: tenantId } : {}),
      },
      body: JSON.stringify(body),
    });
  } catch (err) {
    throw new ApiError(`Network error calling ${path}`, undefined, err);
  }

  let json: ServerResponse<T> | undefined;
  try {
    json = (await res.json()) as ServerResponse<T>;
  } catch {
    // non-JSON body — handled by the checks below
  }

  if (!res.ok || json?.params?.status !== 'successful' || json.result === undefined) {
    const msg = json?.params?.errmsg || json?.params?.err || `Request failed (${res.status})`;
    throw new ApiError(msg, res.status, json);
  }
  return json.result;
}

export function postJson<T>(config: ShellManageConfig, path: string, body: unknown): Promise<T> {
  return requestJson<T>(config, 'POST', path, body);
}
