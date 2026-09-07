import React, { useState } from 'react';
import { User, Phone, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type Tab = 'login' | 'register';

interface Props {
  onSuccess: () => void;
}

export function CustomerAuth({ onSuccess }: Props) {
  const { login, register, isLoading } = useAuth();
  const [tab, setTab] = useState<Tab>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Login form
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  // Register form
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    address: '',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(loginData.email, loginData.password);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await register({
        email: regData.email,
        password: regData.password,
        phone: regData.phone,
        name: regData.name,
        role: 'customer',
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background-primary px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-[-0.06em] text-text-navy">
            SAHAKAR
          </h1>
          <p className="mt-2 text-sm text-text-secondary">Your trusted home services partner</p>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-[28px] border border-status-subtle bg-white shadow-sm">
          {/* Tabs */}
          <div className="flex border-b border-status-subtle">
            {(['login', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(''); }}
                className={`flex-1 py-4 font-mono text-xs font-semibold tracking-[0.1em] uppercase transition-all ${
                  tab === t
                    ? 'border-b-2 border-accent-primary text-accent-primary'
                    : 'text-text-tertiary hover:text-text-secondary'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8">
            {error && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {tab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-semibold tracking-[0.1em] text-text-tertiary">
                    EMAIL
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                    <input
                      type="email"
                      required
                      value={loginData.email}
                      onChange={e => setLoginData(p => ({ ...p, email: e.target.value }))}
                      placeholder="you@example.com"
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
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginData.password}
                      onChange={e => setLoginData(p => ({ ...p, password: e.target.value }))}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-status-subtle bg-background-primary py-3 pl-10 pr-10 text-sm text-text-navy placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-primary py-3.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                  <ArrowRight size={16} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-semibold tracking-[0.1em] text-text-tertiary">FULL NAME</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                    <input type="text" required value={regData.name}
                      onChange={e => setRegData(p => ({ ...p, name: e.target.value }))}
                      placeholder="Priya Sharma"
                      className="w-full rounded-xl border border-status-subtle bg-background-primary py-3 pl-10 pr-4 text-sm text-text-navy placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-semibold tracking-[0.1em] text-text-tertiary">PHONE NUMBER</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                    <input type="tel" required value={regData.phone}
                      onChange={e => setRegData(p => ({ ...p, phone: e.target.value }))}
                      placeholder="+91 98765 43210"
                      className="w-full rounded-xl border border-status-subtle bg-background-primary py-3 pl-10 pr-4 text-sm text-text-navy placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-semibold tracking-[0.1em] text-text-tertiary">EMAIL</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                    <input type="email" required value={regData.email}
                      onChange={e => setRegData(p => ({ ...p, email: e.target.value }))}
                      placeholder="you@example.com"
                      className="w-full rounded-xl border border-status-subtle bg-background-primary py-3 pl-10 pr-4 text-sm text-text-navy placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-semibold tracking-[0.1em] text-text-tertiary">PASSWORD</label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                    <input type={showPassword ? 'text' : 'password'} required minLength={6}
                      value={regData.password}
                      onChange={e => setRegData(p => ({ ...p, password: e.target.value }))}
                      placeholder="Min 6 characters"
                      className="w-full rounded-xl border border-status-subtle bg-background-primary py-3 pl-10 pr-10 text-sm text-text-navy placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none"
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent-primary py-3.5 font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                  <ArrowRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
