/**
 * Mock Data Context Provider
 * 
 * Provides access to all hardcoded mock data and manages global app state.
 * 
 * Validates Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6
 */

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { mockWorkers } from '../data/workers';
import { mockServiceCategories } from '../data/services';
import { mockDemandForecasts } from '../data/forecasts';
import { mockSkillGaps } from '../data/skillGaps';
import { mockJobs } from '../data/jobs';
import type { Worker } from '../types/worker';
import type { ServiceCategory } from '../types/service';
import type { DemandForecast, SkillGapAnalysis } from '../types/forecast';
import type { Job } from '../types/job';

interface MockDataContextType {
  workers: Worker[];
  services: ServiceCategory[];
  forecasts: DemandForecast[];
  skillGaps: SkillGapAnalysis[];
  jobs: Job[];
  getWorkerById: (id: string) => Worker | undefined;
  getServiceById: (id: string) => ServiceCategory | undefined;
  getJobById: (id: string) => Job | undefined;
  updateJobStatus: (jobId: string, status: Job['status']) => void;
  addRating: (jobId: string, rating: number, review: string) => void;
}

const MockDataContext = createContext<MockDataContextType | undefined>(undefined);

interface MockDataProviderProps {
  children: ReactNode;
}

export function MockDataProvider({ children }: MockDataProviderProps) {
  const [jobs, setJobs] = useState<Job[]>(mockJobs);

  const getWorkerById = (id: string): Worker | undefined => {
    return mockWorkers.find(worker => worker.id === id);
  };

  const getServiceById = (id: string): ServiceCategory | undefined => {
    return mockServiceCategories.find(service => service.id === id);
  };

  const getJobById = (id: string): Job | undefined => {
    return jobs.find(job => job.id === id);
  };

  const updateJobStatus = (jobId: string, status: Job['status']) => {
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId
          ? { ...job, status, completedAt: status === 'completed' ? new Date() : job.completedAt }
          : job
      )
    );
  };

  const addRating = (jobId: string, rating: number, review: string) => {
    setJobs(prevJobs =>
      prevJobs.map(job =>
        job.id === jobId
          ? { ...job, rating, review, status: 'completed', completedAt: new Date() }
          : job
      )
    );
  };

  return (
    <MockDataContext.Provider
      value={{
        workers: mockWorkers,
        services: mockServiceCategories,
        forecasts: mockDemandForecasts,
        skillGaps: mockSkillGaps,
        jobs,
        getWorkerById,
        getServiceById,
        getJobById,
        updateJobStatus,
        addRating
      }}
    >
      {children}
    </MockDataContext.Provider>
  );
}

/**
 * Hook to access mock data context
 */
export function useMockData() {
  const context = useContext(MockDataContext);
  if (context === undefined) {
    throw new Error('useMockData must be used within a MockDataProvider');
  }
  return context;
}
