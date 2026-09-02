/**
 * Demand Intelligence Page
 * 
 * PRIORITY SCREEN #5: AI-powered demand forecasting (SIMULATED)
 * Phase 3: Premium editorial redesign - PREDICTION → DECISION → ACTION flow
 * 
 * Validates Requirements: 8.1-8.6, 16.6
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useMockData } from '../../contexts/MockDataContext';

export function DemandIntelligence() {
  const navigate = useNavigate();
  const { forecasts } = useMockData();
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Get unique service categories
  const categories = ['All', ...Array.from(new Set(forecasts.map(f => f.serviceCategory)))];

  // Filter forecasts
  const filteredForecasts = selectedCategory === 'All'
    ? forecasts
    : forecasts.filter(f => f.serviceCategory === selectedCategory);

  // Group by date
  const forecastsByDate = filteredForecasts.reduce((acc, forecast) => {
    const dateKey = forecast.date.toLocaleDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(forecast);
    return acc;
  }, {} as Record<string, typeof forecasts>);

  // Get shortage alerts
  const shortages = forecasts.filter(f => f.shortage);

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
                Predicted Shortages
              </h2>
            </div>
            
            <div className="space-y-3">
              {shortages.slice(0, 5).map((forecast, index) => {
                const shortageAmount = forecast.predictedDemand - forecast.availableCapacity;
                
                return (
                  <article 
                    key={index} 
                    className="overflow-hidden rounded-[20px] border-2 border-accent-primary/20 bg-accent-light/30 p-4 sm:rounded-[24px] sm:p-5 md:p-6"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={18} className="flex-shrink-0 text-accent-primary sm:h-5 sm:w-5" strokeWidth={2.5} />
                          <p className="font-mono text-[9px] font-bold tracking-[0.1em] text-accent-primary sm:text-[10px]">
                            WORKFORCE ALERT
                          </p>
                        </div>
                        <h3 className="mt-2 text-lg font-extrabold tracking-[-0.03em] text-text-navy sm:mt-3 sm:text-xl md:text-2xl">
                          {forecast.serviceCategory}
                        </h3>
                        <p className="mt-1.5 text-xs text-text-secondary sm:mt-2 sm:text-sm">
                          {forecast.date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </p>
                        
                        <div className="mt-3 grid grid-cols-3 gap-3 sm:mt-4 sm:gap-4">
                          <div>
                            <p className="font-mono text-[8px] font-semibold tracking-[0.12em] text-text-tertiary sm:text-[9px]">
                              EXPECTED
                            </p>
                            <p className="mt-1 text-lg font-extrabold tracking-[-0.04em] text-text-navy sm:text-xl">
                              {forecast.predictedDemand}
                            </p>
                            <p className="text-[10px] text-text-tertiary sm:text-xs">jobs</p>
                          </div>
                          <div className="border-l border-text-navy/10 pl-3 sm:pl-4">
                            <p className="font-mono text-[8px] font-semibold tracking-[0.12em] text-text-tertiary sm:text-[9px]">
                              CAPACITY
                            </p>
                            <p className="mt-1 text-lg font-extrabold tracking-[-0.04em] text-text-navy sm:text-xl">
                              {forecast.availableCapacity}
                            </p>
                            <p className="text-[10px] text-text-tertiary sm:text-xs">workers</p>
                          </div>
                          <div className="border-l border-text-navy/10 pl-3 sm:pl-4">
                            <p className="font-mono text-[8px] font-semibold tracking-[0.12em] text-accent-primary sm:text-[9px]">
                              SHORTAGE
                            </p>
                            <p className="mt-1 text-lg font-extrabold tracking-[-0.04em] text-accent-primary sm:text-xl">
                              -{shortageAmount}
                            </p>
                            <p className="text-[10px] text-accent-primary sm:text-xs">jobs</p>
                          </div>
                        </div>

                        {/* Action Recommendation */}
                        <div className="mt-4 rounded-xl border border-accent-primary/20 bg-white/60 p-3 sm:mt-5">
                          <p className="font-mono text-[8px] font-semibold tracking-[0.1em] text-accent-primary sm:text-[9px]">
                            RECOMMENDED ACTION
                          </p>
                          <p className="mt-1 text-xs font-medium leading-relaxed text-text-navy sm:text-sm">
                            Prioritize {forecast.serviceCategory.toLowerCase()} workers in high-demand areas. 
                            Consider skill training for adjacent workers.
                          </p>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
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
              {Object.entries(forecastsByDate).map(([date, dayForecasts]) => (
                <div key={date} className="space-y-3 sm:space-y-4">
                  <h3 className="text-base font-extrabold tracking-[-0.03em] text-text-navy sm:text-lg">
                    {new Date(dayForecasts[0].date).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </h3>
                  
                  <div className="space-y-3">
                    {dayForecasts.map((forecast, index) => {
                      const utilizationPercent = (forecast.predictedDemand / forecast.availableCapacity) * 100;
                      const isOverCapacity = utilizationPercent > 100;
                      
                      return (
                        <div key={index} className="space-y-2">
                          <div className="flex flex-col gap-1.5 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm">
                            <span className="font-semibold text-text-navy">{forecast.serviceCategory}</span>
                            <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] text-text-tertiary sm:gap-3 sm:text-xs">
                              <span>{forecast.predictedDemand} demand</span>
                              <span>/</span>
                              <span>{forecast.availableCapacity} capacity</span>
                              <span className={`font-bold ${forecast.shortage ? 'text-accent-primary' : 'text-text-secondary'}`}>
                                {Math.round(utilizationPercent)}%
                              </span>
                            </div>
                          </div>
                          
                          {/* Capacity Bar */}
                          <div className="relative h-9 overflow-hidden rounded-lg bg-[#f3f3f3] sm:h-10 sm:rounded-xl">
                            <div
                              className={`h-full transition-all ${
                                forecast.shortage ? 'bg-accent-primary' : 'bg-text-navy'
                              }`}
                              style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                            />
                            {isOverCapacity && (
                              <div className="absolute inset-0 flex items-center justify-end px-3 sm:pr-4">
                                <span className="font-mono text-[9px] font-bold text-white sm:text-xs">
                                  {Math.round(utilizationPercent - 100)}% OVER
                                </span>
                              </div>
                            )}
                            {!isOverCapacity && (
                              <div className="absolute inset-0 flex items-center px-3 sm:px-4">
                                <span className="font-mono text-[9px] font-semibold text-white sm:text-xs">
                                  DEMAND vs CAPACITY
                                </span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                            <span className="font-mono text-[8px] tracking-[0.08em] text-text-tertiary sm:text-[9px]">
                              Confidence: {Math.round(forecast.confidenceLevel * 100)}%
                            </span>
                            {forecast.shortage && (
                              <span className="font-mono text-[8px] font-bold tracking-[0.1em] text-accent-primary sm:text-[9px]">
                                SHORTAGE PREDICTED
                              </span>
                            )}
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

        {/* Methodology Disclaimer */}
        <section className="rounded-[20px] border-2 border-accent-primary/20 bg-accent-light/20 p-5 sm:rounded-[24px] sm:p-6 md:p-8">
          <p className="font-mono text-[9px] font-semibold tracking-[0.12em] text-accent-primary sm:text-[10px]">
            ABOUT THIS FEATURE
          </p>
          <h3 className="mt-2 text-lg font-extrabold tracking-[-0.03em] text-text-navy sm:mt-3 sm:text-xl">
            Forecasting Methodology
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-text-secondary sm:mt-3 sm:text-sm">
            <strong className="font-semibold text-text-navy">DEMO:</strong> Forecasts generated using 
            historical demand patterns and seasonal trends (simulated). In production, this would use 
            machine learning models trained on real operational data, weather patterns, local events, 
            and service history to predict demand with greater accuracy.
          </p>
        </section>
      </div>
    </main>
  );
}
