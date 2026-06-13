import { FormEvent, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, BadgePercent, Ticket, Flame, Gift, TrendingUp, Sparkles } from 'lucide-react';
import { api } from '../lib/api';
import type { Category } from '../lib/types';
import { Modal, ConfirmDialog, PageLoader, ActiveBadge, EmptyState, ErrorBanner, fmtDate } from '../components/ui';

interface Promotion {
  id: string;
  code: string;
  description?: string | null;
  type: 'percent' | 'fixed';
  value: number;
  minOrder?: number | null;
  maxDiscount?: number | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  usageLimit?: number | null;
  usedCount: number;
  isActive: boolean;
  createdAt: string;

  scope: 'order' | 'category' | 'product' | 'delivery' | 'payment';
  targetCategorySlug?: string | null;
  targetProductId?: string | null;
  targetPaymentMethod?: 'COD' | 'CARD' | null;
  firstOrderOnly: boolean;
  startHour?: number | null;
  endHour?: number | null;
}

const EMPTY: Partial<Promotion> = {
  code: '', description: '', type: 'percent', value: 10, minOrder: 0,
  maxDiscount: undefined, expiresAt: undefined, usageLimit: undefined, isActive: true,
  scope: 'order', targetCategorySlug: '', targetProductId: '', targetPaymentMethod: null,
  firstOrderOnly: false, startHour: undefined, endHour: undefined
};

