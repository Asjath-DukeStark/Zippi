import { NavLink, Outlet } from 'react-router-dom';
import { Home, Bike, Coins, User } from 'lucide-react';

export default function Shell() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col">
      <main className="flex-1 p-4 pb-24">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-slate-200 bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid max-w-md grid-cols-4">
          {[
            { to: '/', label: 'Home', icon: Home, end: true },
            { to: '/deliver', label: 'Deliver', icon: Bike },
            { to: '/earnings', label: 'Earnings', icon: Coins },
            { to: '/profile', label: 'Profile', icon: User }
          ].map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold ${isActive ? 'text-amber-500' : 'text-slate-400'}`}>
              <Icon className="h-5 w-5" /> {label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
