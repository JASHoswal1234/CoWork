/**
 * Skill Intelligence Page
 * 
 * PRIORITY SCREEN #6: AI-powered skill gap analysis (SIMULATED)
 * Phase 3: Premium editorial redesign - FORECAST → SKILL GAP → TRAINING RESPONSE flow
 * 
 * Validates Requirements: 9.1-9.6, 16.7
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowLeft, AlertCircle } from 'lucide-react';
import { useMockData } from '../../contexts/MockDataContext';

export function SkillIntelligence() {
  const navigate = useNavigate();
  const { skillGaps } = useMockData();

  // Sort by severity
  const sortedGaps = [...skillGaps].sort((a, b) => {
    const severityOrder = { CRITICAL: 0, MODERATE: 1, LOW: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  const criticalCount = skillGaps.filter(g => g.severity === 'CRITICAL').length;
  const moderateCount = skillGaps.filter(g => g.severity === 'MODERATE').length;
  const totalTrainingWeeks = skillGaps.reduce((sum, g) => sum + g.estimatedTrainingDuration, 0);

  return (
    <main className="mx-auto min-h-screen max-w-[1400px] px-4 py-6 sm:px-5 sm:py-8 md:px-10 md:py-14">
      <div className="space-y-6 sm:space-y-8 md:space-y-12">
        {/* Back Navigation */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 font-mono text-[10px] font-semibold tracking-[0.1em] text-text-secondary hover:text-accent-primary sm:text-xs"
        >
          <ArrowLeft size={13} strokeWidth={2.5} className="sm:h-[14px] sm:w-[14px]" /> BACK TO OPERATIONS
        </button>

        {/* Hero Section - Mobile optimized */}
        <section className="relative min-h-[320px] overflow-hidden rounded-[28px] border border-status-subtle bg-[#fff3e0] p-6 sm:min-h-[360px] sm:rounded-[36px] sm:p-8 md:min-h-[420px] md:p-12">
          {/* Background illustration */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <img 
              src="/illustrations/cooperative-training.png" 
              alt="" 
              className="absolute bottom-[-8%] right-[-18%] h-[110%] w-auto max-w-none opacity-45 sm:right-[-12%] sm:h-[115%] sm:opacity-50 md:bottom-[-5%] md:right-[-8%] md:h-[120%]"
              style={{ objectFit: 'contain', objectPosition: 'bottom right' }}
            />
          </div>
          
          {/* Content layer */}
          <div className="relative z-10 flex h-full min-h-[280px] flex-col sm:min-h-0">
            <div className="max-w-[70%] sm:max-w-[65%] md:max-w-[55%]">
              <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-accent-primary sm:text-[10px] sm:tracking-[0.16em]">
                AI-POWERED · SIMULATED
              </p>
              <h1 className="mt-3 text-[clamp(2.25rem,9vw,4.5rem)] font-extrabold leading-[0.88] tracking-[-0.07em] text-text-navy sm:mt-4">
                Skill<br />Intelligence
              </h1>
              
              <div className="mt-4 space-y-2 sm:mt-6 sm:space-y-3">
                <p className="text-base font-semibold tracking-[-0.02em] text-text-navy sm:text-lg md:text-xl">
                  Workforce skill gap analysis
                </p>
                <p className="text-xs leading-relaxed text-text-secondary sm:text-sm md:text-base">
                  Identify skill shortages and recommend targeted training.
                </p>
              </div>
            </div>
            
            {/* Flow Model - Mobile friendly wrapping */}
            <div className="mt-auto pt-6 sm:pt-8">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
                <span className="font-mono text-[10px] font-semibold tracking-[0.08em] text-accent-primary sm:text-xs md:text-sm">
                  FORECAST
                </span>
                <ArrowLeft size={14} className="rotate-180 text-accent-primary sm:h-4 sm:w-4" strokeWidth={2.5} />
                <span className="font-mono text-[10px] font-semibold tracking-[0.08em] text-text-navy sm:text-xs md:text-sm">
                  SKILL GAP
                </span>
                <ArrowLeft size={14} className="rotate-180 text-accent-primary sm:h-4 sm:w-4" strokeWidth={2.5} />
                <span className="font-mono text-[10px] font-semibold tracking-[0.08em] text-text-navy sm:text-xs md:text-sm">
                  TRAINING
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Summary Metrics - 2x2 grid on mobile */}
        <section className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3">
          <div className="overflow-hidden rounded-[20px] border border-status-subtle bg-white p-4 sm:rounded-[24px] sm:p-5 md:p-6">
            <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-text-tertiary sm:text-[10px]">
              CRITICAL
            </p>
            <p className="mt-2 text-[clamp(2rem,7vw,4rem)] font-extrabold leading-none tracking-[-0.05em] text-accent-primary">
              {criticalCount}
            </p>
          </div>

          <div className="overflow-hidden rounded-[20px] border border-status-subtle bg-white p-4 sm:rounded-[24px] sm:p-5 md:p-6">
            <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-text-tertiary sm:text-[10px]">
              MODERATE
            </p>
            <p className="mt-2 text-[clamp(2rem,7vw,4rem)] font-extrabold leading-none tracking-[-0.05em] text-text-navy">
              {moderateCount}
            </p>
          </div>

          <div className="col-span-2 overflow-hidden rounded-[20px] border border-status-subtle bg-white p-4 sm:rounded-[24px] sm:p-5 md:col-span-1 md:p-6">
            <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-text-tertiary sm:text-[10px]">
              TRAINING WEEKS
            </p>
            <p className="mt-2 text-[clamp(2rem,7vw,4rem)] font-extrabold leading-none tracking-[-0.05em] text-text-navy">
              {totalTrainingWeeks}
            </p>
          </div>
        </section>

        {/* Skill Gaps - Mobile optimized */}
        <section className="space-y-4 sm:space-y-6">
          <div>
            <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-text-secondary sm:text-[11px] sm:tracking-[0.16em]">
              IDENTIFIED GAPS
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.055em] text-text-navy sm:text-3xl md:text-4xl">
              Skill Coverage Analysis
            </h2>
          </div>

          <div className="space-y-3 sm:space-y-5">
            {sortedGaps.map((gap, index) => (
              <article 
                key={index} 
                className={`overflow-hidden rounded-[20px] border bg-white p-4 sm:rounded-[24px] sm:p-5 md:rounded-[28px] md:p-6 lg:p-8 ${
                  gap.severity === 'CRITICAL' ? 'border-l-4 border-accent-primary' : 'border-status-subtle'
                }`}
              >
                <div className="space-y-4 sm:space-y-5">
                  {/* Header - Mobile friendly stacking */}
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 font-mono text-[8px] font-bold tracking-[0.1em] sm:px-3 sm:text-[9px] ${
                          gap.severity === 'CRITICAL' ? 'bg-accent-primary text-white' :
                          gap.severity === 'MODERATE' ? 'bg-text-navy text-white' :
                          'bg-status-subtle text-text-secondary'
                        }`}>
                          {gap.severity}
                        </span>
                      </div>
                      <h3 className="mt-2.5 text-xl font-extrabold tracking-[-0.04em] text-text-navy sm:mt-3 sm:text-2xl md:text-3xl">
                        {gap.skillCategory}
                      </h3>
                    </div>
                    <div className="flex-shrink-0 text-left sm:text-right">
                      <p className="font-mono text-[9px] tracking-[0.12em] text-text-tertiary sm:text-[10px]">
                        GAP
                      </p>
                      <p className="mt-0.5 text-3xl font-extrabold tracking-[-0.05em] text-accent-primary sm:mt-1 sm:text-4xl md:text-5xl">
                        {gap.gap}%
                      </p>
                    </div>
                  </div>

                  {/* Coverage Visualization - Mobile optimized */}
                  <div className="space-y-1.5 sm:space-y-2">
                    <div className="flex justify-between text-xs text-text-tertiary sm:text-sm">
                      <span>Current: {gap.currentCoverage}%</span>
                      <span>Required: {gap.requiredCoverage}%</span>
                    </div>
                    <div className="relative h-3 overflow-hidden rounded-full bg-status-subtle sm:h-4">
                      <div 
                        className="h-full rounded-full bg-text-navy transition-all"
                        style={{ width: `${gap.currentCoverage}%` }}
                      />
                    </div>
                  </div>

                  {/* Affected Services - Mobile friendly wrapping */}
                  <div>
                    <p className="mb-1.5 font-mono text-[9px] font-semibold tracking-[0.12em] text-text-tertiary sm:mb-2 sm:text-[10px]">
                      AFFECTED SERVICES
                    </p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {gap.affectedServices.map((service, i) => (
                        <span 
                          key={i} 
                          className="rounded-full border border-status-subtle bg-background-primary px-2.5 py-1 text-xs text-text-secondary sm:px-3 sm:text-sm"
                        >
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Training Response - Mobile friendly spacing */}
                  <div className="rounded-xl border border-accent-primary/20 bg-accent-light/20 p-3.5 sm:p-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-accent-primary sm:h-[18px] sm:w-[18px]" strokeWidth={2} />
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-accent-primary sm:text-[10px]">
                          RECOMMENDED TRAINING RESPONSE
                        </p>
                        <ul className="mt-2.5 space-y-1.5 sm:mt-3 sm:space-y-2">
                          {gap.recommendedTraining.map((training, i) => (
                            <li key={i} className="flex items-start gap-1.5 text-xs text-text-secondary sm:gap-2 sm:text-sm">
                              <span className="text-accent-primary">•</span>
                              <span className="font-medium text-text-navy">{training}</span>
                            </li>
                          ))}
                        </ul>
                        <p className="mt-2.5 text-xs text-text-tertiary sm:mt-3 sm:text-sm">
                          Estimated training duration: <strong className="font-semibold text-text-navy">{gap.estimatedTrainingDuration} weeks</strong>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Methodology Disclaimer - Mobile optimized */}
        <section className="rounded-[20px] border-2 border-accent-primary/20 bg-accent-light/20 p-4 sm:rounded-[24px] sm:p-6 md:p-8">
          <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-accent-primary sm:text-[10px]">
            ABOUT THIS FEATURE
          </p>
          <h3 className="mt-2.5 text-lg font-extrabold tracking-[-0.03em] text-text-navy sm:mt-3 sm:text-xl">
            Analysis Methodology
          </h3>
          <p className="mt-2.5 text-xs leading-relaxed text-text-secondary sm:mt-3 sm:text-sm">
            <strong className="font-semibold text-text-navy">DEMO:</strong> Skill gap analysis based on 
            demand trends and workforce composition (simulated). In production, this would use machine 
            learning models analyzing historical job data, service demand patterns, worker performance 
            metrics, and market trends to identify precise skill requirements and training priorities.
          </p>
        </section>
      </div>
    </main>
  );
}
