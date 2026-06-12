import { Loader2 } from 'lucide-react';
import type { OrderStatus } from '../lib/types';

export const Spinner = ({ className = 'h-6 w-6' }: { className?: string }) => (
  <Loader2 className={`animate-spin text-brand-600 ${className}`} />
);

export const PageLoader = () => (
  <div className="flex items-center justify-center py-24"><Spinner className="h-8 w-8" /></div>
);

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  preparing: 'bg-blue-100 text-blue-700',
  dispatched: 'bg-indigo-100 text-indigo-700',
  arriving: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
};

export const StatusBadge = ({ status }: { status: OrderStatus }) => (
  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-600'}`}>
    {status}
  </span>
);

export const ErrorBanner = ({ message }: { message: string }) => (
  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>
);

export const fmtMoney = (n: number | string | null | undefined, currency = 'LKR') =>
  `${currency} ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const fmtTime = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '-';

export const addressText = (addr: Record<string, any> | null | undefined) =>
  addr ? [addr.label, addr.details, addr.area, addr.city].filter(Boolean).join(', ') || 'Address on file' : '-';
