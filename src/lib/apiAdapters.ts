/**
 * API Response Adapters
 * 
 * Maps backend snake_case responses to frontend camelCase models.
 * Establishes the boundary between backend and frontend data structures.
 * 
 * ARCHITECTURE:
 * Backend Response → Adapter → Frontend TypeScript Model → UI Components
 * 
 * FIELD MAPPING CONVENTIONS:
 * Backend snake_case → Frontend camelCase
 * - service_category → serviceCategory
 * - service_subcategory → serviceSubcategory
 * - estimated_price → estimatedPrice
 * - actual_price → actualPrice
 * - worker_id → assignedWorkerId
 * - customer_id → customerId
 * - completed_at → completedAt
 * - service_radius → serviceRadius
 * - total_ratings → totalRatings
 * - completed_jobs → completedJobs
 * - photo_url → photo
 * - created_at → memberSince (for workers)
 * 
 * STATUS NORMALIZATION:
 * Backend: in_progress → Frontend: in-progress
 * All other statuses match exactly
 * 
 * ROLE MAPPING:
 * Backend: admin → Frontend: cooperative (UI/product terminology)
 * Backend: customer → Frontend: customer
 * Backend: worker → Frontend: worker
 */

import type { Worker, Skill } from '../types/worker';
import type { Job, JobStatus } from '../types/job';
import type { ServiceCategory, ServiceSubcategory } from '../types/service';

// ─── Role Mapping ────────────────────────────────────────────────────────────

/**
 * Maps frontend UI role to backend API role
 * Frontend: 'cooperative' → Backend: 'admin'
 */
export function frontendRoleToBackend(role: 'customer' | 'worker' | 'cooperative'): 'customer' | 'worker' | 'admin' {
  if (role === 'cooperative') return 'admin';
  return role;
}

/**
 * Maps backend API role to frontend UI role
 * Backend: 'admin' → Frontend: 'cooperative'
 */
export function backendRoleToFrontend(role: 'customer' | 'worker' | 'admin'): 'customer' | 'worker' | 'cooperative' {
  if (role === 'admin') return 'cooperative';
  return role;
}

// ─── Job Status Normalization ────────────────────────────────────────────────

/**
 * Normalizes backend job status to frontend JobStatus type
 * Handles snake_case → kebab-case conversion
 */
export function normalizeJobStatus(backendStatus: string): JobStatus {
  // Backend uses 'in_progress', frontend uses 'in-progress'
  if (backendStatus === 'in_progress') return 'in-progress';
  
  // All other statuses match: pending, matched, accepted, completed, cancelled, rejected
  return backendStatus as JobStatus;
}

/**
 * Converts frontend JobStatus to backend format
 */
export function denormalizeJobStatus(frontendStatus: JobStatus): string {
  if (frontendStatus === 'in-progress') return 'in_progress';
  return frontendStatus;
}

// ─── Worker Adapters ─────────────────────────────────────────────────────────

/**
 * Adapts backend worker response to frontend Worker type
 */
export function adaptWorker(backendWorker: any): Worker {
  const location = parsePostGISPoint(backendWorker.location);
  
  return {
    id: backendWorker.id,
    name: backendWorker.user?.name || backendWorker.name || 'Unknown Worker',
    photo: backendWorker.photo_url || '/illustrations/worker-hero.png',
    phoneNumber: backendWorker.user?.phone || backendWorker.phone || '',
    location: {
      address: backendWorker.address || backendWorker.customer_address || '',
      coordinates: location || { lat: 0, lng: 0 },
    },
    serviceRadius: backendWorker.service_radius || 10,
    skills: adaptSkills(backendWorker.skills || []),
    rating: backendWorker.rating || 0,
    totalRatings: backendWorker.total_ratings || 0,
    completedJobs: backendWorker.completed_jobs || 0,
    memberSince: backendWorker.created_at ? new Date(backendWorker.created_at) : new Date(),
    available: backendWorker.available ?? false,
    todayEarnings: 0, // Not provided by backend - would come from wallet API
    monthEarnings: 0, // Not provided by backend - would come from wallet API
    cooperativeShare: 0.15, // Standard 15% cooperative share
    trainingProgress: [], // Not yet implemented in backend
    certifications: [], // Not yet implemented in backend
    governmentIntegrations: undefined, // Demo feature
  };
}

/**
 * Adapts backend skills array to frontend Skill type
 */
function adaptSkills(backendSkills: any[]): Skill[] {
  return backendSkills.map((skill: any) => ({
    category: skill.category || '',
    subcategory: skill.subcategory || '',
    verified: skill.verified ?? false,
    verificationDate: skill.verified_at ? new Date(skill.verified_at) : undefined,
    level: skill.skill_level || 'beginner',
  }));
}

