import React, { useState, useRef, useCallback } from 'react';
import { User, Phone, Mail, Lock, ArrowRight, CheckCircle, Camera, FileCheck, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const SKILL_CATEGORIES = [
  'Plumbing', 'Electrical', 'Carpentry', 'Painting',
  'Cleaning', 'Appliance Repair', 'Masonry', 'Welding',
  'AC Repair', 'CCTV Installation',
];

const CERTIFICATIONS = [
  'NCVT Certificate', 'ITI Diploma', 'NSDC Certification',
  'State Skill Mission', 'Construction Worker Certificate', 'Other',
];

type Step = 'basic' | 'skills' | 'documents' | 'face-scan' | 'done';

interface Props { onSuccess: () => void; }

export function WorkerAuth({ onSuccess }: Props) {
  const { login, register, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [step, setStep] = useState<Step>('basic');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', password: '',
    city: '', address: '', skills: [] as string[],
    certifications: [] as string[], hasEshram: false,
    eshramNumber: '', experience_years: '1',
  });
  const [faceScanStep, setFaceScanStep] = useState<'instructions' | 'scanning' | 'done'>('instructions');
  const [faceDirection, setFaceDirection] = useState<string>('straight');
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [digilockerStatus, setDigilockerStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [digilockerDocs, setDigilockerDocs] = useState<string[]>([]);

  const toggleSkill = (skill: string) =>
    setFormData(p => ({ ...p, skills: p.skills.includes(skill) ? p.skills.filter(s => s !== skill) : [...p.skills, skill] }));

  const toggleCert = (cert: string) =>
    setFormData(p => ({ ...p, certifications: p.certifications.includes(cert) ? p.certifications.filter(c => c !== cert) : [...p.certifications, cert] }));

  const fetchFromDigiLocker = () => {
    setDigilockerStatus('loading');
    setTimeout(() => {
      setDigilockerStatus('success');
      setDigilockerDocs(['Aadhaar Card ✓', 'PAN Card ✓', 'ITI Diploma ✓']);
    }, 2000);
  };

  const startCamera = useCallback(async () => {
    setFaceScanStep('scanning');
    setFaceDirection('straight');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setTimeout(() => setFaceDirection('left'), 2000);
      setTimeout(() => setFaceDirection('right'), 4000);
      setTimeout(() => setFaceDirection('photo'), 6000);
      setTimeout(() => {
        if (videoRef.current && canvasRef.current) {
          const ctx = canvasRef.current.getContext('2d');
          canvasRef.current.width = videoRef.current.videoWidth;
          canvasRef.current.height = videoRef.current.videoHeight;
          ctx?.drawImage(videoRef.current, 0, 0);
          setCapturedPhoto(canvasRef.current.toDataURL('image/jpeg'));
        }
        stream.getTracks().forEach(t => t.stop());
        setFaceScanStep('done');
      }, 7000);
    } catch {
      setFaceScanStep('instructions');
      setError('Camera access denied. Please allow camera access or skip.');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    try { await login(loginData.email, loginData.password); onSuccess(); }
    catch (err: any) { setError(err.message || 'Login failed'); }
  };

  const handleFinalSubmit = async () => {
    setError('');
    try {
      await register({ email: formData.email, password: formData.password, phone: formData.phone, name: formData.name, role: 'worker' });
      setStep('done');
    } catch (err: any) { setError(err.message || 'Registration failed'); }
  };

  const faceInstructions: Record<string, { text: string; icon: string }> = {
    straight: { text: 'Keep head straight and look at camera', icon: '😐' },
    left: { text: 'Slowly turn your head to the LEFT', icon: '👈' },
    right: { text: 'Slowly turn your head to the RIGHT', icon: '👉' },
    photo: { text: 'Look straight — capturing photo!', icon: '📸' },
  };

  const inputClass = "w-full rounded-xl border border-status-subtle bg-background-primary py-3 pl-10 pr-4 text-sm text-text-navy placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none";
  const btnPrimary = "flex w-full items-center justify-center gap-2 rounded-xl bg-accent-primary py-3.5 font-semibold text-white hover:opacity-90 disabled:opacity-60";

  if (mode === 'login') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background-primary px-4">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-extrabold tracking-[-0.06em] text-text-navy">SAHAKAR</h1>
            <p className="mt-2 text-sm text-text-secondary">Worker Portal</p>
          </div>
          <div className="overflow-hidden rounded-[28px] border border-status-subtle bg-white shadow-sm">
            <div className="flex border-b border-status-subtle">
              <button onClick={() => setMode('login')} className="flex-1 border-b-2 border-accent-primary py-4 font-mono text-xs font-semibold tracking-[0.1em] text-accent-primary uppercase">LOGIN</button>
              <button onClick={() => setMode('register')} className="flex-1 py-4 font-mono text-xs font-semibold tracking-[0.1em] text-text-tertiary uppercase hover:text-text-secondary">REGISTER</button>
            </div>
            <div className="p-6 sm:p-8">
              {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>}
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] font-semibold tracking-[0.1em] text-text-tertiary">EMAIL</label>
                  <div className="relative mt-2">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                    <input type="email" required value={loginData.email} onChange={e => setLoginData(p => ({ ...p, email: e.target.value }))} placeholder="Enter your email" className={inputClass} autoComplete="off" />
                  </div>
                </div>
                <div>
                  <label className="font-mono text-[11px] font-semibold tracking-[0.1em] text-text-tertiary">PASSWORD</label>
                  <div className="relative mt-2">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                    <input type={showPassword ? 'text' : 'password'} required value={loginData.password} onChange={e => setLoginData(p => ({ ...p, password: e.target.value }))} placeholder="Enter your password" className="w-full rounded-xl border border-status-subtle bg-background-primary py-3 pl-10 pr-10 text-sm text-text-navy placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none" autoComplete="off" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                  </div>
                </div>
                <button type="submit" disabled={isLoading} className={btnPrimary}>{isLoading ? 'Signing in...' : 'Sign In'} <ArrowRight size={16} /></button>
              </form>
              <p className="mt-4 text-center text-xs text-text-secondary">New worker? <button onClick={() => setMode('register')} className="font-semibold text-accent-primary">Register here</button></p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary px-4 py-8">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold tracking-[-0.06em] text-text-navy">Worker Registration</h1>
          <p className="mt-1 text-sm text-text-secondary">Join SAHAKAR Cooperative Network</p>
        </div>

        {/* Progress */}
        <div className="mb-6 flex items-center justify-between px-2">
          {(['basic', 'skills', 'documents', 'face-scan'] as Step[]).map((s, i) => {
            const order = ['basic', 'skills', 'documents', 'face-scan'];
            const curr = order.indexOf(step);
            const done = curr > i;
            const active = curr === i;
            return (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full font-mono text-xs font-bold ${done ? 'bg-green-500 text-white' : active ? 'bg-accent-primary text-white' : 'bg-gray-100 text-text-tertiary'}`}>
                    {done ? '✓' : i + 1}
                  </div>
                  <span className="hidden font-mono text-[8px] text-text-tertiary sm:block uppercase">{s}</span>
                </div>
                {i < 3 && <div className={`h-0.5 flex-1 ${done ? 'bg-green-500' : 'bg-gray-200'}`} />}
              </React.Fragment>
            );
          })}
        </div>

        <div className="overflow-hidden rounded-[28px] border border-status-subtle bg-white shadow-sm">
          {error && <div className="mx-6 mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          {step === 'basic' && (
            <div className="p-6 space-y-4">
              <h2 className="text-xl font-extrabold text-text-navy">Basic Information</h2>
              {[
                { label: 'FULL NAME', key: 'name', type: 'text', placeholder: 'Rajesh Kumar' },
                { label: 'PHONE', key: 'phone', type: 'tel', placeholder: '+91 98765 43210' },
                { label: 'EMAIL', key: 'email', type: 'email', placeholder: 'worker@example.com' },
                { label: 'CITY', key: 'city', type: 'text', placeholder: 'Mumbai' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="mb-1.5 block font-mono text-[10px] font-semibold tracking-[0.1em] text-text-tertiary">{label}</label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                    <input type={type} required value={(formData as any)[key]} onChange={e => setFormData(p => ({ ...p, [key]: e.target.value }))} placeholder={placeholder} className={inputClass} />
                  </div>
                </div>
              ))}
              <div>
                <label className="mb-1.5 block font-mono text-[10px] font-semibold tracking-[0.1em] text-text-tertiary">PASSWORD</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                  <input type={showPassword ? 'text' : 'password'} required minLength={6} value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} placeholder="Min 6 characters" className="w-full rounded-xl border border-status-subtle bg-background-primary py-3 pl-10 pr-10 text-sm text-text-navy placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary">{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block font-mono text-[10px] font-semibold tracking-[0.1em] text-text-tertiary">YEARS OF EXPERIENCE</label>
                <select value={formData.experience_years} onChange={e => setFormData(p => ({ ...p, experience_years: e.target.value }))} className="w-full rounded-xl border border-status-subtle bg-background-primary py-3 px-4 text-sm text-text-navy focus:border-accent-primary focus:outline-none">
                  {['<1', '1', '2', '3', '4', '5', '6-10', '10+'].map(v => <option key={v} value={v}>{v} year{v !== '1' ? 's' : ''}</option>)}
                </select>
              </div>
              <button onClick={() => setStep('skills')} disabled={!formData.name || !formData.email || !formData.phone} className={btnPrimary}>Continue <ArrowRight size={16} /></button>
            </div>
          )}

          {step === 'skills' && (
            <div className="p-6 space-y-5">
              <h2 className="text-xl font-extrabold text-text-navy">Skills & Expertise</h2>
              <div>
                <label className="mb-2 block font-mono text-[10px] font-semibold tracking-[0.1em] text-text-tertiary">SELECT YOUR SKILLS (at least 1)</label>
                <div className="flex flex-wrap gap-2">
                  {SKILL_CATEGORIES.map(skill => (
                    <button key={skill} type="button" onClick={() => toggleSkill(skill)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${formData.skills.includes(skill) ? 'bg-accent-primary text-white' : 'border border-status-subtle bg-gray-50 text-text-secondary hover:border-accent-primary/40'}`}>{skill}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-2 block font-mono text-[10px] font-semibold tracking-[0.1em] text-text-tertiary">CERTIFICATIONS (optional)</label>
                <div className="flex flex-wrap gap-2">
                  {CERTIFICATIONS.map(cert => (
                    <button key={cert} type="button" onClick={() => toggleCert(cert)} className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${formData.certifications.includes(cert) ? 'bg-text-navy text-white' : 'border border-status-subtle bg-gray-50 text-text-secondary hover:border-text-navy/40'}`}>{cert}</button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-accent-primary/20 bg-accent-light/20 p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input type="checkbox" checked={formData.hasEshram} onChange={e => setFormData(p => ({ ...p, hasEshram: e.target.checked }))} className="mt-0.5 h-4 w-4 accent-accent-primary" />
                  <div>
                    <p className="font-semibold text-text-navy text-sm">I have an e-Shram Card</p>
                    <p className="mt-0.5 text-xs text-text-secondary">Government worker registration scheme</p>
                  </div>
                </label>
                {formData.hasEshram && (
                  <input type="text" value={formData.eshramNumber} onChange={e => setFormData(p => ({ ...p, eshramNumber: e.target.value }))} placeholder="e-Shram Card Number" className="mt-3 w-full rounded-xl border border-status-subtle bg-white py-2.5 px-4 text-sm text-text-navy focus:border-accent-primary focus:outline-none" />
                )}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep('basic')} className="flex-1 rounded-xl border border-status-subtle py-3 text-sm font-semibold text-text-secondary">Back</button>
                <button onClick={() => setStep('documents')} disabled={formData.skills.length === 0} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent-primary py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50">Continue <ArrowRight size={16} /></button>
              </div>
            </div>
          )}

          {step === 'documents' && (
            <div className="p-6 space-y-5">
              <h2 className="text-xl font-extrabold text-text-navy">Document Verification</h2>
              <div className="overflow-hidden rounded-2xl border border-blue-200 bg-blue-50">
                <div className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600"><FileCheck size={20} className="text-white" /></div>
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900">DigiLocker Integration</p>
                    <p className="text-xs text-blue-600">Fetch documents directly from government servers</p>
                  </div>
                </div>
                {digilockerStatus === 'idle' && (
                  <div className="border-t border-blue-200 p-4">
                    <button onClick={fetchFromDigiLocker} className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-700">Connect DigiLocker <ArrowRight size={16} /></button>
                    <p className="mt-2 text-center font-mono text-[9px] text-blue-500">* MOCK DEMO · Will use real DigiLocker API in production</p>
                  </div>
                )}
                {digilockerStatus === 'loading' && (
                  <div className="border-t border-blue-200 p-4 text-center">
                    <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    <p className="mt-2 text-sm text-blue-600">Fetching from DigiLocker...</p>
                  </div>
                )}
                {digilockerStatus === 'success' && (
                  <div className="border-t border-blue-200 p-4 space-y-2">
                    <p className="font-mono text-[10px] font-semibold text-blue-700">DOCUMENTS FETCHED</p>
                    {digilockerDocs.map((doc, i) => <div key={i} className="flex items-center gap-2 text-sm text-blue-800"><CheckCircle size={16} className="text-green-600" />{doc}</div>)}
                  </div>
                )}
              </div>
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-amber-600" />
                <p className="text-xs text-amber-700">Your documents will be reviewed by the cooperative admin before activation (24-48 hours).</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep('skills')} className="flex-1 rounded-xl border border-status-subtle py-3 text-sm font-semibold text-text-secondary">Back</button>
                <button onClick={() => setStep('face-scan')} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent-primary py-3 font-semibold text-white hover:opacity-90">Continue <ArrowRight size={16} /></button>
              </div>
            </div>
          )}

          {step === 'face-scan' && (
            <div className="p-6 space-y-5">
              <div className="flex items-center gap-3">
                <Camera size={24} className="text-accent-primary" />
                <div>
                  <h2 className="text-xl font-extrabold text-text-navy">Identity Verification</h2>
                  <p className="text-xs text-text-secondary">Liveness check + profile photo</p>
                </div>
              </div>
              {faceScanStep === 'instructions' && (
                <div className="space-y-4">
                  <div className="rounded-2xl bg-gray-50 p-5 text-center">
                    <div className="text-5xl mb-3">🤳</div>
                    <p className="font-semibold text-text-navy">Face Liveness Check</p>
                    <p className="mt-2 text-sm text-text-secondary leading-relaxed">Follow the on-screen directions to verify your identity.</p>
                    <div className="mt-4 space-y-2 text-left">
                      {['Find good lighting', 'Remove glasses if possible', 'Keep face centered', 'Follow on-screen directions'].map((tip, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs text-text-secondary"><CheckCircle size={14} className="text-green-500" />{tip}</div>
                      ))}
                    </div>
                  </div>
                  <button onClick={startCamera} className={btnPrimary}><Camera size={18} /> Start Face Scan</button>
                  <button onClick={handleFinalSubmit} className="w-full rounded-xl border border-status-subtle py-3 text-sm font-semibold text-text-secondary">Skip (Demo Mode)</button>
                </div>
              )}
              {faceScanStep === 'scanning' && (
                <div className="space-y-4">
                  <div className="relative overflow-hidden rounded-2xl bg-black">
                    <video ref={videoRef} autoPlay muted playsInline className="w-full" />
                    <div className="absolute inset-0 flex flex-col items-center justify-end pb-6">
                      <div className="rounded-xl bg-black/70 px-4 py-3 text-center">
                        <p className="text-3xl">{faceInstructions[faceDirection]?.icon}</p>
                        <p className="mt-1 text-sm font-semibold text-white">{faceInstructions[faceDirection]?.text}</p>
                      </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="h-48 w-36 rounded-full border-2 border-accent-primary opacity-60" />
                    </div>
                  </div>
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}
              {faceScanStep === 'done' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <CheckCircle size={48} className="mx-auto text-green-500" />
                    <p className="mt-3 text-lg font-extrabold text-text-navy">Face Scan Complete!</p>
                    <p className="mt-1 text-sm text-text-secondary">Liveness check passed ✓</p>
                  </div>
                  {capturedPhoto && <div className="flex justify-center"><img src={capturedPhoto} alt="Profile" className="h-28 w-28 rounded-full object-cover border-4 border-accent-primary" /></div>}
                  <button onClick={handleFinalSubmit} disabled={isLoading} className={btnPrimary}>{isLoading ? 'Creating account...' : 'Complete Registration'} <ArrowRight size={16} /></button>
                </div>
              )}
            </div>
          )}

          {step === 'done' && (
            <div className="p-8 text-center space-y-4">
              <CheckCircle size={56} className="mx-auto text-green-500" />
              <h2 className="text-2xl font-extrabold text-text-navy">Registration Submitted!</h2>
              <p className="text-sm text-text-secondary leading-relaxed">Your application is under cooperative admin review. You'll be notified within 24-48 hours once approved.</p>
              <div className="rounded-xl bg-accent-light/30 p-4 text-left space-y-2">
                <p className="font-mono text-[10px] font-semibold text-accent-primary">WHAT HAPPENS NEXT</p>
                {['Admin reviews your documents', 'Skills get verified', 'Account activated', 'Start accepting jobs!'].map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-text-secondary">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-primary text-[10px] font-bold text-white">{i + 1}</span>{s}
                  </div>
                ))}
              </div>
              <button onClick={onSuccess} className={btnPrimary}>Go to Dashboard <ArrowRight size={16} /></button>
            </div>
          )}
        </div>
        <p className="mt-4 text-center text-xs text-text-secondary">Already registered? <button onClick={() => setMode('login')} className="font-semibold text-accent-primary">Sign in here</button></p>
      </div>
    </div>
  );
}
