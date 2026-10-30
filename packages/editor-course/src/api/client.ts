import { generateId } from '../utils/id';
import { ApiError, type ServerResponse } from './types';
import type { CourseEditorMountData } from '../types';

/**
 * `fetch`-based port of the legacy library's `data.service.ts` header
 * injection (X-Device-ID / X-App-Id / X-Org-code / X-Channel-Id / X-msgid /
 * Authorization) — sourced from the plugin's mount config rather than a
 * global `window.questionEditorBaseUrl` / DOM lookups, which is the one
 * deliberate host-contract deviation from the legacy web component.
 */
export interface ApiClientConfig {
  baseUrl: string;
  channelId: string;
  authToken: string;
  deviceId?: string;
  appId?: string;
  orgCode?: string;
}

const API_PREFIX = 'api/';
const PUBLIC_PREFIX = 'action/';

export class ApiClient {
  constructor(private readonly cfg: ApiClientConfig) {}

  get<T>(path: string, params?: Record<string, string>, usePublicPrefix = false): Promise<T> {
    return this.request<T>('GET', path, { params, usePublicPrefix });
  }

  post<T>(path: string, body: unknown, usePublicPrefix = false): Promise<T> {
    return this.request<T>('POST', path, { body, usePublicPrefix });
  }

  patch<T>(path: string, body: unknown, usePublicPrefix = false): Promise<T> {
    return this.request<T>('PATCH', path, { body, usePublicPrefix });
  }

  private buildUrl(path: string, usePublicPrefix: boolean): string {
    const base = this.cfg.baseUrl.replace(/\/+$/, '');
    const prefix = usePublicPrefix ? PUBLIC_PREFIX : API_PREFIX;
    return `${base}/${prefix}${path.replace(/^\/+/, '')}`;
  }

  private headers(): Record<string, string> {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-msgid': generateId(),
      'X-Channel-Id': this.cfg.channelId,
      ...(this.cfg.deviceId ? { 'X-Device-ID': this.cfg.deviceId } : {}),
      ...(this.cfg.appId ? { 'X-App-Id': this.cfg.appId } : {}),
      ...(this.cfg.orgCode ? { 'X-Org-code': this.cfg.orgCode } : {}),
      ...(this.cfg.authToken ? { Authorization: this.cfg.authToken } : {}),
    };
  }

  private async request<T>(
    method: string,
    path: string,
    opts: { body?: unknown; params?: Record<string, string>; usePublicPrefix: boolean }
  ): Promise<T> {
    let url = this.buildUrl(path, opts.usePublicPrefix);
    if (opts.params) {
      const qs = new URLSearchParams(opts.params).toString();
      if (qs) url += `?${qs}`;
    }

    let res: Response;
    try {
      res = await fetch(url, {
        method,
        headers: this.headers(),
        body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      });
    } catch (err) {
      throw new ApiError(`Network error calling ${path}`, undefined, err);
    }

    let json: ServerResponse<T> | undefined;
    try {
      json = (await res.json()) as ServerResponse<T>;
    } catch {
      // Some endpoints (e.g. telemetry) may respond with no/non-JSON body.
    }

    if (!res.ok || json?.params?.status === 'failed') {
      throw new ApiError(
        json?.params?.errmsg ?? `Request to ${path} failed with status ${res.status}`,
        json?.responseCode,
        json
      );
    }

    return json?.result as T;
  }
}

/**
 * Builds an `ApiClient` from the plugin's mount data + wrapper options, or
 * returns `null` when the host hasn't configured `options.apiBaseUrl` — the
 * view renders a clear "not configured" state rather than firing requests
 * against a blank base URL.
 */
export function createApiClient(
  mountData: CourseEditorMountData,
  options?: Record<string, unknown>
): ApiClient | null {
  const apiBaseUrl = options?.apiBaseUrl as string | undefined;
  if (!apiBaseUrl) return null;
  return new ApiClient({
    baseUrl: apiBaseUrl,
    channelId: mountData.context.channel,
    authToken: mountData.context.authToken ?? '',
    deviceId: mountData.context.did,
    appId: options?.appId as string | undefined,
    orgCode: options?.orgCode as string | undefined,
  });
}
