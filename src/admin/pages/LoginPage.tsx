import { useState, type FormEvent } from 'react';
import { Lock } from 'lucide-react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { LogoMark } from '@/components/common/Logo';
import { TextField } from '@/components/forms/Field';
import { ApiError, USE_API } from '@/lib/api';
import { adminApi } from '../api';
import { useAdmin } from '../AdminContext';

/** Only allow redirects back into the admin area. */
const safeNext = (next: string | null) => (next && /^\/admin(\/|$)/.test(next) && !next.startsWith('//') ? next : '/admin');

export default function LoginPage() {
  const { admin, setAdmin } = useAdmin();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const next = safeNext(params.get('next'));

  if (admin) return <Navigate to={next} replace />;

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const { admin: signedIn } = await adminApi.auth.login(email.trim(), password);
      setAdmin(signedIn);
      navigate(next, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Sign-in failed. Please try again.');
      setPassword('');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden bg-navy-950 px-4 py-12">
      <div className="bg-grid-dark absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" aria-hidden />
      <div className="absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-brand-600/20 blur-[120px]" aria-hidden />
      <main className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <LogoMark className="size-12 [&_rect]:fill-white/10" />
          <h1 className="mt-5 text-2xl font-bold tracking-tight text-white">Admin sign in</h1>
          <p className="mt-1.5 text-sm text-white/60">Business Tamil Nadu control panel</p>
        </div>
        <form onSubmit={onSubmit} noValidate className="rounded-2xl bg-white p-6 shadow-panel sm:p-7">
          {!USE_API && (
            <p className="mb-5 rounded-xl bg-gold-50 px-3.5 py-3 text-sm text-gold-700">
              The site is running in demo mode (VITE_USE_API=false). Start the API to use the admin panel.
            </p>
          )}
          <div className="space-y-4">
            <TextField
              label="Email"
              type="email"
              autoComplete="username"
              required
              optionalLabel={false}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
            <TextField
              label="Password"
              type="password"
              autoComplete="current-password"
              required
              optionalLabel={false}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && (
            <p className="mt-4 rounded-xl bg-red-50 px-3.5 py-2.5 text-sm font-medium text-red-700" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" variant="primary" size="lg" fullWidth loading={busy} className="mt-6" leftIcon={<Lock className="size-4" aria-hidden />}>
            Sign in
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-white/50">
          <Link to="/" className="hover:text-white">
            ← Back to website
          </Link>
        </p>
      </main>
    </div>
  );
}
