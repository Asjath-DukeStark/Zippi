import { FormEvent, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { PageLoader, ErrorBanner } from '../components/ui';

interface StoreSettings { name: string; currency: string; supportPhone: string; supportEmail: string; isOpen: boolean; }
interface DeliverySettings { deliveryFee: number; freeDeliveryAbove: number; etaMinutes: number; serviceRadiusKm: number; }

export default function Settings() {
  const [store, setStore] = useState<StoreSettings | null>(null);
  const [delivery, setDelivery] = useState<DeliverySettings | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get<{ store: StoreSettings; delivery: DeliverySettings }>('/settings')
      .then((d) => { setStore(d.store); setDelivery(d.delivery); })
      .catch((e) => setError(e.message));
  }, []);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!store || !delivery) return;
    setBusy(true);
    setError(null);
    setSaved(null);
    try {
      await api.put('/admin/settings/store', store);
      await api.put('/admin/settings/delivery', {
        deliveryFee: Number(delivery.deliveryFee),
        freeDeliveryAbove: Number(delivery.freeDeliveryAbove),
        etaMinutes: Number(delivery.etaMinutes),
        serviceRadiusKm: Number(delivery.serviceRadiusKm)
      });
      localStorage.setItem('zippi_currency', store.currency);
      setSaved('Settings saved successfully.');
    } catch (err: any) { setError(err.message); } finally { setBusy(false); }
  };

  if (!store || !delivery) return error ? <ErrorBanner message={error} /> : <PageLoader />;

  return (
    <div className="max-w-2xl space-y-5">
      <h1 className="text-2xl font-extrabold">Settings</h1>
      {error && <ErrorBanner message={error} />}
      {saved && <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">{saved}</div>}

      <form onSubmit={save} className="space-y-5">
        <div className="card space-y-4 p-5">
          <h2 className="font-bold">Store</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Store name</label>
              <input className="input" value={store.name} onChange={(e) => setStore({ ...store, name: e.target.value })} required />
            </div>
            <div>
              <label className="label">Currency</label>
              <input className="input" value={store.currency} onChange={(e) => setStore({ ...store, currency: e.target.value })} required />
            </div>
            <div>
              <label className="label">Support phone</label>
              <input className="input" value={store.supportPhone} onChange={(e) => setStore({ ...store, supportPhone: e.target.value })} />
            </div>
            <div>
              <label className="label">Support email</label>
              <input className="input" type="email" value={store.supportEmail} onChange={(e) => setStore({ ...store, supportEmail: e.target.value })} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" checked={store.isOpen} onChange={(e) => setStore({ ...store, isOpen: e.target.checked })} />
            Store is open (accepting orders)
          </label>
        </div>

        <div className="card space-y-4 p-5">
          <h2 className="font-bold">Delivery</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Delivery fee</label>
              <input className="input" type="number" step="0.01" min="0" value={delivery.deliveryFee} onChange={(e) => setDelivery({ ...delivery, deliveryFee: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">Free delivery above</label>
              <input className="input" type="number" step="0.01" min="0" value={delivery.freeDeliveryAbove} onChange={(e) => setDelivery({ ...delivery, freeDeliveryAbove: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">Default ETA (minutes)</label>
              <input className="input" type="number" min="5" value={delivery.etaMinutes} onChange={(e) => setDelivery({ ...delivery, etaMinutes: Number(e.target.value) })} />
            </div>
            <div>
              <label className="label">Service radius (km)</label>
              <input className="input" type="number" min="1" value={delivery.serviceRadiusKm} onChange={(e) => setDelivery({ ...delivery, serviceRadiusKm: Number(e.target.value) })} />
            </div>
          </div>
        </div>

        <button className="btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save settings'}</button>
      </form>
    </div>
  );
}
