import { FormEvent, useEffect, useState } from 'react';
import { Plus, Pencil, Search, UserX, UserCheck } from 'lucide-react';
import { api } from '../lib/api';
import type { User, Pagination } from '../lib/types';
import { Modal, PageLoader, ActiveBadge, EmptyState, ErrorBanner, fmtDate } from '../components/ui';

const ROLES = ['', 'customer', 'rider', 'admin'] as const;

const ROLE_BADGE: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700',
  rider: 'bg-cyan-100 text-cyan-700',
  customer: 'bg-slate-100 text-slate-600'
};

interface EditState { id?: string; name: string; phone: string; email: string; role: User['role']; password: string; }

const EMPTY: EditState = { name: '', phone: '', email: '', role: 'customer', password: '' };

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [role, setRole] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditState | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '25' });
    if (role) params.set('role', role);
    if (search) params.set('search', search);
    api.get<{ users: User[]; pagination: Pagination }>(`/admin/users?${params}`)
      .then((d) => { setUsers(d.users); setPagination(d.pagination); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, [page, role]);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    setFormError(null);
    try {
      if (editing.id) {
        const body: any = { name: editing.name, email: editing.email, role: editing.role };
        if (editing.password) body.password = editing.password;
        await api.patch(`/admin/users/${editing.id}`, body);
      } else {
        await api.post('/admin/users', {
          name: editing.name, phone: editing.phone, email: editing.email || undefined,
          role: editing.role, password: editing.password
        });
      }
      setEditing(null);
      load();
    } catch (err: any) { setFormError(err.message); } finally { setBusy(false); }
  };

  const toggleActive = async (u: User) => {
    setBusy(true);
    try { await api.patch(`/admin/users/${u.id}`, { isActive: u.isActive === false }); load(); }
    catch (err: any) { setError(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Customers</h1>
        <button className="btn-primary" onClick={() => { setFormError(null); setEditing({ ...EMPTY }); }}><Plus className="h-4 w-4" /> Add user</button>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="flex flex-wrap gap-3">
        <form className="relative min-w-52 flex-1" onSubmit={(e) => { e.preventDefault(); setPage(1); load(); }}>
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input className="input pl-9" placeholder="Search name or phone… (press Enter)" value={search} onChange={(e) => setSearch(e.target.value)} />
        </form>
        <div className="flex gap-1.5">
          {ROLES.map((r) => (
            <button key={r || 'all'} onClick={() => { setRole(r); setPage(1); }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${role === r ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
              {r || 'All'}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-x-auto">
        {loading ? <PageLoader /> : users.length === 0 ? <EmptyState message="No users found" /> : (
          <table className="w-full min-w-[680px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr><th className="th">User</th><th className="th">Phone</th><th className="th">Role</th><th className="th">Joined</th><th className="th">Status</th><th className="th text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="td">
                    <p className="font-semibold">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.email || '—'}</p>
                  </td>
                  <td className="td">{u.phone}</td>
                  <td className="td"><span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${ROLE_BADGE[u.role]}`}>{u.role}</span></td>
                  <td className="td text-xs text-slate-400">{fmtDate(u.createdAt)}</td>
                  <td className="td"><ActiveBadge active={u.isActive} /></td>
                  <td className="td text-right">
                    <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600"
                      onClick={() => { setFormError(null); setEditing({ id: u.id, name: u.name, phone: u.phone, email: u.email || '', role: u.role, password: '' }); }}>
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button className={`rounded-lg p-2 text-slate-400 ${u.isActive === false ? 'hover:bg-green-50 hover:text-green-600' : 'hover:bg-red-50 hover:text-red-600'}`}
                      title={u.isActive === false ? 'Enable account' : 'Disable account'} disabled={busy}
                      onClick={() => toggleActive(u)}>
                      {u.isActive === false ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-slate-500">{pagination.total} users</p>
          <div className="flex gap-2">
            <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span className="px-2 py-2 font-semibold">{page} / {pagination.totalPages}</span>
            <button className="btn-secondary" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit user' : 'Add user'}>
        {editing && (
          <form onSubmit={save} className="space-y-4">
            {formError && <ErrorBanner message={formError} />}
            <div>
              <label className="label">Name</label>
              <input className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Phone</label>
                <input className="input" value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} required disabled={!!editing.id} />
              </div>
              <div>
                <label className="label">Role</label>
                <select className="input" value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value as any })}>
                  <option value="customer">Customer</option>
                  <option value="rider">Rider</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Email (optional)</label>
              <input className="input" type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
            </div>
            <div>
              <label className="label">{editing.id ? 'New password (leave blank to keep)' : 'Password'}</label>
              <input className="input" type="password" value={editing.password} onChange={(e) => setEditing({ ...editing, password: e.target.value })} minLength={6} required={!editing.id} />
            </div>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save user'}</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
