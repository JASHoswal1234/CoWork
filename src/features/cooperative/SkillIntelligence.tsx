/**
 * Skill Intelligence Page - Connected to real backend ML API
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ArrowLeft, AlertCircle } from 'lucide-react';
import { mlApi } from '../../lib/api';

export function SkillIntelligence() {
  const navigate = useNavigate();
  const [skillGaps, setSkillGaps] = useState<any[]>([]);
  const [topRecommendations, setTopRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    mlApi.getSkillGaps()
      .then((data) => {
        setSkillGaps(data.skill_gaps || []);
        setTopRecommendations(data.top_training_recommendations || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const criticalCount = skillGaps.filter((g: any) => g.severity === 'critical').length;
  const highCount = skillGaps.filter((g: any) => g.severity === 'high').length;

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-[1400px] px-4 py-6 sm:px-5 sm:py-8 md:px-10 md:py-14">
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-accent-primary border-t-transparent" />
            <p className="mt-4 text-sm text-text-secondary">Analyzing skill gaps from real data...</p>
          </div>
        </div>
      </main>
    );
  }

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
              HIGH
            </p>
            <p className="mt-2 text-[clamp(2rem,7vw,4rem)] font-extrabold leading-none tracking-[-0.05em] text-text-navy">
              {highCount}
            </p>
          </div>

          <div className="col-span-2 overflow-hidden rounded-[20px] border border-status-subtle bg-white p-4 sm:rounded-[24px] sm:p-5 md:col-span-1 md:p-6">
            <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-text-tertiary sm:text-[10px]">
              CATEGORIES ANALYZED
            </p>
            <p className="mt-2 text-[clamp(2rem,7vw,4rem)] font-extrabold leading-none tracking-[-0.05em] text-text-navy">
              {skillGaps.length}
            </p>
          </div>
        </section>

        {/* Top Training Recommendations */}
        {topRecommendations.length > 0 && (
          <section className="overflow-hidden rounded-[24px] border border-accent-primary/20 bg-accent-light/20 p-4 sm:rounded-[32px] sm:p-6">
            <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-accent-primary sm:text-[10px]">
              TOP ROI RECOMMENDATIONS
            </p>
            <div className="mt-3 space-y-3">
              {topRecommendations.map((rec: any, i: number) => (
                <div key={i} className="flex items-start gap-3 rounded-xl bg-white/60 p-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-primary text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold text-text-navy">{rec.category}</p>
                    <p className="text-xs text-text-secondary">{rec.action}</p>
                    <p className="mt-0.5 font-mono text-[9px] text-accent-primary">{rec.expected_improvement}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

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
            {skillGaps.map((gap: any, index: number) => (
              <article 
                key={index} 
                className={`overflow-hidden rounded-[20px] border bg-white p-4 sm:rounded-[24px] sm:p-5 md:rounded-[28px] md:p-6 lg:p-8 ${
                  gap.severity === 'critical' ? 'border-l-4 border-accent-primary' : 'border-status-subtle'
                }`}
              >
                <div className="space-y-4 sm:space-y-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <span className={`inline-flex rounded-full px-2.5 py-1 font-mono text-[8px] font-bold tracking-[0.1em] sm:px-3 sm:text-[9px] ${
                          gap.severity === 'critical' ? 'bg-accent-primary text-white' :
                          gap.severity === 'high' ? 'bg-text-navy text-white' :
                          'bg-status-subtle text-text-secondary'
                        }`}>
                          {gap.severity.toUpperCase()} · #{gap.priority_rank}
                        </span>
                      </div>
                      <h3 className="mt-2.5 text-xl font-extrabold tracking-[-0.04em] text-text-navy sm:mt-3 sm:text-2xl md:text-3xl">
                        {gap.service_category}
                      </h3>
                    </div>
                    <div className="flex-shrink-0 text-left sm:text-right">
                      <p className="font-mono text-[9px] tracking-[0.12em] text-text-tertiary sm:text-[10px]">GAP SCORE</p>
                      <p className="mt-0.5 text-3xl font-extrabold tracking-[-0.05em] text-accent-primary sm:mt-1 sm:text-4xl">
                        {Math.round(gap.gap_score * 100)}
                      </p>
                    </div>
                  </div>

                  {/* Real metrics from DB */}
                  <div className="grid grid-cols-3 gap-3 rounded-xl bg-gray-50 p-3">
                    <div>
                      <p className="font-mono text-[8px] text-text-tertiary">UNFILLED RATE</p>
                      <p className="mt-1 font-bold text-text-navy">{gap.metrics?.unfilled_rate}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[8px] text-text-tertiary">AVG RATING</p>
                      <p className="mt-1 font-bold text-text-navy">{gap.metrics?.avg_quality_rating ?? 'N/A'}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[8px] text-text-tertiary">WORKERS</p>
                      <p className="mt-1 font-bold text-text-navy">{gap.metrics?.available_workers}</p>
                    </div>
                  </div>

                  {/* Recommendations */}
                  {gap.recommendations?.length > 0 && (
                    <div className="rounded-xl border border-accent-primary/20 bg-accent-light/20 p-3.5 sm:p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0 text-accent-primary" strokeWidth={2} />
                        <div className="min-w-0 flex-1">
                          <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-accent-primary sm:text-[10px]">
                            RECOMMENDED ACTIONS
                          </p>
                          <ul className="mt-2.5 space-y-1.5 sm:mt-3 sm:space-y-2">
                            {gap.recommendations.map((rec: string, i: number) => (
                              <li key={i} className="flex items-start gap-1.5 text-xs text-text-secondary sm:gap-2 sm:text-sm">
                                <span className="text-accent-primary">•</span>
                                <span className="font-medium text-text-navy">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
