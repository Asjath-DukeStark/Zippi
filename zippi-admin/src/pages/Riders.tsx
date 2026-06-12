import { useEffect, useState } from 'react';
import { Bike, MapPin } from 'lucide-react';
import { api } from '../lib/api';
import type { Rider } from '../lib/types';
import { PageLoader, EmptyState, ErrorBanner, fmtDate } from '../components/ui';

export default function Riders() {
  const [riders, setRiders] = useState<Rider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ riders: Rider[] }>('/admin/riders')
      .then((d) => setRiders(d.riders))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold">Riders</h1>
        <p className="text-sm text-slate-500">{riders.filter((r) => r.profile?.isOnline).length} online · {riders.length} total</p>
      </div>

      {error && <ErrorBanner message={error} />}

      {riders.length === 0 ? (
        <div className="card"><EmptyState message="No riders yet — create one from the Users page (role: rider)" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {riders.map((r) => (
            <div key={r.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600"><Bike className="h-5 w-5" /></div>
                  <div>
                    <p className="font-bold">{r.name}</p>
                    <p className="text-xs text-slate-400">{r.phone}</p>
                  </div>
                </div>
                <span className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${r.profile?.isOnline ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${r.profile?.isOnline ? 'bg-green-500' : 'bg-slate-400'}`} />
                  {r.profile?.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <p className="text-lg font-extrabold">{r.activeOrders}</p>
                  <p className="text-[10px] font-semibold uppercase text-slate-400">Active</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <p className="text-lg font-extrabold">{r.totalDeliveries}</p>
                  <p className="text-[10px] font-semibold uppercase text-slate-400">Delivered</p>
                </div>
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <p className="text-lg font-extrabold capitalize">{r.profile?.vehicleType || 'bike'}</p>
                  <p className="text-[10px] font-semibold uppercase text-slate-400">Vehicle</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {r.profile?.latitude ? `${Number(r.profile.latitude).toFixed(4)}, ${Number(r.profile.longitude).toFixed(4)}` : 'No location'}
                </span>
                <span>Joined {fmtDate(r.createdAt).split(',')[0]}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
