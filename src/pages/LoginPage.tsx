import React, { useState } from 'react';
import { KeyRound, Mail, ShieldCheck } from 'lucide-react';

interface LoginPageProps {
  onNavigate: (view: string, param?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('admin@innovation.edu.eg');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Login failed');
      localStorage.setItem('msc_session_email', email);
      onNavigate('dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] bg-slate-50 dark:bg-[#0b1220] px-4 py-12">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_24px_80px_-32px_rgba(15,23,42,0.32)] dark:border-slate-700 dark:bg-slate-900">
        <div className="grid md:grid-cols-2">
          <div className="bg-gradient-to-br from-[#0078d4] to-[#0f6cbd] p-8 text-white">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">MSC Platform</div>
            <h1 className="mb-4 text-3xl font-bold">Member portal</h1>
            <p className="text-sm text-blue-100">Secure access for student leaders, admins, and club coordinators.</p>
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3"><ShieldCheck className="h-5 w-5" /> <span>Role-based access</span></div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3"><Mail className="h-5 w-5" /> <span>Email + password auth</span></div>
              <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3"><KeyRound className="h-5 w-5" /> <span>HttpOnly secure session</span></div>
            </div>
          </div>

          <div className="p-8 md:p-12">
            <h2 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">Sign in</h2>
            <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Use your club credentials to continue.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block text-sm font-medium text-slate-600 dark:text-slate-200">
                Email
                <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0 transition focus:border-[#0078d4] dark:border-slate-700 dark:bg-slate-800 dark:text-white" required />
              </label>

              <label className="block text-sm font-medium text-slate-600 dark:text-slate-200">
                Password
                <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none ring-0 transition focus:border-[#0078d4] dark:border-slate-700 dark:bg-slate-800 dark:text-white" required />
              </label>

              {error && <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}

              <button type="submit" disabled={loading} className="w-full rounded-xl bg-[#0078d4] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:brightness-110 disabled:opacity-60">
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
