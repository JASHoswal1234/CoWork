/**
 * Operations Dashboard
 * 
 * PRIORITY SCREEN #4: Cooperative operations with KPIs and workforce map
 * 
 * Validates Requirements: 6.1-6.7, 14.5, 16.5, 7.1-7.5
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, GraduationCap, MapPin, Clock, User } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { Button } from '../../components/primitives/Button';
import { useMockData } from '../../contexts/MockDataContext';

export function OperationsDashboard() {
  const navigate = useNavigate();
  const { jobs, workers } = useMockData();

  // Get active jobs (in-progress and accepted)
  const activeJobs = jobs.filter(job => 
    job.status === 'in-progress' || job.status === 'accepted'
  );

  // Get today's completed jobs
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const completedToday = jobs.filter(job => {
    if (job.status !== 'completed' || !job.completedAt) return false;
    const completedDate = new Date(job.completedAt);
    completedDate.setHours(0, 0, 0, 0);
    return completedDate.getTime() === today.getTime();
  });

  // Calculate today's revenue
  const todayRevenue = completedToday.reduce((sum, job) => sum + (job.actualPrice || job.estimatedPrice), 0);
  const cooperativeShare = todayRevenue * 0.15;

  // Count available workers
  const availableWorkers = workers.filter(w => w.available).length;

  const kpis = {
    activeJobs: activeJobs.length,
    availableWorkers: availableWorkers,
    totalWorkers: workers.length,
    completedToday: completedToday.length,
    todayRevenue: todayRevenue,
    cooperativeShare: cooperativeShare
  };

  // Mock heatmap data (simplified)
  const heatmapData = [
    { area: 'North Delhi', workers: 12, demand: 8, intensity: 'medium' },
    { area: 'South Delhi', workers: 15, demand: 14, intensity: 'high' },
    { area: 'East Delhi', workers: 8, demand: 11, intensity: 'high' },
    { area: 'West Delhi', workers: 10, demand: 7, intensity: 'low' }
  ];

  return (
    <div className="min-h-screen px-6 py-12 max-w-7xl mx-auto">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-extrabold text-text-navy mb-2">
            Operations Dashboard
          </h1>
          <p className="text-text-secondary">Real-time workforce and demand overview</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card variant="bento" padding="lg">
            <p className="text-sm font-mono text-text-tertiary mb-2">ACTIVE JOBS</p>
            <p className="text-5xl font-extrabold text-text-navy">
              {kpis.activeJobs}
            </p>
          </Card>

          <Card variant="bento" padding="lg">
            <p className="text-sm font-mono text-text-tertiary mb-2">AVAILABLE WORKERS</p>
            <p className="text-5xl font-extrabold text-accent-primary">
              {kpis.availableWorkers}
            </p>
            <p className="text-sm text-text-tertiary mt-2">of {kpis.totalWorkers} total</p>
          </Card>

          <Card variant="bento" padding="lg">
            <p className="text-sm font-mono text-text-tertiary mb-2">COMPLETED TODAY</p>
            <p className="text-5xl font-extrabold text-text-navy">
              {kpis.completedToday}
            </p>
          </Card>

          <Card variant="bento" padding="lg">
            <p className="text-sm font-mono text-text-tertiary mb-2">TODAY'S REVENUE</p>
            <p className="text-4xl font-extrabold text-accent-primary">
              ₹{kpis.todayRevenue.toLocaleString()}
            </p>
            <p className="text-sm text-text-tertiary mt-2">
              Cooperative: ₹{kpis.cooperativeShare.toLocaleString()} (15%)
            </p>
          </Card>
        </div>

        {/* Workforce & Demand Heatmap */}
        <Card variant="container" padding="lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-extrabold text-text-navy">
              Workforce & Demand Heatmap
            </h2>
            <div className="flex gap-2 text-sm">
              <button className="px-3 py-1 bg-accent-primary text-white rounded-full font-mono">
                All Services
              </button>
              <button className="px-3 py-1 bg-status-subtle text-text-tertiary rounded-full font-mono">
                Today
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {heatmapData.map((area, index) => (
              <div 
                key={index}
                className={`p-6 rounded-lg border-2 ${
                  area.intensity === 'high' 
                    ? 'border-accent-primary bg-accent-light' 
                    : area.intensity === 'medium'
                    ? 'border-status-neutral bg-status-subtle'
                    : 'border-status-subtle bg-background-surface'
                }`}
              >
                <h3 className="font-extrabold text-lg text-text-navy mb-3">
                  {area.area}
                </h3>
                <div className="flex justify-between text-sm">
                  <div>
                    <p className="text-text-tertiary font-mono mb-1">WORKERS</p>
                    <p className="text-2xl font-extrabold text-text-navy">{area.workers}</p>
                  </div>
                  <div>
                    <p className="text-text-tertiary font-mono mb-1">DEMAND</p>
                    <p className="text-2xl font-extrabold text-accent-primary">{area.demand}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-status-subtle">
            <p className="text-sm text-text-tertiary font-mono mb-2">LEGEND</p>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-accent-light border-2 border-accent-primary rounded" />
                <span className="text-sm text-text-secondary">High Demand</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-status-subtle border-2 border-status-neutral rounded" />
                <span className="text-sm text-text-secondary">Medium Demand</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-background-surface border-2 border-status-subtle rounded" />
                <span className="text-sm text-text-secondary">Low Demand</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Intelligence Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card 
            variant="bento" 
            padding="lg" 
            interactive
            onClick={() => navigate('/intelligence/demand')}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-accent-primary mb-2">AI-POWERED</div>
                <h3 className="text-2xl font-extrabold text-text-navy mb-2">
                  Demand Intelligence
                </h3>
                <p className="text-text-secondary text-sm">
                  7-day demand forecasting with shortage alerts
                </p>
              </div>
              <TrendingUp size={48} strokeWidth={1.5} className="text-accent-primary" />
            </div>
          </Card>

          <Card 
            variant="bento" 
            padding="lg" 
            interactive
            onClick={() => navigate('/intelligence/skills')}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-mono text-accent-primary mb-2">AI-POWERED</div>
                <h3 className="text-2xl font-extrabold text-text-navy mb-2">
                  Skill Intelligence
                </h3>
                <p className="text-text-secondary text-sm">
                  Skill gap analysis and training recommendations
                </p>
              </div>
              <GraduationCap size={48} strokeWidth={1.5} className="text-accent-primary" />
            </div>
          </Card>
        </div>

        {/* Active Jobs List */}
        <Card variant="container" padding="lg">
          <h2 className="text-2xl font-extrabold text-text-navy mb-6">
            Active Jobs
          </h2>
          
          {activeJobs.length === 0 ? (
            <p className="text-text-secondary text-center py-8">No active jobs at the moment</p>
          ) : (
            <div className="space-y-4">
              {activeJobs.map((job) => {
                const worker = workers.find(w => w.id === job.assignedWorkerId);
                
                return (
                  <div 
                    key={job.id}
                    className="p-4 border-2 border-status-subtle rounded-lg hover:border-accent-primary transition-colors"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-mono font-bold mb-2 ${
                          job.status === 'in-progress' 
                            ? 'bg-accent-primary text-white' 
                            : 'bg-text-navy text-white'
                        }`}>
                          {job.status === 'in-progress' ? 'IN PROGRESS' : 'ACCEPTED'}
                        </span>
                        <h3 className="text-lg font-extrabold text-text-navy">
                          {job.serviceCategory} - {job.serviceSubcategory}
                        </h3>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-mono text-text-tertiary">JOB ID</p>
                        <p className="text-sm font-bold text-text-navy">{job.id}</p>
                      </div>
                    </div>

                    <p className="text-text-secondary text-sm mb-3">{job.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3 border-t border-status-subtle">
                      <div className="flex items-start gap-2">
                        <User size={16} className="text-text-tertiary mt-0.5" />
                        <div>
                          <p className="text-xs font-mono text-text-tertiary">CUSTOMER</p>
                          <p className="text-sm font-semibold text-text-navy">{job.customerName}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <User size={16} className="text-accent-primary mt-0.5" />
                        <div>
                          <p className="text-xs font-mono text-text-tertiary">WORKER</p>
                          <p className="text-sm font-semibold text-text-navy">
                            {worker ? worker.name : 'Assigning...'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin size={16} className="text-text-tertiary mt-0.5" />
                        <div>
                          <p className="text-xs font-mono text-text-tertiary">LOCATION</p>
                          <p className="text-sm font-semibold text-text-navy">
                            {job.customerLocation.address}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-status-subtle">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Clock size={14} className="text-text-tertiary" />
                          <span className="text-text-secondary">{job.estimatedDuration} min</span>
                        </div>
                        <div className="font-semibold text-accent-primary">
                          ₹{job.estimatedPrice}
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <span className="text-text-tertiary">Worker earns: </span>
                        <span className="font-bold text-text-navy">₹{job.workerEarnings}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
