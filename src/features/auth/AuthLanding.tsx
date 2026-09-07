import React, { useState } from 'react';
import { ArrowRight, Shield, User, Briefcase, Mail, Lock, Phone, Eye, EyeOff, CheckCircle, FileCheck, Camera, AlertCircle, ChevronLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useRole } from '../../contexts/RoleContext';

type RoleChoice = 'customer' | 'worker' | 'cooperative';
type Screen = 'landing' | 'customer-auth' | 'worker-auth' | 'cooperative-auth';
type AuthTab = 'login' | 'register';
type WorkerStep = 'basic' | 'skills' | 'documents' | 'face-scan' | 'done';

const SKILLS = ['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning', 'Appliance Repair', 'Masonry', 'Welding', 'AC Repair', 'CCTV Installation'];
const CERTS = ['NCVT Certificate', 'ITI Diploma', 'NSDC Certification', 'State Skill Mission', 'Construction Worker Certificate'];

const ROLE_CONFIG = {
  customer: { label: 'Customer', subtitle: 'Book home services', color: 'bg-[#e3f2fd]', icon: User, img: '/illustrations/hero.png' },
  worker: { label: 'Worker', subtitle: 'Find jobs & earn', color: 'bg-[#fff3e0]', img: '/illustrations/worker-hero.png', icon: Briefcase },
  cooperative: { label: 'Cooperative', subtitle: 'Manage operations', color: 'bg-[#eaf1f8]', img: '/illustrations/cooperative-hero.png', icon: Shield },
};

