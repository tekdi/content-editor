/**
 * Prefers the native crypto API; falls back to a Math.random()-based
 * RFC4122 v4-ish generator for non-secure contexts (e.g. local http dev)
 * where `crypto.randomUUID` is unavailable. No `uuid` package dependency.
 */
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
