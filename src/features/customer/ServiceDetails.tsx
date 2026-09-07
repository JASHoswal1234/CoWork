import { ArrowRight, Clock, IndianRupee, Wrench } from 'lucide-react';
import type { ServiceCategory, ServiceSubcategory } from '../../types/service';
import { formatAmount, formatDuration } from '../../utils/formatters';

/**
 * ServiceDetails
 *
 * Dedicated detail screen for a single selected service/subcategory. Answers
 * "what am I requesting?", "how much does it start from?", and "how long might
 * it take?" using only fields that exist in the shared catalogue. No ratings,
 * reviews, warranties, or badges are fabricated.
 */

interface ServiceDetailsProps {
  category: ServiceCategory;
  service: ServiceSubcategory;
  illustration?: string;
  surfaceClass: string;
  onRequestService: () => void;
  onBack: () => void;
}

function StatTile({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-status-subtle bg-white p-4 sm:p-5">
      <div className="flex items-center gap-2 text-accent-primary">
        {icon}
        <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-text-tertiary sm:text-[10px]">
          {label}
        </p>
      </div>
      <p className="mt-2 text-xl font-extrabold tracking-[-0.04em] text-text-navy sm:text-2xl">
        {value}
      </p>
      {sub && <p className="mt-0.5 text-xs text-text-secondary">{sub}</p>}
    </div>
  );
}

export function ServiceDetails({
  category,
  service,
  illustration,
  surfaceClass,
  onRequestService,
  onBack,
}: ServiceDetailsProps) {
  const { name, description, requiredSkills, priceRange, durationRange } = service;
  const skills = requiredSkills ?? [];

  return (
    <main className="mx-auto max-w-6xl px-4 pb-14 pt-6 sm:px-5 sm:pb-16 sm:pt-8 md:px-10 md:pt-12">
      <button
        onClick={onBack}
        className="mb-6 inline-flex min-h-[44px] items-center gap-2 font-mono text-xs font-semibold tracking-[0.1em] text-text-secondary transition-colors hover:text-accent-primary sm:mb-8"
      >
        ← BACK TO {category.name.toUpperCase()}
      </button>

      <div className="grid items-start gap-6 sm:gap-7 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Left: details */}
        <section className="order-2 lg:order-1">
          <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-accent-primary sm:tracking-[0.16em]">
            {category.name.toUpperCase()}
          </p>
          <h1 className="mt-3 text-4xl font-extrabold leading-[0.95] tracking-[-0.06em] text-text-navy sm:text-5xl">
            {name}
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-text-secondary">
            {description}
          </p>

          <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4">
            <StatTile
              label="STARTING ESTIMATE"
              value={`₹${formatAmount(priceRange.min)}`}
              sub={`Up to ₹${formatAmount(priceRange.max)}`}
              icon={<IndianRupee size={15} />}
            />
            <StatTile
              label="TYPICAL DURATION"
              value={formatDuration(durationRange.min)}
              sub={`Up to ${formatDuration(durationRange.max)}`}
              icon={<Clock size={15} />}
            />
          </div>

          <div className="mt-4 rounded-2xl border border-accent-primary/15 bg-accent-light/40 p-4">
            <p className="text-xs leading-5 text-text-secondary">
              The starting estimate is the minimum indicative price for this service. The final
              price is confirmed by the verified cooperative worker after inspecting the work on
              site.
            </p>
          </div>

          {skills.length > 0 && (
            <div className="mt-6">
              <div className="flex items-center gap-2">
                <Wrench size={15} className="text-accent-primary" />
                <p className="font-mono text-[10px] font-semibold tracking-[0.12em] text-text-secondary">
                  SKILLS REQUIRED
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full border border-status-subtle bg-white px-3 py-1.5 text-xs font-medium text-text-navy"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 hidden lg:block">
            <button
              onClick={onRequestService}
              className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-accent-primary px-6 py-4 text-sm font-semibold text-white transition hover:bg-accent-hover sm:w-auto"
            >
              REQUEST SERVICE <ArrowRight size={18} />
            </button>
          </div>
        </section>

        {/* Right: visual */}
        <section className="order-1 lg:order-2 lg:sticky lg:top-24">
          <div
            className={`relative flex min-h-[240px] items-end overflow-hidden rounded-[28px] border border-black/5 ${surfaceClass} p-6 sm:min-h-[300px] sm:rounded-[32px] md:min-h-[360px]`}
          >
            <div className="relative z-10">
              <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-text-secondary sm:text-[10px]">
                ON-DEMAND · VERIFIED WORKER
              </p>
              <p className="mt-2 max-w-[70%] text-lg font-extrabold leading-tight tracking-[-0.03em] text-text-navy sm:text-xl">
                {name}, delivered by your cooperative network.
              </p>
            </div>
            {illustration && (
              <img
                src={illustration}
                alt={`${name} illustration`}
                className="pointer-events-none absolute bottom-[-8%] right-[-8%] h-[95%] max-w-[62%] object-contain object-bottom"
              />
            )}
          </div>
        </section>
      </div>

      {/* Sticky mobile CTA */}
      <div className="sticky bottom-4 mt-8 lg:hidden">
        <button
          onClick={onRequestService}
          className="inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-accent-primary px-6 py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-accent-hover"
        >
          REQUEST SERVICE · FROM ₹{formatAmount(priceRange.min)} <ArrowRight size={18} />
        </button>
      </div>
    </main>
  );
}

export default ServiceDetails;
