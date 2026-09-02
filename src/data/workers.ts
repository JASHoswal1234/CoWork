/**
 * Mock Worker Profiles
 * 
 * Hardcoded worker data for SAHAKAR // SERVICES cooperative platform.
 * Contains 25 diverse worker profiles with variety in:
 * - Skills: Plumbing, Electrical, Carpentry, Painting, Cleaning
 * - Locations: Distributed across city areas
 * - Service radius: 5-15km
 * - Availability: Mix of available and unavailable workers
 * - Ratings: 4.0-5.0 range
 * - Experience: 20-300 completed jobs
 * - Training progress and certifications
 * - Government integration markers (DEMO)
 * 
 * Validates Requirements: 11.1, 5.1, 5.2, 5.3, 5.4, 5.5, 10.1, 17.1, 17.2, 17.3, 17.4, 17.5
 */

import type { Worker } from '../types/worker';

// Delhi NCR coordinates range for realistic distribution
// Latitude: ~28.4-28.7, Longitude: ~77.1-77.4

export const mockWorkers: Worker[] = [
  // === PLUMBING SPECIALISTS ===
  {
    id: 'W001',
    name: 'Rajesh Kumar',
    photo: '/assets/workers/rajesh.jpg',
    phoneNumber: '+91 98765 43210',
    location: {
      address: 'Sector 15, Rohini, Delhi',
      coordinates: { lat: 28.7461, lng: 77.0703 }
    },
    serviceRadius: 10,
    skills: [
      {
        category: 'Plumbing',
        subcategory: 'Pipe Fitting',
        verified: true,
        verificationDate: new Date('2023-06-15'),
        level: 'expert'
      },
      {
        category: 'Plumbing',
        subcategory: 'Leak Repair',
        verified: true,
        verificationDate: new Date('2023-06-15'),
        level: 'expert'
      }
    ],
    rating: 4.8,
    totalRatings: 145,
    completedJobs: 167,
    memberSince: new Date('2022-03-10'),
    available: true,
    todayEarnings: 1250,
    monthEarnings: 28500,
    cooperativeShare: 0.15,
    trainingProgress: [
      {
        id: 'T001',
        name: 'Advanced Plumbing Systems',
        category: 'Plumbing',
        status: 'in-progress',
        progress: 65
      },
      {
        id: 'T002',
        name: 'Safety Protocols',
        category: 'General',
        status: 'completed',
        progress: 100,
        completedDate: new Date('2023-08-20')
      }
    ],
    certifications: [
      {
        id: 'C001',
        name: 'NCVT Plumber Certificate',
        issuer: 'National Council for Vocational Training',
        issueDate: new Date('2021-11-15'),
        verified: true
      }
    ],
    governmentIntegrations: {
      eShram: { linked: true, demo: true },
      digiLocker: { linked: true, demo: true }
    }
  },
  {
    id: 'W002',
    name: 'Amit Singh',
    photo: '/assets/workers/amit.jpg',
    phoneNumber: '+91 98123 45678',
    location: {
      address: 'Dwarka Sector 10, Delhi',
      coordinates: { lat: 28.5921, lng: 77.0460 }
    },
    serviceRadius: 12,
    skills: [
      {
        category: 'Plumbing',
        subcategory: 'Bathroom Fitting',
        verified: true,
        verificationDate: new Date('2023-04-20'),
        level: 'intermediate'
      },
      {
        category: 'Plumbing',
        subcategory: 'Drainage Systems',
        verified: true,
        verificationDate: new Date('2023-04-20'),
        level: 'intermediate'
      }
    ],
    rating: 4.6,
    totalRatings: 89,
    completedJobs: 102,
    memberSince: new Date('2022-08-15'),
    available: true,
    todayEarnings: 850,
    monthEarnings: 22300,
    cooperativeShare: 0.15,
    trainingProgress: [
      {
        id: 'T003',
        name: 'Water Conservation Techniques',
        category: 'Plumbing',
        status: 'in-progress',
        progress: 40
      }
    ],
    certifications: [],
    governmentIntegrations: {
      eShram: { linked: true, demo: true }
    }
  },
  {
    id: 'W003',
    name: 'Suresh Yadav',
    photo: '/assets/workers/suresh.jpg',
    phoneNumber: '+91 97654 32109',
    location: {
      address: 'Janakpuri, West Delhi',
      coordinates: { lat: 28.6211, lng: 77.0830 }
    },
    serviceRadius: 8,
    skills: [
      {
        category: 'Plumbing',
        subcategory: 'Leak Repair',
        verified: true,
        verificationDate: new Date('2023-02-10'),
        level: 'beginner'
      }
    ],
    rating: 4.3,
    totalRatings: 42,
    completedJobs: 48,
    memberSince: new Date('2023-01-20'),
    available: false,
    todayEarnings: 0,
    monthEarnings: 15600,
    cooperativeShare: 0.15,
    trainingProgress: [
      {
        id: 'T004',
        name: 'Basic Plumbing Skills',
        category: 'Plumbing',
        status: 'completed',
        progress: 100,
        completedDate: new Date('2023-03-15')
      },
      {
        id: 'T005',
        name: 'Intermediate Pipe Fitting',
        category: 'Plumbing',
        status: 'in-progress',
        progress: 55
      }
    ],
    certifications: [],
    governmentIntegrations: {
      eShram: { linked: true, demo: true }
    }
  },

  // === ELECTRICAL SPECIALISTS ===
  {
    id: 'W004',
    name: 'Vikram Sharma',
    photo: '/assets/workers/vikram.jpg',
    phoneNumber: '+91 99876 54321',
    location: {
      address: 'Pitampura, North Delhi',
      coordinates: { lat: 28.6971, lng: 77.1318 }
    },
    serviceRadius: 15,
    skills: [
      {
        category: 'Electrical',
        subcategory: 'Wiring',
        verified: true,
        verificationDate: new Date('2022-11-10'),
        level: 'expert'
      },
      {
        category: 'Electrical',
        subcategory: 'Appliance Repair',
        verified: true,
        verificationDate: new Date('2022-11-10'),
        level: 'expert'
      },
      {
        category: 'Electrical',
        subcategory: 'Solar Installation',
        verified: false,
        level: 'intermediate'
      }
    ],
    rating: 4.9,
    totalRatings: 203,
    completedJobs: 245,
    memberSince: new Date('2021-09-05'),
    available: true,
    todayEarnings: 1680,
    monthEarnings: 35400,
    cooperativeShare: 0.15,
    trainingProgress: [
      {
        id: 'T006',
        name: 'Solar PV System Design',
        category: 'Electrical',
        status: 'in-progress',
        progress: 75
      },
      {
        id: 'T007',
        name: 'Advanced Electrical Safety',
        category: 'Electrical',
        status: 'completed',
        progress: 100,
        completedDate: new Date('2023-05-12')
      }
    ],
    certifications: [
      {
        id: 'C002',
        name: 'Industrial Electrician License',
        issuer: 'Delhi Electrical Licensing Board',
        issueDate: new Date('2020-06-20'),
        expiryDate: new Date('2025-06-20'),
        verified: true
      }
    ],
    governmentIntegrations: {
      eShram: { linked: true, demo: true },
      digiLocker: { linked: true, demo: true },
      bhashini: { linked: true, demo: true }
    }
  },
  {
    id: 'W005',
    name: 'Pradeep Kumar',
    photo: '/assets/workers/pradeep.jpg',
    phoneNumber: '+91 98765 11111',
    location: {
      address: 'Shahdara, East Delhi',
      coordinates: { lat: 28.6832, lng: 77.2887 }
    },
    serviceRadius: 10,
    skills: [
      {
        category: 'Electrical',
        subcategory: 'Fan Installation',
        verified: true,
        verificationDate: new Date('2023-07-05'),
        level: 'intermediate'
      },
      {
        category: 'Electrical',
        subcategory: 'Switchboard Repair',
        verified: true,
        verificationDate: new Date('2023-07-05'),
        level: 'intermediate'
      }
    ],
    rating: 4.5,
    totalRatings: 78,
    completedJobs: 91,
    memberSince: new Date('2022-10-01'),
    available: true,
    todayEarnings: 920,
    monthEarnings: 19800,
    cooperativeShare: 0.15,
    trainingProgress: [
      {
        id: 'T008',
        name: 'Smart Home Wiring',
        category: 'Electrical',
        status: 'not-started',
        progress: 0
      }
    ],
    certifications: [],
    governmentIntegrations: {
      eShram: { linked: true, demo: true }
    }
  },
  {
    id: 'W006',
    name: 'Ravi Verma',
    photo: '/assets/workers/ravi.jpg',
    phoneNumber: '+91 97111 22334',
    location: {
      address: 'Mayur Vihar Phase 1, Delhi',
      coordinates: { lat: 28.6083, lng: 77.2907 }
    },
    serviceRadius: 7,
    skills: [
      {
        category: 'Electrical',
        subcategory: 'Wiring',
        verified: true,
        verificationDate: new Date('2023-09-15'),
        level: 'beginner'
      }
    ],
    rating: 4.2,
    totalRatings: 31,
    completedJobs: 35,
    memberSince: new Date('2023-06-10'),
    available: false,
    todayEarnings: 0,
    monthEarnings: 12400,
    cooperativeShare: 0.15,
    trainingProgress: [
      {
        id: 'T009',
        name: 'Electrical Fundamentals',
        category: 'Electrical',
        status: 'completed',
        progress: 100,
        completedDate: new Date('2023-08-30')
      }
    ],
    certifications: [],
    governmentIntegrations: {
      eShram: { linked: true, demo: true }
    }
  },

  // === CARPENTRY SPECIALISTS ===
  {
    id: 'W007',
    name: 'Manoj Tiwari',
    photo: '/assets/workers/manoj.jpg',
    phoneNumber: '+91 98888 77665',
    location: {
      address: 'Saket, South Delhi',
      coordinates: { lat: 28.5244, lng: 77.2066 }
    },
    serviceRadius: 12,
    skills: [
      {
        category: 'Carpentry',
        subcategory: 'Furniture Assembly',
        verified: true,
        verificationDate: new Date('2022-12-05'),
        level: 'expert'
      },
      {
        category: 'Carpentry',
        subcategory: 'Door Repair',
        verified: true,
        verificationDate: new Date('2022-12-05'),
        level: 'expert'
      },
      {
        category: 'Carpentry',
        subcategory: 'Custom Woodwork',
        verified: true,
        verificationDate: new Date('2022-12-05'),
        level: 'intermediate'
      }
    ],
    rating: 4.7,
    totalRatings: 126,
    completedJobs: 156,
    memberSince: new Date('2022-02-20'),
    available: true,
    todayEarnings: 1420,
    monthEarnings: 30100,
    cooperativeShare: 0.15,
    trainingProgress: [
      {
        id: 'T010',
        name: 'Modern Carpentry Techniques',
        category: 'Carpentry',
        status: 'completed',
        progress: 100,
        completedDate: new Date('2023-04-18')
      },
      {
        id: 'T011',
        name: 'Advanced Joinery',
        category: 'Carpentry',
        status: 'in-progress',
        progress: 50
      }
    ],
    certifications: [
      {
        id: 'C003',
        name: 'Master Carpenter Certification',
        issuer: 'Indian Institute of Carpentry',
        issueDate: new Date('2021-03-12'),
        verified: true
      }
    ],
    governmentIntegrations: {
      eShram: { linked: true, demo: true },
      digiLocker: { linked: true, demo: true }
    }
  },
  {
    id: 'W008',
    name: 'Dinesh Gupta',
    photo: '/assets/workers/dinesh.jpg',
    phoneNumber: '+91 99123 45670',
    location: {
      address: 'Laxmi Nagar, East Delhi',
      coordinates: { lat: 28.6316, lng: 77.2768 }
    },
    serviceRadius: 9,
    skills: [
      {
        category: 'Carpentry',
        subcategory: 'Furniture Assembly',
        verified: true,
        verificationDate: new Date('2023-05-22'),
        level: 'intermediate'
      },
      {
        category: 'Carpentry',
        subcategory: 'Window Installation',
        verified: true,
        verificationDate: new Date('2023-05-22'),
        level: 'intermediate'
      }
    ],
    rating: 4.4,
    totalRatings: 67,
    completedJobs: 79,
    memberSince: new Date('2022-11-15'),
    available: true,
    todayEarnings: 730,
    monthEarnings: 18500,
    cooperativeShare: 0.15,
    trainingProgress: [
      {
        id: 'T012',
        name: 'Furniture Design Basics',
        category: 'Carpentry',
        status: 'in-progress',
        progress: 30
      }
    ],
    certifications: [],
    governmentIntegrations: {
      eShram: { linked: true, demo: true }
    }
  },
  {
    id: 'W009',
    name: 'Ramesh Pal',
    photo: '/assets/workers/ramesh.jpg',
    phoneNumber: '+91 98765 98765',
    location: {
      address: 'Uttam Nagar, West Delhi',
      coordinates: { lat: 28.6220, lng: 77.0605 }
    },
    serviceRadius: 10,
    skills: [
      {
        category: 'Carpentry',
        subcategory: 'Door Repair',
        verified: true,
        verificationDate: new Date('2023-03-18'),
        level: 'beginner'
      }
    ],
    rating: 4.1,
    totalRatings: 28,
    completedJobs: 32,
    memberSince: new Date('2023-02-01'),
    available: true,
    todayEarnings: 450,
    monthEarnings: 11200,
    cooperativeShare: 0.15,
    trainingProgress: [
      {
        id: 'T013',
        name: 'Carpentry Fundamentals',
        category: 'Carpentry',
        status: 'completed',
        progress: 100,
        completedDate: new Date('2023-04-10')
      }
    ],
    certifications: [],
    governmentIntegrations: {
      eShram: { linked: true, demo: true }
    }
  },

  // === PAINTING SPECIALISTS ===
  {
    id: 'W010',
    name: 'Sanjay Chauhan',
    photo: '/assets/workers/sanjay.jpg',
    phoneNumber: '+91 97555 44333',
    location: {
      address: 'Vasant Kunj, South Delhi',
      coordinates: { lat: 28.5177, lng: 77.1577 }
    },
    serviceRadius: 14,
    skills: [
      {
        category: 'Painting',
        subcategory: 'Interior Painting',
        verified: true,
        verificationDate: new Date('2022-07-15'),
        level: 'expert'
      },
      {
        category: 'Painting',
        subcategory: 'Exterior Painting',
        verified: true,
        verificationDate: new Date('2022-07-15'),
        level: 'expert'
      },
      {
        category: 'Painting',
        subcategory: 'Texture Work',
        verified: true,
        verificationDate: new Date('2023-01-10'),
        level: 'intermediate'
      }
    ],
    rating: 4.9,
    totalRatings: 187,
    completedJobs: 215,
    memberSince: new Date('2021-11-10'),
    available: true,
    todayEarnings: 1890,
    monthEarnings: 38700,
    cooperativeShare: 0.15,
    trainingProgress: [
      {
        id: 'T014',
        name: 'Decorative Painting Techniques',
        category: 'Painting',
        status: 'in-progress',
        progress: 85
      },
      {
        id: 'T015',
        name: 'Safety in Paint Application',
        category: 'Painting',
        status: 'completed',
        progress: 100,
        completedDate: new Date('2022-10-05')
      }
    ],
    certifications: [
      {
        id: 'C004',
        name: 'Professional Painter Certification',
        issuer: 'National Skill Development Corporation',
        issueDate: new Date('2021-05-20'),
        verified: true
      }
    ],
    governmentIntegrations: {
      eShram: { linked: true, demo: true },
      digiLocker: { linked: true, demo: true }
    }
  },
  {
    id: 'W011',
    name: 'Arun Mishra',
    photo: '/assets/workers/arun.jpg',
    phoneNumber: '+91 98222 33444',
    location: {
      address: 'Malviya Nagar, South Delhi',
      coordinates: { lat: 28.5355, lng: 77.2074 }
    },
    serviceRadius: 11,
    skills: [
      {
        category: 'Painting',
        subcategory: 'Interior Painting',
        verified: true,
        verificationDate: new Date('2023-06-08'),
        level: 'intermediate'
      },
      {
        category: 'Painting',
        subcategory: 'Wall Preparation',
        verified: true,
        verificationDate: new Date('2023-06-08'),
        level: 'intermediate'
      }
    ],
    rating: 4.6,
    totalRatings: 93,
    completedJobs: 108,
    memberSince: new Date('2022-09-12'),
    available: false,
    todayEarnings: 0,
    monthEarnings: 24200,
    cooperativeShare: 0.15,
    trainingProgress: [
      {
        id: 'T016',
        name: 'Color Theory and Application',
        category: 'Painting',
        status: 'in-progress',
        progress: 60
      }
    ],
    certifications: [],
    governmentIntegrations: {
      eShram: { linked: true, demo: true }
    }
  },
  {
    id: 'W012',
    name: 'Deepak Jain',
    photo: '/assets/workers/deepak.jpg',
    phoneNumber: '+91 97666 55444',
    location: {
      address: 'Karol Bagh, Central Delhi',
      coordinates: { lat: 28.6510, lng: 77.1909 }
    },
    serviceRadius: 8,
    skills: [
      {
        category: 'Painting',
        subcategory: 'Interior Painting',
        verified: true,
        verificationDate: new Date('2023-08-25'),
        level: 'beginner'
      }
    ],
    rating: 4.3,
    totalRatings: 37,
    completedJobs: 43,
    memberSince: new Date('2023-07-01'),
    available: true,
    todayEarnings: 560,
    monthEarnings: 13800,
    cooperativeShare: 0.15,
    trainingProgress: [
      {
        id: 'T017',
        name: 'Basic Painting Skills',
        category: 'Painting',
        status: 'completed',
        progress: 100,
        completedDate: new Date('2023-09-10')
      }
    ],
    certifications: [],
    governmentIntegrations: {
      eShram: { linked: true, demo: true }
    }
  },

  // === CLEANING SPECIALISTS ===
  {
    id: 'W013',
    name: 'Sunita Devi',
    photo: '/assets/workers/sunita.jpg',
    phoneNumber: '+91 98111 22333',
    location: {
      address: 'Greater Kailash, South Delhi',
      coordinates: { lat: 28.5494, lng: 77.2426 }
    },
    serviceRadius: 10,
    skills: [
      {
        category: 'Cleaning',
        subcategory: 'Deep Cleaning',
        verified: true,
        verificationDate: new Date('2023-03-20'),
        level: 'expert'
      },
      {
        category: 'Cleaning',
        subcategory: 'Sanitization',
        verified: true,
        verificationDate: new Date('2023-03-20'),
        level: 'expert'
      }
    ],
    rating: 4.8,
    totalRatings: 142,
    completedJobs: 178,
    memberSince: new Date('2022-05-15'),
    available: true,
    todayEarnings: 980,
    monthEarnings: 26400,
    cooperativeShare: 0.15,
    trainingProgress: [
      {
        id: 'T018',
        name: 'Eco-Friendly Cleaning Products',
        category: 'Cleaning',
        status: 'in-progress',
        progress: 70
      },
      {
        id: 'T019',
        name: 'Health and Safety in Cleaning',
        category: 'Cleaning',
        status: 'completed',
        progress: 100,
        completedDate: new Date('2023-06-22')
      }
    ],
    certifications: [
      {
        id: 'C005',
        name: 'Professional Cleaning Specialist',
        issuer: 'Indian Cleaning Association',
        issueDate: new Date('2022-08-30'),
        verified: true
      }
    ],
    governmentIntegrations: {
      eShram: { linked: true, demo: true },
      digiLocker: { linked: true, demo: true }
    }
  },
  {
    id: 'W014',
    name: 'Kavita Sharma',
    photo: '/assets/workers/kavita.jpg',
    phoneNumber: '+91 99777 88999',
    location: {
      address: 'Preet Vihar, East Delhi',
      coordinates: { lat: 28.6405, lng: 77.2969 }
    },
    serviceRadius: 9,
    skills: [
      {
        category: 'Cleaning',
        subcategory: 'Regular Cleaning',
        verified: true,
        verificationDate: new Date('2023-07-14'),
        level: 'intermediate'
      },
      {
        category: 'Cleaning',
        subcategory: 'Kitchen Cleaning',
        verified: true,
        verificationDate: new Date('2023-07-14'),
        level: 'intermediate'
      }
    ],
    rating: 4.5,
    totalRatings: 81,
    completedJobs: 96,
    memberSince: new Date('2022-12-01'),
    available: true,
    todayEarnings: 640,
    monthEarnings: 20100,
    cooperativeShare: 0.15,
    trainingProgress: [
      {
        id: 'T020',
        name: 'Advanced Stain Removal',
        category: 'Cleaning',
        status: 'in-progress',
        progress: 45
      }
    ],
    certifications: [],
    governmentIntegrations: {
      eShram: { linked: true, demo: true }
    }
  },
  {
    id: 'W015',
    name: 'Meena Kumari',
    photo: '/assets/workers/meena.jpg',
    phoneNumber: '+91 98333 44555',
    location: {
      address: 'Naraina, West Delhi',
      coordinates: { lat: 28.6310, lng: 77.1390 }
    },
    serviceRadius: 7,
    skills: [
      {
        category: 'Cleaning',
        subcategory: 'Regular Cleaning',
        verified: true,
        verificationDate: new Date('2023-09-05'),
        level: 'beginner'
      }
    ],
    rating: 4.2,
    totalRatings: 34,
    completedJobs: 39,
    memberSince: new Date('2023-08-01'),
    available: true,
    todayEarnings: 420,
    monthEarnings: 10800,
    cooperativeShare: 0.15,
    trainingProgress: [
      {
        id: 'T021',
        name: 'Basic Cleaning Techniques',
        category: 'Cleaning',
        status: 'completed',
        progress: 100,
        completedDate: new Date('2023-09-20')
      }
    ],
    certifications: [],
    governmentIntegrations: {
      eShram: { linked: true, demo: true }
    }
  },

  // === MULTI-SKILLED WORKERS ===
  {
    id: 'W016',
    name: 'Mukesh Rana',
    photo: '/assets/workers/mukesh.jpg',
    phoneNumber: '+91 97888 99000',
    location: {
      address: 'Model Town, North Delhi',
      coordinates: { lat: 28.7199, lng: 77.1914 }
    },
    serviceRadius: 13,
    skills: [
      {
        category: 'Plumbing',
        subcategory: 'Leak Repair',
        verified: true,
        verificationDate: new Date('2022-10-12'),
        level: 'intermediate'
      },
      {
        category: 'Electrical',
        subcategory: 'Fan Installation',
        verified: true,
        verificationDate: new Date('2022-10-12'),
        level: 'intermediate'
      }
    ],
    rating: 4.7,
    totalRatings: 115,
    completedJobs: 134,
    memberSince: new Date('2022-04-08'),
    available: true,
    todayEarnings: 1340,
    monthEarnings: 29600,
    cooperativeShare: 0.15,
    trainingProgress: [
      {
        id: 'T022',
        name: 'Multi-Skill Maintenance',
        category: 'General',
        status: 'in-progress',
        progress: 55
      }
    ],
    certifications: [],
    governmentIntegrations: {
      eShram: { linked: true, demo: true },
      digiLocker: { linked: true, demo: true }
    }
  },
  {
    id: 'W017',
    name: 'Pankaj Yadav',
    photo: '/assets/workers/pankaj.jpg',
    phoneNumber: '+91 98444 55666',
    location: {
      address: 'Nehru Place, South Delhi',
      coordinates: { lat: 28.5494, lng: 77.2501 }
    },
    serviceRadius: 11,
    skills: [
      {
        category: 'Carpentry',
        subcategory: 'Furniture Assembly',
        verified: true,
        verificationDate: new Date('2023-02-18'),
        level: 'intermediate'
      },
      {
        category: 'Painting',
        subcategory: 'Interior Painting',
        verified: true,
        verificationDate: new Date('2023-02-18'),
        level: 'beginner'
      }
    ],
    rating: 4.4,
    totalRatings: 72,
    completedJobs: 85,
    memberSince: new Date('2022-11-20'),
    available: false,
    todayEarnings: 0,
    monthEarnings: 21500,
    cooperativeShare: 0.15,
    trainingProgress: [
      {
        id: 'T023',
        name: 'Home Improvement Skills',
        category: 'General',
        status: 'in-progress',
        progress: 65
      }
    ],
    certifications: [],
    governmentIntegrations: {
      eShram: { linked: true, demo: true }
    }
  },

  // === ADDITIONAL DIVERSE PROFILES ===
  {
    id: 'W018',
    name: 'Harish Thakur',
    photo: '/assets/workers/harish.jpg',
    phoneNumber: '+91 99999 88777',
    location: {
      address: 'Punjabi Bagh, West Delhi',
      coordinates: { lat: 28.6722, lng: 77.1314 }
    },
    serviceRadius: 12,
    skills: [
      {
        category: 'Plumbing',
        subcategory: 'Pipe Fitting',
        verified: true,
        verificationDate: new Date('2021-12-15'),
        level: 'expert'
      },
      {
        category: 'Plumbing',
        subcategory: 'Bathroom Fitting',
        verified: true,
        verificationDate: new Date('2021-12-15'),
        level: 'expert'
      }
    ],
    rating: 5.0,
    totalRatings: 298,
    completedJobs: 312,
    memberSince: new Date('2021-06-01'),
    available: true,
    todayEarnings: 2140,
    monthEarnings: 42300,
    cooperativeShare: 0.15,
    trainingProgress: [
      {
        id: 'T024',
        name: 'Master Plumber Training',
        category: 'Plumbing',
        status: 'completed',
        progress: 100,
        completedDate: new Date('2022-08-15')
      }
    ],
    certifications: [
      {
        id: 'C006',
        name: 'Master Plumber License',
        issuer: 'National Council for Vocational Training',
        issueDate: new Date('2020-03-10'),
        expiryDate: new Date('2025-03-10'),
        verified: true
      }
    ],
    governmentIntegrations: {
      eShram: { linked: true, demo: true },
      digiLocker: { linked: true, demo: true },
      bhashini: { linked: true, demo: true }
    }
  },
  {
    id: 'W019',
    name: 'Ashok Pandey',
    photo: '/assets/workers/ashok.jpg',
    phoneNumber: '+91 98555 66777',
    location: {
      address: 'Karkardooma, East Delhi',
      coordinates: { lat: 28.6511, lng: 77.2969 }
    },
    serviceRadius: 10,
    skills: [
      {
        category: 'Electrical',
        subcategory: 'Wiring',
        verified: true,
        verificationDate: new Date('2022-05-20'),
        level: 'expert'
      },
      {
        category: 'Electrical',
        subcategory: 'Solar Installation',
        verified: true,
        verificationDate: new Date('2023-07-12'),
        level: 'intermediate'
      }
    ],
    rating: 4.8,
    totalRatings: 176,
    completedJobs: 198,
    memberSince: new Date('2021-10-15'),
    available: true,
    todayEarnings: 1560,
    monthEarnings: 32800,
    cooperativeShare: 0.15,
    trainingProgress: [
      {
        id: 'T025',
        name: 'Solar Grid Integration',
        category: 'Electrical',
        status: 'in-progress',
        progress: 80
      }
    ],
    certifications: [
      {
        id: 'C007',
        name: 'Licensed Electrician',
        issuer: 'Delhi Electrical Licensing Board',
        issueDate: new Date('2021-02-18'),
        expiryDate: new Date('2026-02-18'),
        verified: true
      }
    ],
    governmentIntegrations: {
      eShram: { linked: true, demo: true },
      digiLocker: { linked: true, demo: true }
    }
  },
  {
    id: 'W020',
    name: 'Santosh Kumar',
    photo: '/assets/workers/santosh.jpg',
    phoneNumber: '+91 97222 33444',
    location: {
      address: 'Patel Nagar, Central Delhi',
      coordinates: { lat: 28.6506, lng: 77.1681 }
    },
    serviceRadius: 9,
    skills: [
      {
        category: 'Carpentry',
        subcategory: 'Custom Woodwork',
        verified: true,
        verificationDate: new Date('2022-08-25'),
        level: 'expert'
      },
      {
        category: 'Carpentry',
        subcategory: 'Furniture Assembly',
        verified: true,
        verificationDate: new Date('2022-08-25'),
        level: 'expert'
      }
    ],
    rating: 4.9,
    totalRatings: 164,
    completedJobs: 189,
    memberSince: new Date('2021-12-10'),
    available: false,
    todayEarnings: 0,
    monthEarnings: 36200,
    cooperativeShare: 0.15,
    trainingProgress: [
      {
        id: 'T026',
        name: 'Fine Woodworking Mastery',
        category: 'Carpentry',
        status: 'completed',
        progress: 100,
        completedDate: new Date('2023-03-28')
      }
    ],
    certifications: [
      {
        id: 'C008',
        name: 'Advanced Carpenter Certificate',
        issuer: 'Indian Institute of Carpentry',
        issueDate: new Date('2021-09-15'),
        verified: true
      }
    ],
    governmentIntegrations: {
      eShram: { linked: true, demo: true },
      digiLocker: { linked: true, demo: true }
    }
  },
  {
    id: 'W021',
    name: 'Yogesh Saxena',
    photo: '/assets/workers/yogesh.jpg',
    phoneNumber: '+91 98666 77888',
    location: {
      address: 'Vasant Vihar, South Delhi',
      coordinates: { lat: 28.5622, lng: 77.1605 }
    },
    serviceRadius: 14,
    skills: [
      {
        category: 'Painting',
        subcategory: 'Exterior Painting',
        verified: true,
        verificationDate: new Date('2022-11-08'),
        level: 'expert'
      },
      {
        category: 'Painting',
        subcategory: 'Texture Work',
        verified: true,
        verificationDate: new Date('2022-11-08'),
        level: 'expert'
      }
    ],
    rating: 4.8,
    totalRatings: 152,
    completedJobs: 171,
    memberSince: new Date('2022-01-18'),
    available: true,
    todayEarnings: 1780,
    monthEarnings: 33900,
    cooperativeShare: 0.15,
    trainingProgress: [
      {
        id: 'T027',
        name: 'Industrial Coating Techniques',
        category: 'Painting',
        status: 'in-progress',
        progress: 72
      }
    ],
    certifications: [
      {
        id: 'C009',
        name: 'Certified Professional Painter',
        issuer: 'National Skill Development Corporation',
        issueDate: new Date('2021-10-05'),
        verified: true
      }
    ],
    governmentIntegrations: {
      eShram: { linked: true, demo: true },
      digiLocker: { linked: true, demo: true }
    }
  },
  {
    id: 'W022',
    name: 'Rita Singh',
    photo: '/assets/workers/rita.jpg',
    phoneNumber: '+91 99888 77666',
    location: {
      address: 'IP Extension, East Delhi',
      coordinates: { lat: 28.6218, lng: 77.2812 }
    },
    serviceRadius: 8,
    skills: [
      {
        category: 'Cleaning',
        subcategory: 'Deep Cleaning',
        verified: true,
        verificationDate: new Date('2023-04-15'),
        level: 'intermediate'
      },
      {
        category: 'Cleaning',
        subcategory: 'Sanitization',
        verified: true,
        verificationDate: new Date('2023-04-15'),
        level: 'intermediate'
      }
    ],
    rating: 4.6,
    totalRatings: 98,
    completedJobs: 112,
    memberSince: new Date('2022-08-20'),
    available: true,
    todayEarnings: 870,
    monthEarnings: 23400,
    cooperativeShare: 0.15,
    trainingProgress: [
      {
        id: 'T028',
        name: 'Commercial Cleaning Standards',
        category: 'Cleaning',
        status: 'in-progress',
        progress: 50
      }
    ],
    certifications: [],
    governmentIntegrations: {
      eShram: { linked: true, demo: true }
    }
  },
  {
    id: 'W023',
    name: 'Vikas Arora',
    photo: '/assets/workers/vikas.jpg',
    phoneNumber: '+91 98777 88999',
    location: {
      address: 'Rajouri Garden, West Delhi',
      coordinates: { lat: 28.6410, lng: 77.1201 }
    },
    serviceRadius: 11,
    skills: [
      {
        category: 'Electrical',
        subcategory: 'Appliance Repair',
        verified: true,
        verificationDate: new Date('2023-01-25'),
        level: 'intermediate'
      },
      {
        category: 'Electrical',
        subcategory: 'Switchboard Repair',
        verified: true,
        verificationDate: new Date('2023-01-25'),
        level: 'beginner'
      }
    ],
    rating: 4.4,
    totalRatings: 64,
    completedJobs: 76,
    memberSince: new Date('2022-09-05'),
    available: true,
    todayEarnings: 810,
    monthEarnings: 19200,
    cooperativeShare: 0.15,
    trainingProgress: [
      {
        id: 'T029',
        name: 'Modern Appliance Electronics',
        category: 'Electrical',
        status: 'in-progress',
        progress: 40
      }
    ],
    certifications: [],
    governmentIntegrations: {
      eShram: { linked: true, demo: true }
    }
  },
  {
    id: 'W024',
    name: 'Anita Mehra',
    photo: '/assets/workers/anita.jpg',
    phoneNumber: '+91 97333 44555',
    location: {
      address: 'Kalkaji, South Delhi',
      coordinates: { lat: 28.5489, lng: 77.2583 }
    },
    serviceRadius: 10,
    skills: [
      {
        category: 'Cleaning',
        subcategory: 'Kitchen Cleaning',
        verified: true,
        verificationDate: new Date('2023-05-10'),
        level: 'expert'
      },
      {
        category: 'Cleaning',
        subcategory: 'Regular Cleaning',
        verified: true,
        verificationDate: new Date('2023-05-10'),
        level: 'expert'
      }
    ],
    rating: 4.7,
    totalRatings: 134,
    completedJobs: 156,
    memberSince: new Date('2022-03-15'),
    available: true,
    todayEarnings: 1120,
    monthEarnings: 27800,
    cooperativeShare: 0.15,
    trainingProgress: [
      {
        id: 'T030',
        name: 'Specialized Kitchen Hygiene',
        category: 'Cleaning',
        status: 'completed',
        progress: 100,
        completedDate: new Date('2023-08-05')
      }
    ],
    certifications: [
      {
        id: 'C010',
        name: 'Hygiene Specialist Certificate',
        issuer: 'Indian Cleaning Association',
        issueDate: new Date('2022-11-20'),
        verified: true
      }
    ],
    governmentIntegrations: {
      eShram: { linked: true, demo: true },
      digiLocker: { linked: true, demo: true }
    }
  },
  {
    id: 'W025',
    name: 'Naveen Joshi',
    photo: '/assets/workers/naveen.jpg',
    phoneNumber: '+91 98888 99000',
    location: {
      address: 'Dilshad Garden, East Delhi',
      coordinates: { lat: 28.6858, lng: 77.3183 }
    },
    serviceRadius: 12,
    skills: [
      {
        category: 'Plumbing',
        subcategory: 'Drainage Systems',
        verified: true,
        verificationDate: new Date('2023-03-12'),
        level: 'intermediate'
      },
      {
        category: 'Carpentry',
        subcategory: 'Door Repair',
        verified: true,
        verificationDate: new Date('2023-03-12'),
        level: 'beginner'
      }
    ],
    rating: 4.5,
    totalRatings: 86,
    completedJobs: 99,
    memberSince: new Date('2022-10-08'),
    available: false,
    todayEarnings: 0,
    monthEarnings: 22700,
    cooperativeShare: 0.15,
    trainingProgress: [
      {
        id: 'T031',
        name: 'Versatile Home Maintenance',
        category: 'General',
        status: 'in-progress',
        progress: 58
      }
    ],
    certifications: [],
    governmentIntegrations: {
      eShram: { linked: true, demo: true }
    }
  }
];

/**
 * Helper function to get workers by skill category
 */
export function getWorkersBySkill(skillCategory: string): Worker[] {
  return mockWorkers.filter(worker =>
    worker.skills.some(skill => skill.category === skillCategory)
  );
}

/**
 * Helper function to get available workers
 */
export function getAvailableWorkers(): Worker[] {
  return mockWorkers.filter(worker => worker.available);
}

/**
 * Helper function to get worker by ID
 */
export function getWorkerById(workerId: string): Worker | undefined {
  return mockWorkers.find(worker => worker.id === workerId);
}

/**
 * Helper function to get workers within a specific service radius range
 */
export function getWorkersByServiceRadius(minRadius: number, maxRadius: number): Worker[] {
  return mockWorkers.filter(
    worker => worker.serviceRadius >= minRadius && worker.serviceRadius <= maxRadius
  );
}
