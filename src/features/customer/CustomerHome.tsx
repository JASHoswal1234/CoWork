import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Check, ShieldCheck, AlertCircle, RefreshCw } from 'lucide-react';
import type { ServiceCategory, ServiceSubcategory } from '../../types/service';
import { ServiceSelection } from './ServiceSelection';
import { ServiceDetails } from './ServiceDetails';
import { BookingForm } from './BookingForm';
import { servicesApi, workersApi, jobsApi, mlApi, filesApi } from '../../lib/api';

type CustomerStage = 'browse' | 'services' | 'details' | 'request' | 'dispatch' | 'select' | 'matched';

interface CandidateDisplay {
  id: string;
  name: string;
  phone?: string;
  rating: number;
  completedJobs: number;
  distanceKm: number;
  etaMinutes: number;
  photoUrl?: string;
  city?: string;
}

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

const diagnosisByService: Record<string, string> = {
  Plumbing: 'This looks like a likely pipe or fixture leak. A verified plumbing worker can inspect the connection and carry out the repair.',
  Electrical: 'The image may show a worn electrical fitting. For safety, a verified electrician should inspect the circuit before any repair.',
  Carpentry: 'This appears to need a furniture or fixture repair. A cooperative carpenter can assess the damaged fitting on arrival.',
  Painting: 'The image suggests a surface-preparation and repainting job. The worker can confirm the scope after inspecting the wall.',
  Cleaning: 'The image suggests a deep-cleaning request. The worker can confirm the materials and time needed on arrival.',
  'Appliance Repair': 'The appliance may need a diagnostic visit. A verified technician can inspect the unit and confirm the required repair.',
};

