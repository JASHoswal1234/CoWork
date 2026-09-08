import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Check, 
  ShieldCheck, 
  AlertCircle, 
  RefreshCw, 
  Zap, 
  ListOrdered, 
  Radio, 
  Sparkles,
  MapPin,
  Clock,
  UserCheck
} from 'lucide-react';
import type { ServiceCategory, ServiceSubcategory } from '../../types/service';
import { CreateServiceRequest } from './CreateServiceRequest';
import { ServiceSelection } from './ServiceSelection';
import { MyServiceRequests } from './MyServiceRequests';
import { servicesApi, jobsApi, workersApi, geospatialApi } from '../../lib/api';

type CustomerStage = 'browse' | 'select' | 'request' | 'dispatch' | 'matched' | 'my_requests';

const illustrationByService: Record<string, string> = {
  Plumbing: '/illustrations/plumber.png',
  Electrical: '/illustrations/electrician.png',
  Carpentry: '/illustrations/carpenter.png',
  Painting: '/illustrations/painting.png',
  Cleaning: '/illustrations/cleaning.png',
  'Appliance Repair': '/illustrations/appliance-repair.png',
};

const surfaceByService: Record<string, string> = {
  Plumbing: 'bg-[#e3f2fd]',
  Electrical: 'bg-[#fff3e0]',
  Carpentry: 'bg-[#f3e5f5]',
  Painting: 'bg-[#e8f5e9]',
  Cleaning: 'bg-[#fce4ec]',
  'Appliance Repair': 'bg-[#fff8e1]',
};

function ServiceCard({
  service,
  index,
  onSelect,
}: {
  service: ServiceCategory;
  index: number;
  onSelect: () => void;
}) {
  const featured = index === 0;
  const bgColor = surfaceByService[service.name] || 'bg-[#f5f5f5]';

  return (
    <article
      className={`group relative isolate flex min-h-[300px] overflow-hidden rounded-[20px] border border-black/5 ${bgColor} p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_45px_rgba(18,18,18,0.09)] sm:min-h-[340px] sm:rounded-[24px] sm:p-6 ${
        featured ? 'md:col-span-2 md:min-h-[430px]' : ''
      }`}
    >
      <div className="relative z-10 flex max-w-[60%] flex-col justify-between sm:max-w-[58%]">
        <div>
          <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-text-secondary sm:text-[10px] sm:tracking-[0.16em]">
            {String(index + 1).padStart(2, '0')}
          </p>
          <h3
            className={`mt-3 font-extrabold tracking-[-0.055em] text-text-navy sm:mt-4 ${
              featured ? 'text-3xl sm:text-4xl md:text-5xl' : 'text-2xl sm:text-3xl'
            }`}
          >
            {service.name}
          </h3>
          <p className="mt-2.5 text-xs leading-5 text-text-secondary sm:mt-3 sm:text-sm">
            {service.description?.split(' including ')[0] || `Professional ${service.name} services`}
          </p>
        </div>
        <div className="pt-5 sm:pt-6">
          <div className="mb-4 grid max-w-[260px] grid-cols-2 gap-2.5 sm:mb-5 sm:max-w-[280px] sm:gap-3">
            <div>
              <p className="font-mono text-[8px] font-semibold tracking-[0.12em] text-text-secondary sm:text-[9px]">
                ESTIMATE
              </p>
              <p className="mt-1 text-sm font-extrabold tracking-[-0.03em] text-text-navy sm:text-[15px]">
                {service.avgPrice?.replace('-', '—') || '₹400—₹900'}
              </p>
            </div>
            <div className="border-l border-black/10 pl-2.5 sm:pl-3">
              <p className="font-mono text-[8px] font-semibold tracking-[0.12em] text-text-secondary sm:text-[9px]">
                RESPONSE
              </p>
              <p className="mt-1 text-sm font-extrabold tracking-[-0.03em] text-text-navy sm:text-[15px]">
                &lt; 15 MIN
              </p>
            </div>
          </div>
          <button
            onClick={onSelect}
            className="inline-flex items-center gap-1.5 rounded-xl bg-text-navy px-4 py-2.5 text-xs font-bold text-white transition-all group-hover:bg-accent-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-primary sm:gap-2 sm:text-sm"
          >
            REQUEST SERVICE <ArrowRight size={14} strokeWidth={2} className="sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>
      <img
        src={illustrationByService[service.name] || '/illustrations/hero.png'}
        alt={`${service.name} service illustration`}
        className={`pointer-events-none absolute bottom-[-6%] right-[-12%] z-0 h-[82%] max-w-[72%] object-contain object-bottom transition-transform duration-500 group-hover:scale-[1.045] group-hover:-rotate-1 sm:right-[-9%] sm:h-[87%] sm:max-w-[70%] ${
          featured ? 'md:h-[104%] md:right-[1%] md:max-w-[52%]' : ''
        }`}
      />
    </article>
  );
}

