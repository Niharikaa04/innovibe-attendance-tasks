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

/** Turns a Supabase/Postgres error into something a person can act on. */
export function readableError(err: unknown): string {
  const e = err as { message?: string; code?: string } | null;
  const msg = e?.message ?? 'Something went wrong.';
  if (e?.code === '42501') return 'You do not have permission to make that change.';
  if (msg.includes('duplicate key')) return 'That record already exists.';
  if (msg.toLowerCase().includes('failed to fetch')) {
    return 'Cannot reach the server. Check your connection and try again.';
  }
  return msg;
}
