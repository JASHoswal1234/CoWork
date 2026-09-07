import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Camera, 
  MapPin, 
  Clock, 
  Calendar, 
  Zap, 
  ShieldCheck, 
  AlertCircle, 
  X, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  IndianRupee,
  Navigation
} from 'lucide-react';
import type { ServiceCategory } from '../../types/service';
import { filesApi, mlApi, geospatialApi } from '../../lib/api';

interface CreateServiceRequestProps {
  categories: ServiceCategory[];
  initialCategory?: ServiceCategory | null;
  customerLocation?: { lat: number; lng: number } | null;
  customerAddress?: string;
  onBack: () => void;
  onSubmit: (requestData: {
    serviceCategoryId?: string;
    serviceCategoryName: string;
    serviceSubcategoryName?: string;
    title: string;
    description: string;
    address: string;
    location: { lat: number; lng: number };
    preferredDate: string;
    preferredTime: string;
    urgency: 'normal' | 'urgent' | 'emergency';
    minBudget?: number;
    maxBudget?: number;
    estimatedPrice: number;
    problemImageUrls: string[];
    additionalInstructions?: string;
  }) => Promise<void>;
}

interface ImageUploadItem {
  id: string;
  file: File;
  previewUrl: string;
  uploadedUrl?: string;
  isUploading: boolean;
  error?: string;
}