export function AuthLanding() {
  const { login, register, isLoading } = useAuth();
  const { switchRole } = useRole();
  const [screen, setScreen] = useState<Screen>('landing');
  const [authTab, setAuthTab] = useState<AuthTab>('login');
  const [workerStep, setWorkerStep] = useState<WorkerStep>('basic');
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);

  // Forms
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [custForm, setCustForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [workerForm, setWorkerForm] = useState({
    name: '', email: '', phone: '', password: '', city: '',
    experience: '1', skills: [] as string[], certifications: [] as string[],
    hasEshram: false, eshramNumber: '',
  });

  // DigiLocker mock
  const [digiStatus, setDigiStatus] = useState<'idle' | 'loading' | 'done'>('idle');
  const [digiDocs, setDigiDocs] = useState<string[]>([]);

  // Face scan
  const [faceStep, setFaceStep] = useState<'intro' | 'scan' | 'done'>('intro');
  const [faceDir, setFaceDir] = useState('straight');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const faceGuide: Record<string, string> = {
    straight: '😐  Keep head straight',
    left: '👈  Turn head to the LEFT',
    right: '👉  Turn head to the RIGHT',
    photo: '📸  Hold still — capturing!',
  };

  const go = (s: Screen, role?: RoleChoice) => {
    setScreen(s);
    setError('');
    setAuthTab('login');
    setWorkerStep('basic');
    setDigiStatus('idle');
    setFaceStep('intro');
    if (role) switchRole(role === 'cooperative' ? 'cooperative' : role);
  };

  const handleLogin = async (role: RoleChoice) => {
    setError('');
    try {
      await login(loginForm.email, loginForm.password);
      switchRole(role === 'cooperative' ? 'cooperative' : role);
    } catch (e: any) { setError(e.message || 'Login failed'); }
  };

  const handleCustRegister = async () => {
    setError('');
    try {
      await register({ ...custForm, role: 'customer' });
      switchRole('customer');
    } catch (e: any) { setError(e.message || 'Registration failed'); }
  };

  const handleWorkerRegister = async () => {
    setError('');
    try {
      await register({ email: workerForm.email, password: workerForm.password, phone: workerForm.phone, name: workerForm.name, role: 'worker' });
      setWorkerStep('done');
    } catch (e: any) { setError(e.message || 'Registration failed'); }
  };

  const startFaceScan = async () => {
    setFaceStep('scan');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setTimeout(() => setFaceDir('left'), 2000);
      setTimeout(() => setFaceDir('right'), 4000);
      setTimeout(() => setFaceDir('photo'), 6000);
      setTimeout(() => {
        if (videoRef.current && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          ctx?.drawImage(videoRef.current, 0, 0);
          setCapturedPhoto(canvasRef.current.toDataURL('image/jpeg'));
        }
        stream.getTracks().forEach(t => t.stop());
        setFaceStep('done');
      }, 7500);
    } catch { setFaceStep('intro'); setError('Camera denied. Use "Skip" to continue.'); }
  };

  const mockDigiLocker = () => {
    setDigiStatus('loading');
    setTimeout(() => { setDigiStatus('done'); setDigiDocs(['Aadhaar Card ✓', 'PAN Card ✓', 'ITI Diploma ✓']); }, 2000);
  };

  const inputCls = "w-full rounded-2xl border border-status-subtle bg-[#F7F7F7] py-3.5 pl-11 pr-4 text-sm text-text-navy placeholder:text-text-tertiary focus:border-accent-primary focus:bg-white focus:outline-none transition";
  const btnPrimary = "flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-primary py-4 font-semibold text-white hover:bg-[#0D3A6F] disabled:opacity-50 transition";

  // ─── LANDING ────────────────────────────────────────────────────────────────
  if (screen === 'landing') {
    return (
      <div className="flex min-h-screen flex-col bg-[#F7F7F7]">
        {/* Hero */}
        <section className="relative mx-auto w-full max-w-[1400px] overflow-hidden px-4 pt-8 sm:px-6 md:px-10 md:pt-14">
          <div className="relative overflow-hidden rounded-[28px] bg-white border border-status-subtle px-6 py-10 sm:rounded-[36px] sm:px-8 sm:py-14 md:px-12 md:py-20">
            {/* Background illustration */}
            <img src="/illustrations/cooperative-hero.png" alt="" aria-hidden
              className="pointer-events-none absolute bottom-0 right-[-5%] h-[110%] w-auto max-w-none opacity-20 sm:opacity-25"
              style={{ objectFit: 'contain', objectPosition: 'bottom right' }}
            />
            <div className="relative z-10 max-w-2xl">
              <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-accent-primary">COOPERATIVE SERVICE NETWORK · INDIA</p>
              <h1 className="mt-4 text-[clamp(2.8rem,9vw,6rem)] font-extrabold leading-[0.86] tracking-[-0.07em] text-text-navy">
                SHRAM<br />SANGAM
              </h1>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-text-secondary sm:text-lg">
                Connecting skilled cooperative workers with customers who need them. Fair wages, social security, and reliable service.
              </p>
            </div>
          </div>
        </section>

        {/* Role selection */}
        <section className="mx-auto w-full max-w-[1400px] px-4 py-10 sm:px-6 sm:py-14 md:px-10">
          <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-text-tertiary">WHO ARE YOU?</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.05em] text-text-navy sm:text-4xl">Choose your experience.</h2>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">
            {/* Customer */}
            <button
              onClick={() => go('customer-auth', 'customer')}
              className="group flex flex-col justify-between overflow-hidden rounded-[24px] sm:rounded-[28px] bg-[#e3f2fd] border border-black/5 p-6 sm:p-7 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(18,18,18,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
            >
              {/* Content Region */}
              <div className="flex flex-col">
                <div className="inline-flex w-fit items-center justify-center rounded-2xl bg-white/90 p-3 shadow-sm">
                  <User size={22} className="text-accent-primary" />
                </div>
                <h3 className="mt-4 text-2xl sm:text-[26px] font-extrabold tracking-[-0.04em] text-text-navy">
                  Customer
                </h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-[#2c3e50]">
                  Book verified home services on demand
                </p>
                <div className="mt-5 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-accent-primary transition-all group-hover:translate-x-1">
                  Get Started <ArrowRight size={15} strokeWidth={2.5} />
                </div>
              </div>

              {/* Illustration Region */}
              <div className="mt-6 flex h-36 sm:h-40 md:h-44 w-full items-end justify-end overflow-hidden">
                <img
                  src="/illustrations/hero.png"
                  alt=""
                  aria-hidden
                  className="pointer-events-none h-full w-auto max-w-[85%] object-contain object-bottom-right opacity-90 transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </button>

            {/* Worker */}
            <button
              onClick={() => go('worker-auth', 'worker')}
              className="group flex flex-col justify-between overflow-hidden rounded-[24px] sm:rounded-[28px] bg-[#fff3e0] border border-black/5 p-6 sm:p-7 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(18,18,18,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
            >
              {/* Content Region */}
              <div className="flex flex-col">
                <div className="inline-flex w-fit items-center justify-center rounded-2xl bg-white/90 p-3 shadow-sm">
                  <Briefcase size={22} className="text-accent-primary" />
                </div>
                <h3 className="mt-4 text-2xl sm:text-[26px] font-extrabold tracking-[-0.04em] text-text-navy">
                  Worker
                </h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-[#2c3e50]">
                  Join the cooperative, find jobs, earn fairly
                </p>
                <div className="mt-5 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-accent-primary transition-all group-hover:translate-x-1">
                  Join Network <ArrowRight size={15} strokeWidth={2.5} />
                </div>
              </div>

              {/* Illustration Region */}
              <div className="mt-6 flex h-36 sm:h-40 md:h-44 w-full items-end justify-end overflow-hidden">
                <img
                  src="/illustrations/worker-hero.png"
                  alt=""
                  aria-hidden
                  className="pointer-events-none h-full w-auto max-w-[85%] object-contain object-bottom-right opacity-90 transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </button>

            {/* Cooperative */}
            <button
              onClick={() => go('cooperative-auth', 'cooperative')}
              className="group flex flex-col justify-between overflow-hidden rounded-[24px] sm:rounded-[28px] bg-[#eaf1f8] border border-black/5 p-6 sm:p-7 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(18,18,18,0.10)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary"
            >
              {/* Content Region */}
              <div className="flex flex-col">
                <div className="inline-flex w-fit items-center justify-center rounded-2xl bg-white/90 p-3 shadow-sm">
                  <Shield size={22} className="text-accent-primary" />
                </div>
                <h3 className="mt-4 text-2xl sm:text-[26px] font-extrabold tracking-[-0.04em] text-text-navy">
                  Cooperative
                </h3>
                <p className="mt-2 text-sm font-medium leading-relaxed text-[#2c3e50]">
                  Admin portal — manage workers and operations
                </p>
                <div className="mt-5 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-accent-primary transition-all group-hover:translate-x-1">
                  Admin Login <ArrowRight size={15} strokeWidth={2.5} />
                </div>
              </div>

              {/* Illustration Region */}
              <div className="mt-6 flex h-36 sm:h-40 md:h-44 w-full items-end justify-end overflow-hidden">
                <img
                  src="/illustrations/cooperative-hero.png"
                  alt=""
                  aria-hidden
                  className="pointer-events-none h-full w-auto max-w-[85%] object-contain object-bottom-right opacity-85 transition-transform duration-500 group-hover:scale-105"
                />
              </div>
            </button>
          </div>
        </section>

        {/* Footer tagline */}
        <div className="pb-10 text-center">
          <p className="font-mono text-[10px] tracking-[0.14em] text-text-tertiary">LOCAL SKILLS · SHARED OPPORTUNITY · FAIR WAGES</p>
        </div>
      </div>
    );
  }

  // ─── BACK BUTTON (shared) ──────────────────────────────────────────────────
  const BackBtn = () => (
    <button onClick={() => go('landing')} className="mb-6 inline-flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.1em] text-text-secondary hover:text-accent-primary">
      <ChevronLeft size={14} /> BACK
    </button>
  );

  // ─── CUSTOMER AUTH ─────────────────────────────────────────────────────────
  if (screen === 'customer-auth') {
    return (
      <div className="flex min-h-screen bg-[#e3f2fd]">
        {/* Left panel */}
        <div className="relative hidden flex-1 overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div>
            <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-accent-primary">SHRAMSANGAM</p>
            <h2 className="mt-6 text-5xl font-extrabold leading-[0.88] tracking-[-0.07em] text-text-navy">Book trusted<br />home services.</h2>
            <p className="mt-5 max-w-xs text-text-secondary">Verified cooperative workers at your doorstep.</p>
          </div>
          <img src="/illustrations/hero.png" alt="" className="absolute bottom-0 right-0 h-[75%] w-auto max-w-none object-contain object-bottom" />
        </div>

        {/* Right panel */}
        <div className="flex w-full flex-col justify-center px-5 py-10 lg:max-w-md lg:bg-white lg:px-10">
          <BackBtn />
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-[-0.05em] text-text-navy">Customer Portal</h1>
            <p className="mt-1 text-sm text-text-secondary">Book services or manage your account</p>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-1 rounded-2xl bg-[#F7F7F7] p-1">
            {(['login', 'register'] as AuthTab[]).map(t => (
              <button key={t} onClick={() => { setAuthTab(t); setError(''); }}
                className={`flex-1 rounded-xl py-2.5 font-mono text-xs font-semibold tracking-[0.08em] uppercase transition ${authTab === t ? 'bg-white text-accent-primary shadow-sm' : 'text-text-tertiary'}`}>
                {t}
              </button>
            ))}
          </div>

          {error && <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

          {authTab === 'login' ? (
            <div className="space-y-4">
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input type="email" required value={loginForm.email} onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))} placeholder="you@example.com" className={inputCls} />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input type={showPw ? 'text' : 'password'} required value={loginForm.password} onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} placeholder="Password" className="w-full rounded-2xl border border-status-subtle bg-[#F7F7F7] py-3.5 pl-11 pr-11 text-sm text-text-navy placeholder:text-text-tertiary focus:border-accent-primary focus:bg-white focus:outline-none transition" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary">{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
              <button onClick={() => handleLogin('customer')} disabled={isLoading} className={btnPrimary}>
                {isLoading ? 'Signing in...' : 'Sign In'} <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { label: 'Full Name', key: 'name', type: 'text', ph: 'Priya Sharma' },
                { label: 'Phone', key: 'phone', type: 'tel', ph: '+91 98765 43210' },
                { label: 'Email', key: 'email', type: 'email', ph: 'you@example.com' },
              ].map(({ key, type, ph }) => (
                <div key={key} className="relative">
                  <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <input type={type} value={(custForm as any)[key]} onChange={e => setCustForm(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} className={inputCls} />
                </div>
              ))}
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input type={showPw ? 'text' : 'password'} value={custForm.password} onChange={e => setCustForm(p => ({ ...p, password: e.target.value }))} placeholder="Password (min 6 chars)" minLength={6} className="w-full rounded-2xl border border-status-subtle bg-[#F7F7F7] py-3.5 pl-11 pr-11 text-sm text-text-navy placeholder:text-text-tertiary focus:border-accent-primary focus:bg-white focus:outline-none transition" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary">{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
              <button onClick={handleCustRegister} disabled={isLoading || !custForm.name || !custForm.email} className={btnPrimary}>
                {isLoading ? 'Creating account...' : 'Create Account'} <ArrowRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── COOPERATIVE AUTH ──────────────────────────────────────────────────────
  if (screen === 'cooperative-auth') {
    return (
      <div className="flex min-h-screen bg-[#eaf1f8]">
        <div className="relative hidden flex-1 overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div>
            <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-accent-primary">SHRAMSANGAM</p>
            <h2 className="mt-6 text-5xl font-extrabold leading-[0.88] tracking-[-0.07em] text-text-navy">Cooperative<br />Admin Portal</h2>
            <p className="mt-5 font-mono text-[10px] tracking-[0.14em] text-accent-primary">AUTHORISED ACCESS ONLY</p>
          </div>
          <img src="/illustrations/cooperative-hero.png" alt="" className="absolute bottom-0 right-0 h-[70%] w-auto object-contain object-bottom" />
        </div>

        <div className="flex w-full flex-col justify-center px-5 py-10 lg:max-w-md lg:bg-white lg:px-10">
          <BackBtn />
          <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-text-navy">
            <Shield size={26} className="text-white" />
          </div>
          <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.05em] text-text-navy">Admin Login</h1>
          <p className="mt-1 text-sm text-text-secondary">Registration is by invite only</p>

          {error && <div className="my-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

          <div className="mt-6 space-y-4">
            <div className="relative">
              <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input type="email" value={loginForm.email} onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))} placeholder="admin@cooperative.org" className={inputCls} />
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
              <input type={showPw ? 'text' : 'password'} value={loginForm.password} onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} placeholder="Password" className="w-full rounded-2xl border border-status-subtle bg-[#F7F7F7] py-3.5 pl-11 pr-11 text-sm text-text-navy placeholder:text-text-tertiary focus:border-accent-primary focus:bg-white focus:outline-none transition" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary">{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
            <button onClick={() => handleLogin('cooperative')} disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-text-navy py-4 font-semibold text-white hover:opacity-90 disabled:opacity-50 transition">
              {isLoading ? 'Authenticating...' : 'Access Dashboard'} <ArrowRight size={16} />
            </button>
          </div>
          <div className="mt-6 rounded-2xl border border-status-subtle bg-[#F7F7F7] p-4">
            <p className="font-mono text-[9px] font-semibold tracking-[0.1em] text-text-tertiary">DEMO NOTE</p>
            <p className="mt-1 text-xs text-text-secondary">Contact your cooperative coordinator for access credentials.</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── WORKER AUTH ───────────────────────────────────────────────────────────
  if (screen === 'worker-auth') {
    return (
      <div className="flex min-h-screen bg-[#fff3e0]">
        {/* Left */}
        <div className="relative hidden flex-1 overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-12">
          <div>
            <p className="font-mono text-[10px] font-semibold tracking-[0.18em] text-accent-primary">SHRAMSANGAM</p>
            <h2 className="mt-6 text-5xl font-extrabold leading-[0.88] tracking-[-0.07em] text-text-navy">Join the<br />cooperative.</h2>
            <p className="mt-5 max-w-xs text-text-secondary">Fair wages, social security, and regular work.</p>
          </div>
          <img src="/illustrations/worker-hero.png" alt="" className="absolute bottom-0 right-0 h-[75%] w-auto object-contain object-bottom" />
        </div>

        {/* Right */}
        <div className="flex w-full flex-col px-5 py-8 lg:max-w-[520px] lg:overflow-y-auto lg:bg-white lg:px-10">
          <BackBtn />

          {/* Tabs */}
          {workerStep === 'basic' && authTab !== 'register' && (
            <>
              <div className="mb-6">
                <h1 className="text-3xl font-extrabold tracking-[-0.05em] text-text-navy">Worker Portal</h1>
                <p className="mt-1 text-sm text-text-secondary">Sign in or register to join the network</p>
              </div>
              <div className="mb-6 flex gap-1 rounded-2xl bg-[#F7F7F7] p-1">
                {(['login', 'register'] as AuthTab[]).map(t => (
                  <button key={t} onClick={() => { setAuthTab(t); setError(''); }}
                    className={`flex-1 rounded-xl py-2.5 font-mono text-xs font-semibold tracking-[0.08em] uppercase transition ${authTab === t ? 'bg-white text-accent-primary shadow-sm' : 'text-text-tertiary'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </>
          )}

          {error && <div className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

          {/* Worker Login */}
          {authTab === 'login' && (
            <div className="space-y-4">
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input type="email" value={loginForm.email} onChange={e => setLoginForm(p => ({ ...p, email: e.target.value }))} placeholder="worker@example.com" className={inputCls} />
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input type={showPw ? 'text' : 'password'} value={loginForm.password} onChange={e => setLoginForm(p => ({ ...p, password: e.target.value }))} placeholder="Password" className="w-full rounded-2xl border border-status-subtle bg-[#F7F7F7] py-3.5 pl-11 pr-11 text-sm text-text-navy placeholder:text-text-tertiary focus:border-accent-primary focus:bg-white focus:outline-none transition" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary">{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </div>
              <button onClick={() => handleLogin('worker')} disabled={isLoading} className={btnPrimary}>
                {isLoading ? 'Signing in...' : 'Sign In'} <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Worker Registration - multi step */}
          {authTab === 'register' && (
            <div>
              {/* Step indicator */}
              {workerStep !== 'done' && (
                <div className="mb-6 flex items-center gap-2">
                  {(['basic', 'skills', 'documents', 'face-scan'] as WorkerStep[]).map((s, i) => {
                    const order = ['basic', 'skills', 'documents', 'face-scan'];
                    const curr = order.indexOf(workerStep);
                    const done = curr > i;
                    const active = curr === i;
                    return (
                      <React.Fragment key={s}>
                        <div className={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-[10px] font-bold shrink-0 ${done ? 'bg-green-500 text-white' : active ? 'bg-accent-primary text-white' : 'bg-gray-100 text-text-tertiary'}`}>
                          {done ? '✓' : i + 1}
                        </div>
                        {i < 3 && <div className={`h-0.5 flex-1 ${done ? 'bg-green-500' : 'bg-gray-100'}`} />}
                      </React.Fragment>
                    );
                  })}
                </div>
              )}

              {workerStep === 'basic' && (
                <div className="space-y-4">
                  <h2 className="text-xl font-extrabold text-text-navy">Basic Information</h2>
                  {[
                    { key: 'name', type: 'text', ph: 'Rajesh Kumar' },
                    { key: 'phone', type: 'tel', ph: '+91 98765 43210' },
                    { key: 'email', type: 'email', ph: 'worker@example.com' },
                    { key: 'city', type: 'text', ph: 'Mumbai' },
                  ].map(({ key, type, ph }) => (
                    <div key={key} className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
                      <input type={type} value={(workerForm as any)[key]} onChange={e => setWorkerForm(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} className={inputCls} />
                    </div>
                  ))}
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary" />
                    <input type={showPw ? 'text' : 'password'} value={workerForm.password} onChange={e => setWorkerForm(p => ({ ...p, password: e.target.value }))} placeholder="Password (min 6 chars)" minLength={6} className="w-full rounded-2xl border border-status-subtle bg-[#F7F7F7] py-3.5 pl-11 pr-11 text-sm text-text-navy placeholder:text-text-tertiary focus:border-accent-primary focus:bg-white focus:outline-none transition" />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary">{showPw ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  </div>
                  <div>
                    <label className="mb-2 block font-mono text-[10px] font-semibold tracking-[0.1em] text-text-tertiary">EXPERIENCE</label>
                    <select value={workerForm.experience} onChange={e => setWorkerForm(p => ({ ...p, experience: e.target.value }))} className="w-full rounded-2xl border border-status-subtle bg-[#F7F7F7] px-4 py-3.5 text-sm text-text-navy focus:border-accent-primary focus:outline-none">
                      {['<1 year', '1 year', '2 years', '3 years', '4 years', '5 years', '6-10 years', '10+ years'].map(v => <option key={v}>{v}</option>)}
                    </select>
                  </div>
                  <button onClick={() => setWorkerStep('skills')} disabled={!workerForm.name || !workerForm.email || !workerForm.phone} className={btnPrimary}>Continue <ArrowRight size={16} /></button>
                </div>
              )}

              {workerStep === 'skills' && (
                <div className="space-y-5">
                  <h2 className="text-xl font-extrabold text-text-navy">Skills & Certifications</h2>
                  <div>
                    <label className="mb-2 block font-mono text-[10px] font-semibold tracking-[0.1em] text-text-tertiary">YOUR SKILLS (select all that apply)</label>
                    <div className="flex flex-wrap gap-2">
                      {SKILLS.map(s => (
                        <button key={s} type="button" onClick={() => setWorkerForm(p => ({ ...p, skills: p.skills.includes(s) ? p.skills.filter(x => x !== s) : [...p.skills, s] }))}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${workerForm.skills.includes(s) ? 'bg-accent-primary text-white' : 'border border-status-subtle bg-[#F7F7F7] text-text-secondary hover:border-accent-primary/40'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block font-mono text-[10px] font-semibold tracking-[0.1em] text-text-tertiary">CERTIFICATIONS (optional)</label>
                    <div className="flex flex-wrap gap-2">
                      {CERTS.map(c => (
                        <button key={c} type="button" onClick={() => setWorkerForm(p => ({ ...p, certifications: p.certifications.includes(c) ? p.certifications.filter(x => x !== c) : [...p.certifications, c] }))}
                          className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${workerForm.certifications.includes(c) ? 'bg-text-navy text-white' : 'border border-status-subtle bg-[#F7F7F7] text-text-secondary hover:border-text-navy/30'}`}>
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-accent-primary/20 bg-accent-light/20 p-4">
                    <input type="checkbox" checked={workerForm.hasEshram} onChange={e => setWorkerForm(p => ({ ...p, hasEshram: e.target.checked }))} className="h-4 w-4 accent-accent-primary" />
                    <div>
                      <p className="text-sm font-semibold text-text-navy">I have an e-Shram Card</p>
                      <p className="text-xs text-text-secondary">Government worker registration</p>
                    </div>
                  </label>
                  {workerForm.hasEshram && <input type="text" value={workerForm.eshramNumber} onChange={e => setWorkerForm(p => ({ ...p, eshramNumber: e.target.value }))} placeholder="e-Shram Card Number" className="w-full rounded-2xl border border-status-subtle bg-[#F7F7F7] px-4 py-3.5 text-sm text-text-navy focus:border-accent-primary focus:outline-none" />}
                  <div className="flex gap-3">
                    <button onClick={() => setWorkerStep('basic')} className="flex-1 rounded-2xl border border-status-subtle py-3.5 text-sm font-semibold text-text-secondary">Back</button>
                    <button onClick={() => setWorkerStep('documents')} disabled={workerForm.skills.length === 0} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-accent-primary py-3.5 font-semibold text-white hover:bg-[#0D3A6F] disabled:opacity-50">Continue <ArrowRight size={16} /></button>
                  </div>
                </div>
              )}

              {workerStep === 'documents' && (
                <div className="space-y-5">
                  <h2 className="text-xl font-extrabold text-text-navy">Document Verification</h2>
                  <div className="overflow-hidden rounded-2xl border border-blue-200">
                    <div className="flex items-center gap-3 bg-blue-600 p-4">
                      <FileCheck size={22} className="text-white" />
                      <div>
                        <p className="font-semibold text-white">DigiLocker</p>
                        <p className="text-xs text-blue-100">Government document portal</p>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-4">
                      {digiStatus === 'idle' && (
                        <>
                          <button onClick={mockDigiLocker} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700">
                            Fetch from DigiLocker <ArrowRight size={16} />
                          </button>
                          <p className="mt-2 text-center font-mono text-[9px] text-blue-400">* MOCK DEMO — real API in production</p>
                        </>
                      )}
                      {digiStatus === 'loading' && <div className="flex flex-col items-center gap-2 py-2"><div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" /><p className="text-sm text-blue-600">Fetching from government servers...</p></div>}
                      {digiStatus === 'done' && <div className="space-y-2">{digiDocs.map((d, i) => <div key={i} className="flex items-center gap-2 text-sm font-medium text-blue-900"><CheckCircle size={16} className="text-green-600" />{d}</div>)}</div>}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 rounded-2xl border border-amber-200 bg-amber-50 p-3">
                    <AlertCircle size={15} className="mt-0.5 shrink-0 text-amber-600" />
                    <p className="text-xs text-amber-700">Admin reviews documents before activation (24-48 hrs).</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setWorkerStep('skills')} className="flex-1 rounded-2xl border border-status-subtle py-3.5 text-sm font-semibold text-text-secondary">Back</button>
                    <button onClick={() => setWorkerStep('face-scan')} className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-accent-primary py-3.5 font-semibold text-white hover:bg-[#0D3A6F]">Continue <ArrowRight size={16} /></button>
                  </div>
                </div>
              )}

              {workerStep === 'face-scan' && (
                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <Camera size={24} className="text-accent-primary" />
                    <div>
                      <h2 className="text-xl font-extrabold text-text-navy">Identity Verification</h2>
                      <p className="text-xs text-text-secondary">Liveness check + profile photo</p>
                    </div>
                  </div>
                  {faceStep === 'intro' && (
                    <>
                      <div className="rounded-2xl bg-[#F7F7F7] p-5 text-center">
                        <div className="text-4xl">🤳</div>
                        <p className="mt-3 font-semibold text-text-navy">Face Liveness Check</p>
                        <p className="mt-2 text-sm text-text-secondary">Look straight → turn left → turn right → photo captured.</p>
                        <div className="mt-4 space-y-1.5 text-left text-xs text-text-secondary">
                          {['Good lighting', 'Remove glasses', 'Face centered'].map((t, i) => (
                            <div key={i} className="flex items-center gap-2"><CheckCircle size={13} className="text-green-500" />{t}</div>
                          ))}
                        </div>
                      </div>
                      <button onClick={startFaceScan} className={btnPrimary}><Camera size={16} /> Start Scan</button>
                      <button onClick={handleWorkerRegister} disabled={isLoading} className="w-full rounded-2xl border border-status-subtle py-3.5 text-sm font-semibold text-text-secondary disabled:opacity-50">
                        {isLoading ? 'Submitting...' : 'Skip (Demo Mode)'}
                      </button>
                    </>
                  )}
                  {faceStep === 'scan' && (
                    <div className="relative overflow-hidden rounded-2xl bg-black">
                      <video ref={videoRef} autoPlay muted playsInline className="w-full" />
                      <canvas ref={canvasRef} className="hidden" />
                      <div className="absolute inset-0 flex flex-col items-center justify-end pb-6">
                        <div className="rounded-xl bg-black/70 px-5 py-3 text-center">
                          <p className="text-2xl">{faceDir === 'straight' ? '😐' : faceDir === 'left' ? '👈' : faceDir === 'right' ? '👉' : '📸'}</p>
                          <p className="mt-1 text-sm font-semibold text-white">{faceGuide[faceDir]}</p>
                        </div>
                      </div>
                      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                        <div className="h-52 w-40 rounded-full border-2 border-accent-primary opacity-70" />
                      </div>
                    </div>
                  )}
                  {faceStep === 'done' && (
                    <div className="space-y-4 text-center">
                      <CheckCircle size={52} className="mx-auto text-green-500" />
                      <p className="text-lg font-extrabold text-text-navy">Face Scan Complete!</p>
                      {capturedPhoto && <img src={capturedPhoto} alt="Profile" className="mx-auto h-24 w-24 rounded-full border-4 border-accent-primary object-cover" />}
                      <button onClick={handleWorkerRegister} disabled={isLoading} className={btnPrimary}>{isLoading ? 'Submitting...' : 'Complete Registration'} <ArrowRight size={16} /></button>
                    </div>
                  )}
                </div>
              )}

              {workerStep === 'done' && (
                <div className="space-y-5 text-center">
                  <CheckCircle size={56} className="mx-auto text-green-500" />
                  <h2 className="text-2xl font-extrabold text-text-navy">Submitted!</h2>
                  <p className="text-sm text-text-secondary">Cooperative admin will review in 24-48 hrs.</p>
                  <div className="rounded-2xl bg-accent-light/30 p-4 text-left space-y-2">
                    {['Admin reviews documents', 'Skills verified', 'Account activated', 'Start accepting jobs!'].map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-primary text-[10px] font-bold text-white">{i + 1}</span>{s}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => go('landing')} className={btnPrimary}>Back to Home <ArrowRight size={16} /></button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
