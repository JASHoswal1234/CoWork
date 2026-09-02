/**
 * Mock demand forecast data for SAHAKAR // SERVICES
 * 
 * Validates Requirements: 11.4, 8.1, 8.2, 8.3, 8.4, 8.5
 * 
 * This file contains 7-day AI-powered demand forecasts for 5 service categories (35 entries total).
 * Forecasts include realistic patterns:
 * - Weekend spikes (Saturday/Sunday show increased demand)
 * - Shortage scenarios (where predicted demand exceeds available capacity)
 * - Confidence levels ranging from 0.80 to 0.95
 * - All forecasts marked with source: 'simulated-ml-model' for demo purposes
 */

import type { DemandForecast } from '../types/forecast';

/**
 * Generate 7-day demand forecasts for 5 major service categories
 * 
 * Pattern design:
 * - Plumbing: High weekday demand, critical shortage on Day 2
 * - Electrical: Moderate demand, weekend spike, shortage on Day 6
 * - Carpentry: Steady demand, weekend surge, shortage on Day 7
 * - Painting: Lower demand, weekend peak, moderate shortage on Day 6
 * - Cleaning: High weekend demand, critical shortage on Day 7
 * 
 * Total entries: 7 days × 5 categories = 35 forecasts
 */
export const mockDemandForecasts: DemandForecast[] = [
  // Day 1 (Monday) - January 15, 2024
  {
    date: new Date('2024-01-15'),
    serviceCategory: 'Plumbing',
    predictedDemand: 38,
    availableCapacity: 42,
    shortage: false,
    confidenceLevel: 0.87,
    historicalAverage: 35,
    source: 'simulated-ml-model'
  },
  {
    date: new Date('2024-01-15'),
    serviceCategory: 'Electrical',
    predictedDemand: 28,
    availableCapacity: 35,
    shortage: false,
    confidenceLevel: 0.84,
    historicalAverage: 26,
    source: 'simulated-ml-model'
  },
  {
    date: new Date('2024-01-15'),
    serviceCategory: 'Carpentry',
    predictedDemand: 22,
    availableCapacity: 25,
    shortage: false,
    confidenceLevel: 0.82,
    historicalAverage: 20,
    source: 'simulated-ml-model'
  },
  {
    date: new Date('2024-01-15'),
    serviceCategory: 'Painting',
    predictedDemand: 15,
    availableCapacity: 18,
    shortage: false,
    confidenceLevel: 0.80,
    historicalAverage: 14,
    source: 'simulated-ml-model'
  },
  {
    date: new Date('2024-01-15'),
    serviceCategory: 'Cleaning',
    predictedDemand: 32,
    availableCapacity: 38,
    shortage: false,
    confidenceLevel: 0.86,
    historicalAverage: 30,
    source: 'simulated-ml-model'
  },

  // Day 2 (Tuesday) - January 16, 2024
  {
    date: new Date('2024-01-16'),
    serviceCategory: 'Plumbing',
    predictedDemand: 45,
    availableCapacity: 32,
    shortage: true,
    confidenceLevel: 0.89,
    historicalAverage: 38,
    source: 'simulated-ml-model'
  },
  {
    date: new Date('2024-01-16'),
    serviceCategory: 'Electrical',
    predictedDemand: 30,
    availableCapacity: 36,
    shortage: false,
    confidenceLevel: 0.85,
    historicalAverage: 28,
    source: 'simulated-ml-model'
  },
  {
    date: new Date('2024-01-16'),
    serviceCategory: 'Carpentry',
    predictedDemand: 24,
    availableCapacity: 26,
    shortage: false,
    confidenceLevel: 0.83,
    historicalAverage: 22,
    source: 'simulated-ml-model'
  },
  {
    date: new Date('2024-01-16'),
    serviceCategory: 'Painting',
    predictedDemand: 16,
    availableCapacity: 19,
    shortage: false,
    confidenceLevel: 0.81,
    historicalAverage: 15,
    source: 'simulated-ml-model'
  },
  {
    date: new Date('2024-01-16'),
    serviceCategory: 'Cleaning',
    predictedDemand: 35,
    availableCapacity: 40,
    shortage: false,
    confidenceLevel: 0.87,
    historicalAverage: 32,
    source: 'simulated-ml-model'
  },

  // Day 3 (Wednesday) - January 17, 2024
  {
    date: new Date('2024-01-17'),
    serviceCategory: 'Plumbing',
    predictedDemand: 36,
    availableCapacity: 40,
    shortage: false,
    confidenceLevel: 0.86,
    historicalAverage: 34,
    source: 'simulated-ml-model'
  },
  {
    date: new Date('2024-01-17'),
    serviceCategory: 'Electrical',
    predictedDemand: 26,
    availableCapacity: 34,
    shortage: false,
    confidenceLevel: 0.83,
    historicalAverage: 25,
    source: 'simulated-ml-model'
  },
  {
    date: new Date('2024-01-17'),
    serviceCategory: 'Carpentry',
    predictedDemand: 20,
    availableCapacity: 24,
    shortage: false,
    confidenceLevel: 0.81,
    historicalAverage: 19,
    source: 'simulated-ml-model'
  },
  {
    date: new Date('2024-01-17'),
    serviceCategory: 'Painting',
    predictedDemand: 14,
    availableCapacity: 17,
    shortage: false,
    confidenceLevel: 0.80,
    historicalAverage: 13,
    source: 'simulated-ml-model'
  },
  {
    date: new Date('2024-01-17'),
    serviceCategory: 'Cleaning',
    predictedDemand: 30,
    availableCapacity: 36,
    shortage: false,
    confidenceLevel: 0.85,
    historicalAverage: 28,
    source: 'simulated-ml-model'
  },

  // Day 4 (Thursday) - January 18, 2024
  {
    date: new Date('2024-01-18'),
    serviceCategory: 'Plumbing',
    predictedDemand: 40,
    availableCapacity: 38,
    shortage: true,
    confidenceLevel: 0.88,
    historicalAverage: 36,
    source: 'simulated-ml-model'
  },
  {
    date: new Date('2024-01-18'),
    serviceCategory: 'Electrical',
    predictedDemand: 32,
    availableCapacity: 37,
    shortage: false,
    confidenceLevel: 0.86,
    historicalAverage: 30,
    source: 'simulated-ml-model'
  },
  {
    date: new Date('2024-01-18'),
    serviceCategory: 'Carpentry',
    predictedDemand: 23,
    availableCapacity: 27,
    shortage: false,
    confidenceLevel: 0.84,
    historicalAverage: 21,
    source: 'simulated-ml-model'
  },
  {
    date: new Date('2024-01-18'),
    serviceCategory: 'Painting',
    predictedDemand: 17,
    availableCapacity: 20,
    shortage: false,
    confidenceLevel: 0.82,
    historicalAverage: 16,
    source: 'simulated-ml-model'
  },
  {
    date: new Date('2024-01-18'),
    serviceCategory: 'Cleaning',
    predictedDemand: 34,
    availableCapacity: 39,
    shortage: false,
    confidenceLevel: 0.88,
    historicalAverage: 31,
    source: 'simulated-ml-model'
  },

  // Day 5 (Friday) - January 19, 2024
  {
    date: new Date('2024-01-19'),
    serviceCategory: 'Plumbing',
    predictedDemand: 42,
    availableCapacity: 45,
    shortage: false,
    confidenceLevel: 0.90,
    historicalAverage: 39,
    source: 'simulated-ml-model'
  },
  {
    date: new Date('2024-01-19'),
    serviceCategory: 'Electrical',
    predictedDemand: 35,
    availableCapacity: 40,
    shortage: false,
    confidenceLevel: 0.88,
    historicalAverage: 32,
    source: 'simulated-ml-model'
  },
  {
    date: new Date('2024-01-19'),
    serviceCategory: 'Carpentry',
    predictedDemand: 26,
    availableCapacity: 28,
    shortage: false,
    confidenceLevel: 0.85,
    historicalAverage: 24,
    source: 'simulated-ml-model'
  },
  {
    date: new Date('2024-01-19'),
    serviceCategory: 'Painting',
    predictedDemand: 18,
    availableCapacity: 21,
    shortage: false,
    confidenceLevel: 0.84,
    historicalAverage: 17,
    source: 'simulated-ml-model'
  },
  {
    date: new Date('2024-01-19'),
    serviceCategory: 'Cleaning',
    predictedDemand: 40,
    availableCapacity: 42,
    shortage: false,
    confidenceLevel: 0.90,
    historicalAverage: 36,
    source: 'simulated-ml-model'
  },

  // Day 6 (Saturday) - January 20, 2024 - Weekend spike
  {
    date: new Date('2024-01-20'),
    serviceCategory: 'Plumbing',
    predictedDemand: 52,
    availableCapacity: 48,
    shortage: true,
    confidenceLevel: 0.92,
    historicalAverage: 46,
    source: 'simulated-ml-model'
  },
  {
    date: new Date('2024-01-20'),
    serviceCategory: 'Electrical',
    predictedDemand: 44,
    availableCapacity: 38,
    shortage: true,
    confidenceLevel: 0.91,
    historicalAverage: 40,
    source: 'simulated-ml-model'
  },
  {
    date: new Date('2024-01-20'),
    serviceCategory: 'Carpentry',
    predictedDemand: 35,
    availableCapacity: 32,
    shortage: true,
    confidenceLevel: 0.89,
    historicalAverage: 31,
    source: 'simulated-ml-model'
  },
  {
    date: new Date('2024-01-20'),
    serviceCategory: 'Painting',
    predictedDemand: 26,
    availableCapacity: 24,
    shortage: true,
    confidenceLevel: 0.87,
    historicalAverage: 23,
    source: 'simulated-ml-model'
  },
  {
    date: new Date('2024-01-20'),
    serviceCategory: 'Cleaning',
    predictedDemand: 58,
    availableCapacity: 50,
    shortage: true,
    confidenceLevel: 0.93,
    historicalAverage: 52,
    source: 'simulated-ml-model'
  },

  // Day 7 (Sunday) - January 21, 2024 - Weekend spike continues
  {
    date: new Date('2024-01-21'),
    serviceCategory: 'Plumbing',
    predictedDemand: 48,
    availableCapacity: 44,
    shortage: true,
    confidenceLevel: 0.91,
    historicalAverage: 44,
    source: 'simulated-ml-model'
  },
  {
    date: new Date('2024-01-21'),
    serviceCategory: 'Electrical',
    predictedDemand: 40,
    availableCapacity: 36,
    shortage: true,
    confidenceLevel: 0.90,
    historicalAverage: 38,
    source: 'simulated-ml-model'
  },
  {
    date: new Date('2024-01-21'),
    serviceCategory: 'Carpentry',
    predictedDemand: 38,
    availableCapacity: 30,
    shortage: true,
    confidenceLevel: 0.88,
    historicalAverage: 33,
    source: 'simulated-ml-model'
  },
  {
    date: new Date('2024-01-21'),
    serviceCategory: 'Painting',
    predictedDemand: 24,
    availableCapacity: 22,
    shortage: true,
    confidenceLevel: 0.86,
    historicalAverage: 22,
    source: 'simulated-ml-model'
  },
  {
    date: new Date('2024-01-21'),
    serviceCategory: 'Cleaning',
    predictedDemand: 65,
    availableCapacity: 48,
    shortage: true,
    confidenceLevel: 0.95,
    historicalAverage: 56,
    source: 'simulated-ml-model'
  }
];

