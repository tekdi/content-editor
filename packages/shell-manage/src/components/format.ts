/** Formats Sunbird timestamps (`2026-10-12T07:21:00.491+0000`) for display; full timestamp kept for tooltips. */
export function formatDate(value?: string, { withTime = true } = {}): string {
  if (!value) return '—';
  const date = new Date(value.replace(/\+0000$/, 'Z'));
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString(undefined, withTime ? { dateStyle: 'medium', timeStyle: 'short' } : { dateStyle: 'medium' });
}
