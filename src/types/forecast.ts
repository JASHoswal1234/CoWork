/**
 * Forecast and Intelligence Type Definitions
 * 
 * These types support the AI/ML features in SAHAKAR // SERVICES:
 * - Demand forecasting (7-day predictions)
 * - Skill gap analysis
 * - Workforce and demand heatmap visualization
 * 
 * All intelligence features use simulated ML outputs with hardcoded data.
 * 
 * @requirements 11.4, 11.5, 8.1, 8.2, 8.3, 8.4, 9.1, 9.2, 13.4
 */

/**
 * DemandForecast represents AI-powered demand predictions for service categories.
 * 
 * Used in the cooperative Demand Intelligence dashboard (Priority Screen #5).
 * Forecasts are 7-day predictions showing expected service requests vs available capacity.
 * 
 * @requirements 8.1, 8.2, 8.3, 8.4, 11.4
 */
export interface DemandForecast {
  /** Date for this forecast prediction */
  date: Date;
  
  /** Service category being forecasted (e.g., "Plumbing", "Electrical") */
  serviceCategory: string;
  
  /** Predicted number of service requests for this date */
  predictedDemand: number;
  
  /** Number of workers available to handle demand */
  availableCapacity: number;
  
  /** Whether predicted demand exceeds available capacity */
  shortage: boolean;
  
  /** ML model confidence level (0-1 scale, e.g., 0.87 = 87% confidence) */
  confidenceLevel: number;
  
  /** Historical average demand for comparison */
  historicalAverage: number;
  
  /** Source marker clearly indicating this is simulated ML output */
  source: 'simulated-ml-model';
}

/**
 * SkillGapAnalysis represents AI-powered skill shortage detection.
 * 
 * Used in the cooperative Skill Intelligence dashboard (Priority Screen #6).
 * Identifies workforce skill gaps and provides training recommendations.
 * 
 * @requirements 9.1, 9.2, 11.5
 */
export interface SkillGapAnalysis {
  /** Skill category with identified gap (e.g., "Electrical - Solar Installation") */
  skillCategory: string;
  
  /** Current workforce coverage percentage for this skill (0-100) */
  currentCoverage: number;
  
  /** Required coverage percentage based on demand analysis (0-100) */
  requiredCoverage: number;
  
  /** Gap between current and required coverage (percentage points) */
  gap: number;
  
  /** Severity level using text labels (displayed with typography hierarchy, not colors) */
  severity: 'CRITICAL' | 'MODERATE' | 'LOW';
  
  /** Service categories affected by this skill gap */
  affectedServices: string[];
  
  /** Recommended training programs to address the gap */
  recommendedTraining: string[];
  
  /** Estimated time to close gap through training (in weeks) */
  estimatedTrainingDuration: number;
  
  /** Source marker clearly indicating this is simulated ML output */
  source: 'simulated-ml-model';
}

/**
 * DemandHotspot represents geographic demand intensity for heatmap visualization.
 * 
 * Used in the cooperative Operations Dashboard (Priority Screen #4) for the
 * workforce and demand heatmap feature.
 * 
 * @requirements 8.1, 13.4
 */
export interface DemandHotspot {
  /** Location name or area identifier (e.g., "Sector 15, Delhi") */
  location: string;
  
  /** Geographic coordinates for heatmap positioning */
  coordinates: { lat: number; lng: number };
  
  /** Service category for this demand data (e.g., "Plumbing") */
  serviceCategory: string;
  
  /** Demand intensity level (0-100 scale for visualization) */
  demandIntensity: number;
  
  /** Worker density in this area (workers per square km) */
  workerDensity: number;
}
