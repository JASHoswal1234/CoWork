/**
 * Incoming Job Request Page
 * 
 * PRIORITY SCREEN #2 PART 2: Worker incoming job with accept/reject
 * 
 * Validates Requirements: 4.3, 4.4, 16.3
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../../components/primitives/Card';
import { Button } from '../../components/primitives/Button';

export function IncomingJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [navigate]);

  const handleAccept = () => {
    // In a real app, update job status
    alert('Job accepted! Customer has been notified.');
    navigate('/');
  };

  const handleReject = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen px-6 py-12 max-w-3xl mx-auto">
      <div className="space-y-8">
        {/* Timer */}
        <div className="text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
            timeLeft <= 10 ? 'bg-red-100 text-red-600' : 'bg-accent-light text-accent-primary'
          }`}>
            <span className="text-sm font-mono font-semibold">
              ⏱️ {timeLeft} seconds remaining
            </span>
          </div>
        </div>

        {/* Job Card */}
        <Card variant="container" padding="lg">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <p className="text-sm font-mono text-accent-primary mb-3">
                NEW REQUEST
              </p>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-text-navy mb-4">
                Kitchen Sink Leak Repair
              </h1>
            </div>

            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-y border-status-subtle">
              <div>
                <p className="text-sm font-mono text-text-tertiary mb-2">CUSTOMER</p>
                <p className="text-lg font-semibold">Priya Sharma</p>
              </div>
              <div>
                <p className="text-sm font-mono text-text-tertiary mb-2">LOCATION</p>
                <p className="text-lg font-semibold">B-45, Sector 18, Rohini</p>
                <p className="text-text-secondary">2.5 km away</p>
              </div>
            </div>

            {/* Job Details */}
            <div>
              <p className="text-sm font-mono text-text-tertiary mb-2">DESCRIPTION</p>
              <p className="text-text-secondary">
                Kitchen sink tap is leaking continuously. Needs immediate fixing.
              </p>
            </div>

            {/* Earnings */}
            <div className="bg-accent-light rounded-lg p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-mono text-accent-primary mb-1">
                    ESTIMATED EARNINGS
                  </p>
                  <p className="text-4xl font-extrabold text-accent-primary">
                    ₹425
                  </p>
                  <p className="text-sm text-text-tertiary mt-1">
                    (Customer pays ₹500, 15% cooperative share)
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-text-tertiary mb-1">EST. DURATION</p>
                  <p className="text-2xl font-extrabold text-text-navy">
                    1 hour
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button 
                variant="primary" 
                size="lg" 
                fullWidth
                onClick={handleAccept}
              >
                Accept Job
              </Button>
              <button
                onClick={handleReject}
                className="w-full text-text-tertiary hover:text-text-primary transition-colors py-2"
              >
                Reject
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
