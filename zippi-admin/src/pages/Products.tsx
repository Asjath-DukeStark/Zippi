import { FormEvent, useEffect, useState, useRef } from 'react';
import { Plus, Pencil, Trash2, Search, Eye, EyeOff, AlertTriangle, Upload } from 'lucide-react';
import { api } from '../lib/api';
import type { Product, Category, Pagination } from '../lib/types';
import { Modal, ConfirmDialog, PageLoader, ActiveBadge, EmptyState, ErrorBanner, fmtMoney } from '../components/ui';
import ImageUpload from '../components/ImageUpload';

const EMPTY: Partial<Product> = {
  name: '', description: '', categorySlug: '', price: 0, originalPrice: undefined, unit: '',
  imageUrl: null, popular: false, isFlashDeal: false, stock: 0, isActive: true
};

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [deleting, setDeleting] = useState<Product | null>(null);
  const [confirmHardDelete, setConfirmHardDelete] = useState(false);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Sorting state
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post<{ importedCount: number }>('/admin/products/import', fd);
      alert(`Successfully imported ${res.importedCount} products!`);
      load();
    } catch (err: any) {
      setError(`Import error: ${err.message}`);
    } finally {
      setBusy(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (showInactive) params.set('includeInactive', 'true');
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (sortField) {
      params.set('sort', sortField === 'name' ? 'name' : sortField === 'price' ? 'price' : sortField === 'stock' ? 'stock' : 'created_at');
      params.set('order', sortDirection);
    }
    api.get<{ products: Product[]; pagination: Pagination }>(`/admin/products?${params}`)
      .then((d) => { setProducts(d.products); setPagination(d.pagination); })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setPage(1);
  };

  useEffect(load, [page, category, showInactive, sortField, sortDirection]);
  useEffect(() => {
    api.get<Category[]>('/admin/categories?includeInactive=true').then(setCategories).catch(() => {});
  }, []);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setBusy(true);
    setFormError(null);
    try {
      const body = {
        name: editing.name, description: editing.description, categorySlug: editing.categorySlug,
        price: Number(editing.price), originalPrice: editing.originalPrice ? Number(editing.originalPrice) : null,
        discountPercent: editing.originalPrice && Number(editing.originalPrice) > Number(editing.price)
          ? Math.round((1 - Number(editing.price) / Number(editing.originalPrice)) * 100) : null,
        unit: editing.unit, imageUrl: editing.imageUrl, popular: !!editing.popular,
        isFlashDeal: !!editing.isFlashDeal, stock: Number(editing.stock), isActive: editing.isActive !== false,
        variants: editing.variants && editing.variants.length > 0
          ? editing.variants.map((v) => ({
              unit: v.unit,
              price: Number(v.price),
              originalPrice: v.originalPrice ? Number(v.originalPrice) : null,
              stock: v.stock !== undefined && v.stock !== null ? Number(v.stock) : null
            }))
          : []
      };
      if (editing.id) await api.patch(`/admin/products/${editing.id}`, body);
      else await api.post('/admin/products', body);
      setEditing(null);
      load();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const remove = async (hard = false) => {
    if (!deleting) return;
    setBusy(true);
    try {
      await api.delete(`/admin/products/${deleting.id}${hard ? '?hard=true' : ''}`);
      setDeleting(null);
      setConfirmHardDelete(false);
      load();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Products</h1>
        <div className="flex items-center gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportFile} 
            accept=".csv,.xlsx,.xls" 
            className="hidden" 
          />
          <button 
            className="btn-secondary flex items-center gap-1.5" 
            onClick={handleImportClick}
            disabled={busy}
          >
            <Upload className="h-4 w-4" /> {busy ? 'Importing…' : 'Import Excel / CSV'}
          </button>
          <button className="btn-primary flex items-center gap-1.5" onClick={() => { setFormError(null); setEditing({ ...EMPTY }); }}><Plus className="h-4 w-4" /> Add product</button>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      <div className="flex flex-wrap gap-3">
        <form className="relative flex-1 min-w-52" onSubmit={(e) => { e.preventDefault(); setPage(1); load(); }}>
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input className="input pl-9" placeholder="Search products… (press Enter)" value={search} onChange={(e) => setSearch(e.target.value)} />
        </form>
        <select className="input w-auto" value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <button
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-semibold transition-colors ${
            showInactive
              ? 'border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100'
              : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
          }`}
          onClick={() => { setShowInactive(!showInactive); setPage(1); }}
        >
          {showInactive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          {showInactive ? 'Showing inactive' : 'Inactive hidden'}
        </button>
      </div>

      <div className="card overflow-x-auto">
        {loading ? <PageLoader /> : products.length === 0 ? <EmptyState message="No products found" /> : (
          <table className="w-full min-w-[720px]">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="th cursor-pointer hover:bg-slate-100 hover:text-slate-900 select-none" onClick={() => toggleSort('name')}>
                  Product {sortField === 'name' ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
                <th className="th">Category</th>
                <th className="th cursor-pointer hover:bg-slate-100 hover:text-slate-900 select-none" onClick={() => toggleSort('price')}>
                  Price {sortField === 'price' ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
                <th className="th cursor-pointer hover:bg-slate-100 hover:text-slate-900 select-none" onClick={() => toggleSort('stock')}>
                  Stock {sortField === 'stock' ? (sortDirection === 'asc' ? ' ▲' : ' ▼') : ''}
                </th>
                <th className="th">Flags</th>
                <th className="th">Status</th>
                <th className="th text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="td">
                    <div className="flex items-center gap-3">
                      {p.imageUrl ? <img src={p.imageUrl} className="h-10 w-10 rounded-lg object-cover" alt="" /> : <div className="h-10 w-10 rounded-lg bg-slate-100" />}
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-xs text-slate-400">
                          {p.variants && p.variants.length > 0
                            ? `${p.variants.length} sizes: ${p.variants.map(v => v.unit).join(', ')}`
                            : p.unit}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="td text-slate-500">{categories.find((c) => c.slug === p.categorySlug)?.name || p.categorySlug || '—'}</td>
                  <td className="td">
                    <p className="font-semibold">{fmtMoney(p.price)}</p>
                    {p.originalPrice && <p className="text-xs text-slate-400 line-through">{fmtMoney(p.originalPrice)}</p>}
                  </td>
                  <td className={`td font-semibold ${p.stock <= 5 ? 'text-red-600' : ''}`}>{p.stock}</td>
                  <td className="td">
                    <div className="flex flex-wrap gap-1">
                      {p.popular && <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-700">POPULAR</span>}
                      {p.isFlashDeal && <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">FLASH</span>}
                    </div>
                  </td>
                  <td className="td"><ActiveBadge active={p.isActive} /></td>
                  <td className="td text-right">
                    <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600" onClick={() => { setFormError(null); setEditing({ ...p }); }}><Pencil className="h-4 w-4" /></button>
                    <button className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600" onClick={() => setDeleting(p)}><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-slate-500">{pagination.total} products</p>
          <div className="flex gap-2">
            <button className="btn-secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
            <span className="px-2 py-2 font-semibold">{page} / {pagination.totalPages}</span>
            <button className="btn-secondary" disabled={page >= pagination.totalPages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </div>
      )}

      {/* Editor modal */}
      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? 'Edit product' : 'Add product'} wide>
        {editing && (
          <form onSubmit={save} className="space-y-4">
            {formError && <ErrorBanner message={formError} />}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">Name</label>
                <input className="input" value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} required />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Description</label>
                <textarea className="input" rows={2} value={editing.description || ''} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div>
                <label className="label">Category</label>
                <select className="input" value={editing.categorySlug || ''} onChange={(e) => setEditing({ ...editing, categorySlug: e.target.value })} required>
                  <option value="">Select…</option>
                  {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Unit (e.g. 1 kg, 500 g)</label>
                <input className="input" value={editing.unit || ''} onChange={(e) => setEditing({ ...editing, unit: e.target.value })} required />
              </div>
              <div>
                <label className="label">Price</label>
                <input className="input" type="number" step="0.01" min="0" value={editing.price ?? ''} onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })} required />
              </div>
              <div>
                <label className="label">Original price (optional, for discounts)</label>
                <input className="input" type="number" step="0.01" min="0" value={editing.originalPrice ?? ''} onChange={(e) => setEditing({ ...editing, originalPrice: e.target.value ? Number(e.target.value) : undefined })} />
              </div>
              <div>
                <label className="label">Stock</label>
                <input className="input" type="number" min="0" value={editing.stock ?? 0} onChange={(e) => setEditing({ ...editing, stock: Number(e.target.value) })} required />
              </div>
              <div className="flex items-end gap-5 pb-1">
                <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={!!editing.popular} onChange={(e) => setEditing({ ...editing, popular: e.target.checked })} /> Popular</label>
                <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={!!editing.isFlashDeal} onChange={(e) => setEditing({ ...editing, isFlashDeal: e.target.checked })} /> Flash deal</label>
                <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={editing.isActive !== false} onChange={(e) => setEditing({ ...editing, isActive: e.target.checked })} /> Active</label>
              </div>

              <div className="sm:col-span-2 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-slate-800 text-sm">Product Variants</h3>
                  <button
                    type="button"
                    className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1"
                    onClick={() => {
                      const current = editing.variants || [];
                      setEditing({
                        ...editing,
                        variants: [...current, { unit: '', price: 0, originalPrice: undefined, stock: undefined }]
                      });
                    }}
                  >
                    <Plus className="h-3 w-3" /> Add Variant
                  </button>
                </div>

                {(editing.variants || []).length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No custom variants defined (falls back to main price, unit, and stock above).</p>
                ) : (
                  <div className="space-y-3">
                    {(editing.variants || []).map((variant, idx) => (
                      <div key={idx} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/50 p-3">
                        <div className="flex-1 min-w-[120px]">
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Unit/Size (e.g. 200g, 1 kg)</label>
                          <input
                            className="input text-xs py-1 px-2"
                            placeholder="e.g. 200g"
                            value={variant.unit}
                            onChange={(e) => {
                              const newVariants = [...(editing.variants || [])];
                              newVariants[idx] = { ...newVariants[idx], unit: e.target.value };
                              setEditing({ ...editing, variants: newVariants });
                            }}
                            required
                          />
                        </div>
                        <div className="w-24">
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Price (LKR)</label>
                          <input
                            className="input text-xs py-1 px-2"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Price"
                            value={variant.price || ''}
                            onChange={(e) => {
                              const newVariants = [...(editing.variants || [])];
                              newVariants[idx] = { ...newVariants[idx], price: Number(e.target.value) };
                              setEditing({ ...editing, variants: newVariants });
                            }}
                            required
                          />
                        </div>
                        <div className="w-28">
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Original (optional)</label>
                          <input
                            className="input text-xs py-1 px-2"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="Original Price"
                            value={variant.originalPrice || ''}
                            onChange={(e) => {
                              const newVariants = [...(editing.variants || [])];
                              newVariants[idx] = { ...newVariants[idx], originalPrice: e.target.value ? Number(e.target.value) : undefined };
                              setEditing({ ...editing, variants: newVariants });
                            }}
                          />
                        </div>
                        <div className="w-20">
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Stock (optional)</label>
                          <input
                            className="input text-xs py-1 px-2"
                            type="number"
                            min="0"
                            placeholder="Stock"
                            value={variant.stock ?? ''}
                            onChange={(e) => {
                              const newVariants = [...(editing.variants || [])];
                              newVariants[idx] = { ...newVariants[idx], stock: e.target.value ? Number(e.target.value) : undefined };
                              setEditing({ ...editing, variants: newVariants });
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          className="mt-4 rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors self-center"
                          onClick={() => {
                            const newVariants = (editing.variants || []).filter((_, i) => i !== idx);
                            setEditing({ ...editing, variants: newVariants });
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <ImageUpload value={editing.imageUrl} onChange={(url) => setEditing({ ...editing, imageUrl: url })} folder="products" label="Product image" />
            <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
              <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>Cancel</button>
              <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save product'}</button>
            </div>
          </form>
        )}
      </Modal>

      {/* Soft delete / hard delete dialog */}
      <ConfirmDialog
        open={!!deleting && !confirmHardDelete}
        onClose={() => setDeleting(null)}
        onConfirm={() => remove(false)}
        busy={busy}
        title="Deactivate product"
        message={`"${deleting?.name}" will be hidden from the store. You can re-activate it later by editing it.`}
      >
        <button
          type="button"
          className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
          onClick={() => setConfirmHardDelete(true)}
        >
          <AlertTriangle className="h-3.5 w-3.5" />
          Delete permanently instead
        </button>
      </ConfirmDialog>

      {/* Hard delete second confirmation */}
      <ConfirmDialog
        open={!!deleting && confirmHardDelete}
        onClose={() => setConfirmHardDelete(false)}
        onConfirm={() => remove(true)}
        busy={busy}
        title="⚠️ Permanently delete product?"
        message={`"${deleting?.name}" will be permanently removed from the database. This action CANNOT be undone.`}
      />
    </div>
  );
}
