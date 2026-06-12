import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Radio, ShieldCheck, Navigation, Medal, CheckCircle2, Star, Hourglass, Bike } from 'lucide-react';
import { api } from '../lib/api';
import { useRider } from '../context/RiderContext';
import type { Order } from '../lib/types';
import { ErrorBanner } from '../components/ui';

const Stars = ({ rating = 4 }: { rating?: number }) => {
  const full = Math.round(Math.min(5, Math.max(0, rating)));
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`h-4 w-4 ${i <= full ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
      ))}
    </div>
  );
};

export default function Home() {
  const { profile, stats, setOnline, refresh } = useRider();
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const online = !!profile?.isOnline;

  useEffect(() => {
    const load = () =>
      api.get<{ orders: Order[] }>('/rider/orders').then((d) => setActiveOrders(d.orders)).catch(() => {});
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const toggle = async () => {
    setToggling(true);
    setError(null);
    try {
      await setOnline(!online);
      await refresh();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setToggling(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400">Deliverer Hub</p>
        <div className="mt-0.5 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold uppercase tracking-tight">Rider Dashboard</h1>
          <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 font-mono text-[10px] font-bold tracking-wider text-slate-600 shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5 text-amber-500" /> SECURE
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center py-2">
        <div className="relative flex h-64 w-64 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-slate-200/60" />
          <div className="absolute inset-4 rounded-full bg-slate-100" />
          {online && <div className="absolute inset-8 animate-ping rounded-full bg-brand-500/20 [animation-duration:2.5s]" />}
          <button
            onClick={toggle}
            disabled={toggling}
            className={`relative flex h-44 w-44 flex-col items-center justify-center gap-1 rounded-full shadow-xl ring-8 transition-colors disabled:opacity-70 ${
              online
                ? 'bg-gradient-to-b from-emerald-500 to-brand-700 ring-emerald-100'
                : 'bg-gradient-to-b from-slate-700 to-slate-900 ring-slate-200'
            }`}
          >
            <Radio className="h-9 w-9 text-white" />
            <span className="text-2xl font-extrabold tracking-wider text-white">
              {toggling ? '...' : online ? 'ONLINE' : 'OFFLINE'}
            </span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-white/70">
              {online ? 'GPS broadcasting...' : 'Tap to go online'}
            </span>
          </button>
        </div>

        <span className={`mt-3 flex items-center gap-1.5 rounded-full px-4 py-1.5 font-mono text-xs font-bold ${
          online ? 'bg-brand-100 text-brand-700' : 'bg-slate-200 text-slate-500'
        }`}>
          <Navigation className="h-3.5 w-3.5" />
          {online ? 'Pinging location every 5s' : 'Location sharing paused'}
        </span>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <p className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <Medal className="h-4 w-4 text-amber-500" /> Earnings today
          </p>
          <p className="mt-2 text-xs font-bold text-slate-400">LKR</p>
          <p className="text-3xl font-extrabold leading-tight">{Math.round(stats?.earnedToday ?? 0).toLocaleString()}</p>
        </div>
        <div className="card p-4">
          <p className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <CheckCircle2 className="h-4 w-4 text-teal-500" /> Completed
          </p>
          <div className="mt-2 flex items-end justify-between gap-2">
            <p className="text-3xl font-extrabold leading-tight">{stats?.deliveredToday ?? 0}</p>
            <div className="pb-1 text-right">
              <p className="mb-0.5 text-[10px] font-bold text-slate-400">Rider rating</p>
              <Stars rating={profile?.rating ?? 4} />
            </div>
          </div>
        </div>
      </div>

      {activeOrders.length > 0 ? (
        <Link to="/deliver" className="card flex items-center gap-3 border-brand-200 bg-brand-50 p-4 active:bg-brand-100">
          <div className="rounded-full bg-brand-600 p-2 text-white"><Bike className="h-5 w-5" /></div>
          <div className="flex-1 text-sm">
            <p className="font-extrabold text-brand-800">{activeOrders.length} active {activeOrders.length === 1 ? 'delivery' : 'deliveries'}</p>
            <p className="text-xs text-brand-700">Open the Deliver tab to manage your assignments.</p>
          </div>
        </Link>
      ) : (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-center text-sm text-amber-800">
          <Hourglass className="mx-auto mb-1 h-4 w-4" />
          Waiting for delivery tasks... New assignments from the store will appear here <span className="font-bold">automatically</span>.
        </div>
      )}
    </div>
  );
}
