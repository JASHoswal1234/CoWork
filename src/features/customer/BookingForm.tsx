import React from 'react';
import { ArrowRight, Check, Clock, ImagePlus, MapPin, Sparkles, AlertCircle } from 'lucide-react';
import type { ServiceCategory, ServiceSubcategory } from '../../types/service';
import { formatAmount, formatDurationShort } from '../../utils/formatters';

/**
 * BookingForm
 *
 * The customer request/booking step. This preserves the existing SHRAMSANGAM
 * request-form behaviour (photo upload + Gemini diagnosis, description, location,
 * urgency, and "find a worker") and adds a booking summary that carries the
 * selected category + service context and a starting estimate derived from the
 * selected service's minimum price.
 *
 * All request/booking side effects (image analysis, worker search) stay in
 * CustomerHome; this component only renders and delegates via callbacks.
 */

const formPanelSurface = 'bg-[#eaf1f8]';

interface BookingFormProps {
  category: ServiceCategory;
  service: ServiceSubcategory;
  description: string;
  setDescription: (value: string) => void;
  urgency: 'normal' | 'urgent';
  setUrgency: (value: 'normal' | 'urgent') => void;
  uploadedImage: string | null;
  isDiagnosing: boolean;
  aiDiagnosisBadge: string | null;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onBack: () => void;
  onFind: () => void;
}

