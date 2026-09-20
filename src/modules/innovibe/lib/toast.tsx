import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

type ToastTone = 'info' | 'success' | 'error';
interface Toast { id: number; tone: ToastTone; message: string; }

interface ToastApi {
  notify: (message: string, tone?: ToastTone) => void;
  success: (message: string) => void;
  error: (message: string) => void;
}

const ToastCtx = createContext<ToastApi>({
  notify: () => {}, success: () => {}, error: () => {},
});

let seq = 0;

export function ToastHost({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, tone: ToastTone = 'info') => {
    seq += 1;
    const id = seq;
    setToasts((t) => [...t, { id, tone, message }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const api = useMemo<ToastApi>(() => ({
    notify,
    success: (m) => notify(m, 'success'),
    error: (m) => notify(m, 'error'),
  }), [notify]);

  return (
    <ToastCtx.Provider value={api}>
      {children}
      <div className="iv-toasts" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`iv-toast iv-toast--${t.tone}`}>{t.message}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast(): ToastApi {
  return useContext(ToastCtx);
}

/**
 * Turns a Supabase/Postgres error into something a person can act on.
 * Messages that a database function raised on purpose (for example
 * "You are already checked in") are passed through unchanged.
 */
export function readableError(err: unknown): string {
  const e = err as { message?: string; code?: string } | null;
  const msg = e?.message ?? 'Something went wrong.';
  const lower = msg.toLowerCase();

  // Permission rules (row-level security)
  if (e?.code === '42501' || lower.includes('row-level security')) {
    return 'You do not have permission to make that change.';
  }

  // An update/lookup by id matched no row: usually blocked by a rule, or the
  // item was deleted by someone else in the meantime.
  if (e?.code === 'PGRST116' || lower.includes('json object requested')) {
    return 'That change was not saved. You may not have permission, or the item was removed.';
  }

  // Signed-in session ran out
  if (e?.code === 'PGRST301' || lower.includes('jwt expired')) {
    return 'Your session has expired. Please sign in again.';
  }

  if (e?.code === '23505' || lower.includes('duplicate key')) {
    return 'That record already exists.';
  }

  if (e?.code === '23503') {
    return 'That item is linked to something that no longer exists.';
  }

  if (e?.code === '23514') {
    return 'One of the values you entered is not allowed.';
  }

  // Browser could not reach Supabase ("Load failed" is Safari's wording)
  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('load failed')
  ) {
    return 'Cannot reach the server. Check your connection and try again.';
  }

  return msg;
}