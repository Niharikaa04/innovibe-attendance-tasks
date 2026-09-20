import React, { useEffect, useRef } from 'react';

// ---------------------------------------------------------------------------
// Small, dependency-free primitives. Styling lives in styles/innovibe.css and
// is driven entirely by CSS custom properties, so the whole module re-themes
// to match InnoVibe Chat by editing one block of variables.
// ---------------------------------------------------------------------------

export function Card({
  children, className = '', pad = true,
}: { children: React.ReactNode; className?: string; pad?: boolean }) {
  return <section className={`iv-card ${pad ? 'iv-card--pad' : ''} ${className}`}>{children}</section>;
}

export function SectionHead({
  title, subtitle, actions,
}: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <header className="iv-sectionhead">
      <div>
        <h2 className="iv-sectionhead__title">{title}</h2>
        {subtitle && <p className="iv-sectionhead__sub">{subtitle}</p>}
      </div>
      {actions && <div className="iv-sectionhead__actions">{actions}</div>}
    </header>
  );
}

export function StatTile({
  label, value, hint, tone = 'neutral',
}: {
  label: string; value: React.ReactNode; hint?: string;
  tone?: 'neutral' | 'working' | 'out' | 'absent' | 'late' | 'good';
}) {
  return (
    <div className={`iv-stat iv-stat--${tone}`}>
      <span className="iv-stat__value">{value}</span>
      <span className="iv-stat__label">{label}</span>
      {hint && <span className="iv-stat__hint">{hint}</span>}
    </div>
  );
}

export function Badge({
  children, tone = 'neutral', dot = false,
}: { children: React.ReactNode; tone?: string; dot?: boolean }) {
  return (
    <span className={`iv-badge iv-badge--${tone}`}>
      {dot && <i className="iv-badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}

export function Button({
  children, variant = 'secondary', size = 'md', loading = false, ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}) {
  return (
    <button
      type="button"
      {...rest}
      className={`iv-btn iv-btn--${variant} iv-btn--${size} ${rest.className ?? ''}`}
      disabled={rest.disabled || loading}
    >
      {loading && <i className="iv-spinner iv-spinner--inline" aria-hidden="true" />}
      {children}
    </button>
  );
}

export function Avatar({
  name, url, size = 32,
}: { name?: string | null; url?: string | null; size?: number }) {
  const initials = (name ?? '?')
    .split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');
  return url ? (
    <img className="iv-avatar" src={url} alt="" width={size} height={size} style={{ width: size, height: size }} />
  ) : (
    <span className="iv-avatar iv-avatar--initials" style={{ width: size, height: size, fontSize: size * 0.38 }}>
      {initials || '?'}
    </span>
  );
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div className="iv-loading">
      <i className="iv-spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function SkeletonRows({ rows = 4 }: { rows?: number }) {
  return (
    <div className="iv-skeleton" aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => <div key={i} className="iv-skeleton__row" />)}
    </div>
  );
}

export function EmptyState({
  title, body, action,
}: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="iv-empty">
      <h3>{title}</h3>
      {body && <p>{body}</p>}
      {action}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="iv-error">
      <p>{message}</p>
      {onRetry && <Button size="sm" onClick={onRetry}>Try again</Button>}
    </div>
  );
}

export function LiveDot({ status }: { status: 'connecting' | 'live' | 'error' }) {
  const text = status === 'live' ? 'Live' : status === 'connecting' ? 'Connecting' : 'Reconnecting';
  return (
    <span className={`iv-live iv-live--${status}`} title={`Realtime: ${text}`}>
      <i aria-hidden="true" />{text}
    </span>
  );
}

// ------------------------------- Overlays ----------------------------------

function useEscape(onClose: () => void) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
}

export function Modal({
  open, title, onClose, children, footer, width = 560,
}: {
  open: boolean; title: string; onClose: () => void;
  children: React.ReactNode; footer?: React.ReactNode; width?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEscape(onClose);
  useEffect(() => { if (open) ref.current?.focus(); }, [open]);
  if (!open) return null;
  return (
    <div className="iv-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="iv-modal" style={{ maxWidth: width }} role="dialog" aria-modal="true"
           aria-label={title} tabIndex={-1} ref={ref}>
        <header className="iv-modal__head">
          <h2>{title}</h2>
          <button className="iv-iconbtn" onClick={onClose} aria-label="Close">✕</button>
        </header>
        <div className="iv-modal__body">{children}</div>
        {footer && <footer className="iv-modal__foot">{footer}</footer>}
      </div>
    </div>
  );
}

export function Drawer({
  open, title, onClose, children,
}: { open: boolean; title: string; onClose: () => void; children: React.ReactNode }) {
  useEscape(onClose);
  if (!open) return null;
  return (
    <div className="iv-overlay iv-overlay--right"
         onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <aside className="iv-drawer" role="dialog" aria-modal="true" aria-label={title}>
        <header className="iv-drawer__head">
          <h2>{title}</h2>
          <button className="iv-iconbtn" onClick={onClose} aria-label="Close">✕</button>
        </header>
        <div className="iv-drawer__body">{children}</div>
      </aside>
    </div>
  );
}

export function ConfirmDialog({
  open, title, message, confirmLabel = 'Confirm', tone = 'danger', onConfirm, onCancel, busy,
}: {
  open: boolean; title: string; message: string; confirmLabel?: string;
  tone?: 'danger' | 'primary'; onConfirm: () => void; onCancel: () => void; busy?: boolean;
}) {
  return (
    <Modal open={open} title={title} onClose={onCancel} width={420}
      footer={(
        <>
          <Button onClick={onCancel}>Keep as is</Button>
          <Button variant={tone} onClick={onConfirm} loading={busy}>{confirmLabel}</Button>
        </>
      )}>
      <p className="iv-confirm__msg">{message}</p>
    </Modal>
  );
}

// ------------------------------- Form fields --------------------------------

export function Field({
  label, hint, error, children,
}: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="iv-field">
      <span className="iv-field__label">{label}</span>
      {children}
      {hint && !error && <span className="iv-field__hint">{hint}</span>}
      {error && <span className="iv-field__error">{error}</span>}
    </label>
  );
}

export function Search({
  value, onChange, placeholder = 'Search',
}: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="iv-search">
      <span aria-hidden="true">⌕</span>
      <input value={value} onChange={(e) => onChange(e.target.value)}
             placeholder={placeholder} aria-label={placeholder} />
      {value && <button className="iv-iconbtn" onClick={() => onChange('')} aria-label="Clear search">✕</button>}
    </div>
  );
}

// --------------------------------- Chart ------------------------------------

export interface BarDatum { label: string; value: number; tone?: string }

/** Dependency-free bar chart. Values are minutes, counts, or percentages. */
export function BarChart({
  data, max, suffix = '', height = 148,
}: { data: BarDatum[]; max?: number; suffix?: string; height?: number }) {
  const peak = max ?? Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="iv-chart" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="iv-chart__col" title={`${d.label}: ${d.value}${suffix}`}>
          <div className="iv-chart__track">
            <div className={`iv-chart__bar ${d.tone ? `iv-chart__bar--${d.tone}` : ''}`}
                 style={{ height: `${Math.round((d.value / peak) * 100)}%` }} />
          </div>
          <span className="iv-chart__label">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

export function Meter({ percent, tone = 'good' }: { percent: number; tone?: string }) {
  const p = Math.max(0, Math.min(100, percent));
  return (
    <div className="iv-meter" role="img" aria-label={`${p}%`}>
      <div className={`iv-meter__fill iv-meter__fill--${tone}`} style={{ width: `${p}%` }} />
    </div>
  );
}
