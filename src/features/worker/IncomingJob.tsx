/**
 * Incoming Job Request Page
 * 
 * PRIORITY SCREEN #2 PART 2: Worker incoming job with accept/reject
 * Phase 2: Premium editorial redesign matching Customer design system
 * 
 * Validates Requirements: 4.3, 4.4, 16.3
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapPin, Clock, User, AlertCircle, CheckCircle, ArrowRight, X } from 'lucide-react';

const illustrationByService: Record<string, string> = {
  Plumbing: '/illustrations/plumber.png',
  Electrical: '/illustrations/electrician.png',
  Carpentry: '/illustrations/carpenter.png',
  Painting: '/illustrations/painting.png',
  Cleaning: '/illustrations/cleaning.png',
  'Appliance Repair': '/illustrations/appliance-repair.png'
};

export function IncomingJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(30);

  // Mock job data (in real app, would fetch from context/API)
  const job = {
    serviceCategory: 'Plumbing',
    serviceSubcategory: 'Kitchen Sink Leak Repair',
    description: 'Kitchen sink tap is leaking continuously. Needs immediate fixing.',
    customerName: 'Priya Sharma',
    location: 'B-45, Sector 18, Rohini',
    distance: 2.5,
    earnings: 425,
    totalAmount: 500,
    duration: '1 hour'
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  const handleAccept = () => {
    alert('Job accepted! Customer has been notified.');
    navigate('/');
  };

  const handleReject = () => {
    navigate('/');
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-8 sm:px-5 sm:py-10 md:px-10">
      <section className="relative w-full min-h-[560px] overflow-hidden rounded-[28px] border border-status-subtle bg-white p-5 sm:min-h-[600px] sm:rounded-[32px] sm:p-6 md:rounded-[36px] md:p-12">
        {/* Background illustration */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0">
          <img 
            src={illustrationByService[job.serviceCategory] || '/illustrations/worker-job.png'}
            alt="" 
            className="absolute bottom-[-10%] right-[-12%] h-[103%] w-auto max-w-none opacity-12 sm:bottom-[-8%] sm:right-[-10%] sm:h-[105%] sm:opacity-15 md:bottom-[-5%] md:right-[-8%] md:h-[110%]"
            style={{ objectFit: 'contain', objectPosition: 'bottom right' }}
          />
        </div>

        <div className="relative z-10 space-y-6 sm:space-y-8">
          {/* Timer Badge */}
          <div className="flex justify-center">
            <div className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 transition-colors sm:gap-2.5 sm:px-5 sm:py-3 ${
              timeLeft <= 10 
                ? 'bg-red-50 text-red-600' 
                : 'bg-accent-light/50 text-accent-primary'
            }`}>
              <Clock size={16} strokeWidth={2.5} className="sm:h-[18px] sm:w-[18px]" />
              <span className="font-mono text-xs font-semibold tracking-[0.08em] sm:text-sm">
                {timeLeft} SECONDS TO RESPOND
              </span>
            </div>
          </div>

          {/* Job Header */}
          <div className="max-w-2xl">
            <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-accent-primary sm:text-[11px] sm:tracking-[0.16em]">
              NEW SERVICE REQUEST
            </p>
            <p className="mt-3.5 font-mono text-xs uppercase tracking-[0.08em] text-text-tertiary sm:mt-4 sm:text-sm">
              {job.serviceCategory}
            </p>
            <h1 className="mt-1.5 text-3xl font-extrabold leading-[0.95] tracking-[-0.06em] text-text-navy sm:mt-2 sm:text-4xl md:text-5xl">
              {job.serviceSubcategory}
            </h1>
          </div>

          {/* Customer & Location Grid */}
          <div className="grid grid-cols-1 gap-5 border-y border-status-subtle py-6 sm:grid-cols-2 sm:gap-6 sm:py-8">
            <div>
              <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-text-tertiary sm:text-[10px]">
                CUSTOMER
              </p>
              <div className="mt-2.5 flex items-center gap-2.5 sm:mt-3 sm:gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-light sm:h-10 sm:w-10">
                  <User size={18} className="text-accent-primary sm:h-5 sm:w-5" />
                </div>
                <p className="text-base font-semibold text-text-navy sm:text-lg">{job.customerName}</p>
              </div>
            </div>
            <div>
              <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-text-tertiary sm:text-[10px]">
                LOCATION
              </p>
              <div className="mt-2.5 flex items-start gap-2.5 sm:mt-3 sm:gap-3">
                <MapPin size={18} className="mt-0.5 flex-shrink-0 text-accent-primary sm:h-5 sm:w-5" />
                <div>
                  <p className="text-base font-semibold text-text-navy sm:text-lg">{job.location}</p>
                  <p className="mt-0.5 font-mono text-[10px] text-text-secondary sm:text-xs">{job.distance} KM AWAY</p>
                </div>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="max-w-2xl">
            <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-text-tertiary sm:text-[10px]">
              DESCRIPTION
            </p>
            <p className="mt-2.5 text-sm leading-relaxed text-text-secondary sm:mt-3 sm:text-base">{job.description}</p>
          </div>

          {/* Earnings Highlight */}
          <div className="overflow-hidden rounded-[20px] border border-accent-primary/20 bg-accent-light/30 p-5 sm:rounded-[24px] sm:p-6 md:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
              <div>
                <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-accent-primary sm:text-[10px]">
                  YOUR EARNINGS
                </p>
                <p className="mt-2.5 text-4xl font-extrabold tracking-[-0.05em] text-accent-primary sm:mt-3 sm:text-5xl md:text-6xl">
                  ₹{job.earnings}
                </p>
                <p className="mt-1.5 text-xs text-text-secondary sm:mt-2 sm:text-sm">
                  Customer pays ₹{job.totalAmount} · 15% cooperative share
                </p>
              </div>
              <div className="border-l-0 pt-4 sm:border-l sm:border-status-subtle sm:pl-6 sm:pt-0 md:pl-8">
                <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-text-tertiary sm:text-[10px]">
                  ESTIMATED DURATION
                </p>
                <p className="mt-1.5 text-2xl font-extrabold tracking-[-0.04em] text-text-navy sm:mt-2 sm:text-3xl">
                  {job.duration}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3.5 pt-2 sm:space-y-4">
            <button
              onClick={handleAccept}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-primary px-5 py-4 text-sm font-semibold text-white transition-all hover:bg-accent-hover active:scale-[0.98] sm:gap-2.5 sm:px-6 sm:text-base"
            >
              <CheckCircle size={18} strokeWidth={2.5} className="sm:h-5 sm:w-5" />
              ACCEPT JOB
            </button>
            <button
              onClick={handleReject}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl border-2 border-status-subtle bg-transparent px-5 py-3.5 text-xs font-semibold text-text-secondary transition-all hover:border-text-secondary hover:text-text-navy active:scale-[0.98] sm:gap-2 sm:px-6 sm:py-4 sm:text-sm"
            >
              <X size={16} strokeWidth={2.5} className="sm:h-[18px] sm:w-[18px]" />
              Decline Request
            </button>
          </div>

          {/* Info Notice */}
          <div className="flex items-start gap-2.5 rounded-2xl bg-background-primary p-3.5 sm:gap-3 sm:p-4">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-accent-primary sm:h-[18px] sm:w-[18px]" />
            <p className="text-[10px] leading-relaxed text-text-secondary sm:text-xs">
              Accepting this job will notify the customer immediately. Your location will be shared with the customer for tracking purposes. <span className="font-semibold">This is a simulated demo</span>.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
