// ---------------------------------------------------------------------------
// Time helpers. All display formatting happens here so the whole module shows
// times the same way.
// ---------------------------------------------------------------------------

export const LOCALE = 'en-IN';

/**
 * The office timezone. Keep this the same as the "timezone" value in the
 * iv_work_settings table (default Asia/Kolkata). The database decides "today"
 * for check-in and for the dashboard counts in that timezone, so the app must
 * agree with it even when a phone or laptop clock is set to another timezone.
 */
export const OFFICE_TIMEZONE = 'Asia/Kolkata';

export function formatClock(iso?: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleTimeString(LOCALE, {
    hour: '2-digit', minute: '2-digit', hour12: true, timeZone: OFFICE_TIMEZONE,
  });
}

export function formatDay(value?: string | null): string {
  if (!value) return '—';
  const d = value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value);
  return d.toLocaleDateString(LOCALE, { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDayShort(value?: string | null): string {
  if (!value) return '—';
  const d = value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value);
  return d.toLocaleDateString(LOCALE, { day: '2-digit', month: 'short' });
}

/** 545 → "09h 05m" */
export function formatDuration(minutes?: number | null): string {
  if (!minutes || minutes <= 0) return '—';
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  return `${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m`;
}

/** Live elapsed time since check-in, in minutes. */
export function minutesSince(iso?: string | null, now: number = Date.now()): number {
  if (!iso) return 0;
  return Math.max(0, Math.floor((now - new Date(iso).getTime()) / 60000));
}

export function relativeTime(iso?: string | null): string {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDayShort(iso);
}

/** Today's date (YYYY-MM-DD) in the office timezone, not the device's. */
export function todayISO(): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: OFFICE_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${get('year')}-${get('month')}-${get('day')}`;
}

export function monthRange(monthISO: string): { from: string; to: string } {
  // monthISO = "2026-09"
  const [y, m] = monthISO.split('-').map(Number);
  const from = new Date(Date.UTC(y, m - 1, 1));
  const to = new Date(Date.UTC(y, m, 0));
  return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
}

export function currentMonthISO(): string {
  return todayISO().slice(0, 7);
}

/** The last n office days, oldest first, ending today. */
export function lastNDays(n: number): string[] {
  const [y, m, d] = todayISO().split('-').map(Number);
  const out: string[] = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    out.push(new Date(Date.UTC(y, m - 1, d - i)).toISOString().slice(0, 10));
  }
  return out;
}

export function isOverdue(dueDate?: string | null, status?: string): boolean {
  if (!dueDate || status === 'completed') return false;
  return dueDate < todayISO();
}

export function dueLabel(dueDate?: string | null, status?: string): string {
  if (!dueDate) return 'No due date';
  const today = todayISO();
  if (dueDate === today) return 'Due today';
  if (isOverdue(dueDate, status)) return `Overdue · ${formatDayShort(dueDate)}`;
  return formatDayShort(dueDate);
}