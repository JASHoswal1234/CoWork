/**
 * Job and ServiceRequest type definitions for SAHAKAR // SERVICES
 * 
 * Validates Requirements: 11.2, 11.3, 13.4
 */

/**
 * Job status enum representing the lifecycle of a service request
 */
export type JobStatus = 
  | 'pending'           // Waiting for dispatch
  | 'matched'           // Worker matched, pending acceptance
  | 'accepted'          // Worker accepted
  | 'in-progress'       // Worker en route or working
  | 'completed'         // Job finished
  | 'cancelled'         // Cancelled by customer or worker
  | 'rejected';         // Worker rejected

/**
 * Job interface representing a service request assigned to a worker
 */
export interface Job {
  id: string;
  customerId: string;
  customerName: string;
  customerLocation: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  serviceCategory: string;
  serviceSubcategory: string;
  description: string;
  status: JobStatus;
  assignedWorkerId?: string;
  estimatedDuration: number;  // minutes
  estimatedPrice: number;
  actualPrice?: number;
  completedAt?: Date;
  rating?: number;
  review?: string;
  workerEarnings: number;
}

/**
 * ServiceRequest interface for customer-initiated service requests
 * Note: immediate is always true for ON-DEMAND prototype
 */
export interface ServiceRequest {
  serviceCategory: string;
  serviceSubcategory: string;
  description: string;
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  immediate: true;  // Always true for ON-DEMAND prototype
}
