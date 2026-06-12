import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { api } from '../lib/api';
import type { Order, Pagination, OrderStatus } from '../lib/types';
import { PageLoader, StatusBadge, EmptyState, ErrorBanner, fmtMoney, fmtDate } from '../components/ui';

const STATUSES: (OrderStatus | '')[] = ['', 'pending', 'preparing', 'dispatched', 'arriving', 'delivered', 'cancelled'];

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '25' });
    if (status) params.set('status', status);
    if (search) params.set('search', search);
    api.get<{ orders: Order[]; pagination: Pagination }>(`/admin/orders?${params}`)
      .then((d) => { setOrders(d.orders); setPagination(d.pagination); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, status]);

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-extrabold">Orders</h1>
      {error && <ErrorBanner message={error} />}

      <div className="flex flex-wrap gap-3">
        <form className="relative min-w-52 flex-1" onSubmit={(e) => { e.preventDefault(); setPage(1); load(); }}>
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input className="input pl-9" placeholder="Search by order number… (press Enter)" value={search} onChange={(e) => setSearch(e.target.value)} />
        </form>
        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((s) => (
            <button
              key={s || 'all'}
              onClick={() => { setStatus(s); setPage(1); }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                status === s ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {s || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-x-auto">
        {loading ? <PageLoader /> : orders.length === 0 ? <EmptyState message="No orders found" /> : (
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="th">Order</th><th className="th">Customer</th><th className="th">Items</th>
                <th className="th">Total</th><th className="th">Payment</th><th className="th">Rider</th>
                <th className="th">Status</th><th className="th">Placed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="td">
                    <Link to={`/orders/${o.id}`} className="font-semibold text-brand-700 hover:underline">{o.orderNumber}</Link>
                  </td>
                  <td className="td">
                    <p className="font-semibold">{o.customer?.name || 'Guest'}</p>
                    <p className="text-xs text-slate-400">{o.customer?.phone}</p>
                  </td>
                  <td className="td">{o.items?.length ?? 0}</td>
                  <td className="td font-semibold">{fmtMoney(o.total)}</td>
                  <td className="td text-slate-500">{o.paymentMethod}</td>
                  <td className="td text-slate-500">{o.rider?.name || <span className="text-slate-300">Unassigned</span>}</td>
                  <td className="td"><StatusBadge status={o.status} /></td>
                  <td className="td text-xs text-slate-400">{fmtDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-slate-500">{pagination.total} orders</p>
          <div className="flex gap-2">
            <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span className="px-2 py-2 font-semibold">{page} / {pagination.totalPages}</span>
            <button className="btn-secondary" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
