import { FormEvent, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import type { Banner } from '../lib/types';
import { Modal, ConfirmDialog, PageLoader, ActiveBadge, EmptyState, ErrorBanner } from '../components/ui';
import ImageUpload from '../components/ImageUpload';

const EMPTY: Partial<Banner> = { title: '', imageUrl: '', linkUrl: '', sortOrder: 0, isActive: true };

export default function Banners() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Partial<Banner> | null>(null);
  const [deleting, setDeleting] = useState<Banner | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api.get<Banner[]>('/admin/banners?includeInactive=true')
      .then(setBanners)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!editing.imageUrl) { setFormError('Please upload a banner image'); return; }
    setBusy(true);
    setFormError(null);
    try {
      const body = {
        title: editing.title, imageUrl: editing.imageUrl, linkUrl: editing.linkUrl || null,
        sortOrder: Number(editing.sortOrder) || 0, isActive: editing.isActive !== false
      };
      if (editing.id) await api.patch(`/admin/banners/${editing.id}`, body);
      else await api.post('/admin/banners', body);
      setEditing(null);
      load();
    } catch (err: any) { setFormError(err.message); } finally { setBusy(false); }
  };

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.delete(`/admin/banners/${deleting.id}`);
      setDeleting(null);
      load();
    } catch (err: any) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Banners</h1>
        <button className="btn-primary" onClick={() => { setFormError(null); setEditing({ ...EMPTY }); }}><Plus className="h-4 w-4" /> Add banner</button>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? <PageLoader /> : banners.length === 0 ? (
        <div className="card"><EmptyState message="No banners yet — add one to feature promotions on the home screen" /></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {banners.map((b) => (
            <div key={b.id} className="card overflow-hidden">
              <div className="relative aspect-[21/9] bg-slate-100">
                <img src={b.imageUrl} alt={b.title} className="absolute inset-0 h-full w-full object-cover" />
                <div className="absolute right-2 top-2"><ActiveBadge active={b.isActive} /></div>
              </div>
              <div className="flex items-center justify-between p-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{b.title}</p>
                  <p className="truncate text-xs text-slate-400">{b.linkUrl || 'No link'} · order {b.sortOrder}</p>
                </div>
                <div className="flex shrink-0">
                  <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600" onClick={() => { setFormError(null); setEditing({ ...b }); }}><Pencil className="h-4 w-4" /></button>
                  <button className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" onClick={() => setDeleting(b)}><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit banner' : 'Add banner'}>
        {editing && (
          <form onSubmit={save} className="space-y-4">
            {formError && <ErrorBanner message={formError} />}
            <div>
              <label className="label">Title</label>
              <input className="input" value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} required />
            </div>
            <ImageUpload value={editing.imageUrl} onChange={(url) => setEditing({ ...editing, imageUrl: url || '' })} folder="banners" label="Banner image (wide, e.g. 1200×500)" aspect="aspect-[21/9]" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Link URL (optional)</label>
                <input className="input" value={editing.linkUrl || ''} onChange={(e) => setEditing({ ...editing, linkUrl: e.target.value })} placeholder="/deals" />
              </div>
              <div>
                <label className="label">Sort order</label>
                <input className="input" type="number" value={editing.sortOrder ?? 0} onChange={(e) => setEditing({ ...editing, sortOrder: Number(e.target.value) })} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={editing.isActive !== false} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} /> Active
            </label>
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save banner'}</button>
            </div>
          </form>
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleting} onClose={() => setDeleting(null)} onConfirm={remove} busy={busy}
        title="Delete banner" message={`"${deleting?.title}" will be permanently deleted.`}
      />
    </div>
  );
}