export function CreateServiceRequest({
  categories,
  initialCategory,
  customerLocation: initialLocation,
  customerAddress: initialAddress,
  onBack,
  onSubmit,
}: CreateServiceRequestProps) {
  // Step State (1: General Problem, 2: Job Details)
  const [step, setStep] = useState<1 | 2>(1);

  // 1. Service Category & Problem
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(
    initialCategory || categories[0] || null
  );
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // 2. Images & AI Vision Diagnosis
  const [images, setImages] = useState<ImageUploadItem[]>([]);
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [aiDiagnosis, setAiDiagnosis] = useState<{
    problem_title?: string;
    problem_description?: string;
    severity?: string;
    urgency?: string;
    estimated_price_range?: { min: number; max: number };
  } | null>(null);

  // 3. Location
  const [address, setAddress] = useState(initialAddress || '');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(initialLocation || null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationDetected, setLocationDetected] = useState(Boolean(initialLocation));

  // 4. Preferred Date & Time
  const todayStr = new Date().toISOString().split('T')[0];
  const [preferredDate, setPreferredDate] = useState('Today');
  const [customDate, setCustomDate] = useState(todayStr);
  const [preferredTime, setPreferredTime] = useState('Today, 6:00–8:00 PM');
  const [customTime, setCustomTime] = useState('');

  // 5. Urgency
  const [urgency, setUrgency] = useState<'normal' | 'urgent' | 'emergency'>('normal');

  // 6. Budget
  const [minBudget, setMinBudget] = useState<string>('500');
  const [maxBudget, setMaxBudget] = useState<string>('800');

  // 7. Additional Instructions
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  // Form Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedCategory && categories.length > 0) {
      setSelectedCategory(initialCategory || categories[0]);
    }
  }, [categories, initialCategory, selectedCategory]);

  const handleDetectLocation = () => {
    if (isLocating) return;
    if (!navigator || !navigator.geolocation) {
      setFormError('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setLocationDetected(false);
    setFormError(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        if (
          typeof lat !== 'number' ||
          typeof lng !== 'number' ||
          !isFinite(lat) ||
          !isFinite(lng) ||
          lat < -90 ||
          lat > 90 ||
          lng < -180 ||
          lng > 180
        ) {
          setIsLocating(false);
          setFormError('Unable to determine valid GPS coordinates. Please try again.');
          return;
        }

        // Store true browser GPS coordinates
        setLocation({ lat, lng });

        try {
          const res = await geospatialApi.reverseGeocode(lat, lng);
          if (res && res.address) {
            setAddress(res.address);
          } else {
            setAddress('Current Location');
          }
        } catch (geoErr) {
          console.warn('Reverse geocode error:', geoErr);
          setAddress('Current Location');
        } finally {
          setIsLocating(false);
          setLocationDetected(true);
          setTimeout(() => setLocationDetected(false), 5000);
        }
      },
      (err: GeolocationPositionError) => {
        setIsLocating(false);
        setLocationDetected(false);
        let userMessage = 'Unable to determine your current location. Please try again.';

        switch (err.code) {
          case err.PERMISSION_DENIED:
            userMessage = 'Location permission was denied. Please allow location access in your browser settings and try again.';
            break;
          case err.POSITION_UNAVAILABLE:
            userMessage = 'Unable to determine your current location. Please try again.';
            break;
          case err.TIMEOUT:
            userMessage = 'Location request timed out. Please try again.';
            break;
          default:
            userMessage = 'Unable to determine your current location. Please try again.';
        }
        setFormError(userMessage);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter((file) => {
      if (!file.type.startsWith('image/')) return false;
      if (file.size > 10 * 1024 * 1024) return false;
      return true;
    });

    if (validFiles.length === 0) return;

    const newItems: ImageUploadItem[] = validFiles.map((file) => ({
      id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      isUploading: true,
    }));

    setImages((prev) => [...prev, ...newItems].slice(0, 5));
    setFormError(null);

    if (newItems.length > 0 && !aiDiagnosis) {
      setIsDiagnosing(true);
      mlApi
        .analyzeImage(newItems[0].file)
        .then((diag) => {
          if (diag) {
            setAiDiagnosis(diag);
            if (diag.problem_title && !title) setTitle(diag.problem_title);
            if (diag.problem_description && !description) setDescription(diag.problem_description);
            if (diag.urgency) setUrgency((diag.urgency.toLowerCase() as any) || 'normal');
            if (diag.estimated_price_range) {
              setMinBudget(String(diag.estimated_price_range.min || 400));
              setMaxBudget(String(diag.estimated_price_range.max || 800));
            }
          }
        })
        .catch((err) => console.warn('AI analysis error:', err))
        .finally(() => setIsDiagnosing(false));
    }

    for (const item of newItems) {
      try {
        const uploadRes = await filesApi.uploadJobPhoto(item.file);
        setImages((prev) =>
          prev.map((img) =>
            img.id === item.id
              ? { ...img, isUploading: false, uploadedUrl: uploadRes.url }
              : img
          )
        );
      } catch (err) {
        console.warn('Image upload error:', err);
        setImages((prev) =>
          prev.map((img) =>
            img.id === item.id
              ? { ...img, isUploading: false, error: 'Upload failed' }
              : img
          )
        );
      }
    }
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) {
      setFormError('Please select a service domain / category.');
      return;
    }
    if (!title.trim()) {
      setFormError('Please enter your specific problem or service needed (e.g., Wire fixing).');
      return;
    }
    if (!address.trim()) {
      setFormError('Please enter your service location address.');
      return;
    }

    setFormError(null);
    setStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) {
      setFormError('Please select a service category.');
      setStep(1);
      return;
    }
    if (!title.trim()) {
      setFormError('Please enter a problem title.');
      setStep(1);
      return;
    }
    if (!address.trim()) {
      setFormError('Please enter your service location address.');
      setStep(1);
      return;
    }

    const finalDescription = description.trim() || title.trim();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const uploadedUrls = images
        .map((img) => img.uploadedUrl || img.previewUrl)
        .filter(Boolean);

      const minB = Number(minBudget) || 500;
      const maxB = Number(maxBudget) || 800;
      const estimatedPrice = Math.round((minB + maxB) / 2);

      const effectiveDate = preferredDate === 'Custom' ? customDate : preferredDate;
      const effectiveTime = preferredTime === 'Custom' ? customTime : preferredTime;

      await onSubmit({
        serviceCategoryId: selectedCategory.id,
        serviceCategoryName: selectedCategory.name,
        title: title.trim(),
        description: finalDescription,
        address: address.trim(),
        location: location || { lat: 18.5204, lng: 73.8567 },
        preferredDate: effectiveDate,
        preferredTime: effectiveTime,
        urgency,
        minBudget: minB,
        maxBudget: maxB,
        estimatedPrice,
        problemImageUrls: uploadedUrls,
        additionalInstructions: additionalInstructions.trim() || undefined,
      });
    } catch (err: any) {
      console.error('Submission error:', err);
      setFormError(err.message || 'Failed to submit service request.');
      setIsSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:py-12">
      <div className="overflow-hidden rounded-[28px] border border-status-subtle bg-white shadow-sm sm:rounded-[36px]">
        {/* Header Banner */}
        <div className="border-b border-status-subtle bg-background-primary px-6 py-6 sm:px-10 sm:py-8">
          <button
            onClick={step === 2 ? () => setStep(1) : onBack}
            className="inline-flex items-center gap-2 font-mono text-xs font-semibold text-text-secondary hover:text-text-navy"
          >
            <ArrowLeft size={16} /> {step === 2 ? 'BACK TO STEP 1' : 'BACK TO SERVICES'}
          </button>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-mono text-[10px] font-semibold tracking-[0.16em] text-accent-primary sm:text-[11px]">
                SHRAMSANGAM COOPERATIVE DISPATCH
              </p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-[-0.05em] text-text-navy sm:text-4xl">
                Request a Service
              </h1>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-accent-light/50 px-3.5 py-1.5 font-mono text-[11px] font-semibold text-accent-primary">
              <ShieldCheck size={16} /> Verified Cooperative Workers
            </div>
          </div>

          {/* Two-Step Progress Indicator */}
          <div className="mt-6 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition ${
                step === 1
                  ? 'bg-accent-primary text-white shadow-sm'
                  : 'bg-white text-text-navy border border-status-subtle'
              }`}
            >
              <span>1. General Problem & Domain</span>
            </button>
            <div className="h-0.5 w-6 bg-status-subtle" />
            <button
              type="button"
              onClick={() => {
                if (title && address) setStep(2);
              }}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition ${
                step === 2
                  ? 'bg-accent-primary text-white shadow-sm'
                  : 'bg-white/60 text-text-tertiary border border-status-subtle'
              }`}
            >
              <span>2. Job Details & Budget</span>
            </button>
          </div>
        </div>

        {/* Global Form Error Message */}
        {formError && (
          <div className="mx-6 mt-6 sm:mx-10 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4">
            <AlertCircle size={18} className="mt-0.5 flex-shrink-0 text-red-600" />
            <p className="text-sm font-medium text-red-700">{formError}</p>
          </div>
        )}

        {/* STEP 1: GENERAL PROBLEM & SERVICE DOMAIN */}
        {step === 1 && (
          <form onSubmit={handleProceedToStep2} className="space-y-8 p-6 sm:p-10">
            {/* SECTION 1: Service Category / Domain */}
            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-text-navy">
                1. Service Domain / Category <span className="text-red-500">*</span>
              </label>
              <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-6">
                {categories.map((cat) => {
                  const isSelected = selectedCategory?.id === cat.id;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat)}
                      className={`flex flex-col items-center justify-center rounded-2xl border p-3 text-center transition-all ${
                        isSelected
                          ? 'border-accent-primary bg-accent-light text-accent-primary font-bold shadow-sm'
                          : 'border-status-subtle bg-white text-text-secondary hover:border-accent-primary/40 hover:text-text-navy'
                      }`}
                    >
                      <span className="text-2xl mb-1">
                        {cat.name === 'Plumbing' && '🔧'}
                        {cat.name === 'Electrical' && '⚡'}
                        {cat.name === 'Carpentry' && '🪚'}
                        {cat.name === 'Painting' && '🎨'}
                        {cat.name === 'Cleaning' && '🧹'}
                        {cat.name === 'Appliance Repair' && '🔌'}
                        {cat.name === 'Gardening' && '🌱'}
                        {cat.name === 'Driver' && '🚗'}
                        {cat.name === 'Caregiving' && '🩺'}
                        {cat.name === 'Technician' && '🛠️'}
                        {!['Plumbing','Electrical','Carpentry','Painting','Cleaning','Appliance Repair','Gardening','Driver','Caregiving','Technician'].includes(cat.name) && '🛠️'}
                      </span>
                      <span className="text-xs tracking-tight">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 2: Specific Problem Title */}
            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-text-navy">
                2. What problem do you need fixed? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Wire fixing, switchboard spark, kitchen sink pipe leakage, lock repair"
                className="mt-2 w-full rounded-2xl border border-status-subtle bg-white px-4 py-3.5 text-sm font-medium text-text-navy placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
                required
              />
              <p className="mt-1 text-[11px] text-text-tertiary">
                This demand will be broadcast to all qualified specialists in the selected <strong>{selectedCategory?.name || 'service'}</strong> domain.
              </p>
            </div>

            {/* SECTION 3: Service Location */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-text-navy">
                  3. Service Location <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={isLocating}
                  className={`inline-flex items-center gap-1.5 font-mono text-[10px] font-bold transition ${
                    isLocating
                      ? 'text-text-tertiary cursor-not-allowed'
                      : locationDetected
                      ? 'text-emerald-600'
                      : 'text-accent-primary hover:underline'
                  }`}
                >
                  <Navigation size={12} className={isLocating ? 'animate-spin' : ''} />
                  {isLocating
                    ? 'DETECTING LOCATION…'
                    : locationDetected
                    ? 'LOCATION DETECTED ✓'
                    : 'USE CURRENT GPS'}
                </button>
              </div>
              <div className="mt-2 flex items-center rounded-2xl border border-status-subtle bg-white px-3.5 py-1 focus-within:border-accent-primary focus-within:ring-2 focus-within:ring-accent-primary/20">
                <MapPin size={18} className="text-accent-primary flex-shrink-0 mr-2" />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => {
                    setAddress(e.target.value);
                    setLocationDetected(false);
                  }}
                  placeholder="Enter street address, locality, city"
                  className="w-full py-2.5 text-sm font-medium text-text-navy placeholder:text-text-tertiary focus:outline-none"
                  required
                />
              </div>
            </div>

            {/* SECTION 4: Preferred Date & Time */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-text-navy">
                  4. Preferred Date
                </label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {['Today', 'Tomorrow', 'Custom'].map((d) => (
                    <button
                      type="button"
                      key={d}
                      onClick={() => setPreferredDate(d)}
                      className={`rounded-xl border py-2.5 text-xs font-semibold transition ${
                        preferredDate === d
                          ? 'border-accent-primary bg-accent-light text-accent-primary'
                          : 'border-status-subtle bg-white text-text-secondary hover:text-text-navy'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                {preferredDate === 'Custom' && (
                  <input
                    type="date"
                    min={todayStr}
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="mt-2 w-full rounded-xl border border-status-subtle p-2.5 text-xs font-medium text-text-navy"
                  />
                )}
              </div>

              <div>
                <label className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-text-navy">
                  5. Preferred Time Slot
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {['ASAP (within 1 hr)', 'Today, 6:00–8:00 PM', 'Tomorrow 10 AM–12 PM', 'Custom'].map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setPreferredTime(t)}
                      className={`rounded-xl border py-2.5 px-2 text-[11px] font-semibold transition text-center ${
                        preferredTime === t
                          ? 'border-accent-primary bg-accent-light text-accent-primary'
                          : 'border-status-subtle bg-white text-text-secondary hover:text-text-navy'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 1 Action CTA */}
            <div className="border-t border-status-subtle pt-6 flex items-center justify-between">
              <button
                type="button"
                onClick={onBack}
                className="text-xs font-semibold text-text-secondary hover:text-text-navy"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-2xl bg-accent-primary px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-accent-hover active:scale-[0.98]"
              >
                <span>NEXT: JOB DETAILS & PHOTOS</span>
                <Sparkles size={16} />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: JOB DETAILS, BUDGET & PHOTOS */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-8 p-6 sm:p-10">
            {/* Selected Domain Summary Badge */}
            <div className="flex items-center justify-between rounded-2xl bg-accent-light/40 p-4 border border-accent-primary/20">
              <div>
                <p className="font-mono text-[9px] font-bold tracking-wider text-accent-primary uppercase">
                  DOMAIN: {selectedCategory?.name}
                </p>
                <p className="text-base font-extrabold text-text-navy">{title}</p>
                <p className="text-xs text-text-secondary">{address}</p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="font-mono text-xs font-bold text-accent-primary underline hover:text-accent-hover"
              >
                Edit Step 1
              </button>
            </div>

            {/* SECTION 1: Estimated Budget */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-text-navy">
                  1. Estimated Amount / Budget (INR)
                </label>
                <span className="font-mono text-[10px] text-text-tertiary">FINALIZED WITH WORKER ON SITE</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div className="flex items-center rounded-2xl border border-status-subtle bg-white px-3.5 py-1">
                  <span className="font-mono text-xs font-bold text-text-tertiary mr-2">MIN ₹</span>
                  <input
                    type="number"
                    value={minBudget}
                    onChange={(e) => setMinBudget(e.target.value)}
                    placeholder="500"
                    className="w-full py-2.5 text-sm font-bold text-text-navy focus:outline-none"
                  />
                </div>
                <div className="flex items-center rounded-2xl border border-status-subtle bg-white px-3.5 py-1">
                  <span className="font-mono text-xs font-bold text-text-tertiary mr-2">MAX ₹</span>
                  <input
                    type="number"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    placeholder="800"
                    className="w-full py-2.5 text-sm font-bold text-text-navy focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: Problem Photos Upload */}
            <div>
              <div className="flex items-center justify-between">
                <label className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-text-navy">
                  2. Upload Problem Images
                </label>
                <span className="font-mono text-[10px] text-text-tertiary">OPTIONAL · UP TO 5 PHOTOS</span>
              </div>
              <p className="mt-1 text-xs text-text-secondary">
                Upload photos of the damaged wire, pipe, or broken appliance to help workers arrive with the right tools.
              </p>

              <div className="mt-3.5 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className="group relative aspect-square overflow-hidden rounded-2xl border border-status-subtle bg-background-primary"
                  >
                    <img
                      src={img.previewUrl}
                      alt="Problem preview"
                      className="h-full w-full object-cover"
                    />
                    {img.isUploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="absolute right-1.5 top-1.5 rounded-full bg-black/70 p-1 text-white opacity-90 transition hover:bg-black group-hover:opacity-100"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}

                {images.length < 5 && (
                  <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-status-subtle bg-background-primary/60 p-3 text-center transition hover:border-accent-primary/60 hover:bg-accent-light/20">
                    <Camera size={22} className="text-accent-primary" />
                    <span className="mt-1.5 text-[11px] font-semibold text-text-navy">Add Photo</span>
                    <span className="text-[9px] text-text-tertiary">PNG / JPG</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* AI Vision Insights Card */}
              {isDiagnosing && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-accent-light/40 px-3.5 py-2.5 text-xs text-accent-primary">
                  <Sparkles size={16} className="animate-spin" />
                  <span>AI Vision assistant analyzing problem photos...</span>
                </div>
              )}
              {aiDiagnosis && !isDiagnosing && (
                <div className="mt-3 flex items-center gap-2 rounded-xl border border-accent-primary/20 bg-accent-light/30 px-3.5 py-2.5 text-xs text-text-navy">
                  <Sparkles size={15} className="text-accent-primary flex-shrink-0" />
                  <span>
                    <strong>AI Analysis:</strong> Identified {aiDiagnosis.problem_title || 'issue'} ({aiDiagnosis.severity || 'standard'} severity).
                  </span>
                </div>
              )}
            </div>

            {/* SECTION 3: Detailed Problem Description */}
            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-text-navy">
                3. Detailed Problem Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide additional details on what happened (e.g. One of the wires in my kitchen is damaged and sparking when switch is turned on)..."
                className="mt-2 w-full rounded-2xl border border-status-subtle bg-white p-4 text-sm font-medium text-text-navy placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/20"
              />
            </div>

            {/* SECTION 4: Urgency Level */}
            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-text-navy">
                4. Urgency Level
              </label>
              <div className="mt-2 grid grid-cols-3 gap-3">
                {[
                  { key: 'normal', label: 'Normal', desc: 'Standard turnaround' },
                  { key: 'urgent', label: 'Urgent', desc: 'Required today' },
                  { key: 'emergency', label: 'Emergency', desc: 'Active hazard/leak' },
                ].map((u) => {
                  const isSelected = urgency === u.key;
                  return (
                    <button
                      type="button"
                      key={u.key}
                      onClick={() => setUrgency(u.key as any)}
                      className={`rounded-2xl border p-3.5 text-left transition ${
                        isSelected
                          ? u.key === 'emergency'
                            ? 'border-red-500 bg-red-50 text-red-700'
                            : 'border-accent-primary bg-accent-light text-accent-primary'
                          : 'border-status-subtle bg-white text-text-secondary hover:text-text-navy'
                      }`}
                    >
                      <p className="text-xs font-bold uppercase tracking-wider">{u.label}</p>
                      <p className="mt-0.5 text-[10px] opacity-80">{u.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SECTION 5: Additional Instructions */}
            <div>
              <label className="block font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-text-navy">
                5. Additional Instructions / Notes (Optional)
              </label>
              <input
                type="text"
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                placeholder="e.g., Gate code is #402, please call 5 mins prior to arrival"
                className="mt-2 w-full rounded-2xl border border-status-subtle bg-white px-4 py-3 text-sm font-medium text-text-navy placeholder:text-text-tertiary focus:border-accent-primary focus:outline-none"
              />
            </div>

            {/* Step 2 Action CTA */}
            <div className="border-t border-status-subtle pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-text-secondary hover:text-text-navy"
              >
                ← Back to Step 1
              </button>
              <button
                type="submit"
                disabled={isSubmitting || images.some((img) => img.isUploading)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-accent-primary px-8 py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-accent-hover active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>DISPATCHING REQUEST…</span>
                  </>
                ) : (
                  <>
                    <span>SUBMIT SERVICE REQUEST</span>
                    <Zap size={16} fill="currentColor" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
