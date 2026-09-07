import { ArrowRight, Clock, IndianRupee } from 'lucide-react';
import type { ServiceCategory, ServiceSubcategory } from '../../types/service';
import { formatAmount, formatDurationShort } from '../../utils/formatters';

/**
 * ServiceSelection
 *
 * Category-specific service discovery screen. Shown after a customer picks a
 * category on the SHRAMSANGAM home. Lists only the actual subcategories that
 * exist for the chosen category in the shared catalogue (src/data/services.ts).
 *
 * Design language reuses the existing SHRAMSANGAM tokens/illustrations already
 * used across CustomerHome — no new design system is introduced.
 */

interface ServiceSelectionProps {
  category: ServiceCategory;
  /** Per-category illustration map, owned by CustomerHome. */
  illustration?: string;
  /** Per-category surface tint, owned by CustomerHome. */
  surfaceClass: string;
  onSelectService: (subcategory: ServiceSubcategory) => void;
  onBack: () => void;
}

function ServiceCard({
  subcategory,
  illustration,
  onSelect,
}: {
  subcategory: ServiceSubcategory;
  illustration?: string;
  onSelect: () => void;
}) {
  const { name, description, priceRange, durationRange } = subcategory;

  return (
    <button
      onClick={onSelect}
      className="group flex h-full w-full flex-col overflow-hidden rounded-[20px] border border-status-subtle bg-white p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:border-accent-primary/40 hover:shadow-[0_18px_45px_rgba(18,18,18,0.08)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-primary sm:rounded-[24px] sm:p-6"
    >
      <div className="flex items-start gap-4">
        <div className="relative flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-accent-light sm:h-20 sm:w-20">
          {illustration ? (
            <img
              src={illustration}
              alt=""
              aria-hidden="true"
              className="h-[115%] w-[115%] object-contain transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <IndianRupee size={22} className="text-accent-primary" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-extrabold tracking-[-0.03em] text-text-navy sm:text-xl">
            {name}
          </h3>
          <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-text-secondary sm:text-sm">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-end justify-between gap-3 border-t border-status-subtle pt-4">
        <div className="flex flex-col gap-2">
          <div>
            <p className="font-mono text-[8px] font-semibold tracking-[0.12em] text-text-tertiary sm:text-[9px]">
              STARTS AT
            </p>
            <p className="mt-0.5 text-base font-extrabold tracking-[-0.03em] text-text-navy sm:text-lg">
              ₹{formatAmount(priceRange.min)}
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-text-secondary">
            <Clock size={13} className="text-accent-primary" />
            <span className="text-xs font-medium sm:text-sm">
              {formatDurationShort(durationRange.min)}–{formatDurationShort(durationRange.max)}
            </span>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent-light px-3.5 py-2 text-xs font-semibold text-accent-primary transition-all group-hover:bg-accent-primary group-hover:text-white sm:text-sm">
          View <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  );
}

export function ServiceSelection({
  category,
  illustration,
  surfaceClass,
  onSelectService,
  onBack,
}: ServiceSelectionProps) {
  const services = category.subcategories ?? [];
  const shortContext = category.description.split(' including ')[0];

  return (
    <main className="mx-auto max-w-[1400px] px-4 pb-14 pt-6 sm:px-5 sm:pb-16 sm:pt-8 md:px-10 md:pt-12">
      <button
        onClick={onBack}
        className="mb-6 inline-flex min-h-[44px] items-center gap-2 font-mono text-xs font-semibold tracking-[0.1em] text-text-secondary transition-colors hover:text-accent-primary sm:mb-8"
      >
        ← ALL SERVICES
      </button>

      {/* Category header */}
      <section
        className={`relative grid min-h-[220px] items-end overflow-hidden rounded-[28px] border border-black/5 ${surfaceClass} px-5 py-7 sm:min-h-[260px] sm:rounded-[32px] sm:px-7 sm:py-9 md:grid-cols-2 md:rounded-[36px] md:px-12 md:py-12`}
      >
        <div className="relative z-10 max-w-xl">
          <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-accent-primary sm:text-[10px] sm:tracking-[0.16em]">
            COOPERATIVE SERVICE NETWORK
          </p>
          <h1 className="mt-3 text-[clamp(2.25rem,7vw,4rem)] font-extrabold leading-[0.9] tracking-[-0.06em] text-text-navy sm:mt-4">
            {category.name}
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-text-secondary sm:mt-4">
            {shortContext}
          </p>
          <p className="mt-4 font-mono text-[9px] font-semibold tracking-[0.12em] text-text-tertiary sm:text-[10px]">
            {services.length} {services.length === 1 ? 'SERVICE' : 'SERVICES'} AVAILABLE · PUNE
          </p>
        </div>
        {illustration && (
          <div aria-hidden="true" className="pointer-events-none relative hidden min-h-[180px] md:block">
            <img
              src={illustration}
              alt=""
              className="absolute bottom-[-14%] right-[-6%] h-[128%] max-w-[70%] object-contain object-bottom"
            />
          </div>
        )}
      </section>

      {/* Services */}
      <section className="pt-8 sm:pt-10 md:pt-12">
        <div className="mb-5 flex items-end justify-between gap-6 sm:mb-6">
          <div>
            <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-text-secondary sm:text-[11px] sm:tracking-[0.16em]">
              02
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.05em] text-text-navy sm:text-3xl">
              Choose a service
            </h2>
          </div>
        </div>

        {services.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-status-subtle bg-white px-6 py-14 text-center">
            <p className="text-lg font-semibold text-text-navy">No services listed yet</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-text-secondary">
              There are currently no {category.name.toLowerCase()} services available in your
              cooperative network. Please check back soon or choose another category.
            </p>
            <button
              onClick={onBack}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-accent-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
            >
              ← Back to all services
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((subcategory) => (
              <ServiceCard
                key={subcategory.id}
                subcategory={subcategory}
                illustration={illustration}
                onSelect={() => onSelectService(subcategory)}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default ServiceSelection;
