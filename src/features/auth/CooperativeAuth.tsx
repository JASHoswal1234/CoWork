import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface Props { onSuccess: () => void; }

export function CooperativeAuth({ onSuccess }: Props) {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eaf1f8] px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-text-navy">
            <Shield size={32} className="text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-[-0.06em] text-text-navy">SAHAKAR</h1>
          <p className="mt-2 text-sm font-semibold text-text-secondary">Cooperative Admin Portal</p>
          <p className="mt-1 font-mono text-[10px] tracking-[0.1em] text-accent-primary">
            AUTHORISED ACCESS ONLY
          </p>
        </div>

        <div className="overflow-hidden rounded-[28px] border border-status-subtle bg-white shadow-sm">
          <div className="border-b border-status-subtle bg-text-navy px-6 py-4">
            <p className="font-mono text-xs font-semibold tracking-[0.1em] text-white/70">
              COOPERATIVE ADMINISTRATOR LOGIN
            </p>
          </div>

          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mb-1.5 block font-mono text-[10px] font-semibold tracking-[0.1em] text-text-tertiary">
                  ADMIN EMAIL
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <input
                    type="email" required value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="admin@cooperative.org"
                    className="w-full rounded-xl border border-status-subtle bg-background-primary py-3 pl-10 pr-4 text-sm text-text-navy placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-[10px] font-semibold tracking-[0.1em] text-text-tertiary">
                  PASSWORD
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <input
                    type={showPassword ? 'text' : 'password'} required value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-status-subtle bg-background-primary py-3 pl-10 pr-10 text-sm text-text-navy placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit" disabled={isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-text-navy py-3.5 font-semibold text-white hover:opacity-90 disabled:opacity-60"
              >
                {isLoading ? 'Authenticating...' : 'Access Dashboard'}
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="mt-6 rounded-xl border border-status-subtle bg-gray-50 p-4">
              <p className="font-mono text-[9px] font-semibold tracking-[0.1em] text-text-tertiary">
                DEMO CREDENTIALS
              </p>
              <p className="mt-1 text-xs text-text-secondary">
                Registration for cooperative admins is by invite only.
                Contact your cooperative coordinator for access credentials.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
