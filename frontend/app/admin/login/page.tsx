'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Mail, Stethoscope, AlertCircle, Loader2 } from 'lucide-react';
import { withBasePath } from '@/lib/base-path';

// useSearchParams must sit inside a Suspense boundary or the production
// build fails with a CSR-bailout error. The page shell wraps the form.
export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = params.get('next') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(withBasePath('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data?.error || 'Login failed');
        return;
      }
      router.push(nextPath);
      router.refresh();
    } catch {
      setError('Network error — is the API running?');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-hero-sky px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-clinical text-paper mb-4 shadow-[0_12px_32px_-8px_rgba(45,91,255,0.5)]">
            <Stethoscope className="w-7 h-7" />
          </div>
          <h1 className="font-display text-3xl font-bold text-ink mb-1">Admin Panel</h1>
          <p className="text-sm text-ink-muted">Dr. Mili · Internal access only</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-paper rounded-2xl card-shadow-lg p-8 border border-sky-100"
        >
          {error && (
            <div className="mb-5 flex items-start gap-2 text-sm text-coral bg-coral/10 border border-coral/20 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <label className="field-label">Email</label>
          <div className="relative mb-5">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle pointer-events-none" />
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="field-input pl-10"
              placeholder="admin@drtapan.com"
            />
          </div>

          <label className="field-label">Password</label>
          <div className="relative mb-6">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-subtle pointer-events-none" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="field-input pl-10"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>

        <p className="text-center text-xs text-ink-subtle mt-6">
          © {new Date().getFullYear()} Prof. Dr. Maksuda Farida Akhtar (Mili)
        </p>
      </div>
    </div>
  );
}
