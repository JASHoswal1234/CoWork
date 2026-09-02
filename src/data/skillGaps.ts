/**
 * Mock skill gap analysis data for SAHAKAR // SERVICES
 * 
 * Validates Requirements: 11.5, 9.1, 9.2, 9.3, 9.4, 9.5, 9.6
 * 
 * This file contains AI-powered skill gap analyses across different service categories.
 * All analyses are marked with source: 'simulated-ml-model' for demo purposes.
 * Demonstrates the skill intelligence feature with realistic training recommendations.
 */

import type { SkillGapAnalysis } from '../types/forecast';

/**
 * Mock skill gap analyses (8-10 entries across different categories)
 * 
 * Severity levels:
 * - CRITICAL: gap > 30%
 * - MODERATE: gap > 15%
 * - LOW: gap ≤ 15%
 */
export const mockSkillGaps: SkillGapAnalysis[] = [
  {
    skillCategory: 'Electrical - Solar Installation',
    currentCoverage: 15,
    requiredCoverage: 35,
    gap: 20,
    severity: 'CRITICAL',
    affectedServices: ['Solar Panel Installation', 'Solar Maintenance', 'Grid Integration'],
    recommendedTraining: [
      'Solar PV System Design',
      'Solar Installation Safety',
      'Grid Integration Basics',
      'Battery Storage Systems'
    ],
    estimatedTrainingDuration: 4,
    source: 'simulated-ml-model'
  },
  {
    skillCategory: 'Plumbing - Advanced Systems',
    currentCoverage: 22,
    requiredCoverage: 40,
    gap: 18,
    severity: 'CRITICAL',
    affectedServices: ['Water Heater Installation', 'Drainage Systems', 'Commercial Plumbing'],
    recommendedTraining: [
      'Advanced Plumbing Systems',
      'Commercial Water Systems',
      'Hot Water System Maintenance'
    ],
    estimatedTrainingDuration: 3,
    source: 'simulated-ml-model'
  },
  {
    skillCategory: 'Carpentry - Custom Woodwork',
    currentCoverage: 28,
    requiredCoverage: 50,
    gap: 22,
    severity: 'CRITICAL',
    affectedServices: ['Custom Furniture Making', 'Fine Joinery', 'Decorative Woodwork'],
    recommendedTraining: [
      'Advanced Joinery Techniques',
      'Custom Furniture Design',
      'Wood Finishing Mastery',
      'CNC Woodworking'
    ],
    estimatedTrainingDuration: 6,
    source: 'simulated-ml-model'
  },
  {
    skillCategory: 'Electrical - Smart Home Systems',
    currentCoverage: 18,
    requiredCoverage: 35,
    gap: 17,
    severity: 'MODERATE',
    affectedServices: ['Smart Wiring', 'Home Automation', 'IoT Device Installation'],
    recommendedTraining: [
      'Smart Home Wiring',
      'Home Automation Systems',
      'IoT Integration Basics'
    ],
    estimatedTrainingDuration: 3,
    source: 'simulated-ml-model'
  },
  {
    skillCategory: 'Painting - Specialized Finishes',
    currentCoverage: 25,
    requiredCoverage: 42,
    gap: 17,
    severity: 'MODERATE',
    affectedServices: ['Texture Painting', 'Decorative Finishes', 'Waterproofing'],
    recommendedTraining: [
      'Decorative Painting Techniques',
      'Texture Application Methods',
      'Waterproofing Solutions',
      'Industrial Coating'
    ],
    estimatedTrainingDuration: 4,
    source: 'simulated-ml-model'
  },
  {
    skillCategory: 'Cleaning - Specialized Sanitization',
    currentCoverage: 30,
    requiredCoverage: 48,
    gap: 18,
    severity: 'MODERATE',
    affectedServices: ['Medical Facility Cleaning', 'Industrial Cleaning', 'Biohazard Cleaning'],
    recommendedTraining: [
      'Medical Grade Sanitization',
      'Industrial Cleaning Safety',
      'Eco-Friendly Cleaning Products'
    ],
    estimatedTrainingDuration: 2,
    source: 'simulated-ml-model'
  },
  {
    skillCategory: 'Appliance Repair - Air Conditioning',
    currentCoverage: 32,
    requiredCoverage: 50,
    gap: 18,
    severity: 'MODERATE',
    affectedServices: ['AC Installation', 'AC Repair', 'HVAC Maintenance'],
    recommendedTraining: [
      'AC Systems Fundamentals',
      'Refrigeration Technology',
      'HVAC Troubleshooting'
    ],
    estimatedTrainingDuration: 5,
    source: 'simulated-ml-model'
  },
  {
    skillCategory: 'Plumbing - Eco-Friendly Systems',
    currentCoverage: 35,
    requiredCoverage: 48,
    gap: 13,
    severity: 'LOW',
    affectedServices: ['Rainwater Harvesting', 'Greywater Systems', 'Water Conservation'],
    recommendedTraining: [
      'Water Conservation Techniques',
      'Rainwater Harvesting Systems',
      'Sustainable Plumbing'
    ],
    estimatedTrainingDuration: 2,
    source: 'simulated-ml-model'
  },
  {
    skillCategory: 'Electrical - EV Charging Installation',
    currentCoverage: 10,
    requiredCoverage: 25,
    gap: 15,
    severity: 'LOW',
    affectedServices: ['EV Charger Installation', 'EV Charger Maintenance'],
    recommendedTraining: [
      'EV Charging Systems',
      'High-Power Electrical Systems',
      'EV Safety Protocols'
    ],
    estimatedTrainingDuration: 3,
    source: 'simulated-ml-model'
  },
  {
    skillCategory: 'Carpentry - Modular Furniture Assembly',
    currentCoverage: 42,
    requiredCoverage: 55,
    gap: 13,
    severity: 'LOW',
    affectedServices: ['IKEA-style Assembly', 'Flat-Pack Furniture', 'Modular Storage'],
    recommendedTraining: [
      'Modular Furniture Systems',
      'Efficient Assembly Techniques'
    ],
    estimatedTrainingDuration: 1,
    source: 'simulated-ml-model'
  }
];

