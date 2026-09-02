/**
 * Worker and Skill Type Definitions
 * 
 * Defines the core data structures for workers, skills, training modules,
 * and certifications in the SAHAKAR // SERVICES cooperative platform.
 * 
 * Validates Requirements: 11.1 (Hardcoded Mock Data System), 13.4 (TypeScript for type safety)
 */

/**
 * Skill interface representing a worker's verified capability
 */
export interface Skill {
  /** Service category (e.g., "Plumbing", "Electrical", "Carpentry") */
  category: string;
  
  /** Specific skill within category (e.g., "Pipe Fitting", "Leak Repair") */
  subcategory: string;
  
  /** Whether the skill has been verified by the cooperative */
  verified: boolean;
  
  /** Date when the skill was verified (if applicable) */
  verificationDate?: Date;
  
  /** Proficiency level of the worker in this skill */
  level: 'beginner' | 'intermediate' | 'expert';
}

/**
 * Training module interface representing worker professional development
 */
export interface TrainingModule {
  /** Unique identifier for the training module */
  id: string;
  
  /** Name of the training module */
  name: string;
  
  /** Skill category this training belongs to */
  category: string;
  
  /** Current status of the training */
  status: 'completed' | 'in-progress' | 'not-started';
  
  /** Progress percentage (0-100) */
  progress: number;
  
  /** Date when the training was completed (if applicable) */
  completedDate?: Date;
}

/**
 * Certification interface representing formal credentials
 */
export interface Certification {
  /** Unique identifier for the certification */
  id: string;
  
  /** Name of the certification */
  name: string;
  
  /** Organization or body that issued the certification */
  issuer: string;
  
  /** Date when the certification was issued */
  issueDate: Date;
  
  /** Optional expiry date for time-limited certifications */
  expiryDate?: Date;
  
  /** Whether the certification has been verified */
  verified: boolean;
}

/**
 * Government integrations interface for demonstration purposes
 * All integrations are marked as demo features
 */
export interface GovernmentIntegrations {
  /** e-Shram registration system integration (demo) */
  eShram?: {
    linked: boolean;
    demo: boolean;
  };
  
  /** DigiLocker credential verification integration (demo) */
  digiLocker?: {
    linked: boolean;
    demo: boolean;
  };
  
  /** Bhashini multilingual support integration (demo) */
  bhashini?: {
    linked: boolean;
    demo: boolean;
  };
}

/**
 * Worker interface representing a cooperative member providing services
 * 
 * Workers are the core service providers in the cooperative platform.
 * All data is hardcoded as mock data for demonstration purposes.
 */
export interface Worker {
  /** Unique identifier for the worker */
  id: string;
  
  /** Full name of the worker */
  name: string;
  
  /** URL or path to worker's photo */
  photo: string;
  
  /** Contact phone number */
  phoneNumber: string;
  
  /** Worker's location information */
  location: {
    /** Full address as string */
    address: string;
    /** Geographic coordinates for distance calculations */
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  
  /** Service radius in kilometers - used for geospatial dispatch filtering */
  serviceRadius: number;
  
  /** Array of verified and unverified skills */
  skills: Skill[];
  
  /** Average rating from customer reviews (0-5 scale) */
  rating: number;
  
  /** Total number of ratings received */
  totalRatings: number;
  
  /** Total number of jobs completed */
  completedJobs: number;
  
  /** Date when the worker joined the cooperative */
  memberSince: Date;
  
  /** Current availability status for receiving job requests */
  available: boolean;
  
  /** Earnings accumulated today (in rupees) */
  todayEarnings: number;
  
  /** Earnings accumulated this month (in rupees) */
  monthEarnings: number;
  
  /** Cooperative's share percentage (e.g., 0.15 for 15%) */
  cooperativeShare: number;
  
  /** Array of training modules - completed, in-progress, or not started */
  trainingProgress: TrainingModule[];
  
  /** Array of formal certifications earned */
  certifications: Certification[];
  
  /** Optional government system integrations (all marked as demo) */
  governmentIntegrations?: GovernmentIntegrations;
}
