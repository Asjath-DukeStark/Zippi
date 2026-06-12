import { useEffect, useState } from 'react';
import { Coins, CheckCircle2, CalendarDays } from 'lucide-react';
import { api } from '../lib/api';
import { useRider } from '../context/RiderContext';
import type { Order } from '../lib/types';
import { PageLoader, ErrorBanner, fmtMoney, fmtTime } from '../components/ui';

export default function Earnings() {
  const { stats } = useRider();
  const [history, setHistory] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ orders: Order[] }>('/rider/orders?history=true')
      .then((d) => setHistory(d.orders.filter((o) => o.status === 'delivered')))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const weekStart = new Date();
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(weekStart.getDate() - 6);
  const thisWeek = history
    .filter((o) => new Date(o.deliveredAt || o.createdAt) >= weekStart)
    .reduce((s, o) => s + Number(o.total || 0), 0);
  const allTime = history.reduce((s, o) => s + Number(o.total || 0), 0);

  return (
    <div className="space-y-4">
      <div>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400">Payout overview</p>
        <h1 className="mt-0.5 text-2xl font-extrabold uppercase tracking-tight">Earnings</h1>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="card bg-gradient-to-br from-slate-800 to-slate-900 p-5 text-white">
        <p className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-amber-400">
          <Coins className="h-4 w-4" /> Earnings today
        </p>
        <p className="mt-1 text-xs font-bold text-white/50">LKR</p>
        <p className="text-4xl font-extrabold leading-tight">{Math.round(stats?.earnedToday ?? 0).toLocaleString()}</p>
        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-3 text-sm">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-white/40">Last 7 days</p>
            <p className="font-extrabold">{fmtMoney(thisWeek)}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-white/40">All time</p>
            <p className="font-extrabold">{fmtMoney(allTime)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4 text-center">
          <CheckCircle2 className="mx-auto mb-1 h-5 w-5 text-teal-500" />
          <p className="text-2xl font-extrabold">{stats?.deliveredToday ?? 0}</p>
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Today</p>
        </div>
        <div className="card p-4 text-center">
          <CalendarDays className="mx-auto mb-1 h-5 w-5 text-amber-500" />
          <p className="text-2xl font-extrabold">{stats?.totalDeliveries ?? 0}</p>
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">All deliveries</p>
        </div>
      </div>

      <h2 className="pt-1 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">Completed orders</h2>
      {loading ? <PageLoader /> : history.length === 0 ? (
        <div className="card p-8 text-center text-sm text-slate-400">No completed deliveries yet</div>
      ) : (
        <div className="space-y-2.5">
          {history.map((o) => (
            <div key={o.id} className="card flex items-center justify-between p-4">
              <div>
                <p className="text-sm font-extrabold">{o.orderNumber}</p>
                <p className="text-xs text-slate-400">{fmtTime(o.deliveredAt || o.createdAt)}</p>
              </div>
              <p className="font-extrabold text-brand-700">+{fmtMoney(o.total)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
