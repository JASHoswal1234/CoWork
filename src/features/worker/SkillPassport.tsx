/**
 * Skill Passport Page - Connected to real backend
 * Shows personalized training recommendations based on ratings and job history
 */

import React, { useEffect, useState } from 'react';
import { CheckCircle, BookOpen, Award, ShieldCheck, FileCheck, TrendingUp, AlertTriangle, Star } from 'lucide-react';
import { mlApi, workersApi } from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';

export function SkillPassport() {
  const { user } = useAuth();
  const [workerProfile, setWorkerProfile] = useState<any>(null);
  const [trainingData, setTrainingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchWorkerData = async () => {
      setLoading(true);
      setError('');
      
      try {
        // Fetch authenticated worker's profile
        const profileRes = await workersApi.getProfileMe();
        if (profileRes?.worker) {
          setWorkerProfile(profileRes.worker);
          
          // Fetch ML training recommendations for this worker
          if (profileRes.worker.id) {
            try {
              const trainingRes = await mlApi.getWorkerTrainingRecommendations(profileRes.worker.id);
              setTrainingData(trainingRes);
            } catch (mlErr) {
              console.warn('ML recommendations not available:', mlErr);
            }
          }
        }
      } catch (err: any) {
        console.error('Failed to load worker profile:', err);
        setError(err?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkerData();
  }, []);

  // Build worker data from profile
  const worker = workerProfile ? {
    name: workerProfile.user?.name || workerProfile.name || user?.name || 'Worker',
    memberSince: workerProfile.created_at ? new Date(workerProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently',
    todayEarnings: workerProfile.wallet?.today_earnings || 0,
    monthEarnings: workerProfile.wallet?.month_earnings || 0,
    totalJobs: trainingData?.performance?.total_completed || workerProfile.completed_jobs || 0,
    rating: trainingData?.performance?.avg_rating || workerProfile.rating || 0,
    skills: workerProfile.skills?.map((s: any) => ({
      name: s.subcategory || s.category,
      level: s.skill_level || 'intermediate',
      verified: s.verified ?? true
    })) || [],
    certifications: workerProfile.certifications || []
  } : null;

  const recommendations = trainingData?.recommendations || [];

  const performance = trainingData?.performance;
  const insights = trainingData?.insights || [];

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-[1400px] px-4 py-6 sm:px-5 sm:py-8 md:px-10 md:py-14 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-accent-primary border-t-transparent" />
          <p className="mt-4 text-sm text-text-secondary">Loading your Skill Passport...</p>
        </div>
      </main>
    );
  }

  if (error || !worker) {
    return (
      <main className="mx-auto min-h-screen max-w-[1400px] px-4 py-6 sm:px-5 sm:py-8 md:px-10 md:py-14 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle size={48} className="mx-auto text-red-500" />
          <p className="mt-4 text-lg font-semibold text-text-navy">Failed to load Skill Passport</p>
          <p className="mt-2 text-sm text-text-secondary">{error || 'Worker profile not found'}</p>
        </div>
      </main>
    );
  }

  const primarySkill = worker.skills?.[0]?.name || 'Service Professional';

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
                  {primarySkill}
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
                  MEMBER SINCE
                </p>
                <p className="mt-0.5 text-sm font-extrabold tracking-[-0.04em] text-text-navy sm:mt-1 sm:text-base md:text-lg">
                  {worker.memberSince}
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
                  {worker.rating > 0 ? `★ ${worker.rating.toFixed(1)}` : 'NEW'}
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
                ₹{worker.todayEarnings.toLocaleString()}
              </p>
              <p className="mt-1.5 font-mono text-[9px] font-semibold tracking-[0.12em] text-text-tertiary sm:mt-2 sm:text-[10px]">
                TODAY
              </p>
            </div>
            <div className="border-l border-status-subtle pl-5 sm:pl-6 md:pl-12">
              <p className="text-[clamp(2rem,7vw,4rem)] font-extrabold leading-none tracking-[-0.05em] text-text-navy">
                ₹{worker.monthEarnings.toLocaleString()}
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
            {worker.skills.length > 0 ? (
              worker.skills.map((skill: any, index: number) => (
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
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-status-subtle bg-background-primary p-8 text-center">
                <p className="text-sm text-text-secondary">No verified skills yet. Complete jobs to build your skill profile.</p>
              </div>
            )}
          </div>
        </section>

        {/* Performance Insights from Real Data */}
        {performance && (
          <section className="overflow-hidden rounded-[24px] border border-status-subtle bg-white p-5 sm:rounded-[28px] sm:p-6 md:rounded-[32px] md:p-8">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <TrendingUp size={24} className="text-accent-primary" strokeWidth={2} />
              <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-text-secondary sm:text-[11px]">
                PERFORMANCE INSIGHTS
              </p>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 sm:mt-5 sm:gap-4">
              <div className="rounded-xl bg-gray-50 p-3 text-center">
                <p className="text-2xl font-extrabold text-accent-primary">★ {performance.avg_rating}</p>
                <p className="mt-1 font-mono text-[8px] text-text-tertiary">AVG RATING</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 text-center">
                <p className="text-2xl font-extrabold text-text-navy">{performance.total_completed}</p>
                <p className="mt-1 font-mono text-[8px] text-text-tertiary">JOBS DONE</p>
              </div>
              <div className="rounded-xl bg-gray-50 p-3 text-center">
                <p className={`text-lg font-extrabold ${performance.rating_trend === 'improving' ? 'text-green-600' : 'text-accent-primary'}`}>
                  {performance.rating_trend === 'improving' ? '↑' : '→'} {performance.rating_trend}
                </p>
                <p className="mt-1 font-mono text-[8px] text-text-tertiary">TREND</p>
              </div>
            </div>
            {insights.length > 0 && (
              <div className="mt-3 space-y-2">
                {insights.map((insight: any, i: number) => (
                  <div key={i} className={`flex items-center gap-2 rounded-xl p-3 text-xs ${
                    insight.type === 'alert' ? 'bg-red-50 text-red-700' : 'bg-yellow-50 text-yellow-700'
                  }`}>
                    <AlertTriangle size={14} />
                    <span>{insight.message}</span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Personalized Training Recommendations */}
        <section className="relative min-h-[300px] overflow-hidden rounded-[32px] border border-status-subtle bg-[#fff3e0] p-6 md:p-8">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            <img src="/illustrations/worker-training.png" alt=""
              className="absolute bottom-[-8%] right-[-10%] h-[100%] w-auto max-w-none opacity-50 md:bottom-[-6%] md:right-[-8%]"
              style={{ objectFit: 'contain', objectPosition: 'bottom right' }}
            />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <BookOpen size={28} className="text-accent-primary" strokeWidth={2} />
              <div>
                <h2 className="text-2xl font-extrabold tracking-[-0.04em] text-text-navy md:text-3xl">
                  Personalised Training
                </h2>
                <p className="mt-0.5 text-xs text-text-secondary">Based on your ratings, job history and market demand</p>
              </div>
            </div>

            <div className="mt-6 max-w-2xl space-y-4">
              {recommendations.length > 0 ? (
                recommendations.map((rec: any, index: number) => (
                  <div key={index} className="rounded-2xl bg-white/90 p-5 shadow-sm backdrop-blur-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 font-mono text-[8px] font-bold ${
                            rec.priority === 'high' ? 'bg-red-100 text-red-700' :
                            rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {rec.priority.toUpperCase()}
                          </span>
                          <span className="font-mono text-[8px] text-text-tertiary">{rec.duration_weeks}W COURSE</span>
                        </div>
                        <p className="mt-2 font-semibold text-text-navy">{rec.title}</p>
                        <p className="mt-1 text-xs leading-relaxed text-text-secondary">{rec.reason}</p>
                        {rec.expected_rating_boost && (
                          <p className="mt-2 font-mono text-[9px] font-bold text-accent-primary">
                            ★ Expected: {rec.expected_rating_boost}
                          </p>
                        )}
                        {rec.expected_income_boost && (
                          <p className="mt-2 font-mono text-[9px] font-bold text-green-600">
                            💰 {rec.expected_income_boost}
                          </p>
                        )}
                        {rec.modules && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {rec.modules.map((m: string, i: number) => (
                              <span key={i} className="rounded-full border border-accent-primary/20 bg-accent-light/30 px-2 py-0.5 text-[10px] text-text-secondary">
                                {m}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl bg-white/90 p-8 text-center shadow-sm backdrop-blur-sm">
                  <p className="text-sm text-text-secondary">No training recommendations available yet. Complete more jobs to receive personalized suggestions.</p>
                </div>
              )}
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
            {worker.certifications.length > 0 ? (
              worker.certifications.map((cert: any, index: number) => (
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
              ))
            ) : (
              <div className="rounded-2xl border border-status-subtle bg-background-primary p-8 text-center">
                <p className="text-sm text-text-secondary">No certifications added yet.</p>
              </div>
            )}
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
