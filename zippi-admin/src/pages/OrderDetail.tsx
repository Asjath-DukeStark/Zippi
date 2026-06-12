import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, CreditCard } from 'lucide-react';
import { api } from '../lib/api';
import type { Order, OrderStatus, Rider } from '../lib/types';
import { PageLoader, StatusBadge, ErrorBanner, fmtMoney, fmtDate } from '../components/ui';

const NEXT: Record<string, OrderStatus[]> = {
  pending: ['preparing', 'cancelled'],
  preparing: ['dispatched', 'cancelled'],
  dispatched: ['arriving', 'cancelled'],
  arriving: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: []
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [riders, setRiders] = useState<Rider[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    api.get<{ order: Order }>(`/admin/orders/${id}`).then((d) => setOrder(d.order)).catch((e) => setError(e.message));
  };

  useEffect(() => {
    load();
    api.get<{ riders: Rider[] }>('/admin/riders').then((d) => setRiders(d.riders)).catch(() => {});
  }, [id]);

  const setStatus = async (status: OrderStatus) => {
    setBusy(true);
    try { await api.patch(`/admin/orders/${id}/status`, { status }); load(); }
    catch (e: any) { setError(e.message); }
    finally { setBusy(false); }
  };

  const assignRider = async (riderId: string) => {
    setBusy(true);
    try { await api.patch(`/admin/orders/${id}/assign`, { riderId: riderId || null }); load(); }
    catch (e: any) { setError(e.message); }
    finally { setBusy(false); }
  };

  if (error && !order) return <ErrorBanner message={error} />;
  if (!order) return <PageLoader />;

  const addr = order.deliveryAddress || {};

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/orders" className="btn-secondary"><ArrowLeft className="h-4 w-4" /> Orders</Link>
        <h1 className="text-xl font-extrabold">{order.orderNumber}</h1>
        <StatusBadge status={order.status} />
        <span className="text-sm text-slate-400">{fmtDate(order.createdAt)}</span>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Items + totals */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-3 font-bold">Items</h2>
          <ul className="divide-y divide-slate-100">
            {(order.items || []).map((it) => (
              <li key={it.id} className="flex items-center gap-3 py-2.5">
                {it.product?.imageUrl ? <img src={it.product.imageUrl} className="h-10 w-10 rounded-lg object-cover" alt="" /> : <div className="h-10 w-10 rounded-lg bg-slate-100" />}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{it.product?.name || it.productId}</p>
                  <p className="text-xs text-slate-400">{it.product?.unit} · {fmtMoney(it.price)} each</p>
                </div>
                <p className="text-sm text-slate-500">×{it.quantity}</p>
                <p className="w-20 text-right text-sm font-bold">{fmtMoney(Number(it.price) * it.quantity)}</p>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-4 text-sm">
            <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>{fmtMoney(order.subtotal)}</span></div>
            <div className="flex justify-between text-slate-500"><span>Delivery fee</span><span>{fmtMoney(order.deliveryFee)}</span></div>
            {Number(order.discount) > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-{fmtMoney(order.discount)}</span></div>}
            <div className="flex justify-between text-base font-extrabold"><span>Total</span><span>{fmtMoney(order.total)}</span></div>
          </div>
        </div>

        {/* Side panel */}
        <div className="space-y-5">
          <div className="card space-y-3 p-5">
            <h2 className="font-bold">Manage</h2>
            <div>
              <label className="label">Update status</label>
              <div className="flex flex-wrap gap-2">
                {NEXT[order.status].length === 0 && <p className="text-sm text-slate-400">Final state — no further changes.</p>}
                {NEXT[order.status].map((s) => (
                  <button key={s} disabled={busy}
                    className={s === 'cancelled' ? 'btn-danger' : 'btn-primary'}
                    onClick={() => setStatus(s)}>
                    Mark {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label">Assigned rider</label>
              <select className="input" value={order.riderId || ''} disabled={busy} onChange={(e) => assignRider(e.target.value)}>
                <option value="">— Unassigned —</option>
                {riders.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} {r.profile?.isOnline ? '· online' : '· offline'} ({r.activeOrders} active)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="card space-y-3 p-5 text-sm">
            <h2 className="font-bold">Customer</h2>
            <p className="font-semibold">{order.customer?.name || 'Guest'}</p>
            {order.customer?.phone && <p className="flex items-center gap-2 text-slate-500"><Phone className="h-4 w-4" /> {order.customer.phone}</p>}
            <p className="flex items-start gap-2 text-slate-500">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{[addr.label, addr.details, addr.area, addr.city].filter(Boolean).join(', ') || JSON.stringify(addr)}</span>
            </p>
            <p className="flex items-center gap-2 text-slate-500"><CreditCard className="h-4 w-4" /> {order.paymentMethod === 'COD' ? 'Cash on delivery' : 'Card'}</p>
            {order.specialInstructions && (
              <p className="rounded-lg bg-amber-50 p-3 text-amber-800">“{order.specialInstructions}”</p>
            )}
          </div>

          <div className="card p-5">
            <h2 className="mb-3 font-bold">Timeline</h2>
            <ul className="space-y-3">
              {(order.events || []).map((ev) => (
                <li key={ev.id} className="flex gap-3 text-sm">
                  <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                  <div>
                    <p className="font-semibold capitalize">{ev.status}</p>
                    {ev.note && <p className="text-xs text-slate-500">{ev.note}</p>}
                    <p className="text-xs text-slate-400">{fmtDate(ev.createdAt)}</p>
                  </div>
                </li>
              ))}
              {(order.events || []).length === 0 && <p className="text-sm text-slate-400">No events recorded.</p>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
