import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { Check, CircleHelp, MapPin, Phone, ShieldCheck } from 'lucide-react';

type JobStage = 'active' | 'completed' | 'paid' | 'rated';
const statusSteps = ['ACCEPTED', 'ON THE WAY', 'ARRIVED', 'SERVICE'];

export function LiveJob() {
  const { jobId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [eta, setEta] = useState<number>(state?.eta ?? 8);
  const [stage, setStage] = useState<JobStage>('active');
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState<string[]>([]);
  const worker = state?.worker ?? { name: 'Arjun Patil', rating: 4.8, completedJobs: 127 };
  const service = state?.service ?? 'Plumbing';
  useEffect(() => { if (stage !== 'active') return; const timer = window.setInterval(() => setEta(value => Math.max(1, value - 1)), 60000); return () => window.clearInterval(timer); }, [stage]);
  const toggleFeedback = (label: string) => setFeedback(current => current.includes(label) ? current.filter(item => item !== label) : [...current, label]);

  if (stage !== 'active') return <main className="mx-auto flex min-h-screen max-w-2xl items-center px-4 py-8 sm:px-5 sm:py-10">
  <section className="w-full rounded-[28px] border border-status-subtle bg-white p-6 text-center sm:rounded-[32px] sm:p-7 md:rounded-[34px] md:p-12">
  <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-accent-primary sm:text-[11px] sm:tracking-[0.16em]">{stage === 'completed' ? 'SERVICE COMPLETED' : 'PAYMENT SUCCESSFUL'}</p>
  <div className="mx-auto mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-accent-light text-accent-primary sm:mt-6 sm:h-14 sm:w-14"><Check size={24} className="sm:h-[27px] sm:w-[27px]" /></div>
  <h1 className="mt-5 text-3xl font-extrabold tracking-[-0.06em] text-text-navy sm:mt-6 sm:text-4xl">{stage === 'completed' ? 'All sorted.' : stage === 'paid' ? 'Thank you.' : 'Your feedback is in.'}</h1>
  {stage === 'completed' ? <><p className="mt-3.5 text-sm text-text-secondary sm:mt-4 sm:text-base">{service} service completed by {worker.name}.</p><div className="mt-6 rounded-2xl bg-background-primary px-5 py-4 sm:mt-8 sm:px-6 sm:py-5"><p className="font-mono text-[9px] tracking-[0.12em] text-text-secondary sm:text-[10px]">TOTAL PAID</p><p className="mt-1.5 text-3xl font-extrabold tracking-[-0.05em] text-text-navy sm:mt-2 sm:text-4xl">₹500</p><p className="mt-1.5 text-xs text-text-secondary sm:mt-2 sm:text-sm">UPI · Simulated payment</p></div><button onClick={() => setStage('paid')} className="mt-6 w-full rounded-2xl bg-accent-primary py-3.5 text-sm font-semibold text-white hover:bg-accent-hover sm:mt-8 sm:py-4">CONFIRM PAYMENT</button></> : stage === 'paid' ? <><p className="mt-3.5 text-sm text-text-secondary sm:mt-4 sm:text-base">How was your experience with {worker.name}?</p><div className="mt-6 flex justify-center gap-1.5 sm:mt-8 sm:gap-2">{[1, 2, 3, 4, 5].map(value => <button aria-label={`Rate ${value} stars`} key={value} onClick={() => setRating(value)} className={`text-3xl transition-transform hover:scale-110 sm:text-4xl ${value <= rating ? 'text-accent-primary' : 'text-status-subtle'}`}>★</button>)}</div><div className="mt-5 flex flex-wrap justify-center gap-1.5 sm:mt-7 sm:gap-2">{['Professional', 'On time', 'Skilled', 'Polite', 'Clean work'].map(label => <button key={label} onClick={() => toggleFeedback(label)} className={`rounded-full border px-2.5 py-1.5 text-[10px] font-medium transition sm:px-3 sm:py-2 sm:text-xs ${feedback.includes(label) ? 'border-accent-primary bg-accent-light text-accent-primary' : 'border-status-subtle text-text-secondary'}`}>{label}</button>)}</div><button disabled={!rating} onClick={() => setStage('rated')} className="mt-6 w-full rounded-2xl bg-accent-primary py-3.5 text-sm font-semibold text-white disabled:bg-status-neutral sm:mt-8 sm:py-4">SUBMIT FEEDBACK</button></> : <button onClick={() => navigate('/')} className="mt-6 w-full rounded-2xl bg-accent-primary py-3.5 text-sm font-semibold text-white sm:mt-8 sm:py-4">BACK TO SERVICES</button>}</section></main>;

  return <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-5 sm:py-8 md:px-10 md:py-14">
  <div className="mb-6 flex items-center justify-between sm:mb-8">
  <div><p className="font-mono text-[10px] font-semibold tracking-[0.15em] text-accent-primary sm:text-[11px]">{service.toUpperCase()} // ACTIVE</p><h1 className="mt-1.5 text-3xl font-extrabold tracking-[-0.06em] text-text-navy sm:mt-2 sm:text-4xl">Your worker is on the way.</h1></div><span className="hidden font-mono text-[9px] tracking-[0.1em] text-text-secondary sm:text-[10px] md:block">JOB #{jobId}</span></div>
  <div className="grid gap-5 sm:gap-6 lg:grid-cols-[1.1fr_.9fr]">
  <section className="overflow-hidden rounded-[24px] border border-status-subtle bg-white sm:rounded-[28px] md:rounded-[32px]">
  <div className="relative min-h-[260px] overflow-hidden bg-[#eaf1f8] sm:min-h-[300px]"><div className="absolute inset-0 opacity-60" style={{ backgroundImage: 'radial-gradient(#174A8B 1px, transparent 1px)', backgroundSize: '22px 22px' }} /><div className="absolute left-[16%] top-[25%] h-[54%] w-[58%] -rotate-6 rounded-[38%] border-[10px] border-white/80" /><div className="absolute bottom-[21%] left-[23%] flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1.5 text-[10px] font-semibold shadow-sm sm:gap-2 sm:px-3 sm:py-2 sm:text-xs"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent-primary sm:h-2 sm:w-2" /> YOU · KOTHRUD</div><div className="absolute right-[21%] top-[22%] flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-accent-primary text-white shadow-lg sm:h-12 sm:w-12">●</div><div className="absolute bottom-5 left-5 flex items-center gap-1.5 font-mono text-[9px] tracking-[0.1em] text-text-secondary sm:bottom-7 sm:left-7 sm:gap-2 sm:text-[10px]"><MapPin size={12} className="text-accent-primary sm:h-[14px] sm:w-[14px]" /> SIMULATED LOCATION</div></div>
  <div className="p-5 sm:p-6 md:p-8">
  <div className="flex items-start justify-between gap-4"><div><p className="font-mono text-[9px] tracking-[0.12em] text-text-secondary sm:text-[10px]">ESTIMATED ARRIVAL</p><p className="mt-1.5 text-4xl font-extrabold tracking-[-0.06em] text-accent-primary sm:mt-2 sm:text-5xl">{String(eta).padStart(2, '0')} MIN</p></div><button onClick={() => setStage('completed')} className="rounded-xl border border-accent-primary px-3.5 py-2.5 text-[10px] font-semibold text-accent-primary hover:bg-accent-light sm:px-4 sm:py-3 sm:text-xs">MARK COMPLETE</button></div>
  <div className="mt-6 grid grid-cols-4 gap-1 sm:mt-8">{statusSteps.map((step, index) => <div key={step} className="text-center"><span className={`mx-auto flex h-5 w-5 items-center justify-center rounded-full text-[9px] sm:h-6 sm:w-6 sm:text-[10px] ${index < 2 ? 'bg-accent-primary text-white' : 'bg-status-subtle text-text-secondary'}`}>{index < 2 ? <Check size={11} className="sm:h-[13px] sm:w-[13px]" /> : index + 1}</span><p className={`mt-1.5 font-mono text-[7px] tracking-[0.06em] sm:mt-2 sm:text-[8px] ${index < 2 ? 'text-accent-primary' : 'text-text-tertiary'}`}>{step}</p></div>)}</div>
  </div>
  </section>
  <aside className="rounded-[24px] border border-status-subtle bg-white p-5 sm:rounded-[28px] sm:p-6 md:rounded-[32px] md:p-8">
  <p className="font-mono text-[9px] tracking-[0.12em] text-text-secondary sm:text-[10px]">YOUR COOPERATIVE WORKER</p>
  <div className="mt-4 flex items-center gap-3 sm:mt-5 sm:gap-4"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8e5e0] text-xl sm:h-16 sm:w-16 sm:text-2xl">🛠</div><div><h2 className="text-xl font-extrabold tracking-[-0.04em] text-text-navy sm:text-2xl">{worker.name}</h2><p className="mt-1 text-xs text-text-secondary sm:text-sm">★ {worker.rating} · {worker.completedJobs} jobs</p></div></div>
  <p className="mt-4 flex items-center gap-2 text-[10px] font-semibold text-accent-primary sm:mt-5 sm:text-xs"><ShieldCheck size={14} className="sm:h-4 sm:w-4" /> COOPERATIVE VERIFIED</p>
  <div className="my-5 border-t border-status-subtle sm:my-7" />
  <p className="font-mono text-[9px] tracking-[0.12em] text-text-secondary sm:text-[10px]">SERVICE</p>
  <p className="mt-1.5 text-base font-semibold text-text-navy sm:mt-2 sm:text-lg">{service} · Immediate assistance</p>
  <p className="mt-1.5 text-xs leading-5 text-text-secondary sm:mt-2 sm:text-sm">Kothrud, Pune · A worker is travelling to your location.</p>
  <div className="mt-6 grid grid-cols-2 gap-2.5 sm:mt-8 sm:gap-3"><button className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-status-subtle py-2.5 text-[10px] font-semibold hover:border-accent-primary hover:text-accent-primary sm:gap-2 sm:py-3 sm:text-xs"><Phone size={13} className="sm:h-[15px] sm:w-[15px]" /> CONTACT</button><button className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-status-subtle py-2.5 text-[10px] font-semibold hover:border-accent-primary hover:text-accent-primary sm:gap-2 sm:py-3 sm:text-xs"><CircleHelp size={13} className="sm:h-[15px] sm:w-[15px]" /> HELP</button></div>
  </aside>
  </div>
  </main>;
}
