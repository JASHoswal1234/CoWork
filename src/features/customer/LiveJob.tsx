/**
 * Live Job Tracking Page
 * 
 * PRIORITY SCREEN #1 PART 2: Customer live job tracking
 * 
 * Validates Requirements: 3.5, 3.6, 16.2
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../../components/primitives/Card';
import { Button } from '../../components/primitives/Button';

export function LiveJob() {
  const { jobId } = useParams();
  const [eta, setEta] = useState(15);
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);

  useEffect(() => {
    // Countdown ETA
    const interval = setInterval(() => {
      setEta((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, []);

  // Mock worker data
  const worker = {
    name: 'Rajesh Kumar',
    photo: '👨‍🔧',
    rating: 4.8,
    completedJobs: 167,
    phone: '+91 98765 43210'
  };

  if (showRating) {
    return (
      <div className="min-h-screen px-6 py-12 max-w-2xl mx-auto">
        <Card variant="container" padding="lg">
          <div className="space-y-6 text-center">
            <h2 className="text-3xl font-extrabold text-text-navy">
              Service Completed!
            </h2>
            
            <p className="text-text-secondary">
              How was your experience with {worker.name}?
            </p>

            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="text-4xl transition-transform hover:scale-110"
                >
                  {star <= rating ? '⭐' : '☆'}
                </button>
              ))}
            </div>

            <textarea
              placeholder="Share your feedback (optional)"
              rows={4}
              className="w-full px-4 py-3 border-2 border-status-subtle rounded-lg focus:border-accent-primary focus:outline-none resize-none"
            />

            <Button variant="primary" size="lg" fullWidth>
              Submit Rating
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12 max-w-4xl mx-auto">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-extrabold text-text-navy mb-2">
            Worker On The Way
          </h1>
          <p className="text-text-secondary">Job #{jobId}</p>
        </div>

        {/* Worker Card */}
        <Card variant="container" padding="lg">
          <div className="flex items-center gap-6 mb-6">
            <div className="text-6xl">{worker.photo}</div>
            <div className="flex-1">
              <h3 className="text-2xl font-extrabold text-text-navy mb-1">
                {worker.name}
              </h3>
              <div className="flex items-center gap-4 text-text-secondary">
                <span>⭐ {worker.rating}</span>
                <span>·</span>
                <span>{worker.completedJobs} jobs</span>
              </div>
            </div>
          </div>

          {/* ETA */}
          <div className="bg-accent-light rounded-lg p-6 mb-6">
            <p className="text-sm font-mono text-accent-primary mb-2">
              ESTIMATED ARRIVAL
            </p>
            <p className="text-4xl font-extrabold text-accent-primary">
              {eta} minutes
            </p>
          </div>

          {/* Service Details */}
          <div className="space-y-4 mb-6">
            <div>
              <p className="text-sm font-mono text-text-tertiary mb-1">SERVICE</p>
              <p className="text-lg font-semibold">Plumbing - Leak Repair</p>
            </div>
            <div>
              <p className="text-sm font-mono text-text-tertiary mb-1">LOCATION</p>
              <p className="text-text-secondary">Demo Location, Delhi</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <Button variant="outline" fullWidth>
              📞 Call Worker
            </Button>
            <Button 
              variant="primary" 
              fullWidth
              onClick={() => setShowRating(true)}
            >
              Mark Complete
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