export function CustomerHome() {
  const navigate = useNavigate();
  const [stage, setStage] = useState<CustomerStage>('browse');

  // Service categories
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  // Selected Category for creation form
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  // Selected Sub-service within the chosen category
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | null>(null);

  // GPS Location
  const [customerLocation, setCustomerLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [customerAddress, setCustomerAddress] = useState<string>('');

  // Active Job & Matched Worker State
  const [activeJob, setActiveJob] = useState<any>(null);
  const [assignedWorker, setAssignedWorker] = useState<any>(null);
  const [matchingProgress, setMatchingProgress] = useState(1);
  const [dispatchedCount, setDispatchedCount] = useState(3);

  // Load Real Categories on Mount
  useEffect(() => {
    servicesApi
      .getCategories()
      .then((data: any) => {
        const cats = data?.categories || [];
        if (cats.length > 0) {
          const mapped: ServiceCategory[] = cats.map((c: any) => ({
            id: c.id,
            name: c.name,
            icon: c.icon || c.name.toLowerCase(),
            description: c.description || `Professional ${c.name} services`,
            avgPrice: `₹${c.avg_price_min || 300}—₹${c.avg_price_max || 2000}`,
            avgDuration: `${Math.round((c.avg_duration_min || 60) / 60)}-${Math.round((c.avg_duration_max || 120) / 60)} hrs`,
            subcategories: Array.isArray(c.subcategories)
              ? c.subcategories.map((s: any) => ({
                  id: s.id,
                  name: s.name,
                  description: s.description || '',
                  requiredSkills: [],
                  priceRange: { min: s.price_min || 300, max: s.price_max || 1500 },
                  durationRange: { min: s.duration_min || 30, max: s.duration_max || 120 },
                }))
              : [],
          }));
          setServices(mapped);
        }
      })
      .catch((err) => console.warn('Could not load categories:', err))
      .finally(() => setServicesLoading(false));

    // Get real GPS on mount with accurate settings
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          if (isFinite(lat) && isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
            setCustomerLocation({ lat, lng });
            try {
              const res = await geospatialApi.reverseGeocode(lat, lng);
              if (res?.address) {
                setCustomerAddress(res.address);
              } else {
                setCustomerAddress(`Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
              }
            } catch {
              setCustomerAddress(`Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
            }
          }
        },
        () => {},
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
      );
    }
  }, []);

  // Poll for worker acceptance when in dispatch mode
  useEffect(() => {
    if (stage !== 'dispatch' || !activeJob?.id) return;

    // Simulate animated dispatch steps
    const progressTimer = setInterval(() => {
      setMatchingProgress((prev) => (prev < 4 ? prev + 1 : prev));
    }, 800);

    // Poll backend for real worker acceptance
    const pollInterval = setInterval(async () => {
      try {
        const res = await jobsApi.getById(activeJob.id);
        if (res?.job) {
          const updatedJob = res.job;
          setActiveJob(updatedJob);

          // If worker accepted
          if (
            updatedJob.worker_id &&
            ['accepted', 'on_the_way', 'arrived', 'in_progress', 'completed'].includes(updatedJob.status)
          ) {
            clearInterval(pollInterval);
            clearInterval(progressTimer);

            // Fetch worker details
            try {
              const workerRes = await workersApi.getById(updatedJob.worker_id);
              if (workerRes?.worker) {
                setAssignedWorker(workerRes.worker);
              }
            } catch (wErr) {
              console.warn('Worker profile fetch error:', wErr);
            }

            setStage('matched');
          }
        }
      } catch (pollErr) {
        console.warn('Job polling error:', pollErr);
      }
    }, 2500);

    return () => {
      clearInterval(progressTimer);
      clearInterval(pollInterval);
    };
  }, [stage, activeJob?.id]);

  // Handler: Category selected → show sub-service selection
  const handleStartRequest = (cat?: ServiceCategory) => {
    const category = cat || services[0] || null;
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setStage('select');
  };

  // Handler: Sub-service selected → open the request form
  const handleSelectSubcategory = (subcategory: ServiceSubcategory) => {
    setSelectedSubcategory(subcategory);
    setStage('request');
  };

  // Handler: Submit Request
  const handleSubmitRequest = async (requestData: any) => {
    // Call backend POST /api/jobs
    const payload = {
      service_category_id: requestData.serviceCategoryId,
      service_category_name: requestData.serviceCategoryName,
      service_subcategory_name: requestData.serviceSubcategoryName,
      title: requestData.title,
      description: requestData.description,
      address: requestData.address,
      location: requestData.location,
      preferred_date: requestData.preferredDate,
      preferred_time: requestData.preferredTime,
      urgency: requestData.urgency,
      min_budget: requestData.minBudget,
      max_budget: requestData.maxBudget,
      estimated_price: requestData.estimatedPrice,
      problem_image_urls: requestData.problemImageUrls,
      additional_instructions: requestData.additionalInstructions,
    };

    const res = await jobsApi.create(payload);
    if (res?.job) {
      setActiveJob(res.job);
      setAssignedWorker(null);
      setMatchingProgress(1);
      setStage('dispatch');
    }
  };

  // STAGE: Sub-service Selection
  if (stage === 'select' && selectedCategory) {
    return (
      <ServiceSelection
        category={selectedCategory}
        illustration={illustrationByService[selectedCategory.name]}
        surfaceClass={surfaceByService[selectedCategory.name] || 'bg-[#f5f5f5]'}
        onSelectService={handleSelectSubcategory}
        onBack={() => setStage('browse')}
      />
    );
  }

  // STAGE: Request a Service Form
  if (stage === 'request') {
    return (
      <CreateServiceRequest
        categories={services}
        initialCategory={selectedCategory}
        initialSubcategory={selectedSubcategory}
        customerLocation={customerLocation}
        customerAddress={customerAddress}
        onBack={() => setStage('select')}
        onSubmit={handleSubmitRequest}
      />
    );
  }

  // STAGE: My Service Requests History
  if (stage === 'my_requests') {
    return (
      <div>
        <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6">
          <button
            onClick={() => setStage('browse')}
            className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-text-secondary hover:text-text-navy"
          >
            ← BACK TO EXPLORE SERVICES
          </button>
        </div>
        <MyServiceRequests onNewRequest={() => handleStartRequest()} />
      </div>
    );
  }

  // STAGE: Finding Suitable Workers (Radar / Dispatch Screen)
  if (stage === 'dispatch' && activeJob) {
    const steps = [
      { step: 1, name: 'Geospatial Proximity', desc: 'Querying available verified workers within 10 km in Pune' },
      { step: 2, name: 'Skill & Category Verification', desc: `Matching certified ${activeJob.service_category_name || 'service'} specialists` },
      { step: 3, name: 'Availability & Workload', desc: 'Filtering active on-duty cooperative members' },
      { step: 4, name: 'Request Broadcasted', desc: `Dispatched service request to candidate workers` },
    ];

    return (
      <main className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-10 sm:px-6 md:px-10">
        <section className="w-full overflow-hidden rounded-[32px] border border-status-subtle bg-white p-6 md:p-12">
          {/* Header */}
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-accent-primary sm:text-[11px]">
              DISPATCH ENGINE ACTIVE · JOB #{activeJob.job_number || activeJob.id?.slice(-6).toUpperCase()}
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 font-mono text-[10px] font-bold text-amber-700">
              <span className="h-2 w-2 animate-ping rounded-full bg-amber-500" />
              FINDING WORKERS
            </span>
          </div>

          <h1 className="mt-4 text-3xl font-extrabold leading-tight tracking-[-0.05em] text-text-navy sm:text-5xl">
            Finding suitable workers…
          </h1>
          <p className="mt-3 text-sm text-text-secondary sm:text-base">
            Your request for <strong>{activeJob.service_category_name}: {activeJob.title || activeJob.description?.slice(0, 30)}</strong> has been broadcasted to verified workers nearby.
          </p>

          {/* Dispatch Steps */}
          <div className="mt-8 space-y-3">
            {steps.map((s, idx) => {
              const isDone = idx < matchingProgress;
              const isCurrent = idx === matchingProgress - 1;
              return (
                <div
                  key={s.step}
                  className={`flex items-center justify-between rounded-2xl border px-5 py-4 transition-all duration-500 ${
                    isDone
                      ? 'border-accent-primary/20 bg-accent-light/40 opacity-100'
                      : isCurrent
                      ? 'border-amber-300 bg-amber-50/50 opacity-100'
                      : 'border-status-subtle bg-background-primary opacity-40'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-xs font-bold ${
                        isDone
                          ? 'bg-accent-primary text-white'
                          : isCurrent
                          ? 'bg-amber-500 text-white animate-pulse'
                          : 'bg-status-subtle text-text-secondary'
                      }`}
                    >
                      {isDone ? <Check size={14} /> : s.step}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-text-navy">{s.name}</p>
                      <p className="text-xs text-text-secondary">{s.desc}</p>
                    </div>
                  </div>
                  <span className="font-mono text-xs font-bold text-text-secondary">
                    {isDone ? 'COMPLETED' : isCurrent ? 'DISPATCHING…' : 'WAITING'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Live Radar animation footer */}
          <div className="mt-8 rounded-2xl border border-dashed border-status-subtle bg-background-primary/60 p-5 text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-accent-light text-accent-primary">
              <Radio size={20} className="animate-pulse text-accent-primary" />
            </div>
            <p className="mt-2 text-xs font-bold text-text-navy">
              Awaiting worker acceptance...
            </p>
            <p className="mt-0.5 text-[11px] text-text-secondary">
              The first verified worker to accept will be automatically assigned. You will be notified instantly.
            </p>
          </div>

          <div className="mt-6 flex justify-between items-center">
            <button
              onClick={() => setStage('my_requests')}
              className="font-mono text-xs font-semibold text-text-secondary hover:text-text-navy"
            >
              View in My Requests →
            </button>
            <button
              onClick={() => setStage('browse')}
              className="text-xs font-semibold text-text-tertiary hover:text-text-secondary"
            >
              Back to Home
            </button>
          </div>
        </section>
      </main>
    );
  }

  // STAGE: Worker Found Screen
  if (stage === 'matched' && activeJob) {
    const workerName = assignedWorker?.user?.name || assignedWorker?.name || activeJob.worker_name || 'Rajesh Kumar';
    const workerRating = assignedWorker?.rating || 4.8;
    const completedJobs = assignedWorker?.completed_jobs || 124;
    const distanceKm = 2.1;

    return (
      <main className="mx-auto flex min-h-screen max-w-4xl items-center px-4 py-10 sm:px-6 md:px-10">
        <section className="w-full overflow-hidden rounded-[32px] border border-status-subtle bg-white p-6 sm:p-10 md:p-12">
          {/* Header Banner */}
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] font-bold tracking-[0.16em] text-accent-primary sm:text-[11px]">
              WORKER ASSIGNED · JOB #{activeJob.job_number || activeJob.id?.slice(-6).toUpperCase()}
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 font-mono text-[10px] font-bold text-green-700">
              <UserCheck size={12} />
              WORKER ACCEPTED
            </span>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-wider text-text-tertiary">
                WORKER FOUND
              </p>
              <h1 className="mt-1 text-4xl font-extrabold tracking-[-0.05em] text-text-navy sm:text-5xl">
                {workerName}
              </h1>

              <div className="mt-3 flex items-center gap-2 text-sm text-text-navy">
                <ShieldCheck size={18} className="text-accent-primary" />
                <span className="font-bold">Verified {activeJob.service_category_name} Specialist</span>
              </div>
              <p className="mt-0.5 text-xs text-text-secondary">
                ShramSangam Cooperative Network
              </p>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                <span className="font-bold text-text-navy">★ {workerRating}</span>
                <span>·</span>
                <span className="text-text-secondary">{completedJobs} completed jobs</span>
                <span>·</span>
                <span className="font-semibold text-accent-primary">{distanceKm} km away</span>
              </div>

              {/* Job summary info */}
              <div className="mt-6 rounded-2xl bg-background-primary p-4 space-y-1">
                <p className="text-xs font-bold text-text-navy">
                  Problem: {activeJob.title || activeJob.description?.slice(0, 40)}
                </p>
                <p className="text-xs text-text-secondary">
                  Location: {activeJob.customer_address?.split(',')[0] || customerAddress}
                </p>
                <p className="text-xs font-bold text-accent-primary">
                  Status: Confirmed
                </p>
              </div>
            </div>

            <div className={`relative min-h-[220px] overflow-hidden rounded-[24px] ${surfaceByService[activeJob.service_category_name] || 'bg-[#e3f2fd]'}`}>
              <img
                src={illustrationByService[activeJob.service_category_name] || '/illustrations/hero.png'}
                alt="Worker service"
                className="absolute bottom-[-10%] right-[0%] h-[108%] w-full object-contain"
              />
            </div>
          </div>

          {/* Action CTA */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-status-subtle pt-6">
            <button
              onClick={() => setStage('my_requests')}
              className="text-xs font-semibold text-text-secondary hover:text-text-navy"
            >
              View My Requests
            </button>
            <button
              onClick={() =>
                navigate(`/job/${activeJob.id}`, {
                  state: {
                    service: activeJob.service_category_name,
                    worker: {
                      name: workerName,
                      rating: workerRating,
                      completedJobs,
                      distanceKm,
                    },
                    jobId: activeJob.id,
                    price: activeJob.estimated_price || 500,
                    customerLocation,
                  },
                })
              }
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-accent-primary px-8 py-4 text-sm font-bold text-white shadow-lg transition hover:bg-accent-hover"
            >
              <span>TRACK WORKER LIVE</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </main>
    );
  }

  // STAGE: Browse Services & Homepage
  return (
    <main className="mx-auto max-w-[1400px] overflow-hidden px-4 pb-12 pt-6 sm:px-5 sm:pb-16 sm:pt-8 md:px-10 md:pt-14">
      {/* Hero Section */}
      <section className="relative grid min-h-[400px] items-end overflow-hidden rounded-[28px] border border-status-subtle bg-white px-5 py-8 sm:min-h-[460px] sm:rounded-[32px] sm:px-6 sm:py-10 md:grid-cols-2 md:rounded-[36px] md:px-12 md:py-14">
        <div className="relative z-10 max-w-xl">
          <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-accent-primary sm:text-[10px] sm:tracking-[0.16em] md:text-[11px]">
            SHRAMSANGAM · COOPERATIVE SERVICE NETWORK
          </p>
          <h1 className="mt-4 text-[clamp(2.5rem,10vw,6.8rem)] font-extrabold leading-[0.83] tracking-[-0.075em] text-text-navy sm:mt-5 md:mt-6">
            LOCAL SKILLS.
            <br />
            SHARED TRUST.
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-6 text-text-secondary sm:text-base sm:leading-6 md:mt-7">
            Request trusted cooperative home services in seconds. We match and dispatch certified nearby workers directly.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3 sm:gap-4 md:mt-8">
            <button
              onClick={() => handleStartRequest()}
              className="inline-flex items-center gap-2 rounded-2xl bg-accent-primary px-6 py-3.5 text-xs font-bold text-white shadow-md transition-all hover:bg-accent-hover active:scale-[0.98] sm:text-sm"
            >
              <Zap size={16} fill="currentColor" />
              <span>REQUEST A SERVICE</span>
            </button>

            <button
              onClick={() => setStage('my_requests')}
              className="inline-flex items-center gap-2 rounded-2xl border border-status-subtle bg-background-primary px-5 py-3.5 text-xs font-semibold text-text-navy transition hover:bg-white sm:text-sm"
            >
              <ListOrdered size={16} />
              <span>MY REQUESTS</span>
            </button>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none relative min-h-[220px] sm:min-h-[250px] md:min-h-[390px]"
        >
          <div className="absolute inset-x-[4%] bottom-[-25%] h-[76%] rounded-t-full bg-[#eaf1f8]" />
          <img
            src="/illustrations/hero.png"
            alt=""
            className="absolute bottom-[-10%] right-[-10%] h-[108%] max-w-[92%] object-contain object-bottom sm:right-[-8%] sm:h-[114%] sm:max-w-[90%] md:right-[3%]"
          />
          <div className="absolute bottom-[14%] left-[2%] hidden rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm md:block">
            <p className="font-mono text-[9px] tracking-[0.12em] text-text-secondary">
              PUNE · ACTIVE NETWORK
            </p>
            <p className="mt-1 text-sm font-semibold text-text-navy">
              10+ Verified Specialists Ready
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="pt-14 sm:pt-20 md:pt-28">
        <div className="mb-6 flex items-end justify-between gap-6 sm:mb-9">
          <div>
            <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-text-secondary sm:text-[11px] sm:tracking-[0.16em]">
              01
            </p>
            <h2 className="mt-2.5 text-3xl font-extrabold tracking-[-0.06em] text-text-navy sm:mt-3 sm:text-4xl md:text-5xl">
              What service do you need?
            </h2>
          </div>
          <p className="hidden max-w-xs text-right text-sm leading-5 text-text-secondary md:block">
            Select a service category to request verified cooperative workers in Pune.
          </p>
        </div>

        {servicesLoading ? (
          <div className="py-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-accent-primary border-t-transparent" />
            <p className="mt-3 text-sm text-text-secondary">Loading services…</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                index={index}
                onSelect={() => handleStartRequest(service)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Trust Banner */}
      <section className="mt-10 grid gap-4 rounded-[24px] border border-status-subtle bg-white p-5 sm:mt-12 sm:gap-5 sm:rounded-[28px] sm:p-6 md:grid-cols-[1.35fr_1fr] md:rounded-[30px] md:p-9">
        <div>
          <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-accent-primary sm:text-[10px]">
            COOPERATIVE GOVERNANCE
          </p>
          <h2 className="mt-2.5 text-2xl font-extrabold tracking-[-0.05em] text-text-navy sm:mt-3 sm:text-3xl">
            Worker-Owned. Fair Pay. Guaranteed Quality.
          </h2>
          <p className="mt-2.5 max-w-xl text-xs leading-6 text-text-secondary sm:mt-3 sm:text-sm">
            Unlike commercial platforms that take 30%+ commissions, ShramSangam ensures workers retain 85% of earnings while building verified skill credentials.
          </p>
        </div>
        <div className="flex items-center gap-3 border-t border-status-subtle pt-4 sm:gap-4 sm:pt-5 md:border-l md:border-t-0 md:pl-8 md:pt-0">
          <div className="flex -space-x-2">
            <span className="h-8 w-8 rounded-full border-4 border-white bg-accent-primary sm:h-9 sm:w-9" />
            <span className="h-8 w-8 rounded-full border-4 border-white bg-[#d9d2c5] sm:h-9 sm:w-9" />
            <span className="h-8 w-8 rounded-full border-4 border-white bg-[#e0e4e7] sm:h-9 sm:w-9" />
          </div>
          <p className="font-mono text-[9px] leading-5 tracking-[0.08em] text-text-secondary sm:text-[10px]">
            SERVICE REQUEST → PROXIMITY DISPATCH → ATOMIC ASSIGNMENT
          </p>
        </div>
      </section>
    </main>
  );
}