/**
 * Parses PostGIS POINT string to coordinates object
 * PostGIS format: "POINT(lng lat)" or object { x: lng, y: lat }
 */
function parsePostGISPoint(location: any): { lat: number; lng: number } | null {
  if (!location) return null;
  
  // If already an object with coordinates
  if (typeof location === 'object' && location.coordinates) {
    const [lng, lat] = location.coordinates;
    return { lat, lng };
  }
  
  // If PostGIS string format: "POINT(lng lat)"
  if (typeof location === 'string') {
    const match = location.match(/POINT\(([^ ]+) ([^ ]+)\)/);
    if (match) {
      return {
        lng: parseFloat(match[1]),
        lat: parseFloat(match[2]),
      };
    }
  }
  
  return null;
}

// ─── Job Adapters ────────────────────────────────────────────────────────────

/**
 * Adapts backend job response to frontend Job type
 */
export function adaptJob(backendJob: any): Job {
  const customerLocation = parsePostGISPoint(backendJob.customer_location);
  
  return {
    id: backendJob.id,
    customerId: backendJob.customer_id,
    customerName: backendJob.customer_name || 'Unknown Customer',
    customerLocation: {
      address: backendJob.customer_address || '',
      coordinates: customerLocation || { lat: 0, lng: 0 },
    },
    serviceCategory: backendJob.service_category_name || backendJob.service_category || '',
    serviceSubcategory: backendJob.service_subcategory_name || backendJob.service_subcategory || '',
    description: backendJob.description || '',
    status: normalizeJobStatus(backendJob.status),
    assignedWorkerId: backendJob.worker_id || undefined,
    estimatedDuration: backendJob.estimated_duration || 60,
    estimatedPrice: backendJob.estimated_price || 0,
    actualPrice: backendJob.actual_price || undefined,
    completedAt: backendJob.completed_at ? new Date(backendJob.completed_at) : undefined,
    rating: backendJob.rating || undefined,
    review: backendJob.review || undefined,
    workerEarnings: backendJob.actual_price 
      ? backendJob.actual_price * 0.85 
      : backendJob.estimated_price * 0.85,
  };
}

// ─── Service Adapters ────────────────────────────────────────────────────────

/**
 * Adapts backend service category response to frontend ServiceCategory type
 */
export function adaptServiceCategory(backendCategory: any): ServiceCategory {
  return {
    id: backendCategory.id,
    name: backendCategory.name,
    icon: backendCategory.icon || 'wrench',
    description: backendCategory.description || '',
    subcategories: backendCategory.subcategories?.map(adaptServiceSubcategory) || [],
    avgPrice: backendCategory.avg_price 
      || `₹${backendCategory.avg_price_min || 500}-${backendCategory.avg_price_max || 2000}`,
    avgDuration: backendCategory.avg_duration 
      || `${Math.floor((backendCategory.avg_duration_min || 60) / 60)}-${Math.floor((backendCategory.avg_duration_max || 120) / 60)} hours`,
  };
}

/**
 * Adapts backend service subcategory response to frontend ServiceSubcategory type
 */
function adaptServiceSubcategory(backendSubcategory: any): ServiceSubcategory {
  return {
    id: backendSubcategory.id,
    name: backendSubcategory.name,
    description: backendSubcategory.description || '',
    requiredSkills: backendSubcategory.required_skills || [],
    priceRange: {
      min: backendSubcategory.price_min || 0,
      max: backendSubcategory.price_max || 0,
    },
    durationRange: {
      min: backendSubcategory.duration_min || 0,
      max: backendSubcategory.duration_max || 0,
    },
  };
}

// ─── Request Adapters (Frontend → Backend) ───────────────────────────────────

/**
 * Adapts frontend ServiceRequest to backend job creation payload
 */
export function adaptServiceRequestToBackend(request: any, userId?: string) {
  return {
    service_category_name: request.serviceCategory,
    service_subcategory_name: request.serviceSubcategory,
    description: request.description,
    address: request.location.address,
    location: {
      lat: request.location.coordinates.lat,
      lng: request.location.coordinates.lng,
    },
    estimated_price: request.estimatedPrice || 500,
    worker_id: request.workerId || undefined,
    problem_image_urls: request.problemImages || [],
  };
}

/**
 * Adapts frontend worker profile updates to backend format
 */
export function adaptWorkerProfileToBackend(profile: any) {
  return {
    address: profile.address,
    city: profile.city,
    state: profile.state,
    pincode: profile.pincode,
    service_radius: profile.serviceRadius,
    photo_url: profile.photo,
    available: profile.available,
  };
}
