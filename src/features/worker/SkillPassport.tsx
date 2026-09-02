/**
 * Skill Passport Page
 * 
 * PRIORITY SCREEN #3: Worker skill passport with earnings
 * Phase 2: Premium editorial redesign matching Customer design system
 * 
 * Validates Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 16.4, 17.1-17.6
 */

import React from 'react';
import { CheckCircle, BookOpen, Award, ShieldCheck, FileCheck, Calendar, TrendingUp } from 'lucide-react';

export function SkillPassport() {
  const worker = {
    name: 'Rajesh Kumar',
    memberSince: 'March 2022',
    todayEarnings: 1250,
    monthEarnings: 28500,
    totalJobs: 167,
    rating: 4.8,
    skills: [
      { name: 'Pipe Fitting', level: 'expert', verified: true },
      { name: 'Leak Repair', level: 'expert', verified: true },
      { name: 'Bathroom Fitting', level: 'intermediate', verified: true }
    ],
    training: [
      { name: 'Advanced Plumbing Systems', progress: 65, status: 'in-progress' },
      { name: 'Safety Protocols', progress: 100, status: 'completed' }
    ],
    certifications: [
      { name: 'NCVT Plumber Certificate', issuer: 'National Council for Vocational Training', date: 'Nov 2021' }
    ]
  };

  return (
    <main className="mx-auto min-h-screen max-w-[1400px] px-4 py-6 sm:px-5 sm:py-8 md:px-10 md:py-14">
      <div className="space-y-6 sm:space-y-8 md:space-y-12">
        {/* Hero Section with Identity - Mobile optimized */}
        <section className="relative min-h-[340px] overflow-hidden rounded-[28px] border border-status-subtle bg-[#f3e5f5] p-6 sm:min-h-[380px] sm:rounded-[32px] sm:p-8 md:min-h-[440px] md:rounded-[36px] md:p-12">
          {/* Background illustration */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <img 
              src="/illustrations/worker-passport.png" 
              alt="" 
              className="absolute bottom-[-10%] right-[-15%] h-[112%] w-auto max-w-none opacity-65 sm:bottom-[-8%] sm:right-[-12%] sm:h-[115%] sm:opacity-70 md:bottom-[-5%] md:right-[-8%] md:h-[120%]"
              style={{ objectFit: 'contain', objectPosition: 'bottom right' }}
            />
          </div>
          
          {/* Content layer */}
          <div className="relative z-10 flex h-full flex-col">
            <div className="max-w-[68%] sm:max-w-[65%] md:max-w-[55%]">
              <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-text-secondary sm:text-[10px] sm:tracking-[0.16em]">
                SKILL PASSPORT
              </p>
              <h1 className="mt-3 text-[clamp(2.5rem,8vw,4.5rem)] font-extrabold leading-[0.88] tracking-[-0.07em] text-text-navy sm:mt-4">
                {worker.name.toUpperCase()}
              </h1>
              
              <div className="mt-5 space-y-2.5 sm:mt-6 sm:space-y-3">
                <p className="text-base font-semibold tracking-[-0.02em] text-text-navy sm:text-lg md:text-xl">
                  Plumbing Specialist
                </p>
                <div className="flex items-center gap-2 text-xs text-text-secondary sm:text-sm">
                  <ShieldCheck size={16} className="text-accent-primary sm:h-[18px] sm:w-[18px]" strokeWidth={2.5} />
                  <span className="font-medium">Cooperative Verified</span>
                </div>
              </div>
            </div>
            
            {/* Stats Row */}
            <div className="mt-auto grid grid-cols-3 gap-3.5 pt-6 sm:gap-4 sm:pt-8 md:max-w-lg md:gap-6">
              <div>
                <p className="font-mono text-[8px] font-semibold tracking-[0.12em] text-text-tertiary sm:text-[9px]">
                  EXPERIENCE
                </p>
                <p className="mt-0.5 text-xl font-extrabold tracking-[-0.04em] text-text-navy sm:mt-1 sm:text-2xl md:text-3xl">
                  4 YRS
                </p>
              </div>
              <div className="border-l border-text-navy/10 pl-3.5 sm:pl-4 md:pl-6">
                <p className="font-mono text-[8px] font-semibold tracking-[0.12em] text-text-tertiary sm:text-[9px]">
                  JOBS
                </p>
                <p className="mt-0.5 text-xl font-extrabold tracking-[-0.04em] text-text-navy sm:mt-1 sm:text-2xl md:text-3xl">
                  {worker.totalJobs}
                </p>
              </div>
              <div className="border-l border-text-navy/10 pl-3.5 sm:pl-4 md:pl-6">
                <p className="font-mono text-[8px] font-semibold tracking-[0.12em] text-text-tertiary sm:text-[9px]">
                  RATING
                </p>
                <p className="mt-0.5 text-xl font-extrabold tracking-[-0.04em] text-text-navy sm:mt-1 sm:text-2xl md:text-3xl">
                  ★ {worker.rating}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Earnings Panel - Mobile optimized */}
        <section className="overflow-hidden rounded-[24px] border border-status-subtle bg-white p-5 sm:rounded-[28px] sm:p-6 md:rounded-[32px] md:p-8">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <TrendingUp size={24} className="text-accent-primary sm:h-[26px] sm:w-[26px] md:h-7 md:w-7" strokeWidth={2} />
            <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-text-secondary sm:text-[11px] sm:tracking-[0.16em]">
              EARNINGS
            </p>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-5 sm:mt-6 sm:gap-6 md:gap-12">
            <div>
              <p className="text-[clamp(2rem,7vw,4rem)] font-extrabold leading-none tracking-[-0.05em] text-accent-primary">
                ₹{worker.todayEarnings}
              </p>
              <p className="mt-1.5 font-mono text-[9px] font-semibold tracking-[0.12em] text-text-tertiary sm:mt-2 sm:text-[10px]">
                TODAY
              </p>
            </div>
            <div className="border-l border-status-subtle pl-5 sm:pl-6 md:pl-12">
              <p className="text-[clamp(2rem,7vw,4rem)] font-extrabold leading-none tracking-[-0.05em] text-text-navy">
                ₹{worker.monthEarnings}
              </p>
              <p className="mt-1.5 font-mono text-[9px] font-semibold tracking-[0.12em] text-text-tertiary sm:mt-2 sm:text-[10px]">
                THIS MONTH
              </p>
            </div>
          </div>
        </section>

        {/* Verified Skills */}
        <section className="overflow-hidden rounded-[32px] border border-status-subtle bg-white p-6 md:p-8">
          <div className="flex items-center gap-3">
            <CheckCircle size={28} className="text-accent-primary" strokeWidth={2} />
            <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-text-navy md:text-3xl">
              Verified Skills
            </h2>
          </div>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {worker.skills.map((skill, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3.5 rounded-2xl border border-accent-primary/20 bg-accent-light/40 p-5 transition-all hover:bg-accent-light/60 hover:shadow-sm"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent-primary">
                  <CheckCircle size={20} className="text-white" strokeWidth={2.5} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-tight text-text-navy">{skill.name}</p>
                  <p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-text-tertiary">
                    {skill.level}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Training Progress with illustration */}
        <section className="relative min-h-[300px] overflow-hidden rounded-[32px] border border-status-subtle bg-[#fff3e0] p-6 md:p-8">
          {/* Background illustration */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <img 
              src="/illustrations/worker-training.png" 
              alt="" 
              className="absolute bottom-[-8%] right-[-10%] h-[100%] w-auto max-w-none opacity-50 md:bottom-[-6%] md:right-[-8%]"
              style={{ objectFit: 'contain', objectPosition: 'bottom right' }}
            />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <BookOpen size={28} className="text-accent-primary" strokeWidth={2} />
              <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-text-navy md:text-3xl">
                Training Progress
              </h2>
            </div>
            <div className="mt-6 max-w-2xl space-y-5">
              {worker.training.map((course, index) => (
                <div key={index} className="rounded-2xl bg-white/90 p-5 shadow-sm backdrop-blur-sm">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                        course.status === 'completed' ? 'bg-green-100' : 'bg-accent-light'
                      }`}>
                        {course.status === 'completed' ? (
                          <CheckCircle size={18} className="text-green-600" strokeWidth={2.5} />
                        ) : (
                          <BookOpen size={18} className="text-accent-primary" strokeWidth={2} />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold leading-tight text-text-navy">{course.name}</p>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.1em] text-text-tertiary">
                          {course.status === 'completed' ? 'Completed' : 'In Progress'}
                        </p>
                      </div>
                    </div>
                    <span className="flex-shrink-0 font-mono text-sm font-semibold text-accent-primary">
                      {course.progress}%
                    </span>
                  </div>
                  <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-background-primary">
                    <div 
                      className={`h-full rounded-full transition-all ${
                        course.status === 'completed' ? 'bg-green-500' : 'bg-accent-primary'
                      }`}
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Certifications */}
        <section className="overflow-hidden rounded-[32px] border border-status-subtle bg-white p-6 md:p-8">
          <div className="flex items-center gap-3">
            <Award size={28} className="text-accent-primary" strokeWidth={2} />
            <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-text-navy md:text-3xl">
              Certifications
            </h2>
          </div>
          <div className="mt-6 space-y-4">
            {worker.certifications.map((cert, index) => (
              <div 
                key={index} 
                className="flex items-start gap-4 rounded-2xl border border-status-subtle bg-background-primary p-5 transition-all hover:border-accent-primary/30 hover:bg-accent-light/20"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-accent-light">
                  <Award size={24} className="text-accent-primary" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold leading-tight text-text-navy">{cert.name}</p>
                  <p className="mt-1 text-sm text-text-secondary">{cert.issuer}</p>
                  <p className="mt-1.5 font-mono text-[10px] tracking-[0.08em] text-text-tertiary">
                    ISSUED {cert.date.toUpperCase()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Government Integrations - Demo Notice */}
        <section className="overflow-hidden rounded-[28px] border-2 border-accent-primary/30 bg-accent-light/30 p-6 md:p-8">
          <div className="flex items-start gap-3">
            <FileCheck size={24} className="mt-0.5 flex-shrink-0 text-accent-primary" strokeWidth={2} />
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-extrabold tracking-[-0.03em] text-accent-primary">
                Government Integrations
              </h3>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle size={18} className="flex-shrink-0 text-accent-primary" strokeWidth={2.5} />
                  <p className="text-sm font-medium text-text-navy">e-Shram Registration linked</p>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle size={18} className="flex-shrink-0 text-accent-primary" strokeWidth={2.5} />
                  <p className="text-sm font-medium text-text-navy">DigiLocker Credential verification</p>
                </div>
              </div>
              <p className="mt-4 font-mono text-[9px] leading-relaxed tracking-[0.08em] text-text-tertiary">
                * PROPOSED INTEGRATION · DEMO ONLY
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
