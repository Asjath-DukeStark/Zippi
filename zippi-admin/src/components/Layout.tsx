import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, FolderTree, BadgePercent, Image, ShoppingBag,
  Users, Bike, BarChart3, Settings, LogOut, Menu, X, Zap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/categories', label: 'Categories', icon: FolderTree },
  { to: '/promotions', label: 'Promotions', icon: BadgePercent },
  { to: '/banners', label: 'Banners', icon: Image },
  { to: '/orders', label: 'Orders', icon: ShoppingBag, badge: true },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/riders', label: 'Riders', icon: Bike },
  { to: '/reports', label: 'Reports', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings }
] as const;

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(0);

  // Pending orders badge - refreshed every 30s
  useEffect(() => {
    const load = () =>
      api.get<{ pendingOrders: number }>('/admin/analytics/summary')
        .then((d) => setPending(d.pendingOrders || 0))
        .catch(() => {});
    load();
    const t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, []);

  const sidebar = (
    <div className="flex h-full flex-col bg-slate-900 text-slate-300">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400 text-slate-900"><Zap className="h-5 w-5" /></div>
        <div>
          <p className="text-base font-extrabold leading-none text-white">Zippi</p>
          <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-500">Admin Panel</p>
        </div>
      </div>
      <nav className="flex-1 space-y-0.5 px-3">
        {NAV.map(({ to, label, icon: Icon, ...rest }) => (
          <NavLink
            key={to} to={to} end={'end' in rest && rest.end} onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive ? 'bg-slate-800 text-amber-400' : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`}
          >
            {({ isActive }) => (
              <>
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-amber-400' : ''}`} />
                <span className="flex-1">{label}</span>
                {'badge' in rest && rest.badge && pending > 0 && (
                  <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-extrabold leading-none text-white">{pending}</span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-800 p-4">
        <p className="truncate text-sm font-semibold text-white">{user?.name}</p>
        <p className="truncate text-xs text-slate-500">{user?.phone}</p>
        <button
          className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-400 hover:bg-slate-800"
          onClick={() => { logout(); navigate('/login'); }}
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:flex">
      <header className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white lg:hidden">
        <div className="flex items-center gap-2 font-extrabold"><Zap className="h-5 w-5 text-amber-400" /> Zippi Admin</div>
        <button onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-slate-800"><Menu className="h-5 w-5" /></button>
      </header>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-72 shadow-xl">
            <button className="absolute right-3 top-3 z-10 rounded-lg p-1.5 text-slate-400 hover:bg-slate-800" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
            {sidebar}
          </aside>
        </div>
      )}

      <aside className="hidden w-64 shrink-0 lg:block">{sidebar}</aside>

      <main className="min-w-0 flex-1 p-4 sm:p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
