import { useNavigate } from 'react-router-dom';
import { LogOut, Bike, CheckCircle2, Package, Phone } from 'lucide-react';
import { useRider } from '../context/RiderContext';

export default function Profile() {
  const { user, profile, stats, logout } = useRider();
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div>
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.3em] text-slate-400">Account</p>
        <h1 className="mt-0.5 text-2xl font-extrabold uppercase tracking-tight">Profile</h1>
      </div>

      <div className="card flex items-center gap-4 p-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700">
          <Bike className="h-7 w-7" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-lg font-extrabold">{user?.name}</p>
          <p className="flex items-center gap-1.5 text-sm text-slate-500"><Phone className="h-3.5 w-3.5" /> {user?.phone}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4 text-center">
          <CheckCircle2 className="mx-auto mb-1 h-6 w-6 text-brand-600" />
          <p className="text-2xl font-extrabold">{stats?.totalDeliveries ?? 0}</p>
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Total deliveries</p>
        </div>
        <div className="card p-4 text-center">
          <Package className="mx-auto mb-1 h-6 w-6 text-brand-600" />
          <p className="text-2xl font-extrabold">{stats?.activeOrders ?? 0}</p>
          <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">Active now</p>
        </div>
      </div>

      <div className="card p-4 text-sm">
        <div className="flex justify-between py-1.5">
          <span className="text-slate-500">Vehicle</span>
          <span className="font-bold capitalize">{profile?.vehicleType || 'bike'}</span>
        </div>
        <div className="flex justify-between border-t border-slate-100 py-1.5 pt-2.5">
          <span className="text-slate-500">Rider rating</span>
          <span className="font-bold text-amber-500">★ {Number(profile?.rating ?? 4).toFixed(1)} / 5</span>
        </div>
        <div className="flex justify-between border-t border-slate-100 py-1.5 pt-2.5">
          <span className="text-slate-500">Status</span>
          <span className={`font-bold ${profile?.isOnline ? 'text-green-600' : 'text-slate-500'}`}>{profile?.isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      <button
        className="btn-secondary w-full text-red-600"
        onClick={() => { logout(); navigate('/login'); }}
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </div>
  );
}
