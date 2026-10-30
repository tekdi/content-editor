/** Sunbird API response envelope, matching the legacy `ServerResponse` shape. */
export interface ServerResponseParams {
  status: 'successful' | 'failed';
  err?: string;
  errmsg?: string;
}

export interface ServerResponse<T = unknown> {
  id: string;
  ver: string;
  ts: string;
  params: ServerResponseParams;
  responseCode: string;
  result: T;
}

export class ApiError extends Error {
  readonly responseCode?: string;
  readonly cause?: unknown;

  constructor(message: string, responseCode?: string, cause?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.responseCode = responseCode;
    this.cause = cause;
  }
}
