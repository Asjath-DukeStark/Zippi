import { useEffect, useState } from 'react';
import { Download, UserPlus, Wallet, Banknote, Percent, Trophy, Clock, FolderTree, CalendarRange } from 'lucide-react';
import { api } from '../lib/api';
import { PageLoader, ErrorBanner, fmtMoney } from '../components/ui';

interface DayPoint { date: string; orders: number; revenue: number; }
interface ReportData {
  window: { days: number; since: string };
  totals: { orders: number; revenue: number; delivered: number; cancelled: number; newCustomers: number; avgOrderValue: number };
  paymentSplit: { COD: { orders: number; value: number }; CARD: { orders: number; value: number } };
  byHour: { hour: number; orders: number }[];
  byCategory: { category: string; revenue: number }[];
  riders: { riderId: string; name: string; deliveries: number; value: number }[];
}

const RANGES = [7, 14, 30, 90];

export default function Reports() {
  const [report, setReport] = useState<ReportData | null>(null);
  const [series, setSeries] = useState<DayPoint[]>([]);
  const [days, setDays] = useState(30);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get<ReportData>(`/admin/analytics/report?days=${days}`),
      api.get<{ series: DayPoint[] }>(`/admin/analytics/orders-by-day?days=${days}`)
    ])
      .then(([r, s]) => { setReport(r); setSeries(s.series); setError(null); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [days]);

  const exportCsv = () => {
    const rows = [['date', 'orders', 'revenue'], ...series.map((d) => [d.date, d.orders, d.revenue.toFixed(2)])];
    const csv = rows.map((r) => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `zippi-report-${days}d-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  if (loading && !report) return <PageLoader />;
  if (error && !report) return <ErrorBanner message={error} />;
  if (!report) return null;

  const { totals, paymentSplit, byHour, byCategory, riders } = report;
  const deliveryRate = totals.orders ? Math.round((totals.delivered / totals.orders) * 100) : 0;
  const codShare = (paymentSplit.COD.orders + paymentSplit.CARD.orders)
    ? Math.round((paymentSplit.COD.orders / (paymentSplit.COD.orders + paymentSplit.CARD.orders)) * 100) : 0;
  const maxHour = Math.max(1, ...byHour.map((h) => h.orders));
  const maxCat = Math.max(1, ...byCategory.map((c) => c.revenue));
  const peak = byHour.reduce((best, h) => (h.orders > best.orders ? h : best), byHour[0]);
  const busyDays = [...series].sort((a, b) => b.orders - a.orders).slice(0, 1)[0];

  const kpis = [
    { label: 'New customers', value: totals.newCustomers, sub: `in last ${days} days`, icon: UserPlus, color: 'bg-indigo-100 text-indigo-600' },
    { label: 'Avg order value', value: fmtMoney(totals.avgOrderValue), sub: `${totals.delivered} delivered orders`, icon: Wallet, color: 'bg-green-100 text-green-600' },
    { label: 'Cash on delivery', value: `${codShare}%`, sub: `${paymentSplit.COD.orders} of ${paymentSplit.COD.orders + paymentSplit.CARD.orders} orders`, icon: Banknote, color: 'bg-amber-100 text-amber-600' },
    { label: 'Delivery rate', value: `${deliveryRate}%`, sub: `${totals.cancelled} cancelled`, icon: Percent, color: 'bg-pink-100 text-pink-600' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Reports</h1>
          <p className="text-sm text-slate-400">Deep-dive analytics - {fmtMoney(totals.revenue)} revenue from {totals.orders} orders</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-200 bg-white p-1">
            {RANGES.map((r) => (
              <button key={r} onClick={() => setDays(r)}
                className={`rounded-md px-3 py-1.5 text-xs font-bold ${days === r ? 'bg-slate-900 text-amber-400' : 'text-slate-500 hover:bg-slate-50'}`}>
                {r}d
              </button>
            ))}
          </div>
          <button className="btn-secondary" onClick={exportCsv}><Download className="h-4 w-4" /> CSV</button>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="card p-4">
            <div className="flex items-center gap-3">
              <div className={`rounded-xl p-2.5 ${k.color}`}><k.icon className="h-5 w-5" /></div>
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-slate-400">{k.label}</p>
                <p className="truncate text-lg font-extrabold">{k.value}</p>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-400">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-1 flex items-center gap-2 font-bold"><FolderTree className="h-4 w-4 text-brand-600" /> Revenue by category</h2>
          <p className="mb-4 text-xs text-slate-400">Item revenue from non-cancelled orders, last {days} days</p>
          {byCategory.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">No sales in this period</p>
          ) : (
            <div className="space-y-3">
              {byCategory.slice(0, 8).map((c) => (
                <div key={c.category}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-semibold capitalize">{c.category.replace(/-/g, ' ')}</span>
                    <span className="font-bold">{fmtMoney(c.revenue)}</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-slate-100">
                    <div className="h-2.5 rounded-full bg-gradient-to-r from-brand-500 to-emerald-400" style={{ width: `${Math.max(3, (c.revenue / maxCat) * 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <h2 className="mb-1 flex items-center gap-2 font-bold"><Clock className="h-4 w-4 text-brand-600" /> Orders by hour of day</h2>
          <p className="mb-4 text-xs text-slate-400">
            {peak.orders > 0 ? `Peak: ${String(peak.hour).padStart(2, '0')}:00-${String(peak.hour + 1).padStart(2, '0')}:00 (${peak.orders} orders)` : 'No orders in this period'}
          </p>
          <div className="flex h-36 items-end gap-1">
            {byHour.map((h) => (
              <div key={h.hour} className="group relative flex-1">
                <div
                  className={`w-full rounded-t ${h.orders === peak.orders && h.orders > 0 ? 'bg-amber-400' : 'bg-blue-200 group-hover:bg-blue-300'}`}
                  style={{ height: `${Math.max(h.orders ? 8 : 2, (h.orders / maxHour) * 130)}px` }}
                  title={`${String(h.hour).padStart(2, '0')}:00 - ${h.orders} orders`}
                />
              </div>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10px] font-bold text-slate-400">
            <span>00</span><span>06</span><span>12</span><span>18</span><span>23</span>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold"><Banknote className="h-4 w-4 text-brand-600" /> Payment methods</h2>
          <div className="mb-4 flex h-4 w-full overflow-hidden rounded-full bg-slate-100">
            <div className="bg-amber-400" style={{ width: `${codShare}%` }} title={`COD ${codShare}%`} />
            <div className="bg-indigo-400" style={{ width: `${100 - codShare}%` }} title={`Card ${100 - codShare}%`} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-600">Cash on delivery</p>
              <p className="mt-1 text-2xl font-extrabold">{paymentSplit.COD.orders}</p>
              <p className="text-xs text-slate-500">{fmtMoney(paymentSplit.COD.value)} order value</p>
            </div>
            <div className="rounded-xl bg-indigo-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wide text-indigo-600">Card</p>
              <p className="mt-1 text-2xl font-extrabold">{paymentSplit.CARD.orders}</p>
              <p className="text-xs text-slate-500">{fmtMoney(paymentSplit.CARD.value)} order value</p>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h2 className="mb-4 flex items-center gap-2 font-bold"><Trophy className="h-4 w-4 text-amber-500" /> Rider leaderboard</h2>
          {riders.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">No deliveries in this period</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {riders.slice(0, 8).map((r, i) => (
                <li key={r.riderId} className="flex items-center gap-3 py-2.5">
                  <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-extrabold ${
                    i === 0 ? 'bg-amber-100 text-amber-600' : i === 1 ? 'bg-slate-200 text-slate-600' : i === 2 ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-400'
                  }`}>{i + 1}</span>
                  <p className="min-w-0 flex-1 truncate text-sm font-semibold">{r.name}</p>
                  <div className="text-right">
                    <p className="text-sm font-extrabold">{r.deliveries} deliveries</p>
                    <p className="text-xs text-slate-400">{fmtMoney(r.value)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card overflow-x-auto">
        <div className="flex items-center justify-between px-5 pt-5">
          <h2 className="flex items-center gap-2 font-bold"><CalendarRange className="h-4 w-4 text-brand-600" /> Daily breakdown</h2>
          {busyDays && busyDays.orders > 0 && (
            <p className="text-xs text-slate-400">Busiest day: <span className="font-bold text-slate-600">{busyDays.date}</span> ({busyDays.orders} orders)</p>
          )}
        </div>
        <table className="mt-3 w-full min-w-[480px]">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr><th className="th">Date</th><th className="th">Orders</th><th className="th">Delivered revenue</th><th className="th">Trend</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[...series].reverse().filter((d) => d.orders > 0 || d.revenue > 0).slice(0, 14).map((d) => {
              const maxO = Math.max(1, ...series.map((x) => x.orders));
              return (
                <tr key={d.date} className="hover:bg-slate-50">
                  <td className="td font-mono text-xs font-bold">{d.date}</td>
                  <td className="td font-semibold">{d.orders}</td>
                  <td className="td font-semibold">{fmtMoney(d.revenue)}</td>
                  <td className="td w-1/3">
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div className="h-2 rounded-full bg-blue-300" style={{ width: `${(d.orders / maxO) * 100}%` }} />
                    </div>
                  </td>
                </tr>
              );
            })}
            {series.every((d) => d.orders === 0 && d.revenue === 0) && (
              <tr><td colSpan={4} className="td py-10 text-center text-slate-400">No activity in this period</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
