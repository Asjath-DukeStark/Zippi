import { ReactNode, useEffect } from 'react';
import { X, Loader2, AlertTriangle } from 'lucide-react';
import type { OrderStatus } from '../lib/types';

/* ---------- Spinner ---------- */
export const Spinner = ({ className = 'h-6 w-6' }: { className?: string }) => (
  <Loader2 className={`animate-spin text-brand-600 ${className}`} />
);

export const PageLoader = () => (
  <div className="flex items-center justify-center py-24"><Spinner className="h-8 w-8" /></div>
);

/* ---------- Status badge ---------- */
const STATUS_STYLES: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-700',
  preparing: 'bg-blue-100 text-blue-700',
  dispatched: 'bg-indigo-100 text-indigo-700',
  arriving: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
};

export const StatusBadge = ({ status }: { status: OrderStatus }) => (
  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-600'}`}>
    {status}
  </span>
);

export const ActiveBadge = ({ active }: { active?: boolean }) => (
  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${active !== false ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
    {active !== false ? 'Active' : 'Inactive'}
  </span>
);

/* ---------- Modal ---------- */
export function Modal({ open, onClose, title, children, wide }: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:p-8" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`card w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} my-auto`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h3 className="text-base font-bold">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

/* ---------- Confirm dialog ---------- */
export function ConfirmDialog({ open, onClose, onConfirm, title, message, busy, children }: {
  open: boolean; onClose: () => void; onConfirm: () => void; title: string; message: string; busy?: boolean; children?: ReactNode;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-red-100 p-2"><AlertTriangle className="h-5 w-5 text-red-600" /></div>
        <div>
          <p className="text-sm text-slate-600">{message}</p>
          {children}
        </div>
      </div>
      <div className="mt-5 flex justify-end gap-2">
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-danger" onClick={onConfirm} disabled={busy}>{busy ? 'Working…' : 'Confirm'}</button>
      </div>
    </Modal>
  );
}

/* ---------- Empty state ---------- */
export const EmptyState = ({ message }: { message: string }) => (
  <div className="py-16 text-center text-sm text-slate-400">{message}</div>
);

/* ---------- Error banner ---------- */
export const ErrorBanner = ({ message }: { message: string }) => (
  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>
);

/* ---------- Currency ---------- */
export const fmtMoney = (n: number | string | null | undefined, currency?: string) => {
  const activeCurrency = currency || localStorage.getItem('zippi_currency') || 'AED';
  return `${activeCurrency} ${Number(n || 0).toFixed(2)}`;
};

export const fmtDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—';
