import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Navigation, CheckCircle2, Banknote } from 'lucide-react';
import { api } from '../lib/api';
import type { Order } from '../lib/types';
import { PageLoader, StatusBadge, ErrorBanner, fmtMoney, addressText } from '../components/ui';
import { useRider } from '../context/RiderContext';

const STEPS = ['preparing', 'dispatched', 'arriving', 'delivered'] as const;

export default function OrderDetail() {
  const { id } = useParams();
  const { refresh } = useRider();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => {
    api.get<{ order: Order }>(`/orders/${id}`).then((d) => setOrder(d.order)).catch((e) => setError(e.message));
  };
  useEffect(load, [id]);

  const advance = async (status: 'arriving' | 'delivered') => {
    setBusy(true);
    setError(null);
    try {
      await api.patch(`/rider/orders/${id}/status`, { status });
      load();
      refresh().catch(() => {});
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  if (error && !order) {
    return (
      <div className="space-y-4">
        <Link to="/deliver" className="btn-secondary"><ArrowLeft className="h-4 w-4" /> Back</Link>
        <ErrorBanner message={error} />
      </div>
    );
  }
  if (!order) return <PageLoader />;

  const addr = order.deliveryAddress || {};
  const mapsUrl = addr.latitude && addr.longitude
    ? `https://www.google.com/maps/dir/?api=1&destination=${addr.latitude},${addr.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressText(addr))}`;
  const stepIndex = STEPS.indexOf(order.status as any);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link to="/deliver" className="btn-secondary px-3 py-2"><ArrowLeft className="h-4 w-4" /> Back</Link>
        <StatusBadge status={order.status} />
      </div>

      <div className="card p-4">
        <p className="text-lg font-extrabold">{order.orderNumber}</p>

        {stepIndex >= 0 && (
          <div className="mt-4 flex items-center">
            {STEPS.map((s, i) => (
              <div key={s} className="flex flex-1 items-center last:flex-none">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold ${
                  i <= stepIndex ? 'bg-brand-600 text-white' : 'bg-slate-200 text-slate-400'}`}>
                  {i < stepIndex ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && <div className={`h-1 flex-1 ${i < stepIndex ? 'bg-brand-600' : 'bg-slate-200'}`} />}
              </div>
            ))}
          </div>
        )}
        {stepIndex >= 0 && (
          <div className="mt-1.5 flex justify-between text-[10px] font-bold uppercase text-slate-400">
            <span>Preparing</span><span>Picked up</span><span>Arriving</span><span>Delivered</span>
          </div>
        )}
      </div>

      {error && <ErrorBanner message={error} />}

      {order.status === 'dispatched' && (
        <button className="btn-primary w-full py-4 text-base" disabled={busy} onClick={() => advance('arriving')}>
          <Navigation className="h-5 w-5" /> {busy ? 'Updating...' : "I'm arriving at the customer"}
        </button>
      )}
      {order.status === 'arriving' && (
        <button className="btn-primary w-full py-4 text-base" disabled={busy} onClick={() => advance('delivered')}>
          <CheckCircle2 className="h-5 w-5" /> {busy ? 'Updating...' : 'Mark as delivered'}
        </button>
      )}
      {order.status === 'preparing' && (
        <div className="card p-4 text-center text-sm text-slate-500">
          The store is preparing this order. You'll be able to update the status once it's dispatched by the admin.
        </div>
      )}

      <div className="card space-y-3 p-4">
        <h2 className="font-extrabold">Customer</h2>
        <p className="text-sm font-semibold">{order.customer?.name || 'Customer'}</p>
        <p className="flex items-start gap-2 text-sm text-slate-500">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" /> {addressText(addr)}
        </p>
        {order.specialInstructions && (
          <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">"{order.specialInstructions}"</p>
        )}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {order.customer?.phone && (
            <a href={`tel:${order.customer.phone}`} className="btn-secondary"><Phone className="h-4 w-4" /> Call</a>
          )}
          <a href={mapsUrl} target="_blank" rel="noreferrer" className="btn-primary"><Navigation className="h-4 w-4" /> Navigate</a>
        </div>
      </div>

      <div className={`card flex items-center gap-3 p-4 ${order.paymentMethod === 'COD' ? 'border-amber-300 bg-amber-50' : ''}`}>
        <Banknote className={`h-6 w-6 ${order.paymentMethod === 'COD' ? 'text-amber-600' : 'text-brand-600'}`} />
        <div className="flex-1">
          <p className="text-sm font-extrabold">{order.paymentMethod === 'COD' ? `Collect ${fmtMoney(order.total)} in cash` : 'Paid by card'}</p>
          <p className="text-xs text-slate-500">{order.paymentMethod === 'COD' ? 'Collect payment on delivery' : 'No payment collection needed'}</p>
        </div>
      </div>

      <div className="card p-4">
        <h2 className="mb-2 font-extrabold">Items ({order.items?.length ?? 0})</h2>
        <ul className="divide-y divide-slate-100">
          {(order.items || []).map((it) => (
            <li key={it.id} className="flex items-center gap-3 py-2.5">
              {it.product?.imageUrl
                ? <img src={it.product.imageUrl} className="h-10 w-10 rounded-lg object-cover" alt="" />
                : <div className="h-10 w-10 rounded-lg bg-slate-100" />}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{it.product?.name || 'Item'}</p>
                <p className="text-xs text-slate-400">{it.product?.unit}</p>
              </div>
              <p className="text-sm font-bold">x{it.quantity}</p>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex justify-between border-t border-slate-100 pt-3 text-sm font-extrabold">
          <span>Total</span><span>{fmtMoney(order.total)}</span>
        </div>
      </div>
    </div>
  );
}