export function BookingForm({
  category,
  service,
  description,
  setDescription,
  urgency,
  setUrgency,
  uploadedImage,
  isDiagnosing,
  aiDiagnosisBadge,
  onUpload,
  onBack,
  onFind,
}: BookingFormProps) {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-6 sm:px-5 sm:py-8 md:px-10 md:py-14">
      <button
        onClick={onBack}
        className="mb-6 min-h-[44px] font-mono text-xs font-semibold tracking-[0.1em] text-text-secondary hover:text-accent-primary sm:mb-8 md:mb-10"
      >
        ← BACK TO SERVICE DETAILS
      </button>
      <div className="grid items-start gap-6 sm:gap-7 md:gap-8 lg:grid-cols-[0.82fr_1.18fr]">
        <aside
          className={`relative min-h-[360px] overflow-hidden rounded-[28px] ${formPanelSurface} p-6 sm:min-h-[420px] sm:rounded-[32px] sm:p-7 md:min-h-[680px] md:rounded-[36px] md:p-10 lg:sticky lg:top-28`}
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <div className="absolute bottom-[-15%] right-[-10%] h-[65%] w-[65%] rounded-full bg-white/30 sm:bg-white/35 md:bottom-[-10%] md:right-[-8%] md:h-[60%] md:w-[60%]" />
            <img
              src="/illustrations/form-illustration.png"
              alt=""
              className="absolute bottom-[-8%] right-[-15%] h-[108%] w-auto max-w-none opacity-75 sm:bottom-[-7%] sm:opacity-80 md:bottom-[-5%] md:right-[-12%] md:h-[115%] md:opacity-85"
              style={{ objectFit: 'contain', objectPosition: 'bottom right' }}
            />
          </div>

          <div className="relative z-10 flex h-full flex-col">
            <div className="max-w-[78%] sm:max-w-[74%] md:max-w-[72%]">
              <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-text-secondary sm:text-[10px] sm:tracking-[0.16em]">
                ON-DEMAND SERVICE
              </p>
              <h1 className="mt-3 text-[clamp(2rem,7vw,2.75rem)] font-extrabold leading-[0.92] tracking-[-0.06em] text-text-navy sm:mt-4">
                {service.name}, when you need it.
              </h1>
            </div>

            {/* Booking summary: carries category + service context */}
            <div className="mt-6 rounded-2xl border border-white/60 bg-white/70 p-4 backdrop-blur-sm sm:mt-7">
              <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-text-tertiary sm:text-[10px]">
                BOOKING SUMMARY
              </p>
              <dl className="mt-3 space-y-2.5 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-text-secondary">Category</dt>
                  <dd className="font-semibold text-text-navy">{category.name}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-text-secondary">Service</dt>
                  <dd className="text-right font-semibold text-text-navy">{service.name}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-1 text-text-secondary">
                    <Clock size={13} className="text-accent-primary" /> Duration
                  </dt>
                  <dd className="font-semibold text-text-navy">
                    {formatDurationShort(service.durationRange.min)}–
                    {formatDurationShort(service.durationRange.max)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-status-subtle pt-2.5">
                  <dt className="text-text-secondary">Starting estimate</dt>
                  <dd className="text-lg font-extrabold tracking-[-0.03em] text-accent-primary">
                    ₹{formatAmount(service.priceRange.min)}
                  </dd>
                </div>
              </dl>
              <p className="mt-2 text-[11px] leading-4 text-text-tertiary">
                Starting estimate only. The final price is confirmed by the worker on site.
              </p>
            </div>

            <div className="mt-auto pt-6 sm:pt-7 md:pt-8">
              <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-accent-primary sm:text-[10px]">
                PUNE · COOPERATIVE NETWORK
              </p>
            </div>
          </div>
        </aside>

        <section className="rounded-[24px] border border-status-subtle bg-white p-5 sm:rounded-[28px] sm:p-6 md:rounded-[32px] md:p-10">
          <div className="mb-7 flex items-center gap-2.5 font-mono text-[9px] font-semibold tracking-[0.12em] text-text-secondary sm:mb-8 sm:gap-3 sm:text-[10px] md:mb-10">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-primary text-white sm:h-7 sm:w-7">
              1
            </span>{' '}
            DESCRIBE
            <span className="h-px w-6 bg-status-subtle sm:w-8" />
            <span>2 MATCH</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-[-0.045em] text-text-navy md:text-4xl">
            Tell us what needs attention.
          </h2>
          <p className="mt-3 max-w-lg text-text-secondary">
            We’ll use your request to find an available, verified cooperative worker nearby for your{' '}
            <span className="font-semibold text-text-navy">{service.name}</span> request.
          </p>

          <div className="mt-8 rounded-2xl border border-accent-primary/15 bg-accent-light/50 p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-xl bg-white p-2 text-accent-primary">
                <Sparkles size={16} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-text-navy">AI Photo Problem Diagnosis</p>
                  <span className="rounded-md bg-accent-primary/10 px-2 py-0.5 font-mono text-[9px] font-bold tracking-[0.08em] text-accent-primary">
                    GEMINI 2.0 FLASH
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-text-secondary">
                  Upload a photo and Gemini Vision will diagnose the problem and draft your service request.
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <label
                    htmlFor="problem-photo"
                    className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-accent-primary bg-white px-3 py-2 text-xs font-semibold text-accent-primary transition hover:bg-accent-primary hover:text-white"
                  >
                    <ImagePlus size={15} /> {uploadedImage ? 'CHANGE PHOTO' : 'UPLOAD PHOTO'}
                  </label>
                  <input
                    id="problem-photo"
                    className="sr-only"
                    type="file"
                    accept="image/*"
                    onChange={onUpload}
                  />
                  {isDiagnosing && (
                    <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.08em] text-accent-primary">
                      <span className="h-2 w-2 animate-ping rounded-full bg-accent-primary" />
                      ANALYZING WITH GEMINI VISION…
                    </span>
                  )}
                  {uploadedImage && !isDiagnosing && (
                    <span className="flex items-center gap-1 font-mono text-[10px] tracking-[0.08em] text-green-700">
                      <Check size={13} /> AI DIAGNOSIS COMPLETE
                    </span>
                  )}
                </div>
                {aiDiagnosisBadge && (
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[11px] font-medium text-text-navy shadow-sm">
                    <Sparkles size={12} className="text-accent-primary" />
                    <span>{aiDiagnosisBadge}</span>
                  </div>
                )}
                {uploadedImage && (
                  <img
                    src={uploadedImage}
                    alt="Problem photo preview"
                    className="mt-4 h-24 w-24 rounded-xl border border-white object-cover shadow-sm"
                  />
                )}
              </div>
            </div>
          </div>

          <label htmlFor="problem" className="mt-7 block font-mono text-[11px] font-semibold tracking-[0.12em] text-text-secondary">
            DESCRIBE THE PROBLEM
          </label>
          <textarea
            id="problem"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe the issue or upload a photo for automatic diagnosis..."
            rows={5}
            className="mt-3 w-full resize-none rounded-2xl border border-status-subtle bg-background-primary px-4 py-4 text-base outline-none transition focus:border-accent-primary focus:bg-white"
          />

          <div className="mt-7 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="font-mono text-[11px] font-semibold tracking-[0.12em] text-text-secondary">LOCATION</p>
              <div className="mt-3 flex items-center gap-3 rounded-2xl border border-status-subtle px-4 py-3 text-sm font-medium text-text-navy">
                <MapPin size={17} className="text-accent-primary" /> Kothrud, Pune
                <span className="ml-auto font-mono text-[9px] font-semibold text-accent-primary">ACTIVE NETWORK</span>
              </div>
            </div>
            <div>
              <p className="font-mono text-[11px] font-semibold tracking-[0.12em] text-text-secondary">URGENCY</p>
              <div className="mt-3 flex rounded-2xl bg-background-primary p-1">
                {(['normal', 'urgent'] as const).map((value) => (
                  <button
                    key={value}
                    onClick={() => setUrgency(value)}
                    className={`flex-1 rounded-xl py-2 text-xs font-semibold uppercase tracking-[0.08em] transition ${
                      urgency === value ? 'bg-white text-accent-primary shadow-sm' : 'text-text-secondary'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={onFind}
            disabled={description.trim().length < 5 || isDiagnosing}
            className="mt-10 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-accent-primary px-6 py-4 text-sm font-semibold text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-status-neutral md:w-auto"
          >
            FIND A WORKER <ArrowRight size={18} />
          </button>

          {description.trim().length > 0 && description.trim().length < 5 && (
            <p className="mt-3 flex items-center gap-1.5 text-xs text-text-tertiary">
              <AlertCircle size={13} /> Please add a little more detail (at least 5 characters).
            </p>
          )}
        </section>
      </div>
    </main>
  );
}

export default BookingForm;
