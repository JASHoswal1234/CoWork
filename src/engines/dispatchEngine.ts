/**
 * Geospatial + Rule-Based Dispatch Engine (NOT AI)
 * 
 * This engine uses a multi-stage filtering algorithm based on:
 * 1. Skill matching
 * 2. Availability filtering
 * 3. Service radius check (geospatial)
 * 4. Distance calculation
 * 5. Nearest worker selection (pure distance-based, NOT rating-based)
 * 
 * Validates Requirements: 12.1, 12.3, 12.4, 12.5, 12.6
 */

import type { Worker } from '../types/worker';
import type { ServiceRequest } from '../types/job';
import { calculateDistanceBetweenPoints } from '../utils/distance';

/**
 * Dispatch step information for visualization
 */
export interface DispatchStep {
  step: number;
  name: string;
  description: string;
  candidateCount: number;
  duration: number;  // ms for animation timing
}

/**
 * Dispatch result with matched worker and steps
 */
export interface DispatchResult {
  steps: DispatchStep[];
  matchedWorker: Worker;
  estimatedArrival: number;  // minutes
  matchMethod: 'geospatial-rules';  // NOT 'ai-matching'
  distance: number;  // km
}

/**
 * Worker with calculated distance
 */
interface WorkerWithDistance extends Worker {
  distance: number;
}

/**
 * Check if worker has required skills for service category
 */
export function hasRequiredSkills(worker: Worker, serviceCategory: string): boolean {
  return worker.skills.some(
    skill => skill.category === serviceCategory && skill.verified
  );
}

/**
 * Main dispatch function using rule-based geospatial matching
 * 
 * @param request - Service request from customer
 * @param allWorkers - All available workers
 * @returns Dispatch result with matched worker and steps
 */
export function dispatchWorker(
  request: ServiceRequest,
  allWorkers: Worker[]
): DispatchResult {
  const steps: DispatchStep[] = [];
  
  // Step 1: Skill Filter
  // Find workers with required skills for the service category
  const skillMatched = allWorkers.filter(worker =>
    hasRequiredSkills(worker, request.serviceCategory)
  );
  
  steps.push({
    step: 1,
    name: 'Skill Matching',
    description: `Finding workers with ${request.serviceCategory} skills`,
    candidateCount: skillMatched.length,
    duration: 600
  });
  
  if (skillMatched.length === 0) {
    throw new Error(`No workers found with ${request.serviceCategory} skills`);
  }
  
  // Step 2: Availability Filter
  // Filter to only available workers
  const availableWorkers = skillMatched.filter(worker => worker.available);
  
  steps.push({
    step: 2,
    name: 'Availability Check',
    description: 'Checking who\'s available now',
    candidateCount: availableWorkers.length,
    duration: 500
  });
  
  if (availableWorkers.length === 0) {
    throw new Error('No available workers found');
  }
  
  // Step 3: Service Radius Check (GEOSPATIAL)
  // Filter workers within their service area
  const workersWithinRadius = availableWorkers.map(worker => {
    const distance = calculateDistanceBetweenPoints(
      request.location.coordinates,
      worker.location.coordinates
    );
    return { ...worker, distance };
  }).filter(worker => worker.distance <= worker.serviceRadius);
  
  steps.push({
    step: 3,
    name: 'Service Area Filter',
    description: 'Workers within service area',
    candidateCount: workersWithinRadius.length,
    duration: 600
  });
  
  if (workersWithinRadius.length === 0) {
    throw new Error('No workers found within service area');
  }
  
  // Step 4: Distance Calculation
  // All remaining workers now have distance calculated
  // Sort by distance
  const sortedByDistance = [...workersWithinRadius].sort(
    (a, b) => a.distance - b.distance
  );
  
  steps.push({
    step: 4,
    name: 'Distance Calculation',
    description: 'Finding nearest worker',
    candidateCount: sortedByDistance.length,
    duration: 800
  });
  
  // Step 5: Nearest Match
  // Select worker with minimum distance (pure distance-based, NOT rating)
  const matchedWorker = sortedByDistance[0];
  
  steps.push({
    step: 5,
    name: 'Worker Matched',
    description: `${matchedWorker.name} - ${matchedWorker.distance.toFixed(1)} km away`,
    candidateCount: 1,
    duration: 500
  });
  
  // Calculate estimated arrival time (assuming 20 km/h average speed)
  const estimatedArrival = Math.ceil((matchedWorker.distance / 20) * 60);
  
  return {
    steps,
    matchedWorker,
    estimatedArrival,
    matchMethod: 'geospatial-rules',
    distance: matchedWorker.distance
  };
}

/**
 * Get total animation duration for all steps
 */
export function getTotalAnimationDuration(steps: DispatchStep[]): number {
  return steps.reduce((total, step) => total + step.duration, 0);
}

/**
 * Simulate dispatch with delay for demonstration
 */
export async function dispatchWorkerAsync(
  request: ServiceRequest,
  allWorkers: Worker[]
): Promise<DispatchResult> {
  // Small delay to simulate processing
  await new Promise(resolve => setTimeout(resolve, 300));
  return dispatchWorker(request, allWorkers);
}
