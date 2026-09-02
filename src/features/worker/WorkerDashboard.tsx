/**
 * Worker Dashboard
 * 
 * PRIORITY SCREEN #2 PART 1: Worker dashboard with availability toggle
 * 
 * Validates Requirements: 4.1, 4.2
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, BookOpen, Circle } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { Button } from '../../components/primitives/Button';

export function WorkerDashboard() {
  const [available, setAvailable] = useState(true);
  const navigate = useNavigate();

  const stats = {
    todayEarnings: 1250,
    activeJobs: 1,
    completedToday: 3
  };

  return (
    <div className="min-h-screen px-6 py-12 max-w-6xl mx-auto">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-text-navy mb-2">
              Worker Dashboard
            </h1>
            <p className="text-text-secondary">Welcome back, Rajesh!</p>
          </div>
          
          {/* Availability Toggle */}
          <div className="w-full md:w-auto">
            <div className="relative bg-status-subtle rounded-full p-1 w-full md:w-80">
              {/* Sliding Background */}
              <div 
                className={`absolute top-1 bottom-1 rounded-full bg-accent-primary transition-all duration-300 ease-in-out ${
                  available ? 'left-1 right-1/2 mr-0.5' : 'left-1/2 right-1 ml-0.5'
                }`}
              />
              
              {/* Toggle Options */}
              <div className="relative grid grid-cols-2 gap-1">
                <button
                  onClick={() => setAvailable(true)}
                  className={`py-3 px-4 rounded-full font-semibold text-sm transition-colors duration-300 flex items-center justify-center gap-2 ${
                    available ? 'text-white' : 'text-text-secondary'
                  }`}
                >
                  <Circle 
                    size={10} 
                    fill="currentColor" 
                    className={available ? 'text-green-400' : 'text-gray-400'}
                  />
                  Available
                </button>
                
                <button
                  onClick={() => setAvailable(false)}
                  className={`py-3 px-4 rounded-full font-semibold text-sm transition-colors duration-300 flex items-center justify-center gap-2 ${
                    !available ? 'text-white' : 'text-text-secondary'
                  }`}
                >
                  <Circle 
                    size={10} 
                    fill="currentColor" 
                    className={!available ? 'text-gray-400' : 'text-gray-300'}
                  />
                  Unavailable
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="bento" padding="lg">
            <p className="text-sm font-mono text-text-tertiary mb-2">TODAY'S EARNINGS</p>
            <p className="text-4xl font-extrabold text-accent-primary">
              ₹{stats.todayEarnings}
            </p>
          </Card>

          <Card variant="bento" padding="lg">
            <p className="text-sm font-mono text-text-tertiary mb-2">ACTIVE JOBS</p>
            <p className="text-4xl font-extrabold text-text-navy">
              {stats.activeJobs}
            </p>
          </Card>

          <Card variant="bento" padding="lg">
            <p className="text-sm font-mono text-text-tertiary mb-2">COMPLETED TODAY</p>
            <p className="text-4xl font-extrabold text-text-navy">
              {stats.completedToday}
            </p>
          </Card>
        </div>

        {/* Mock Incoming Job */}
        {available && (
          <Card variant="elevated" padding="lg">
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-mono text-accent-primary mb-2">NEW REQUEST</p>
                  <h3 className="text-2xl font-extrabold text-text-navy mb-2">
                    Kitchen Sink Leak Repair
                  </h3>
                  <p className="text-text-secondary">Sector 18, Rohini · 2.5 km away</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-extrabold text-accent-primary">₹500</p>
                  <p className="text-sm text-text-tertiary">Est. earnings</p>
                </div>
              </div>

              <Button 
                variant="primary" 
                size="lg" 
                fullWidth
                onClick={() => navigate('/job/JOB001')}
              >
                View Details →
              </Button>
            </div>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="bento" padding="lg" interactive onClick={() => navigate('/passport')}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-text-navy mb-2">
                  Skill Passport
                </h3>
                <p className="text-text-secondary text-sm">
                  View your skills and certifications
                </p>
              </div>
              <FileText size={40} strokeWidth={1.5} className="text-accent-primary" />
            </div>
          </Card>

          <Card variant="bento" padding="lg" interactive>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-extrabold text-text-navy mb-2">
                  Training
                </h3>
                <p className="text-text-secondary text-sm">
                  Continue your learning journey
                </p>
              </div>
              <BookOpen size={40} strokeWidth={1.5} className="text-accent-primary" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
