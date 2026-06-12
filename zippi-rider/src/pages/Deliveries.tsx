import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Package } from 'lucide-react';
import { api } from '../lib/api';
import { useRider } from '../context/RiderContext';
import type { Order } from '../lib/types';
import { PageLoader, StatusBadge, ErrorBanner, fmtMoney, addressText } from '../components/ui';

export default function Deliveries() {
  const { profile } = useRider();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    api.get<{ orders: Order[] }>('/rider/orders')
      .then((d) => setOrders(d.orders))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 30000); // poll for new assignments
    return () => clearInterval(t);
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400">Active tasks</p>
        <div className="mt-0.5 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold uppercase tracking-tight">Deliver</h1>
          <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[10px] font-bold ${profile?.isOnline ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-500'}`}>
            <span className={`h-2 w-2 rounded-full ${profile?.isOnline ? 'animate-pulse bg-brand-500' : 'bg-slate-400'}`} />
            {profile?.isOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? <PageLoader /> : orders.length === 0 ? (
        <div className="card p-8 text-center">
          <Package className="mx-auto mb-2 h-8 w-8 text-slate-300" />
          <p className="text-sm font-semibold text-slate-500">No active deliveries</p>
          <p className="text-xs text-slate-400">
            {profile?.isOnline ? 'New assignments will appear here automatically.' : 'Go online from the Home tab to receive assignments.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link key={o.id} to={`/orders/${o.id}`} className="card block p-4 active:bg-slate-50">
              <div className="flex items-center justify-between">
                <p className="font-extrabold">{o.orderNumber}</p>
                <StatusBadge status={o.status} />
              </div>
              <p className="mt-2 flex items-start gap-1.5 text-sm text-slate-500">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                {addressText(o.deliveryAddress)}
              </p>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-slate-400">{o.items?.length ?? 0} items - {o.paymentMethod === 'COD' ? 'Cash on delivery' : 'Paid by card'}</span>
                <span className="font-extrabold">{fmtMoney(o.total)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
