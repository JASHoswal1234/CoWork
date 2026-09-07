/**
 * Demand Intelligence Page - Connected to real backend ML API
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, AlertTriangle, ArrowLeft } from 'lucide-react';
import { mlApi } from '../../lib/api';

export function DemandIntelligence() {
  const navigate = useNavigate();
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [historicalActuals, setHistoricalActuals] = useState<any>({});
  const [modelInfo, setModelInfo] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mlApi.getDemandForecast(7)
      .then((data) => {
        setForecasts(data.forecasts || []);
        setHistoricalActuals(data.historical_actuals || {});
        setModelInfo(data.model_info);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const categories = ['All', ...Array.from(new Set(forecasts.map((f: any) => f.service_category)))];

  const filteredForecasts = selectedCategory === 'All'
    ? forecasts
    : forecasts.filter((f: any) => f.service_category === selectedCategory);

  // Group by date
  const forecastsByDate = filteredForecasts.reduce((acc: any, forecast: any) => {
    const dateKey = forecast.date;
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(forecast);
    return acc;
  }, {} as Record<string, any[]>);

  // Shortage alerts: predicted_demand > 20 and high confidence
  const shortages = forecasts.filter((f: any) => f.predicted_demand > 20 && f.confidence_score > 0.8)
    .slice(0, 5);

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-[1400px] px-4 py-6 sm:px-5 sm:py-8 md:px-10 md:py-14">
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-accent-primary border-t-transparent" />
            <p className="mt-4 text-sm text-text-secondary">Loading demand forecasts from ML model...</p>
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

        {/* Hero Section */}
        <section className="relative min-h-[320px] overflow-hidden rounded-[28px] border border-status-subtle bg-[#e3f2fd] p-6 sm:min-h-[360px] sm:rounded-[36px] sm:p-8 md:min-h-[420px] md:p-12">
          {/* Large editorial illustration - cooperative-workforce.png */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0">
            {/* Illustration positioned bottom-right, oversized and cropped */}
            <img 
              src="/illustrations/cooperative-workforce.png" 
              alt="" 
              className="absolute bottom-[-8%] right-[-15%] h-[110%] max-w-[85%] object-contain object-bottom opacity-[0.45] sm:right-[-10%] sm:h-[115%] sm:max-w-[80%] sm:opacity-[0.5] md:bottom-[-5%] md:right-[-8%] md:h-[120%] md:max-w-[70%]"
            />
          </div>
          
          {/* Content layer */}
          <div className="relative z-10 flex h-full min-h-[280px] flex-col sm:min-h-0">
            <div className="max-w-[70%] sm:max-w-[65%] md:max-w-[55%]">
              <p className="font-mono text-[9px] font-semibold tracking-[0.14em] text-accent-primary sm:text-[10px] sm:tracking-[0.16em]">
                AI-POWERED · SIMULATED
              </p>
              <h1 className="mt-3 text-[clamp(2.25rem,9vw,4.5rem)] font-extrabold leading-[0.88] tracking-[-0.07em] text-text-navy sm:mt-4">
                Demand<br />Intelligence
              </h1>
              
              <div className="mt-4 space-y-2 sm:mt-6 sm:space-y-3">
                <p className="text-base font-semibold tracking-[-0.02em] text-text-navy sm:text-lg md:text-xl">
                  7-day demand forecasting
                </p>
                <p className="text-xs leading-relaxed text-text-secondary sm:text-sm md:text-base">
                  Predict capacity needs before they become shortages.
                </p>
              </div>
            </div>
            
            {/* Flow Model */}
            <div className="mt-auto pt-6 sm:pt-8">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 md:gap-4">
                <span className="font-mono text-[10px] font-semibold tracking-[0.08em] text-accent-primary sm:text-xs md:text-sm">
                  PREDICTION
                </span>
                <ArrowLeft size={14} className="rotate-180 text-accent-primary sm:h-4 sm:w-4" strokeWidth={2.5} />
                <span className="font-mono text-[10px] font-semibold tracking-[0.08em] text-text-navy sm:text-xs md:text-sm">
                  DECISION
                </span>
                <ArrowLeft size={14} className="rotate-180 text-accent-primary sm:h-4 sm:w-4" strokeWidth={2.5} />
                <span className="font-mono text-[10px] font-semibold tracking-[0.08em] text-text-navy sm:text-xs md:text-sm">
                  ACTION
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-full px-3 py-1.5 font-mono text-[10px] font-semibold tracking-[0.08em] transition-all sm:px-4 sm:py-2 sm:text-xs ${
                selectedCategory === cat
                  ? 'bg-accent-primary text-white'
                  : 'border border-status-subtle bg-white text-text-secondary hover:border-accent-primary/30 hover:text-text-navy'
              }`}
            >
              {cat}
            </button>
          ))}
        </section>

        {/* Shortage Alerts - Actionable Warnings */}
        {shortages.length > 0 && (
          <section className="space-y-3 sm:space-y-4">
            <div>
              <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-text-secondary sm:text-[11px] sm:tracking-[0.16em]">
                CAPACITY WARNINGS
              </p>
              <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.055em] text-text-navy sm:text-3xl md:text-4xl">
                High Demand Days
              </h2>
            </div>
            
            <div className="space-y-3">
              {shortages.slice(0, 5).map((forecast: any, index: number) => (
                  <article 
                    key={index} 
                    className="overflow-hidden rounded-[20px] border-2 border-accent-primary/20 bg-accent-light/30 p-4 sm:rounded-[24px] sm:p-5 md:p-6"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={18} className="flex-shrink-0 text-accent-primary sm:h-5 sm:w-5" strokeWidth={2.5} />
                          <p className="font-mono text-[9px] font-bold tracking-[0.1em] text-accent-primary sm:text-[10px]">
                            HIGH DEMAND PREDICTED
                          </p>
                        </div>
                        <h3 className="mt-2 text-lg font-extrabold tracking-[-0.03em] text-text-navy sm:mt-3 sm:text-xl md:text-2xl">
                          {forecast.service_category}
                        </h3>
                        <p className="mt-1.5 text-xs text-text-secondary sm:mt-2 sm:text-sm">
                          {forecast.date} · {forecast.day_of_week}
                          {forecast.is_festival && ' · 🎉 Festival Day'}
                        </p>
                        
                        <div className="mt-3 grid grid-cols-3 gap-3 sm:mt-4 sm:gap-4">
                          <div>
                            <p className="font-mono text-[8px] font-semibold tracking-[0.12em] text-text-tertiary sm:text-[9px]">
                              PREDICTED
                            </p>
                            <p className="mt-1 text-lg font-extrabold tracking-[-0.04em] text-text-navy sm:text-xl">
                              {forecast.predicted_demand}
                            </p>
                            <p className="text-[10px] text-text-tertiary sm:text-xs">jobs</p>
                          </div>
                          <div className="border-l border-text-navy/10 pl-3 sm:pl-4">
                            <p className="font-mono text-[8px] font-semibold tracking-[0.12em] text-text-tertiary sm:text-[9px]">
                              CONFIDENCE
                            </p>
                            <p className="mt-1 text-lg font-extrabold tracking-[-0.04em] text-text-navy sm:text-xl">
                              {Math.round(forecast.confidence_score * 100)}%
                            </p>
                          </div>
                          <div className="border-l border-text-navy/10 pl-3 sm:pl-4">
                            <p className="font-mono text-[8px] font-semibold tracking-[0.12em] text-accent-primary sm:text-[9px]">
                              DAY FACTOR
                            </p>
                            <p className="mt-1 text-lg font-extrabold tracking-[-0.04em] text-accent-primary sm:text-xl">
                              {forecast.factors?.day_factor}x
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
            </div>
          </section>
        )}

        {/* 7-Day Forecast Visualization */}
        <section className="space-y-4 sm:space-y-6">
          <div>
            <p className="font-mono text-[10px] font-semibold tracking-[0.14em] text-text-secondary sm:text-[11px] sm:tracking-[0.16em]">
              FORECAST TIMELINE
            </p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.055em] text-text-navy sm:text-3xl md:text-4xl">
              Next 7 Days
            </h2>
          </div>

          <div className="overflow-hidden rounded-[24px] border border-status-subtle bg-white p-4 sm:rounded-[32px] sm:p-6 md:p-8">
            <div className="space-y-6 sm:space-y-8">
              {Object.entries(forecastsByDate).map(([date, dayForecasts]: [string, any]) => (
                <div key={date} className="space-y-3 sm:space-y-4">
                  <h3 className="text-base font-extrabold tracking-[-0.03em] text-text-navy sm:text-lg">
                    {new Date(date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'short', 
                      day: 'numeric' 
                    })} {dayForecasts[0]?.is_weekend && '🏠'}
                  </h3>
                  
                  <div className="space-y-3">
                    {dayForecasts.map((forecast: any, index: number) => {
                      const maxDemand = 40;
                      const pct = Math.min((forecast.predicted_demand / maxDemand) * 100, 100);
                      
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex flex-col gap-1.5 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm">
                            <span className="font-semibold text-text-navy">{forecast.service_category}</span>
                            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-text-tertiary sm:gap-3 sm:text-xs">
                              <span>{forecast.predicted_demand} predicted jobs</span>
                              <span className="font-bold text-text-secondary">
                                {Math.round(forecast.confidence_score * 100)}% confidence
                              </span>
                            </div>
                          </div>
                          
                          <div className="relative h-9 overflow-hidden rounded-lg bg-[#f3f3f3] sm:h-10 sm:rounded-xl">
                            <div className="h-full bg-text-navy transition-all" style={{ width: `${pct}%` }} />
                            <div className="absolute inset-0 flex items-center px-3 sm:px-4">
                              <span className="font-mono text-[9px] font-semibold text-white sm:text-xs">
                                {forecast.predicted_demand} JOBS PREDICTED
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Model Info */}
        {modelInfo && (
          <section className="rounded-[20px] border-2 border-accent-primary/20 bg-accent-light/20 p-5 sm:rounded-[24px] sm:p-6 md:p-8">
            <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-accent-primary sm:text-[10px]">
              MODEL INFORMATION
            </p>
            <h3 className="mt-2 text-lg font-extrabold tracking-[-0.03em] text-text-navy sm:mt-3 sm:text-xl">
              {modelInfo.algorithm}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary sm:mt-3 sm:text-sm">
              Features: {modelInfo.features?.join(', ')} · 
              Training data: {modelInfo.training_data_points} real jobs
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
