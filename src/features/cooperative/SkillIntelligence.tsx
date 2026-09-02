/**
 * Skill Intelligence Page
 * 
 * PRIORITY SCREEN #6: AI-powered skill gap analysis (SIMULATED)
 * 
 * Validates Requirements: 9.1-9.6, 16.7
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { Card } from '../../components/primitives/Card';
import { useMockData } from '../../contexts/MockDataContext';

export function SkillIntelligence() {
  const navigate = useNavigate();
  const { skillGaps } = useMockData();

  // Sort by severity
  const sortedGaps = [...skillGaps].sort((a, b) => {
    const severityOrder = { CRITICAL: 0, MODERATE: 1, LOW: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  const criticalCount = skillGaps.filter(g => g.severity === 'CRITICAL').length;
  const moderateCount = skillGaps.filter(g => g.severity === 'MODERATE').length;
  const totalTrainingWeeks = skillGaps.reduce((sum, g) => sum + g.estimatedTrainingDuration, 0);

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
              <GraduationCap
                size={48}
                strokeWidth={1.5}
                className="text-accent-primary"
              />
            </div>
            <div>
              <div className="text-sm font-mono text-accent-primary mb-2">AI-POWERED FEATURE</div>
              <h1 className="text-4xl font-extrabold text-text-navy mb-3">
                Skill Intelligence
              </h1>
              <p className="text-text-secondary text-lg">
                Workforce skill gap analysis and training recommendations
              </p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="bento" padding="lg">
            <p className="text-sm font-mono text-text-tertiary mb-2">CRITICAL GAPS</p>
            <p className="text-5xl font-extrabold text-accent-primary">
              {criticalCount}
            </p>
          </Card>

          <Card variant="bento" padding="lg">
            <p className="text-sm font-mono text-text-tertiary mb-2">MODERATE GAPS</p>
            <p className="text-5xl font-extrabold text-text-navy">
              {moderateCount}
            </p>
          </Card>

          <Card variant="bento" padding="lg">
            <p className="text-sm font-mono text-text-tertiary mb-2">TRAINING NEEDED</p>
            <p className="text-5xl font-extrabold text-text-navy">
              {totalTrainingWeeks}
            </p>
            <p className="text-sm text-text-tertiary mt-2">weeks total</p>
          </Card>
        </div>

        {/* Skill Gaps */}
        <div className="space-y-6">
          {sortedGaps.map((gap, index) => (
            <Card 
              key={index} 
              variant="container" 
              padding="lg"
              className={gap.severity === 'CRITICAL' ? 'border-l-4 border-accent-primary' : ''}
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`
                        px-3 py-1 rounded-full text-xs font-mono font-bold
                        ${gap.severity === 'CRITICAL' ? 'bg-accent-primary text-white' :
                          gap.severity === 'MODERATE' ? 'bg-text-navy text-white' :
                          'bg-status-subtle text-text-secondary'}
                      `}>
                        {gap.severity}
                      </span>
                      <h3 className="text-2xl font-extrabold text-text-navy">
                        {gap.skillCategory}
                      </h3>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-text-tertiary mb-1">GAP</p>
                    <p className="text-4xl font-extrabold text-accent-primary">
                      {gap.gap}%
                    </p>
                  </div>
                </div>

                {/* Coverage */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-text-tertiary">
                    <span>Current: {gap.currentCoverage}%</span>
                    <span>Required: {gap.requiredCoverage}%</span>
                  </div>
                  <div className="h-3 bg-status-subtle rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-text-navy rounded-full"
                      style={{ width: `${gap.currentCoverage}%` }}
                    />
                  </div>
                </div>

                {/* Affected Services */}
                <div>
                  <p className="text-sm font-mono text-text-tertiary mb-2">AFFECTED SERVICES</p>
                  <div className="flex flex-wrap gap-2">
                    {gap.affectedServices.map((service, i) => (
                      <span key={i} className="px-3 py-1 bg-status-subtle text-text-secondary text-sm rounded-full">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Training Recommendations */}
                <div>
                  <p className="text-sm font-mono text-text-tertiary mb-2">RECOMMENDED TRAINING</p>
                  <ul className="space-y-2">
                    {gap.recommendedTraining.map((training, i) => (
                      <li key={i} className="flex items-start gap-2 text-text-secondary">
                        <span className="text-accent-primary">•</span>
                        <span>{training}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-sm text-text-tertiary mt-3">
                    Estimated training duration: <strong>{gap.estimatedTrainingDuration} weeks</strong>
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Disclaimer */}
        <Card variant="bento" padding="lg" className="bg-accent-light">
          <p className="text-sm text-text-secondary">
            <strong className="text-text-navy">Analysis Methodology:</strong> Skill gap analysis based on demand trends and workforce composition (DEMO). 
            In production, this would use machine learning models analyzing historical job data, service demand patterns, and worker performance metrics.
          </p>
        </Card>
      </div>
    </div>
  );
}
