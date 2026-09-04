import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, ImagePlus, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { useMockData } from '../../contexts/MockDataContext';
import { dispatchWorker, type DispatchResult } from '../../engines/dispatchEngine';
import type { ServiceRequest } from '../../types/job';
import type { ServiceCategory } from '../../types/service';

type CustomerStage = 'browse' | 'request' | 'dispatch' | 'select' | 'matched';

const illustrationByService: Record<string, string> = {
  Plumbing: '/illustrations/plumber.png', Electrical: '/illustrations/electrician.png', Carpentry: '/illustrations/carpenter.png',
  Painting: '/illustrations/painting.png', Cleaning: '/illustrations/cleaning.png', 'Appliance Repair': '/illustrations/appliance-repair.png'
};
const surfaceByService: Record<string, string> = {
  Plumbing: 'bg-[#e3f2fd]', Electrical: 'bg-[#fff3e0]', Carpentry: 'bg-[#f3e5f5]',
  Painting: 'bg-[#e8f5e9]', Cleaning: 'bg-[#fce4ec]', 'Appliance Repair': 'bg-[#fff8e1]'
};
const formPanelSurface = 'bg-[#eaf1f8]'; // Consistent color for form request panels
const diagnosisByService: Record<string, string> = {
  Plumbing: 'This looks like a likely pipe or fixture leak. A verified plumbing worker can inspect the connection and carry out the repair.',
  Electrical: 'The image may show a worn electrical fitting. For safety, a verified electrician should inspect the circuit before any repair.',
  Carpentry: 'This appears to need a furniture or fixture repair. A cooperative carpenter can assess the damaged fitting on arrival.',
  Painting: 'The image suggests a surface-preparation and repainting job. The worker can confirm the scope after inspecting the wall.',
  Cleaning: 'The image suggests a deep-cleaning request. The worker can confirm the materials and time needed on arrival.',
  'Appliance Repair': 'The appliance may need a diagnostic visit. A verified technician can inspect the unit and confirm the required repair.'
};

function ServiceCard({ service, index, onSelect }: { service: ServiceCategory; index: number; onSelect: () => void }) {
  const featured = index === 0;
  const bgColor = surfaceByService[service.name] || 'bg-[#f5f5f5]';
  return <article className={`group relative isolate flex min-h-[300px] overflow-hidden rounded-[20px] border border-black/5 ${bgColor} p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(18,18,18,0.09)] sm:min-h-[340px] sm:rounded-[24px] sm:p-6 ${featured ? 'md:col-span-2 md:min-h-[430px]' : ''}`}>
    <div className="relative z-10 flex max-w-[60%] flex-col justify-between sm:max-w-[58%]"><div><p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-text-secondary sm:text-[10px] sm:tracking-[0.16em]">{String(index + 1).padStart(2, '0')}</p><h3 className={`mt-3 font-extrabold tracking-[-0.055em] text-text-navy sm:mt-4 ${featured ? 'text-3xl sm:text-4xl md:text-5xl' : 'text-2xl sm:text-3xl'}`}>{service.name}</h3><p className="mt-2.5 text-xs leading-5 text-text-secondary sm:mt-3 sm:text-sm">{service.description.split(' including ')[0]}</p></div><div className="pt-5 sm:pt-6"><div className="mb-4 grid max-w-[260px] grid-cols-2 gap-2.5 sm:mb-5 sm:max-w-[280px] sm:gap-3"><div><p className="font-mono text-[8px] font-semibold tracking-[0.12em] text-text-secondary sm:text-[9px]">ESTIMATE</p><p className="mt-1 text-sm font-extrabold tracking-[-0.03em] text-text-navy sm:text-[15px]">{service.avgPrice.replace('-', '—')}</p></div><div className="border-l border-black/10 pl-2.5 sm:pl-3"><p className="font-mono text-[8px] font-semibold tracking-[0.12em] text-text-secondary sm:text-[9px]">TIME</p><p className="mt-1 text-sm font-extrabold tracking-[-0.03em] text-text-navy sm:text-[15px]">{service.avgDuration.replace('hours', 'hrs').replace('hour', 'hr').toUpperCase()}</p></div></div><button onClick={onSelect} className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary transition-transform group-hover:translate-x-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-primary sm:gap-2 sm:text-sm">REQUEST SERVICE <ArrowRight size={14} strokeWidth={2} className="sm:h-4 sm:w-4" /></button></div></div>
    <img src={illustrationByService[service.name]} alt={`${service.name} service illustration`} className={`pointer-events-none absolute bottom-[-6%] right-[-12%] z-0 h-[82%] max-w-[72%] object-contain object-bottom transition-transform duration-500 group-hover:scale-[1.045] group-hover:-rotate-1 sm:right-[-9%] sm:h-[87%] sm:max-w-[70%] ${featured ? 'md:h-[104%] md:right-[1%] md:max-w-[52%]' : ''}`} />
  </article>;
}

