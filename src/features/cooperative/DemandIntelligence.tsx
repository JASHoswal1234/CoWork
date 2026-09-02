/**
 * Demand Intelligence Page
 * 
 * PRIORITY SCREEN #5: AI-powered demand forecasting (SIMULATED)
 * 
 * Validates Requirements: 8.1-8.6, 16.6
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
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
    <div className="min-h-screen px-6 py-12 max-w-7xl mx-auto">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <button
            onClick={() => navigate('/')}
            className="text-accent-primary font-medium mb-4 hover:underline"
          >
            ← Back to Dashboard
          </button>
          
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 mt-2">
              <TrendingUp
                size={48}
                strokeWidth={1.5}
                className="text-accent-primary"
              />
            </div>
            <div>
              <div className="text-sm font-mono text-accent-primary mb-2">AI-POWERED FEATURE</div>
              <h1 className="text-4xl font-extrabold text-text-navy mb-3">
                Demand Intelligence
              </h1>
              <p className="text-text-secondary text-lg">
                7-day demand forecasting with capacity analysis
              </p>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full font-mono text-sm transition-all ${
                selectedCategory === cat
                  ? 'bg-accent-primary text-white'
                  : 'bg-status-subtle text-text-secondary hover:bg-status-neutral hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Shortage Alerts */}
        {shortages.length > 0 && (
          <Card variant="elevated" padding="lg" className="border-l-4 border-accent-primary">
            <h2 className="text-xl font-extrabold text-text-navy mb-4">
              Shortage Alerts
            </h2>
            <div className="space-y-3">
              {shortages.slice(0, 3).map((forecast, index) => (
                <div key={index} className="flex justify-between items-center p-4 bg-accent-light rounded-lg">
                  <div>
                    <p className="font-semibold text-text-navy">
                      {forecast.serviceCategory} - {forecast.date.toLocaleDateString()}
                    </p>
                    <p className="text-sm text-text-secondary">
                      Predicted {forecast.predictedDemand} requests, only {forecast.availableCapacity} workers available
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-text-tertiary">SHORTAGE</p>
                    <p className="text-2xl font-extrabold text-accent-primary">
                      -{forecast.predictedDemand - forecast.availableCapacity}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Forecast Chart (Simplified) */}
        <Card variant="container" padding="lg">
          <h2 className="text-2xl font-extrabold text-text-navy mb-6">
            7-Day Forecast
          </h2>
          
          <div className="space-y-6">
            {Object.entries(forecastsByDate).map(([date, dayForecasts]) => (
              <div key={date} className="space-y-3">
                <h3 className="font-semibold text-text-navy">{date}</h3>
                <div className="grid grid-cols-1 gap-3">
                  {dayForecasts.map((forecast, index) => {
                    const utilizationPercent = (forecast.predictedDemand / forecast.availableCapacity) * 100;
                    
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-text-navy">{forecast.serviceCategory}</span>
                          <span className="text-text-tertiary">
                            {forecast.predictedDemand} demand / {forecast.availableCapacity} capacity
                          </span>
                        </div>
                        <div className="h-8 bg-status-subtle rounded-lg overflow-hidden relative">
                          <div
                            className={`h-full transition-all ${
                              forecast.shortage ? 'bg-accent-primary' : 'bg-text-navy'
                            }`}
                            style={{ width: `${Math.min(utilizationPercent, 100)}%` }}
                          />
                          {forecast.shortage && utilizationPercent > 100 && (
                            <div className="absolute inset-0 flex items-center justify-end pr-4">
                              <span className="text-white font-bold text-sm">
                                {Math.round(utilizationPercent - 100)}% over capacity
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex justify-between text-xs text-text-tertiary">
                          <span>Confidence: {Math.round(forecast.confidenceLevel * 100)}%</span>
                          {forecast.shortage && (
                            <span className="text-accent-primary font-semibold">SHORTAGE PREDICTED</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Disclaimer */}
        <Card variant="bento" padding="lg" className="bg-accent-light">
          <p className="text-sm text-text-secondary">
            <strong className="text-text-navy">Forecasting Methodology:</strong> Forecasts generated using historical demand patterns and seasonal trends (DEMO). 
            In production, this would use machine learning models trained on real operational data.
          </p>
        </Card>
      </div>
    </div>
  );
}
