import { FormEvent, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import type { Category } from '../lib/types';
import { Modal, ConfirmDialog, PageLoader, ActiveBadge, EmptyState, ErrorBanner } from '../components/ui';
import ImageUpload from '../components/ImageUpload';

const EMPTY: Partial<Category> = { name: '', slug: '', icon: '', imageUrl: null, parentSlug: null, sortOrder: 0, isActive: true };

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const [deleting, setDeleting] = useState<Category | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Sorting state
  const [sortField, setSortField] = useState<'name' | 'sortOrder' | 'parentSlug'>('sortOrder');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const load = () => {
    setLoading(true);
    api.get<Category[]>('/admin/categories?includeInactive=true')
      .then(setCategories)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    setFormError(null);
    try {
      const body = {
        name: editing.name, slug: editing.slug || undefined, icon: editing.icon || null,
        imageUrl: editing.imageUrl, sortOrder: Number(editing.sortOrder) || 0, isActive: editing.isActive !== false,
        parentSlug: editing.parentSlug || null
      };
      if (editing.id) await api.patch(`/admin/categories/${editing.id}`, body);
      else await api.post('/admin/categories', body);
      setEditing(null);
      load();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.delete(`/admin/categories/${deleting.id}`);
      setDeleting(null);
      load();
    } catch (err: any) { setError(err.message); } finally { setBusy(false); }
  };

  const toggleSort = (field: 'name' | 'sortOrder' | 'parentSlug') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedCategories = [...categories].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];
    if (aVal === undefined || aVal === null) aVal = '';
    if (bVal === undefined || bVal === null) bVal = '';

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }
    return sortDirection === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Categories</h1>
        <button className="btn-primary" onClick={() => { setFormError(null); setEditing({ ...EMPTY }); }}><Plus className="h-4 w-4" /> Add category</button>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="card overflow-x-auto">
        {loading ? <PageLoader /> : categories.length === 0 ? <EmptyState message="No categories yet" /> : (
          <table className="w-full min-w-[560px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="th cursor-pointer hover:bg-slate-100 hover:text-slate-900 select-none" onClick={() => toggleSort('name')}>
                  Category {sortField === 'name' ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
                <th className="th">Slug</th>
                <th className="th cursor-pointer hover:bg-slate-100 hover:text-slate-900 select-none" onClick={() => toggleSort('parentSlug')}>
                  Parent {sortField === 'parentSlug' ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
                <th className="th">Icon</th>
                <th className="th cursor-pointer hover:bg-slate-100 hover:text-slate-900 select-none" onClick={() => toggleSort('sortOrder')}>
                  Order {sortField === 'sortOrder' ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
                <th className="th">Status</th>
                <th className="th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedCategories.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50">
                  <td className="td">
                    <div className="flex items-center gap-3">
                      {c.imageUrl ? <img src={c.imageUrl} className="h-9 w-9 rounded-lg object-cover" alt="" /> : <div className="h-9 w-9 rounded-lg bg-slate-100" />}
                      <span className="font-semibold">{c.name}</span>
                    </div>
                  </td>
                  <td className="td text-slate-500">{c.slug}</td>
                  <td className="td text-slate-500">
                    {c.parentSlug ? (categories.find((p) => p.slug === c.parentSlug)?.name || c.parentSlug) : '—'}
                  </td>
                  <td className="td text-slate-500">{c.icon || '—'}</td>
                  <td className="td">{c.sortOrder ?? 0}</td>
                  <td className="td"><ActiveBadge active={c.isActive} /></td>
                  <td className="td text-right">
                    <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600" onClick={() => { setFormError(null); setEditing({ ...c }); }}><Pencil className="h-4 w-4" /></button>
                    <button className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" onClick={() => setDeleting(c)}><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit category' : 'Add category'}>
        {editing && (
          <form onSubmit={save} className="space-y-4">
            {formError && <ErrorBanner message={formError} />}
            <div>
              <label className="label">Name</label>
              <input className="input" value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Slug (auto if empty)</label>
                <input className="input" value={editing.slug || ''} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} placeholder="fruits-vegetables" disabled={!!editing.id} />
              </div>
              <div>
                <label className="label">Sort order</label>
                <input className="input" type="number" value={editing.sortOrder ?? 0} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })} />
              </div>
            </div>
            <div>
              <label className="label">Parent Category (optional)</label>
              <select className="input" value={editing.parentSlug || ''} onChange={(e) => setEditing({ ...editing, parentSlug: e.target.value || null })}>
                <option value="">None (Top-level Department)</option>
                {categories
                  .filter((cat) => !cat.parentSlug && cat.slug !== editing.slug)
                  .map((cat) => (
                    <option key={cat.id} value={cat.slug}>{cat.name}</option>
                  ))
                }
              </select>
            </div>
            <div>
              <label className="label">Lucide icon name (used by the web app)</label>
              <input className="input" value={editing.icon || ''} onChange={(e) => setEditing({ ...editing, icon: e.target.value })} placeholder="e.g. Apple, Leaf, Sparkles" />
            </div>
            <ImageUpload value={editing.imageUrl} onChange={(url) => setEditing({ ...editing, imageUrl: url })} folder="categories" label="Category image (optional)" />
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={editing.isActive !== false} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} /> Active
            </label>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save category'}</button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting} onClose={() => setDeleting(null)} onConfirm={remove} busy={busy}
        title="Deactivate category"
        message={`"${deleting?.name}" will be hidden from the store. Products in it remain but won't show under this category.`}
      />
    </div>
  );
}
