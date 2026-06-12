import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { useRider } from '../context/RiderContext';
import { ErrorBanner } from '../components/ui';

export default function Login() {
  const { login } = useRider();
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      await login(phone.trim(), password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6">
      <div className="mb-8 flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-brand-600 text-white"><Zap className="h-8 w-8" /></div>
        <div className="text-center">
          <h1 className="text-2xl font-extrabold">Zippi Rider</h1>
          <p className="text-sm text-slate-500">Sign in to start delivering</p>
        </div>
      </div>
      <form onSubmit={submit} className="space-y-4">
        {error && <ErrorBanner message={error} />}
        <div>
          <label className="label">Phone number</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05xxxxxxxx" autoFocus required />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
        </div>
        <button className="btn-primary w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </div>
  );
}