function CustomerRequestForm({ service, description, setDescription, urgency, setUrgency, uploadedImage, isDiagnosing, onUpload, onBack, onFind }: {
  service: ServiceCategory;
  description: string;
  setDescription: (value: string) => void;
  urgency: 'normal' | 'urgent';
  setUrgency: (value: 'normal' | 'urgent') => void;
  uploadedImage: string | null;
  isDiagnosing: boolean;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBack: () => void;
  onFind: () => void;
}) {
  return <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-5 sm:py-8 md:px-10 md:py-14">
    <button onClick={onBack} className="mb-6 min-h-[44px] font-mono text-xs font-semibold tracking-[0.1em] text-text-secondary hover:text-accent-primary sm:mb-8 md:mb-10">← ALL SERVICES</button>
    <div className="grid items-start gap-6 sm:gap-7 md:gap-8 lg:grid-cols-[0.82fr_1.18fr]">
      <aside className={`relative min-h-[360px] overflow-hidden rounded-[28px] ${formPanelSurface} p-6 sm:min-h-[420px] sm:rounded-[32px] sm:p-7 md:min-h-[680px] md:rounded-[36px] md:p-10 lg:sticky lg:top-28`}>
        {/* Background illustration layer - oversized and positioned */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          {/* Subtle circular gradient overlay for depth */}
          <div className="absolute bottom-[-15%] right-[-10%] h-[65%] w-[65%] rounded-full bg-white/30 sm:bg-white/35 md:bottom-[-10%] md:right-[-8%] md:h-[60%] md:w-[60%]" />
          
          {/* Large illustration as background stencil */}
          <img 
            src="/illustrations/form-illustration.png" 
            alt="" 
            className="absolute bottom-[-8%] right-[-15%] h-[108%] w-auto max-w-none opacity-75 sm:bottom-[-7%] sm:opacity-80 md:bottom-[-5%] md:right-[-12%] md:h-[115%] md:opacity-85"
            style={{ objectFit: 'contain', objectPosition: 'bottom right' }}
          />
        </div>
        
        {/* Text content layer - above illustration */}
        <div className="relative z-10 flex h-full flex-col">
          <div className="max-w-[75%] sm:max-w-[72%] md:max-w-[70%]">
            <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-text-secondary sm:text-[10px] sm:tracking-[0.16em]">ON-DEMAND SERVICE</p>
            <h1 className="mt-3 text-[clamp(2rem,7vw,2.75rem)] font-extrabold leading-[0.92] tracking-[-0.06em] text-text-navy sm:mt-4">
              {service.name}, when you need it.
            </h1>
          </div>
          
          {/* Push network label to bottom */}
          <div className="mt-auto pt-6 sm:pt-7 md:pt-8">
            <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-accent-primary sm:text-[10px]">PUNE · DEMO NETWORK</p>
          </div>
        </div>
      </aside>
      <section className="rounded-[24px] border border-status-subtle bg-white p-5 sm:rounded-[28px] sm:p-6 md:rounded-[32px] md:p-10">
        <div className="mb-7 flex items-center gap-2.5 font-mono text-[9px] font-semibold tracking-[0.12em] text-text-secondary sm:mb-8 sm:gap-3 sm:text-[10px] md:mb-10">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-primary text-white sm:h-7 sm:w-7">1</span> DESCRIBE 
          <span className="h-px w-6 bg-status-subtle sm:w-8" /> 
          <span>2 MATCH</span>
        </div>
        <h2 className="text-3xl font-extrabold tracking-[-0.045em] text-text-navy md:text-4xl">Tell us what needs attention.</h2>
        <p className="mt-3 max-w-lg text-text-secondary">We’ll use your request to find an available, verified cooperative worker nearby.</p>
        <div className="mt-8 rounded-2xl border border-accent-primary/15 bg-accent-light/50 p-4">
          <div className="flex items-start gap-3"><div className="mt-0.5 rounded-xl bg-white p-2 text-accent-primary"><Sparkles size={16} /></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-semibold text-text-navy">Photo-assisted problem note</p><span className="font-mono text-[9px] font-semibold tracking-[0.1em] text-accent-primary">SIMULATED DEMO</span></div><p className="mt-1 text-xs leading-5 text-text-secondary">Upload a photo and a hardcoded demo diagnosis will help draft your request.</p><div className="mt-3 flex flex-wrap items-center gap-3"><label htmlFor="problem-photo" className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-accent-primary bg-white px-3 py-2 text-xs font-semibold text-accent-primary transition hover:bg-accent-primary hover:text-white"><ImagePlus size={15} /> {uploadedImage ? 'CHANGE PHOTO' : 'UPLOAD PHOTO'}</label><input id="problem-photo" className="sr-only" type="file" accept="image/*" onChange={onUpload} />{isDiagnosing && <span className="font-mono text-[10px] tracking-[0.08em] text-accent-primary">ANALYSING PHOTO…</span>}{uploadedImage && !isDiagnosing && <span className="flex items-center gap-1 font-mono text-[10px] tracking-[0.08em] text-accent-primary"><Check size={13} /> NOTE ADDED</span>}</div>{uploadedImage && <img src={uploadedImage} alt="Problem photo preview" className="mt-4 h-20 w-20 rounded-xl border border-white object-cover" />}</div></div>
        </div>
        <label htmlFor="problem" className="mt-7 block font-mono text-[11px] font-semibold tracking-[0.12em] text-text-secondary">DESCRIBE THE PROBLEM</label>
        <textarea id="problem" value={description} onChange={event => setDescription(event.target.value)} placeholder="My kitchen sink is leaking." rows={5} className="mt-3 w-full resize-none rounded-2xl border border-status-subtle bg-background-primary px-4 py-4 text-base outline-none transition focus:border-accent-primary focus:bg-white" />
        <div className="mt-7 grid gap-6 sm:grid-cols-2"><div><p className="font-mono text-[11px] font-semibold tracking-[0.12em] text-text-secondary">LOCATION</p><div className="mt-3 flex items-center gap-3 rounded-2xl border border-status-subtle px-4 py-3 text-sm font-medium text-text-navy"><MapPin size={17} className="text-accent-primary" /> Kothrud, Pune <span className="ml-auto font-mono text-[9px] text-text-tertiary">DEMO</span></div></div><div><p className="font-mono text-[11px] font-semibold tracking-[0.12em] text-text-secondary">URGENCY</p><div className="mt-3 flex rounded-2xl bg-background-primary p-1">{(['normal', 'urgent'] as const).map(value => <button key={value} onClick={() => setUrgency(value)} className={`flex-1 rounded-xl py-2 text-xs font-semibold uppercase tracking-[0.08em] transition ${urgency === value ? 'bg-white text-accent-primary shadow-sm' : 'text-text-secondary'}`}>{value}</button>)}</div></div></div>
        <button onClick={onFind} disabled={description.trim().length < 10 || isDiagnosing} className="mt-10 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-accent-primary px-6 py-4 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-status-neutral md:w-auto">FIND A WORKER <ArrowRight size={18} /></button>
      </section>
    </div>
  </main>;
}

export function CustomerHome() {
  const { services, workers } = useMockData();
  const navigate = useNavigate();
  const [stage, setStage] = useState<CustomerStage>('browse');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'urgent'>('normal');
  const [dispatchResult, setDispatchResult] = useState<DispatchResult | null>(null);
  const [selectedWorkerIndex, setSelectedWorkerIndex] = useState<number>(0);
  const [visibleStep, setVisibleStep] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const selectedService = useMemo(() => services.find(service => service.id === selectedServiceId), [services, selectedServiceId]);

  useEffect(() => {
    if (stage !== 'dispatch' || !dispatchResult) return;
    if (visibleStep >= dispatchResult.steps.length) { const reveal = window.setTimeout(() => setStage('select'), 600); return () => window.clearTimeout(reveal); }
    const timer = window.setTimeout(() => setVisibleStep(current => current + 1), 650);
    return () => window.clearTimeout(timer);
  }, [stage, dispatchResult, visibleStep]);

  const selectService = (serviceId: string) => { setSelectedServiceId(serviceId); setDescription(''); setUploadedImage(null); setIsDiagnosing(false); setStage('request'); };
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedService) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
      setIsDiagnosing(true);
      window.setTimeout(() => {
        setDescription(diagnosisByService[selectedService.name] || 'Image review complete. Please add any details that will help the worker.');
        setIsDiagnosing(false);
      }, 1400);
    };
    reader.readAsDataURL(file);
  };
  const handleFindWorker = () => {
    if (!selectedService || description.trim().length < 10) return;
    const eligibleWorker = workers.find(worker => worker.available && worker.skills.some(skill => skill.category === selectedService.name && skill.verified));
    if (!eligibleWorker) return;
    // Customer location: Delhi NCR area (coordinates match worker network region)
    const customerLocation = { lat: 28.6139, lng: 77.2090 };
    const request: ServiceRequest = { serviceCategory: selectedService.name, serviceSubcategory: selectedService.subcategories[0]?.name || '', description: description.trim(), location: { address: 'Kothrud, Pune · DEMO', coordinates: customerLocation }, immediate: true };
    try { setDispatchResult(dispatchWorker(request, workers)); setVisibleStep(0); setStage('dispatch'); } catch (error) { console.error('Mock dispatch error:', error); }
  };

  if (stage === 'request' && selectedService) return <CustomerRequestForm
    service={selectedService}
    description={description}
    setDescription={setDescription}
    urgency={urgency}
    setUrgency={setUrgency}
    uploadedImage={uploadedImage}
    isDiagnosing={isDiagnosing}
    onUpload={handleImageUpload}
    onBack={() => setStage('browse')}
    onFind={handleFindWorker}
  />;

  if (stage === 'request' && selectedService) return <main className="mx-auto min-h-screen max-w-6xl px-5 py-8 md:px-10 md:py-14"><button onClick={() => setStage('browse')} className="mb-10 font-mono text-xs font-semibold tracking-[0.1em] text-text-secondary hover:text-accent-primary">← ALL SERVICES</button><div className="grid items-start gap-8 lg:grid-cols-[0.82fr_1.18fr]"><aside className={`relative min-h-[300px] overflow-hidden rounded-[32px] ${surfaceByService[selectedService.name]} p-7 lg:sticky lg:top-28`}><p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-text-secondary">ON-DEMAND SERVICE</p><h1 className="mt-4 max-w-xs text-4xl font-extrabold leading-[0.92] tracking-[-0.06em] text-text-navy">{selectedService.name}, when you need it.</h1><img src={illustrationByService[selectedService.name]} alt="" className="absolute bottom-[-11%] right-[-8%] h-[64%] max-w-[62%] object-contain" /></aside><section className="rounded-[32px] border border-status-subtle bg-white p-6 md:p-10"><div className="mb-10 flex items-center gap-3 font-mono text-[10px] font-semibold tracking-[0.12em] text-text-secondary"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-primary text-white">1</span> DESCRIBE <span className="h-px w-8 bg-status-subtle" /> <span>2 MATCH</span></div><h2 className="text-3xl font-extrabold tracking-[-0.045em] text-text-navy md:text-4xl">Tell us what needs attention.</h2><p className="mt-3 max-w-lg text-text-secondary">We’ll use your request to find an available, verified cooperative worker nearby.</p><label htmlFor="problem" className="mt-9 block font-mono text-[11px] font-semibold tracking-[0.12em] text-text-secondary">DESCRIBE THE PROBLEM</label><textarea id="problem" value={description} onChange={event => setDescription(event.target.value)} placeholder="My kitchen sink is leaking." rows={5} className="mt-3 w-full resize-none rounded-2xl border border-status-subtle bg-background-primary px-4 py-4 text-base outline-none transition focus:border-accent-primary focus:bg-white" /><div className="mt-7 grid gap-6 sm:grid-cols-2"><div><p className="font-mono text-[11px] font-semibold tracking-[0.12em] text-text-secondary">LOCATION</p><div className="mt-3 flex items-center gap-3 rounded-2xl border border-status-subtle px-4 py-3 text-sm font-medium text-text-navy"><MapPin size={17} className="text-accent-primary" /> Kothrud, Pune <span className="ml-auto font-mono text-[9px] text-text-tertiary">DEMO</span></div></div><div><p className="font-mono text-[11px] font-semibold tracking-[0.12em] text-text-secondary">URGENCY</p><div className="mt-3 flex rounded-2xl bg-background-primary p-1">{(['normal', 'urgent'] as const).map(value => <button key={value} onClick={() => setUrgency(value)} className={`flex-1 rounded-xl py-2 text-xs font-semibold uppercase tracking-[0.08em] transition ${urgency === value ? 'bg-white text-accent-primary shadow-sm' : 'text-text-secondary'}`}>{value}</button>)}</div></div></div><button onClick={handleFindWorker} disabled={description.trim().length < 10} className="mt-10 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-accent-primary px-6 py-4 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-status-neutral md:w-auto">FIND A WORKER <ArrowRight size={18} /></button></section></div></main>;

  // Worker Selection Screen - Customer chooses from top 3 candidates
  if (stage === 'select' && selectedService && dispatchResult) {
    return <main className="mx-auto flex min-h-screen max-w-5xl items-center px-5 py-10 md:px-10">
      <section className="w-full overflow-hidden rounded-[36px] border border-status-subtle bg-white p-6 md:p-12">
        <p className="font-mono text-[11px] font-semibold tracking-[0.16em] text-accent-primary">WORKERS FOUND</p>
        <h1 className="mt-4 text-4xl font-extrabold leading-[0.92] tracking-[-0.06em] text-text-navy md:text-5xl">Choose your worker.</h1>
        <p className="mt-5 max-w-2xl text-text-secondary">We found {dispatchResult.candidates.length} verified {selectedService.name.toLowerCase()} workers nearby. Select the one that works best for you.</p>
        
        <div className="mt-10 space-y-4">
          {dispatchResult.candidates.map((candidate, index) => {
            const isSelected = selectedWorkerIndex === index;
            const isRecommended = index === 0;
            return (
              <button
                key={candidate.worker.id}
                onClick={() => setSelectedWorkerIndex(index)}
                className={`group w-full text-left transition-all ${
                  isSelected 
                    ? 'rounded-2xl border-2 border-accent-primary bg-accent-light/30' 
                    : 'rounded-2xl border border-status-subtle bg-white hover:border-accent-primary/40 hover:bg-accent-light/10'
                }`}
              >
                <div className="p-5 md:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      {/* Worker Avatar */}
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-[#e8e5e0] text-xl md:h-16 md:w-16 md:text-2xl">
                        🛠
                      </div>
                      
                      {/* Worker Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-extrabold tracking-[-0.04em] text-text-navy md:text-2xl">
                            {candidate.worker.name}
                          </h3>
                          {isRecommended && (
                            <span className="rounded-full bg-accent-primary px-2 py-0.5 font-mono text-[9px] font-bold tracking-[0.08em] text-white">
                              NEAREST
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-secondary">
                          <span>★ {candidate.worker.rating}</span>
                          <span>·</span>
                          <span>{candidate.worker.completedJobs} jobs</span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <ShieldCheck size={14} className="text-accent-primary" />
                            Cooperative Verified
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Distance & ETA */}
                    <div className="flex flex-shrink-0 gap-6 text-right">
                      <div>
                        <p className="font-mono text-[9px] tracking-[0.12em] text-text-secondary">DISTANCE</p>
                        <p className="mt-1 text-xl font-extrabold tracking-[-0.04em] text-text-navy">
                          {candidate.distance.toFixed(1)} KM
                        </p>
                      </div>
                      <div>
                        <p className="font-mono text-[9px] tracking-[0.12em] text-text-secondary">ETA</p>
                        <p className="mt-1 text-xl font-extrabold tracking-[-0.04em] text-accent-primary">
                          {Math.max(candidate.estimatedArrival, 8)} MIN
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
        
        <button 
          onClick={() => setStage('matched')} 
          className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-accent-primary px-6 py-4 text-sm font-semibold text-white transition hover:bg-accent-hover md:w-auto"
        >
          BOOK {dispatchResult.candidates[selectedWorkerIndex].worker.name.split(' ')[0].toUpperCase()}
          <ArrowRight size={18} />
        </button>
      </section>
    </main>;
  }

  if (stage === 'matched' && selectedService && dispatchResult) {
    const selectedCandidate = dispatchResult.candidates[selectedWorkerIndex];
    const worker = selectedCandidate.worker;
    return <main className="mx-auto flex min-h-screen max-w-4xl items-center px-5 py-10 md:px-10"><section className="w-full overflow-hidden rounded-[36px] border border-status-subtle bg-white p-6 md:p-12"><><p className="font-mono text-[11px] font-semibold tracking-[0.16em] text-accent-primary">WORKER BOOKED</p><div className="mt-6 grid gap-6 md:grid-cols-[1fr_0.85fr] md:items-end"><div><h1 className="text-5xl font-extrabold leading-[0.88] tracking-[-0.07em] text-text-navy md:text-6xl">{worker.name.toUpperCase()}</h1><p className="mt-4 flex items-center gap-2 text-sm font-semibold text-text-secondary"><ShieldCheck size={18} className="text-accent-primary" /> VERIFIED COOPERATIVE WORKER</p><p className="mt-6 text-lg text-text-secondary">{selectedService.name} specialist · {worker.completedJobs} completed jobs · ★ {worker.rating}</p></div><div className={`relative min-h-[230px] overflow-hidden rounded-[28px] ${surfaceByService[selectedService.name]}`}><img src={illustrationByService[selectedService.name]} alt="" className="absolute bottom-[-11%] right-[3%] h-[108%] w-full object-contain" /></div></div><div className="mt-8 grid grid-cols-2 gap-3 border-y border-status-subtle py-6"><div><p className="font-mono text-[10px] tracking-[0.12em] text-text-secondary">DISTANCE</p><p className="mt-2 text-2xl font-extrabold tracking-[-0.04em]">{selectedCandidate.distance.toFixed(1)} KM</p></div><div><p className="font-mono text-[10px] tracking-[0.12em] text-text-secondary">ETA</p><p className="mt-2 text-2xl font-extrabold tracking-[-0.04em]">{Math.max(selectedCandidate.estimatedArrival, 8)} MIN</p></div></div><button onClick={() => navigate('/job/DEMO001', { state: { service: selectedService.name, worker, eta: Math.max(selectedCandidate.estimatedArrival, 8) } })} className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-accent-primary px-6 py-4 text-sm font-semibold text-white transition hover:bg-accent-hover md:w-auto">TRACK WORKER <ArrowRight size={18} /></button></></section></main>;
  }

  if (stage === 'dispatch' && selectedService && dispatchResult) {
    return <main className="mx-auto flex min-h-screen max-w-4xl items-center px-5 py-10 md:px-10"><section className="w-full overflow-hidden rounded-[36px] border border-status-subtle bg-white p-6 md:p-12"><><p className="font-mono text-[11px] font-semibold tracking-[0.16em] text-accent-primary">RULE-BASED DISPATCH · DEMO</p><h1 className="mt-4 text-4xl font-extrabold leading-[0.92] tracking-[-0.06em] text-text-navy md:text-6xl">Finding the right worker.</h1><p className="mt-5 max-w-xl text-text-secondary">Matching verified {selectedService.name.toLowerCase()} skills, availability, service radius and geographic distance.</p><div className="mt-10 space-y-3">{dispatchResult.steps.slice(0, 4).map((step, index) => <div key={step.step} className={`flex items-center justify-between rounded-2xl border px-5 py-4 transition-all duration-500 ${index < visibleStep ? 'border-accent-primary/20 bg-accent-light opacity-100' : 'border-status-subtle bg-background-primary opacity-45'}`}><div className="flex items-center gap-4"><span className={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-[10px] ${index < visibleStep ? 'bg-accent-primary text-white' : 'bg-status-subtle text-text-secondary'}`}>{index < visibleStep ? <Check size={14} /> : step.step}</span><div><p className="font-semibold text-text-navy">{step.name}</p><p className="mt-0.5 text-xs text-text-secondary">{step.description}</p></div></div><span className="font-mono text-xs text-text-secondary">{index < visibleStep ? `${step.candidateCount} ELIGIBLE` : 'CHECKING'}</span></div>)}</div></></section></main>;
  }

  return (
    <main className="mx-auto max-w-[1400px] overflow-hidden px-4 pb-12 pt-6 sm:px-5 sm:pb-16 sm:pt-8 md:px-10 md:pt-14">
      <section className="relative grid min-h-[400px] items-end overflow-hidden rounded-[28px] border border-status-subtle bg-white px-5 py-8 sm:min-h-[460px] sm:rounded-[32px] sm:px-6 sm:py-10 md:grid-cols-2 md:rounded-[36px] md:px-12 md:py-14">
        <div className="relative z-10 max-w-xl"><p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-accent-primary sm:text-[10px] sm:tracking-[0.16em] md:text-[11px]">COOPERATIVE SERVICE NETWORK</p><h1 className="mt-4 text-[clamp(2.5rem,10vw,6.8rem)] font-extrabold leading-[0.83] tracking-[-0.075em] text-text-navy sm:mt-5 md:mt-6">LOCAL SKILLS.<br />SHARED OPPORTUNITY.</h1><p className="mt-5 max-w-sm text-sm leading-6 text-text-secondary sm:text-base sm:leading-6 md:mt-7">Find trusted cooperative workers for everyday services, right when you need them.</p><a href="#services" className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-accent-primary hover:gap-3 sm:text-sm md:mt-8"><span>EXPLORE SERVICES</span> <ArrowRight size={15} className="sm:h-[17px] sm:w-[17px]" /></a></div>
        <div aria-hidden="true" className="pointer-events-none relative min-h-[220px] sm:min-h-[250px] md:min-h-[390px]"><div className="absolute inset-x-[4%] bottom-[-25%] h-[76%] rounded-t-full bg-[#eaf1f8]" /><img src="/illustrations/hero.png" alt="" className="absolute bottom-[-10%] right-[-10%] h-[108%] max-w-[92%] object-contain object-bottom sm:right-[-8%] sm:h-[114%] sm:max-w-[90%] md:right-[3%]" /><div className="absolute bottom-[14%] left-[2%] hidden rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm md:block"><p className="font-mono text-[9px] tracking-[0.12em] text-text-secondary">PUNE · DEMO NETWORK</p><p className="mt-1 text-sm font-semibold text-text-navy">186 workers available</p></div></div>
        <div className="absolute bottom-5 right-5 hidden items-center gap-2 font-mono text-[9px] tracking-[0.11em] text-text-secondary sm:bottom-7 sm:right-7 sm:text-[10px] md:flex"><span className="h-2 w-2 rounded-full bg-accent-primary" /> VERIFIED COOPERATIVE NETWORK</div>
      </section>
      <section id="services" className="pt-14 sm:pt-20 md:pt-28"><div className="mb-6 flex items-end justify-between gap-6 sm:mb-9"><div><p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-text-secondary sm:text-[11px] sm:tracking-[0.16em]">01</p><h2 className="mt-2.5 text-3xl font-extrabold tracking-[-0.06em] text-text-navy sm:mt-3 sm:text-4xl md:text-5xl">What do you need?</h2></div><p className="hidden max-w-xs text-right text-sm leading-5 text-text-secondary md:block">Every request is routed through a verified cooperative worker network.</p></div><div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">{services.map((service, index) => <ServiceCard key={service.id} service={service} index={index} onSelect={() => selectService(service.id)} />)}</div></section>
      <section className="mt-10 grid gap-4 rounded-[24px] border border-status-subtle bg-white p-5 sm:mt-12 sm:gap-5 sm:rounded-[28px] sm:p-6 md:grid-cols-[1.35fr_1fr] md:rounded-[30px] md:p-9"><div><p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-accent-primary sm:text-[10px]">COOPERATIVE NETWORK</p><h2 className="mt-2.5 text-2xl font-extrabold tracking-[-0.05em] text-text-navy sm:mt-3 sm:text-3xl">Local workers. Shared trust.</h2><p className="mt-2.5 max-w-xl text-xs leading-6 text-text-secondary sm:mt-3 sm:text-sm">A simple service request connects you to verified workers from the Pune demonstration cooperative network.</p></div><div className="flex items-center gap-3 border-t border-status-subtle pt-4 sm:gap-4 sm:pt-5 md:border-l md:border-t-0 md:pl-8 md:pt-0"><div className="flex -space-x-2"><span className="h-8 w-8 rounded-full border-4 border-white bg-accent-primary sm:h-9 sm:w-9" /><span className="h-8 w-8 rounded-full border-4 border-white bg-[#d9d2c5] sm:h-9 sm:w-9" /><span className="h-8 w-8 rounded-full border-4 border-white bg-[#e0e4e7] sm:h-9 sm:w-9" /></div><p className="font-mono text-[9px] leading-5 tracking-[0.08em] text-text-secondary sm:text-[10px]">CUSTOMER → COOPERATIVE → VERIFIED WORKER</p></div></section>
    </main>
  );
}