const inDays = (n: number) => {
  const d = new Date(); d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const TEMPLATES: { icon: any; title: string; desc: string; preset: Partial<Promotion> }[] = [
  {
    icon: Gift, title: 'Welcome offer',
    desc: '10% off for new customers',
    preset: { ...EMPTY, code: 'WELCOME10', description: '10% off your first order', type: 'percent', value: 10, usageLimit: 100 }
  },
  {
    icon: Flame, title: 'Flash sale',
    desc: '20% off, capped, ends in 7 days',
    preset: { ...EMPTY, code: 'FLASH20', description: 'Limited-time 20% off', type: 'percent', value: 20, maxDiscount: 500, expiresAt: inDays(7) }
  },
  {
    icon: Ticket, title: 'Big basket',
    desc: 'LKR 250 off orders over 2,500',
    preset: { ...EMPTY, code: 'SAVE250', description: 'LKR 250 off orders over 2,500', type: 'fixed', value: 250, minOrder: 2500 }
  }
];

export default function Promotions() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Promotion> | null>(null);
  const [deleting, setDeleting] = useState<Promotion | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api.get<{ promotions: Promotion[] }>('/admin/promotions')
      .then((d) => setPromotions(d.promotions))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  useEffect(() => {
    api.get<Category[]>('/admin/categories?includeInactive=true')
      .then(setCategories)
      .catch(() => {});
  }, []);

  const isLive = (p: Promotion) =>
    p.isActive &&
    (!p.expiresAt || new Date(p.expiresAt) >= new Date()) &&
    (!p.usageLimit || p.usedCount < p.usageLimit);

  const liveCount = promotions.filter(isLive).length;
  const totalRedemptions = promotions.reduce((s, p) => s + (p.usedCount || 0), 0);
  const expiringSoon = promotions.filter((p) => isLive(p) && p.expiresAt && new Date(p.expiresAt) <= new Date(Date.now() + 7 * 86400000)).length;
  const top = [...promotions].sort((a, b) => (b.usedCount || 0) - (a.usedCount || 0))[0];

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    setFormError(null);
    try {
      const body = {
        code: editing.code,
        description: editing.description || null,
        type: editing.type,
        value: editing.scope === 'delivery' ? 0 : Number(editing.value),
        minOrder: Number(editing.minOrder) || 0,
        maxDiscount: editing.maxDiscount ? Number(editing.maxDiscount) : null,
        expiresAt: editing.expiresAt ? new Date(editing.expiresAt).toISOString() : null,
        usageLimit: editing.usageLimit ? Number(editing.usageLimit) : null,
        isActive: editing.isActive !== false,
        scope: editing.scope || 'order',
        firstOrderOnly: editing.firstOrderOnly === true,
        targetCategorySlug: editing.scope === 'category' && editing.targetCategorySlug ? editing.targetCategorySlug : null,
        targetProductId: editing.scope === 'product' && editing.targetProductId ? editing.targetProductId : null,
        targetPaymentMethod: editing.scope === 'payment' && editing.targetPaymentMethod ? editing.targetPaymentMethod : null,
        startHour: (editing.startHour !== undefined && editing.startHour !== null) ? Number(editing.startHour) : null,
        endHour: (editing.endHour !== undefined && editing.endHour !== null) ? Number(editing.endHour) : null
      };
      if (editing.id) await api.patch(`/admin/promotions/${editing.id}`, body);
      else await api.post('/admin/promotions', body);
      setEditing(null);
      load();
    } catch (err: any) { setFormError(err.message); } finally { setBusy(false); }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.delete(`/admin/promotions/${deleting.id}`);
      setDeleting(null);
      load();
    } catch (err: any) { setError(err.message); } finally { setBusy(false); }
  };

  const fmtValue = (p: Promotion) => p.type === 'percent' ? `${Number(p.value)}% off` : `${Number(p.value).toFixed(2)} off`;
  const toLocalInput = (iso?: string | null) => (iso ? new Date(iso).toISOString().slice(0, 10) : '');

  const stats = [
    { label: 'Live codes', value: liveCount, icon: BadgePercent, color: 'bg-green-100 text-green-600' },
    { label: 'Total redemptions', value: totalRedemptions, icon: TrendingUp, color: 'bg-indigo-100 text-indigo-600' },
    { label: 'Expiring in 7 days', value: expiringSoon, icon: Flame, color: 'bg-amber-100 text-amber-600' },
    { label: 'Top code', value: top && top.usedCount > 0 ? top.code : '-', icon: Sparkles, color: 'bg-pink-100 text-pink-600' }
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold">Promotions</h1>
          <p className="text-sm text-slate-400">Discount codes customers redeem at checkout</p>
        </div>
        <button className="btn-primary" onClick={() => { setFormError(null); setEditing({ ...EMPTY }); }}><Plus className="h-4 w-4" /> Add promo code</button>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card flex items-center gap-3 p-4">
            <div className={`rounded-xl p-2.5 ${s.color}`}><s.icon className="h-5 w-5" /></div>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-400">{s.label}</p>
              <p className="truncate text-lg font-extrabold">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {!loading && promotions.length === 0 && (
        <div className="card p-6">
          <h2 className="font-bold">Get started with a template</h2>
          <p className="mb-4 text-sm text-slate-400">One click to prefill - review and save.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {TEMPLATES.map((t) => (
              <button key={t.title} className="rounded-xl border-2 border-dashed border-slate-200 p-4 text-left transition-colors hover:border-brand-500 hover:bg-brand-50"
                onClick={() => { setFormError(null); setEditing({ ...t.preset }); }}>
                <t.icon className="mb-2 h-6 w-6 text-brand-600" />
                <p className="font-bold">{t.title}</p>
                <p className="text-xs text-slate-500">{t.desc}</p>
                <p className="mt-2 font-mono text-xs font-bold text-brand-700">{t.preset.code}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card overflow-x-auto">
        {loading ? <PageLoader /> : promotions.length === 0 ? (
          <EmptyState message="No promo codes yet - use a template above or click 'Add promo code'" />
        ) : (
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="th">Code</th><th className="th">Discount</th><th className="th">Min order</th>
                <th className="th">Redemptions</th><th className="th">Expires</th><th className="th">Status</th><th className="th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {promotions.map((p) => {
                const expired = p.expiresAt && new Date(p.expiresAt) < new Date();
                const exhausted = p.usageLimit && p.usedCount >= p.usageLimit;
                const pct = p.usageLimit ? Math.min(100, Math.round((p.usedCount / p.usageLimit) * 100)) : null;
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="td">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 text-amber-600"><BadgePercent className="h-4.5 w-4.5" /></div>
                        <div>
                          <p className="font-mono font-bold">{p.code}</p>
                          {p.description && <p className="max-w-48 truncate text-xs text-slate-400">{p.description}</p>}
                          <div className="flex flex-wrap gap-1 mt-1">
                            {p.firstOrderOnly && (
                              <span className="inline-flex items-center gap-1 rounded bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold text-rose-700">First Order</span>
                            )}
                            {p.startHour !== null && p.endHour !== null && p.startHour !== undefined && p.endHour !== undefined && (
                              <span className="inline-flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">{p.startHour}:00 - {p.endHour}:00</span>
                            )}
                            {p.scope === 'delivery' && (
                              <span className="inline-flex items-center gap-1 rounded bg-sky-50 px-1.5 py-0.5 text-[10px] font-bold text-sky-700">Free Delivery</span>
                            )}
                            {p.scope === 'category' && p.targetCategorySlug && (
                              <span className="inline-flex items-center gap-1 rounded bg-purple-50 px-1.5 py-0.5 text-[10px] font-bold text-purple-700">Category: {categories.find(c => c.slug === p.targetCategorySlug)?.name || p.targetCategorySlug}</span>
                            )}
                            {p.scope === 'product' && p.targetProductId && (
                              <span className="inline-flex items-center gap-1 rounded bg-orange-50 px-1.5 py-0.5 text-[10px] font-bold text-orange-700">Product: {p.targetProductId}</span>
                            )}
                            {p.scope === 'payment' && p.targetPaymentMethod && (
                              <span className="inline-flex items-center gap-1 rounded bg-indigo-50 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">Payment: {p.targetPaymentMethod}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="td font-semibold">
                      {p.scope === 'delivery' ? 'Free Delivery' : fmtValue(p)}
                      {p.maxDiscount && p.scope !== 'delivery' && <p className="text-xs font-normal text-slate-400">max {Number(p.maxDiscount).toFixed(2)}</p>}
                    </td>
                    <td className="td text-slate-500">{Number(p.minOrder || 0) > 0 ? Number(p.minOrder).toFixed(2) : '-'}</td>
                    <td className="td">
                      <p className={`font-semibold ${exhausted ? 'text-red-600' : ''}`}>{p.usedCount}{p.usageLimit ? ` / ${p.usageLimit}` : ''}</p>
                      {pct !== null && (
                        <div className="mt-1 h-1.5 w-20 rounded-full bg-slate-100">
                          <div className={`h-1.5 rounded-full ${pct >= 100 ? 'bg-red-400' : 'bg-brand-500'}`} style={{ width: `${pct}%` }} />
                        </div>
                      )}
                    </td>
                    <td className={`td text-xs ${expired ? 'font-semibold text-red-600' : 'text-slate-400'}`}>
                      {p.expiresAt ? fmtDate(p.expiresAt).split(',')[0] : 'Never'}
                    </td>
                    <td className="td"><ActiveBadge active={!!isLive(p)} /></td>
                    <td className="td text-right">
                      <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600" onClick={() => { setFormError(null); setEditing({ ...p, expiresAt: toLocalInput(p.expiresAt) }); }}><Pencil className="h-4 w-4" /></button>
                      <button className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" onClick={() => setDeleting(p)}><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit promotion' : 'Add promotion'} wide>
        {editing && (
          <form onSubmit={save} className="space-y-4">
            {formError && <ErrorBanner message={formError} />}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Code</label>
                <input className="input font-mono uppercase" value={editing.code || ''} onChange={(e) => setEditing({ ...editing, code: e.target.value.toUpperCase() })} placeholder="WELCOME10" required minLength={3} disabled={!!editing.id} />
              </div>
              <div>
                <label className="label">Scope / Targeting Type</label>
                <select className="input" value={editing.scope || 'order'} onChange={(e) => {
                  const s = e.target.value as any;
                  setEditing({
                    ...editing,
                    scope: s,
                    targetCategorySlug: s === 'category' ? editing.targetCategorySlug : '',
                    targetProductId: s === 'product' ? editing.targetProductId : '',
                    targetPaymentMethod: s === 'payment' ? (editing.targetPaymentMethod || 'COD') : null
                  });
                }}>
                  <option value="order">Entire Order</option>
                  <option value="category">Category-wise</option>
                  <option value="product">Product-wise</option>
                  <option value="delivery">Delivery-fee Waiver</option>
                  <option value="payment">Payment Method-wise</option>
                </select>
              </div>
            </div>
            <div>
              <label className="label">Description (optional)</label>
              <input className="input" value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="10% off your first order" />
            </div>

            {editing.scope !== 'delivery' && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Type</label>
                  <select className="input" value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value as any })}>
                    <option value="percent">Percentage (%)</option>
                    <option value="fixed">Fixed amount</option>
                  </select>
                </div>
                <div>
                  <label className="label">{editing.type === 'percent' ? 'Percent off' : 'Amount off'}</label>
                  <input className="input" type="number" step="0.01" min="0.01" value={editing.value ?? ''} onChange={(e) => setEditing({ ...editing, value: Number(e.target.value) })} required />
                </div>
              </div>
            )}

            {/* Target Scope Fields */}
            {editing.scope === 'category' && (
              <div>
                <label className="label">Target Category</label>
                <select className="input" value={editing.targetCategorySlug || ''} onChange={(e) => setEditing({ ...editing, targetCategorySlug: e.target.value })} required>
                  <option value="">Select category…</option>
                  {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
            )}
            {editing.scope === 'product' && (
              <div>
                <label className="label">Target Product ID</label>
                <input className="input" placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000" value={editing.targetProductId || ''} onChange={(e) => setEditing({ ...editing, targetProductId: e.target.value })} required />
              </div>
            )}
            {editing.scope === 'payment' && (
              <div>
                <label className="label">Target Payment Method</label>
                <select className="input" value={editing.targetPaymentMethod || 'COD'} onChange={(e) => setEditing({ ...editing, targetPaymentMethod: e.target.value as any })} required>
                  <option value="COD">Cash on Delivery (COD)</option>
                  <option value="CARD">Card Payment</option>
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Min order (0 = none)</label>
                <input className="input" type="number" step="0.01" min="0" value={editing.minOrder ?? 0} onChange={(e) => setEditing({ ...editing, minOrder: Number(e.target.value) })} />
              </div>
              {editing.scope !== 'delivery' && editing.type === 'percent' && (
                <div>
                  <label className="label">Max discount (optional)</label>
                  <input className="input" type="number" step="0.01" min="0" value={editing.maxDiscount ?? ''} onChange={(e) => setEditing({ ...editing, maxDiscount: e.target.value ? Number(e.target.value) : undefined })} />
                </div>
              )}
              <div>
                <label className="label">Usage limit (optional)</label>
                <input className="input" type="number" min="1" value={editing.usageLimit ?? ''} onChange={(e) => setEditing({ ...editing, usageLimit: e.target.value ? Number(e.target.value) : undefined })} />
              </div>
              <div>
                <label className="label">Expires on (optional)</label>
                <input className="input" type="date" value={editing.expiresAt || ''} onChange={(e) => setEditing({ ...editing, expiresAt: e.target.value })} />
              </div>
            </div>

            {/* Daily Hour Range Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Start Hour (0-23, optional)</label>
                <input className="input" type="number" min="0" max="23" placeholder="e.g. 14" value={editing.startHour ?? ''} onChange={(e) => setEditing({ ...editing, startHour: e.target.value === '' ? undefined : Number(e.target.value) })} />
              </div>
              <div>
                <label className="label">End Hour (0-23, optional)</label>
                <input className="input" type="number" min="0" max="23" placeholder="e.g. 18" value={editing.endHour ?? ''} onChange={(e) => setEditing({ ...editing, endHour: e.target.value === '' ? undefined : Number(e.target.value) })} />
              </div>
            </div>

            <div className="flex gap-6 pb-2">
              <label className="flex items-center gap-2 text-sm font-semibold select-none cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4" checked={editing.firstOrderOnly === true} onChange={(e) => setEditing({ ...editing, firstOrderOnly: e.target.checked })} /> First order only
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold select-none cursor-pointer">
                <input type="checkbox" className="rounded border-slate-300 text-brand-600 focus:ring-brand-500 h-4 w-4" checked={editing.isActive !== false} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} /> Active
              </label>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn-primary" disabled={busy}>{busy ? 'Saving...' : 'Save promotion'}</button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting} onClose={() => setDeleting(null)} onConfirm={remove} busy={busy}
        title="Delete promotion" message={`Code "${deleting?.code}" will be permanently deleted and can no longer be redeemed.`}
      />
    </div>
  );
}