/**
 * Get skill gaps by severity level
 */
export function getSkillGapsBySeverity(severity: 'CRITICAL' | 'MODERATE' | 'LOW'): SkillGapAnalysis[] {
  return mockSkillGaps.filter(gap => gap.severity === severity);
}

/**
 * Get critical skill gaps (highest priority)
 */
export function getCriticalSkillGaps(): SkillGapAnalysis[] {
  return getSkillGapsBySeverity('CRITICAL');
}

/**
 * Get skill gaps sorted by severity and gap percentage
 */
export function getSkillGapsSorted(): SkillGapAnalysis[] {
  const severityOrder = { CRITICAL: 0, MODERATE: 1, LOW: 2 };
  return [...mockSkillGaps].sort((a, b) => {
    // First sort by severity
    const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
    if (severityDiff !== 0) return severityDiff;
    // Then by gap percentage (descending)
    return b.gap - a.gap;
  });
}

/**
 * Get total training hours needed to address all gaps
 */
export function getTotalTrainingDuration(): number {
  return mockSkillGaps.reduce((total, gap) => total + gap.estimatedTrainingDuration, 0);
}

/**
 * Get skill gap summary statistics
 */
export function getSkillGapSummary() {
  const total = mockSkillGaps.length;
  const critical = mockSkillGaps.filter(g => g.severity === 'CRITICAL').length;
  const moderate = mockSkillGaps.filter(g => g.severity === 'MODERATE').length;
  const low = mockSkillGaps.filter(g => g.severity === 'LOW').length;
  const avgGap = mockSkillGaps.reduce((sum, g) => sum + g.gap, 0) / total;
  const totalTrainingWeeks = getTotalTrainingDuration();
  
  return {
    total,
    critical,
    moderate,
    low,
    avgGap: Math.round(avgGap * 10) / 10,
    totalTrainingWeeks,
    affectedServicesCount: new Set(mockSkillGaps.flatMap(g => g.affectedServices)).size
  };
}
