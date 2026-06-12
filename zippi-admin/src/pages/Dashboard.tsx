import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Wallet, Users, Package, Clock, Truck } from 'lucide-react';
import { api } from '../lib/api';
import type { AnalyticsSummary, Order } from '../lib/types';
import { BarLineChart } from '../components/Chart';
import { PageLoader, StatusBadge, fmtMoney, fmtDate, ErrorBanner } from '../components/ui';

export default function Dashboard() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [series, setSeries] = useState<{ date: string; orders: number; revenue: number }[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [recent, setRecent] = useState<Order[]>([]);
  const [days, setDays] = useState(14);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<AnalyticsSummary>('/admin/analytics/summary'),
      api.get<{ products: any[] }>('/admin/analytics/top-products?limit=5'),
      api.get<{ orders: Order[] }>('/admin/orders?limit=8')
    ])
      .then(([s, tp, ro]) => { setSummary(s); setTopProducts(tp.products); setRecent(ro.orders); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    api.get<{ series: any[] }>(`/admin/analytics/orders-by-day?days=${days}`)
      .then((d) => setSeries(d.series))
      .catch(() => {});
  }, [days]);

  if (loading) return <PageLoader />;
  if (error) return <ErrorBanner message={error} />;
  if (!summary) return null;

  const stats = [
    { label: "Today's orders", value: summary.todayOrders, icon: Clock, color: 'bg-amber-100 text-amber-600' },
    { label: "Today's revenue", value: fmtMoney(summary.todayRevenue), icon: Wallet, color: 'bg-green-100 text-green-600' },
    { label: 'Total orders', value: summary.totalOrders, icon: ShoppingBag, color: 'bg-blue-100 text-blue-600' },
    { label: 'Total revenue', value: fmtMoney(summary.totalRevenue), icon: Wallet, color: 'bg-emerald-100 text-emerald-600' },
    { label: 'Customers', value: summary.totalCustomers, icon: Users, color: 'bg-indigo-100 text-indigo-600' },
    { label: 'Active orders', value: summary.activeOrders, icon: Truck, color: 'bg-purple-100 text-purple-600' },
    { label: 'Riders', value: summary.totalRiders, icon: Truck, color: 'bg-cyan-100 text-cyan-600' },
    { label: 'Active products', value: summary.activeProducts, icon: Package, color: 'bg-pink-100 text-pink-600' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card flex items-center gap-3 p-4">
            <div className={`rounded-xl p-2.5 ${s.color}`}><s.icon className="h-5 w-5" /></div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-400">{s.label}</p>
              <p className="truncate text-lg font-extrabold">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold">Orders & revenue</h2>
            <p className="text-xs text-slate-400">Bars: orders · Line: delivered revenue</p>
          </div>
          <select className="input w-auto" value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
          </select>
        </div>
        <BarLineChart data={series} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="mb-3 font-bold">Top products</h2>
          {topProducts.length === 0 && <p className="py-8 text-center text-sm text-slate-400">No sales yet</p>}
          <ul className="divide-y divide-slate-100">
            {topProducts.map((t) => (
              <li key={t.product.id} className="flex items-center gap-3 py-2.5">
                {t.product.imageUrl
                  ? <img src={t.product.imageUrl} className="h-10 w-10 rounded-lg object-cover" alt="" />
                  : <div className="h-10 w-10 rounded-lg bg-slate-100" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{t.product.name}</p>
                  <p className="text-xs text-slate-400">{t.product.unit}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold">{t.unitsSold} sold</p>
                  <p className="text-xs text-slate-400">{fmtMoney(t.revenue)}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-bold">Recent orders</h2>
            <Link to="/orders" className="text-sm font-semibold text-brand-600 hover:underline">View all</Link>
          </div>
          {recent.length === 0 && <p className="py-8 text-center text-sm text-slate-400">No orders yet</p>}
          <ul className="divide-y divide-slate-100">
            {recent.map((o) => (
              <li key={o.id}>
                <Link to={`/orders/${o.id}`} className="flex items-center gap-3 py-2.5 hover:bg-slate-50">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">{o.orderNumber}</p>
                    <p className="text-xs text-slate-400">{o.customer?.name || 'Guest'} · {fmtDate(o.createdAt)}</p>
                  </div>
                  <p className="text-sm font-bold">{fmtMoney(o.total)}</p>
                  <StatusBadge status={o.status} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