/**
 * Get forecasts for a specific service category
 */
export function getForecastsByCategory(category: string): DemandForecast[] {
  return mockDemandForecasts.filter(
    forecast => forecast.serviceCategory === category
  );
}

/**
 * Get forecasts for a specific date
 */
export function getForecastsByDate(date: Date): DemandForecast[] {
  return mockDemandForecasts.filter(
    forecast => forecast.date.toDateString() === date.toDateString()
  );
}

/**
 * Get all forecasts with shortages
 */
export function getShortageForecasts(): DemandForecast[] {
  return mockDemandForecasts.filter(forecast => forecast.shortage);
}

/**
 * Get forecasts for a date range
 */
export function getForecastsByDateRange(startDate: Date, endDate: Date): DemandForecast[] {
  return mockDemandForecasts.filter(
    forecast => forecast.date >= startDate && forecast.date <= endDate
  );
}

/**
 * Get summary statistics for all forecasts
 */
export function getForecastSummary() {
  const totalForecasts = mockDemandForecasts.length;
  const shortages = mockDemandForecasts.filter(f => f.shortage).length;
  const avgConfidence = mockDemandForecasts.reduce((sum, f) => sum + f.confidenceLevel, 0) / totalForecasts;
  const totalPredictedDemand = mockDemandForecasts.reduce((sum, f) => sum + f.predictedDemand, 0);
  const totalAvailableCapacity = mockDemandForecasts.reduce((sum, f) => sum + f.availableCapacity, 0);
  
  return {
    totalForecasts,
    shortages,
    shortagePercentage: (shortages / totalForecasts) * 100,
    avgConfidence,
    totalPredictedDemand,
    totalAvailableCapacity,
    overallCapacityGap: totalPredictedDemand - totalAvailableCapacity
  };
}
