/**
 * Service type definitions for SAHAKAR // SERVICES
 * 
 * Validates Requirements: 11.2, 11.3, 13.4
 */

import type { IconName } from '../components/primitives/Icon';

/**
 * ServiceSubcategory interface representing a specific service type
 */
export interface ServiceSubcategory {
  id: string;
  name: string;
  description: string;
  requiredSkills: string[];
  priceRange: { min: number; max: number };
  durationRange: { min: number; max: number };
}

/**
 * ServiceCategory interface representing a top-level service category
 */
export interface ServiceCategory {
  id: string;
  name: string;
  icon: IconName;
  description: string;
  subcategories: ServiceSubcategory[];
  avgPrice: string;
  avgDuration: string;
}