function ServiceCard({ service, index, onSelect }: { service: ServiceCategory; index: number; onSelect: () => void }) {
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
            {service.description.split(' including ')[0]}
          </p>
        </div>
        <div className="pt-5 sm:pt-6">
          <div className="mb-4 grid max-w-[260px] grid-cols-2 gap-2.5 sm:mb-5 sm:max-w-[280px] sm:gap-3">
            <div>
              <p className="font-mono text-[8px] font-semibold tracking-[0.12em] text-text-secondary sm:text-[9px]">ESTIMATE</p>
              <p className="mt-1 text-sm font-extrabold tracking-[-0.03em] text-text-navy sm:text-[15px]">
                {service.avgPrice.replace('-', '—')}
              </p>
            </div>
            <div className="border-l border-black/10 pl-2.5 sm:pl-3">
              <p className="font-mono text-[8px] font-semibold tracking-[0.12em] text-text-secondary sm:text-[9px]">TIME</p>
              <p className="mt-1 text-sm font-extrabold tracking-[-0.03em] text-text-navy sm:text-[15px]">
                {service.avgDuration.replace('hours', 'hrs').replace('hour', 'hr').toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onSelect}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-primary transition-transform group-hover:translate-x-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent-primary sm:gap-2 sm:text-sm"
          >
            REQUEST SERVICE <ArrowRight size={14} strokeWidth={2} className="sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>
      <img
        src={illustrationByService[service.name]}
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

  // Load real services from backend
  const [services, setServices] = useState<ServiceCategory[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  // Real customer GPS location
  const [customerLocation, setCustomerLocation] = useState({ lat: 18.5074, lng: 73.8077 }); // default Kothrud
  const [customerAddress, setCustomerAddress] = useState('Kothrud, Pune');
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    // Load real service categories from backend
    servicesApi.getCategories()
      .then((data: any) => {
        const cats = data?.categories || [];
        if (cats.length > 0) {
          // Map backend format to frontend ServiceCategory type
          const mapped: ServiceCategory[] = cats.map((c: any) => ({
            id: c.id,
            name: c.name,
            icon: c.icon || c.name.toLowerCase(),
            description: c.description || `Professional ${c.name} services`,
            avgPrice: `₹${c.avg_price_min || 300}—₹${c.avg_price_max || 2000}`,
            avgDuration: `${Math.round((c.avg_duration_min || 60) / 60)}-${Math.round((c.avg_duration_max || 120) / 60)} hrs`,
            subcategories: (c.subcategories || []).map((s: any) => ({
              id: s.id,
              name: s.name,
              description: s.description || s.name,
              requiredSkills: [c.name],
              priceRange: { min: s.price_min, max: s.price_max },
              durationRange: { min: s.duration_min, max: s.duration_max },
            })),
          }));
          setServices(mapped);
        }
      })
      .catch(() => {}) // silently fall back to mock
      .finally(() => setServicesLoading(false));

    // Get real GPS location
    if (navigator.geolocation) {
      setLocationLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCustomerLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setCustomerAddress('Your location');
          setLocationLoading(false);
        },
        () => setLocationLoading(false), // fall back to Kothrud on denial
        { timeout: 5000 }
      );
    }
  }, []);

  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'urgent'>('normal');
  const [selectedWorkerIndex, setSelectedWorkerIndex] = useState<number>(0);
  const [visibleStep, setVisibleStep] = useState(0);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [aiDiagnosisBadge, setAiDiagnosisBadge] = useState<string | null>(null);
  const [candidates, setCandidates] = useState<CandidateDisplay[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [createdJobId, setCreatedJobId] = useState<string | null>(null);
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);

  const selectedService = useMemo(
    () => services.find((service) => service.id === selectedServiceId),
    [services, selectedServiceId]
  );

  const selectedSubcategory: ServiceSubcategory | undefined = useMemo(
    () => selectedService?.subcategories.find((sub) => sub.id === selectedSubcategoryId),
    [selectedService, selectedSubcategoryId]
  );

  /** Starting estimate = selected service's minimum price (fallback to category min). */
  const startingEstimate = useMemo(() => {
    if (selectedSubcategory) return selectedSubcategory.priceRange.min;
    if (selectedService && selectedService.subcategories.length > 0) {
      return Math.min(...selectedService.subcategories.map((s) => s.priceRange.min));
    }
    return 0;
  }, [selectedSubcategory, selectedService]);

  useEffect(() => {
    if (stage !== 'dispatch') return;
    const timer = setInterval(() => {
      setVisibleStep((prev) => {
        if (prev >= 4) {
          clearInterval(timer);
          // Only advance to selection once the search actually returned workers.
          // Otherwise land on the "no workers" state instead of a fake success.
          setCandidates((current) => {
            setStage(current.length > 0 ? 'select' : 'request');
            if (current.length === 0) {
              setSearchError((prevErr) => prevErr ?? 'No verified workers are available nearby right now.');
            }
            return current;
          });
          return 4;
        }
        return prev + 1;
      });
    }, 450);
    return () => clearInterval(timer);
  }, [stage]);

  // Step 1 of the flow: pick a category -> open its service list.
  const selectCategory = (serviceId: string) => {
    setSelectedServiceId(serviceId);
    setSelectedSubcategoryId(null);
    setDescription('');
    setUploadedImage(null);
    setUploadedFile(null);
    setIsDiagnosing(false);
    setAiDiagnosisBadge(null);
    setCandidates([]);
    setSearchError(null);
    setBookingError(null);
    setCreatedJobId(null);
    setStage('services');
  };

  // Step 2: pick a specific service/subcategory -> open its detail screen.
  const selectSubcategory = (subcategory: ServiceSubcategory) => {
    setSelectedSubcategoryId(subcategory.id);
    setStage('details');
  };

  // Step 3: from details, begin the request/booking form.
  const startBooking = () => {
    setSearchError(null);
    setBookingError(null);
    setStage('request');
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedService) return;

    const reader = new FileReader();
    setUploadedFile(file);
    reader.onloadend = () => {
      setUploadedImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    setIsDiagnosing(true);
    setAiDiagnosisBadge(null);

    try {
      const res = await mlApi.analyzeImage(file);
      if (res?.analysis) {
        const analysis = res.analysis;
        const note = `${analysis.problem_title ? analysis.problem_title + '. ' : ''}${analysis.problem_description || ''}`;
        setDescription(note.trim() || diagnosisByService[selectedService.name]);
        if (analysis.urgency === 'immediate' || analysis.severity === 'high') {
          setUrgency('urgent');
        }
        setAiDiagnosisBadge(
          `Severity: ${(analysis.severity || 'Medium').toUpperCase()} · ${(analysis.suggested_actions || [])[0] || 'Verified'}`
        );
      } else {
        setDescription(diagnosisByService[selectedService.name]);
      }
    } catch (err) {
      console.warn('Gemini vision API error, falling back to local diagnosis:', err);
      setDescription(diagnosisByService[selectedService.name]);
      setAiDiagnosisBadge('Photo reviewed by local diagnostic rules');
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleFindWorker = async () => {
    if (!selectedService || description.trim().length < 5) return;

    // Reset any previous results/errors and start the search animation.
    setCandidates([]);
    setSearchError(null);
    setBookingError(null);
    setSelectedWorkerIndex(0);
    setVisibleStep(1);
    setStage('dispatch');

    // PHASE 2A: Use real customer GPS location (not hardcoded mock coordinates)
    const searchLocation = customerLocation; // Already captured from browser GPS or fallback
    const searchTerm = selectedService.name;

    try {
      // PHASE 2A: Real backend PostGIS worker search
      const res = await workersApi.searchNearby(
        searchLocation.lat,
        searchLocation.lng,
        searchTerm
      );

      const realWorkers = res.workers || [];

      if (realWorkers.length > 0) {
        const mappedCandidates: CandidateDisplay[] = realWorkers.map((w: any) => ({
          id: w.worker_id || w.id,
          name: w.name || 'Verified Specialist',
          phone: w.phone,
          rating: w.rating ? Number(w.rating) : 4.8,
          completedJobs: w.completed_jobs || 120,
          distanceKm: w.distance_km || Number((w.distance_meters / 1000).toFixed(1)) || 2.5,
          etaMinutes: w.eta_minutes || 10,
          photoUrl: w.photo_url || illustrationByService[selectedService.name],
          city: w.city || 'Pune',
        }));
        setCandidates(mappedCandidates);
      } else {
        // No workers found - this is a real scenario, not an error
        setCandidates([]);
      }
    } catch (err) {
      console.error('Worker search failed:', err);
      // PHASE 2A: Do NOT fall back to mock data
      // Show clear error instead
      setCandidates([]);
      setSearchError('Unable to search for workers. Please check your connection and try again.');
    }
  };

  const retryFromRequest = () => {
    setSearchError(null);
    setStage('request');
  };

  const handleBookWorker = async () => {
    if (!selectedService || candidates.length === 0) return;
    setIsBooking(false);

    const chosen = candidates[selectedWorkerIndex];
    const price = startingEstimate > 0 ? startingEstimate : selectedService.subcategories[0]?.priceRange.min ?? 500;

    // Navigate to map immediately — don't block on API
    const tempJobId = `temp-${Date.now()}`;
    setCreatedJobId(tempJobId);
    setStage('matched');

    // Fire-and-forget: save the job in the background
    const doCreate = async () => {
      const uploadedPhotoUrl = uploadedFile
        ? (await filesApi.uploadJobPhoto(uploadedFile)).url
        : undefined;

      const res = await jobsApi.create({
        service_category_id: selectedService.id,
        service_category_name: selectedService.name,
        service_subcategory_name: selectedSubcategory?.name,
        description: description.trim() || `${selectedService.name} service request`,
        address: customerAddress,
        location: customerLocation,
        estimated_price: price,
        worker_id: chosen.id,
        problem_image_urls: uploadedPhotoUrl ? [uploadedPhotoUrl] : [],
      });

      if (res?.job?.id) {
        setCreatedJobId(res.job.id);
      }
    };

    doCreate().catch((err) => {
      console.error('Background job creation failed:', err);
    });
  };

  // Stage: category-specific service discovery
  if (stage === 'services' && selectedService) {
    return (
      <ServiceSelection
        category={selectedService}
        illustration={illustrationByService[selectedService.name]}
        surfaceClass={surfaceByService[selectedService.name] || 'bg-[#f5f5f5]'}
        onSelectService={selectSubcategory}
        onBack={() => setStage('browse')}
      />
    );
  }

  // Stage: single service detail
  if (stage === 'details' && selectedService && selectedSubcategory) {
    return (
      <ServiceDetails
        category={selectedService}
        service={selectedSubcategory}
        illustration={illustrationByService[selectedService.name]}
        surfaceClass={surfaceByService[selectedService.name] || 'bg-[#f5f5f5]'}
        onRequestService={startBooking}
        onBack={() => setStage('services')}
      />
    );
  }

  // Stage: request / booking form (reuses existing behaviour, keeps service context)
  if (stage === 'request' && selectedService && selectedSubcategory) {
    return (
      <div>
        <BookingForm
          category={selectedService}
          service={selectedSubcategory}
          description={description}
          setDescription={setDescription}
          urgency={urgency}
          setUrgency={setUrgency}
          uploadedImage={uploadedImage}
          isDiagnosing={isDiagnosing}
          aiDiagnosisBadge={aiDiagnosisBadge}
          onUpload={handleImageUpload}
          onBack={() => setStage('details')}
          onFind={handleFindWorker}
        />
        {searchError && (
          <div className="mx-auto max-w-6xl px-4 pb-10 sm:px-5 md:px-10">
            <div className="flex flex-col items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <AlertCircle size={20} className="mt-0.5 flex-shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-text-navy">No workers found</p>
                  <p className="mt-1 text-sm text-text-secondary">{searchError}</p>
                </div>
              </div>
              <button
                onClick={handleFindWorker}
                disabled={description.trim().length < 5 || isDiagnosing}
                className="inline-flex items-center gap-2 rounded-2xl bg-accent-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-status-neutral"
              >
                <RefreshCw size={15} /> Try again
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Worker Selection Screen
  if (stage === 'select' && selectedService && candidates.length > 0) {
    const chosen = candidates[selectedWorkerIndex];
    return (
      <main className="mx-auto flex min-h-screen max-w-5xl items-center px-5 py-10 md:px-10">
        <section className="w-full overflow-hidden rounded-[36px] border border-status-subtle bg-white p-6 md:p-12">
          <div className="flex items-center justify-between">
            <p className="font-mono text-[11px] font-semibold tracking-[0.16em] text-accent-primary">
              WORKERS FOUND NEAR KOTHRUD
            </p>
            <span className="rounded-full bg-green-50 px-3 py-1 font-mono text-[10px] font-bold text-green-700">
              {candidates.length} AVAILABLE NOW
            </span>
          </div>
          <h1 className="mt-4 text-4xl font-extrabold leading-[0.92] tracking-[-0.06em] text-text-navy md:text-5xl">
            Choose your worker.
          </h1>
          <p className="mt-4 max-w-2xl text-text-secondary">
            We found {candidates.length} verified {selectedService.name.toLowerCase()} workers nearby. Select a worker to book immediate service.
          </p>

          <div className="mt-8 space-y-4">
            {candidates.map((candidate, index) => {
              const isSelected = selectedWorkerIndex === index;
              const isNearest = index === 0;
              return (
                <button
                  key={candidate.id || index}
                  onClick={() => setSelectedWorkerIndex(index)}
                  className={`group w-full text-left transition-all ${
                    isSelected
                      ? 'rounded-2xl border-2 border-accent-primary bg-accent-light/30 shadow-sm'
                      : 'rounded-2xl border border-status-subtle bg-white hover:border-accent-primary/40 hover:bg-accent-light/10'
                  }`}
                >
                  <div className="p-5 md:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-[#e8e5e0] text-xl md:h-16 md:w-16 md:text-2xl">
                          🛠
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-extrabold tracking-[-0.04em] text-text-navy md:text-2xl">
                              {candidate.name}
                            </h3>
                            {isNearest && (
                              <span className="rounded-full bg-accent-primary px-2.5 py-0.5 font-mono text-[9px] font-bold tracking-[0.08em] text-white">
                                NEAREST
                              </span>
                            )}
                          </div>

                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-text-secondary">
                            <span className="font-semibold text-text-navy">★ {candidate.rating}</span>
                            <span>·</span>
                            <span>{candidate.completedJobs} jobs</span>
                            <span>·</span>
                            <span className="flex items-center gap-1 font-medium text-accent-primary">
                              <ShieldCheck size={14} />
                              Cooperative Verified
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-shrink-0 gap-6 text-right">
                        <div>
                          <p className="font-mono text-[9px] tracking-[0.12em] text-text-secondary">DISTANCE</p>
                          <p className="mt-1 text-xl font-extrabold tracking-[-0.04em] text-text-navy">
                            {candidate.distanceKm.toFixed(1)} KM
                          </p>
                        </div>
                        <div>
                          <p className="font-mono text-[9px] tracking-[0.12em] text-text-secondary">ETA</p>
                          <p className="mt-1 text-xl font-extrabold tracking-[-0.04em] text-accent-primary">
                            {Math.max(candidate.etaMinutes, 6)} MIN
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {bookingError && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
              <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-red-600" />
              <div>
                <p className="text-sm font-semibold text-red-700">Booking failed</p>
                <p className="mt-1 text-sm text-red-600">{bookingError}</p>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-status-subtle pt-6 sm:flex-row">
            <button
              onClick={() => setStage('request')}
              className="text-xs font-semibold text-text-secondary hover:text-text-navy"
            >
              ← Back to request
            </button>
            <button
              onClick={handleBookWorker}
              disabled={isBooking}
              className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-accent-primary px-7 py-4 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:opacity-50 sm:w-auto"
            >
              {isBooking ? 'BOOKING WORKER…' : `BOOK ${chosen.name.split(' ')[0].toUpperCase()}`}
              <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </main>
    );
  }

  // Matched / Booked Screen
  if (stage === 'matched' && selectedService && candidates.length > 0) {
    const chosen = candidates[selectedWorkerIndex];
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl items-center px-5 py-10 md:px-10">
        <section className="w-full overflow-hidden rounded-[36px] border border-status-subtle bg-white p-6 md:p-12">
          <p className="font-mono text-[11px] font-semibold tracking-[0.16em] text-accent-primary">
            WORKER BOOKED · JOB #{createdJobId?.slice(-6) || 'ACTIVE'}
          </p>
          <div className="mt-6 grid gap-6 md:grid-cols-[1fr_0.85fr] md:items-end">
            <div>
              <h1 className="text-5xl font-extrabold leading-[0.88] tracking-[-0.07em] text-text-navy md:text-6xl">
                {chosen.name.toUpperCase()}
              </h1>
              <p className="mt-4 flex items-center gap-2 text-sm font-semibold text-text-secondary">
                <ShieldCheck size={18} className="text-accent-primary" /> VERIFIED COOPERATIVE WORKER
              </p>
              <p className="mt-6 text-lg text-text-secondary">
                {selectedService.name} specialist · {chosen.completedJobs} completed jobs · ★ {chosen.rating}
              </p>
            </div>
            <div className={`relative min-h-[230px] overflow-hidden rounded-[28px] ${surfaceByService[selectedService.name]}`}>
              <img
                src={illustrationByService[selectedService.name]}
                alt=""
                className="absolute bottom-[-11%] right-[3%] h-[108%] w-full object-contain"
              />
            </div>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 border-y border-status-subtle py-6">
            <div>
              <p className="font-mono text-[10px] tracking-[0.12em] text-text-secondary">DISTANCE</p>
              <p className="mt-2 text-2xl font-extrabold tracking-[-0.04em]">{chosen.distanceKm.toFixed(1)} KM</p>
            </div>
            <div>
              <p className="font-mono text-[10px] tracking-[0.12em] text-text-secondary">ETA</p>
              <p className="mt-2 text-2xl font-extrabold tracking-[-0.04em] text-accent-primary">
                {Math.max(chosen.etaMinutes, 6)} MIN
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              navigate(`/job/${createdJobId}`, {
                state: {
                  service: selectedService.name,
                  subcategory: selectedSubcategory?.name,
                  worker: chosen,
                  eta: Math.max(chosen.etaMinutes, 6),
                  jobId: createdJobId,
                  price: startingEstimate,
                },
              })
            }
            className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-accent-primary px-6 py-4 text-sm font-semibold text-white transition hover:bg-accent-hover md:w-auto"
          >
            TRACK WORKER LIVE <ArrowRight size={18} />
          </button>
        </section>
      </main>
    );
  }

  // Dispatch / Finding Animation Screen
  if (stage === 'dispatch' && selectedService) {
    const steps = [
      { step: 1, name: 'Geospatial Proximity', description: 'Searching within 25km radius in Pune' },
      { step: 2, name: 'Skill Verification', description: `Matching verified ${selectedService.name} certifications` },
      { step: 3, name: 'Availability Check', description: 'Confirming active on-demand status' },
      { step: 4, name: 'Ranking Candidates', description: 'Sorting by arrival ETA and member rating' },
    ];

    return (
      <main className="mx-auto flex min-h-screen max-w-4xl items-center px-5 py-10 md:px-10">
        <section className="w-full overflow-hidden rounded-[36px] border border-status-subtle bg-white p-6 md:p-12">
          <p className="font-mono text-[11px] font-semibold tracking-[0.16em] text-accent-primary">
            GEOSPATIAL DISPATCH ENGINE
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-[0.92] tracking-[-0.06em] text-text-navy md:text-6xl">
            Finding the right worker.
          </h1>
          <p className="mt-5 max-w-xl text-text-secondary">
            Matching verified {selectedService.name.toLowerCase()} skills, real-time availability, and geographic proximity across Pune.
          </p>
          <div className="mt-10 space-y-3">
            {steps.map((step, index) => (
              <div
                key={step.step}
                className={`flex items-center justify-between rounded-2xl border px-5 py-4 transition-all duration-500 ${
                  index < visibleStep
                    ? 'border-accent-primary/20 bg-accent-light opacity-100'
                    : 'border-status-subtle bg-background-primary opacity-45'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full font-mono text-[10px] ${
                      index < visibleStep ? 'bg-accent-primary text-white' : 'bg-status-subtle text-text-secondary'
                    }`}
                  >
                    {index < visibleStep ? <Check size={14} /> : step.step}
                  </span>
                  <div>
                    <p className="font-semibold text-text-navy">{step.name}</p>
                    <p className="mt-0.5 text-xs text-text-secondary">{step.description}</p>
                  </div>
                </div>
                <span className="font-mono text-xs text-text-secondary">
                  {index < visibleStep ? 'VERIFIED' : 'CHECKING'}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>
    );
  }

  // Browse Services Screen
  return (
    <main className="mx-auto max-w-[1400px] overflow-hidden px-4 pb-12 pt-6 sm:px-5 sm:pb-16 sm:pt-8 md:px-10 md:pt-14">
      <section className="relative grid min-h-[400px] items-end overflow-hidden rounded-[28px] border border-status-subtle bg-white px-5 py-8 sm:min-h-[460px] sm:rounded-[32px] sm:px-6 sm:py-10 md:grid-cols-2 md:rounded-[36px] md:px-12 md:py-14">
        <div className="relative z-10 max-w-xl">
          <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-accent-primary sm:text-[10px] sm:tracking-[0.16em] md:text-[11px]">
            COOPERATIVE SERVICE NETWORK
          </p>
          <h1 className="mt-4 text-[clamp(2.5rem,10vw,6.8rem)] font-extrabold leading-[0.83] tracking-[-0.075em] text-text-navy sm:mt-5 md:mt-6">
            LOCAL SKILLS.
            <br />
            SHARED OPPORTUNITY.
          </h1>
          <p className="mt-5 max-w-sm text-sm leading-6 text-text-secondary sm:text-base sm:leading-6 md:mt-7">
            Find trusted cooperative workers for everyday home services, right when you need them.
          </p>
          <a
            href="#services"
            className="mt-6 inline-flex items-center gap-2 text-xs font-semibold text-accent-primary hover:gap-3 sm:text-sm md:mt-8"
          >
            <span>EXPLORE SERVICES</span> <ArrowRight size={15} className="sm:h-[17px] sm:w-[17px]" />
          </a>
        </div>
        <div aria-hidden="true" className="pointer-events-none relative min-h-[220px] sm:min-h-[250px] md:min-h-[390px]">
          <div className="absolute inset-x-[4%] bottom-[-25%] h-[76%] rounded-t-full bg-[#eaf1f8]" />
          <img
            src="/illustrations/hero.png"
            alt=""
            className="absolute bottom-[-10%] right-[-10%] h-[108%] max-w-[92%] object-contain object-bottom sm:right-[-8%] sm:h-[114%] sm:max-w-[90%] md:right-[3%]"
          />
          <div className="absolute bottom-[14%] left-[2%] hidden rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-sm md:block">
            <p className="font-mono text-[9px] tracking-[0.12em] text-text-secondary">PUNE · ACTIVE NETWORK</p>
            <p className="mt-1 text-sm font-semibold text-text-navy">6 Verified Specialists Available</p>
          </div>
        </div>
        <div className="absolute bottom-5 right-5 hidden items-center gap-2 font-mono text-[9px] tracking-[0.11em] text-text-secondary sm:bottom-7 sm:right-7 sm:text-[10px] md:flex">
          <span className="h-2 w-2 rounded-full bg-accent-primary" /> VERIFIED COOPERATIVE NETWORK
        </div>
      </section>

      <section id="services" className="pt-14 sm:pt-20 md:pt-28">
        <div className="mb-6 flex items-end justify-between gap-6 sm:mb-9">
          <div>
            <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-text-secondary sm:text-[11px] sm:tracking-[0.16em]">
              01
            </p>
            <h2 className="mt-2.5 text-3xl font-extrabold tracking-[-0.06em] text-text-navy sm:mt-3 sm:text-4xl md:text-5xl">
              What do you need?
            </h2>
          </div>
          <p className="hidden max-w-xs text-right text-sm leading-5 text-text-secondary md:block">
            Every request is dispatched through our verified cooperative worker network in Pune.
          </p>
        </div>
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} onSelect={() => selectCategory(service.id)} />
          ))}
        </div>
      </section>

      <section className="mt-10 grid gap-4 rounded-[24px] border border-status-subtle bg-white p-5 sm:mt-12 sm:gap-5 sm:rounded-[28px] sm:p-6 md:grid-cols-[1.35fr_1fr] md:rounded-[30px] md:p-9">
        <div>
          <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-accent-primary sm:text-[10px]">
            COOPERATIVE NETWORK
          </p>
          <h2 className="mt-2.5 text-2xl font-extrabold tracking-[-0.05em] text-text-navy sm:mt-3 sm:text-3xl">
            Local workers. Shared trust.
          </h2>
          <p className="mt-2.5 max-w-xl text-xs leading-6 text-text-secondary sm:mt-3 sm:text-sm">
            Every service booking connects you directly with verified cooperative members in Pune, ensuring transparent rates and fair earnings.
          </p>
        </div>
        <div className="flex items-center gap-3 border-t border-status-subtle pt-4 sm:gap-4 sm:pt-5 md:border-l md:border-t-0 md:pl-8 md:pt-0">
          <div className="flex -space-x-2">
            <span className="h-8 w-8 rounded-full border-4 border-white bg-accent-primary sm:h-9 sm:w-9" />
            <span className="h-8 w-8 rounded-full border-4 border-white bg-[#d9d2c5] sm:h-9 sm:w-9" />
            <span className="h-8 w-8 rounded-full border-4 border-white bg-[#e0e4e7] sm:h-9 sm:w-9" />
          </div>
          <p className="font-mono text-[9px] leading-5 tracking-[0.08em] text-text-secondary sm:text-[10px]">
            CUSTOMER → COOPERATIVE → VERIFIED WORKER
          </p>
        </div>
      </section>
    </main>
  );
}
