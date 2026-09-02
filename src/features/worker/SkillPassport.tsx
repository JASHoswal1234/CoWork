/**
 * Skill Passport Page
 * 
 * PRIORITY SCREEN #3: Worker skill passport with earnings
 * 
 * Validates Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 16.4, 17.1-17.6
 */

import React from 'react';
import { Card } from '../../components/primitives/Card';

export function SkillPassport() {
  const worker = {
    name: 'Rajesh Kumar',
    photo: '👨‍🔧',
    todayEarnings: 1250,
    monthEarnings: 28500,
    skills: [
      { name: 'Pipe Fitting', level: 'expert', verified: true },
      { name: 'Leak Repair', level: 'expert', verified: true },
      { name: 'Bathroom Fitting', level: 'intermediate', verified: true }
    ],
    training: [
      { name: 'Advanced Plumbing Systems', progress: 65, status: 'in-progress' },
      { name: 'Safety Protocols', progress: 100, status: 'completed' }
    ],
    certifications: [
      { name: 'NCVT Plumber Certificate', issuer: 'National Council for Vocational Training', date: 'Nov 2021' }
    ]
  };

  return (
    <div className="min-h-screen px-6 py-12 max-w-5xl mx-auto">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center gap-6">
          <div className="text-6xl">{worker.photo}</div>
          <div>
            <h1 className="text-4xl font-extrabold text-text-navy mb-2">
              {worker.name}
            </h1>
            <p className="text-text-secondary">Cooperative Member since March 2022</p>
          </div>
        </div>

        {/* Earnings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card variant="bento" padding="lg">
            <p className="text-sm font-mono text-text-tertiary mb-2">TODAY'S EARNINGS</p>
            <p className="text-5xl font-extrabold text-accent-primary">
              ₹{worker.todayEarnings}
            </p>
          </Card>

          <Card variant="bento" padding="lg">
            <p className="text-sm font-mono text-text-tertiary mb-2">THIS MONTH</p>
            <p className="text-5xl font-extrabold text-text-navy">
              ₹{worker.monthEarnings}
            </p>
          </Card>
        </div>

        {/* Verified Skills */}
        <Card variant="container" padding="lg">
          <h2 className="text-2xl font-extrabold text-text-navy mb-6">
            Verified Skills
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {worker.skills.map((skill, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-status-subtle rounded-lg">
                <span className="text-2xl">✓</span>
                <div>
                  <p className="font-semibold text-text-navy">{skill.name}</p>
                  <p className="text-sm text-text-tertiary capitalize">{skill.level}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Training Progress */}
        <Card variant="container" padding="lg">
          <h2 className="text-2xl font-extrabold text-text-navy mb-6">
            Training Progress
          </h2>
          <div className="space-y-4">
            {worker.training.map((course, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">
                      {course.status === 'completed' ? '✅' : '📚'}
                    </span>
                    <p className="font-semibold">{course.name}</p>
                  </div>
                  <p className="text-sm text-text-tertiary">{course.progress}%</p>
                </div>
                <div className="h-2 bg-status-subtle rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-accent-primary rounded-full transition-all"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Certifications */}
        <Card variant="container" padding="lg">
          <h2 className="text-2xl font-extrabold text-text-navy mb-6">
            Certifications
          </h2>
          {worker.certifications.map((cert, index) => (
            <div key={index} className="flex items-start gap-4 p-4 bg-status-subtle rounded-lg">
              <span className="text-3xl">🏆</span>
              <div>
                <p className="font-semibold text-text-navy mb-1">{cert.name}</p>
                <p className="text-sm text-text-secondary">{cert.issuer}</p>
                <p className="text-xs text-text-tertiary mt-1">Issued {cert.date}</p>
              </div>
            </div>
          ))}
        </Card>

        {/* Government Integrations */}
        <Card variant="bento" padding="lg" className="bg-accent-light border-2 border-accent-primary">
          <h3 className="text-lg font-extrabold text-accent-primary mb-4">
            Government Integrations · DEMO
          </h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xl">✓</span>
              <p className="text-text-navy">e-Shram Registration linked · DEMO</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl">✓</span>
              <p className="text-text-navy">DigiLocker Credential verification · DEMO</p>
            </div>
          </div>
          <p className="text-xs text-text-tertiary mt-4">
            * Government integrations are proposed features for demonstration purposes
          </p>
        </Card>
      </div>
    </div>
  );
}
