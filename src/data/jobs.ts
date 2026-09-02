/**
 * Mock job data for SAHAKAR // SERVICES
 * 
 * Validates Requirements: 11.2
 * 
 * Sample jobs with various statuses for demonstration purposes.
 * Links jobs to mock workers and service categories.
 */

import type { Job } from '../types/job';

/**
 * Mock jobs for demonstration
 * Includes jobs with different statuses to showcase the complete workflow
 * Covers all service categories and job statuses
 */
export const mockJobs: Job[] = [
  // === IN-PROGRESS JOBS ===
  {
    id: 'JOB001',
    customerId: 'CUST001',
    customerName: 'Priya Sharma',
    customerLocation: {
      address: 'B-45, Sector 18, Rohini, Delhi',
      coordinates: { lat: 28.7461, lng: 77.0703 }
    },
    serviceCategory: 'Plumbing',
    serviceSubcategory: 'Leak Repair',
    description: 'Kitchen sink tap is leaking continuously. Needs immediate fixing.',
    status: 'in-progress',
    assignedWorkerId: 'W001',
    estimatedDuration: 60,
    estimatedPrice: 500,
    workerEarnings: 425
  },
  
  {
    id: 'JOB002',
    customerId: 'CUST002',
    customerName: 'Monika Desai',
    customerLocation: {
      address: 'A-78, Vasant Vihar, South Delhi',
      coordinates: { lat: 28.5622, lng: 77.1605 }
    },
    serviceCategory: 'Painting',
    serviceSubcategory: 'Exterior Wall Painting',
    description: 'Front wall exterior painting needed. Weather resistant paint preferred.',
    status: 'in-progress',
    assignedWorkerId: 'W021',
    estimatedDuration: 360,
    estimatedPrice: 4500,
    workerEarnings: 3825
  },
  
  // === PENDING JOBS ===
  {
    id: 'JOB003',
    customerId: 'CUST003',
    customerName: 'Rahul Verma',
    customerLocation: {
      address: 'Plot 23, Dwarka Sector 12, Delhi',
      coordinates: { lat: 28.5921, lng: 77.0460 }
    },
    serviceCategory: 'Electrical',
    serviceSubcategory: 'Ceiling Fan Installation',
    description: 'Need to install 2 ceiling fans in bedroom and living room.',
    status: 'pending',
    estimatedDuration: 90,
    estimatedPrice: 600,
    workerEarnings: 510
  },
  
  {
    id: 'JOB004',
    customerId: 'CUST004',
    customerName: 'Sanjay Khanna',
    customerLocation: {
      address: 'C-56, Karol Bagh, Central Delhi',
      coordinates: { lat: 28.6510, lng: 77.1909 }
    },
    serviceCategory: 'Carpentry',
    serviceSubcategory: 'Door Installation',
    description: 'Install new wooden door for bedroom. Door already purchased.',
    status: 'pending',
    estimatedDuration: 180,
    estimatedPrice: 2000,
    workerEarnings: 1700
  },
  
  {
    id: 'JOB005',
    customerId: 'CUST005',
    customerName: 'Divya Agarwal',
    customerLocation: {
      address: 'F-12, Preet Vihar, East Delhi',
      coordinates: { lat: 28.6405, lng: 77.2969 }
    },
    serviceCategory: 'Appliance Repair',
    serviceSubcategory: 'Washing Machine Repair',
    description: 'Washing machine not draining water properly. Making loud noise.',
    status: 'pending',
    estimatedDuration: 90,
    estimatedPrice: 800,
    workerEarnings: 680
  },
  
  // === MATCHED JOBS ===
  {
    id: 'JOB006',
    customerId: 'CUST006',
    customerName: 'Anjali Gupta',
    customerLocation: {
      address: 'C-102, Janakpuri, West Delhi',
      coordinates: { lat: 28.6211, lng: 77.0830 }
    },
    serviceCategory: 'Cleaning',
    serviceSubcategory: 'Home Deep Cleaning',
    description: 'Full home deep cleaning needed for 2BHK apartment.',
    status: 'matched',
    assignedWorkerId: 'W013',
    estimatedDuration: 240,
    estimatedPrice: 2500,
    workerEarnings: 2125
  },
  
  {
    id: 'JOB007',
    customerId: 'CUST007',
    customerName: 'Arjun Malhotra',
    customerLocation: {
      address: 'D-89, Patel Nagar, Central Delhi',
      coordinates: { lat: 28.6506, lng: 77.1681 }
    },
    serviceCategory: 'Carpentry',
    serviceSubcategory: 'Custom Furniture Making',
    description: 'Need custom wall-mounted shelving unit for living room.',
    status: 'matched',
    assignedWorkerId: 'W020',
    estimatedDuration: 600,
    estimatedPrice: 8500,
    workerEarnings: 7225
  },
  
  // === ACCEPTED JOBS ===
  {
    id: 'JOB008',
    customerId: 'CUST008',
    customerName: 'Karan Mehta',
    customerLocation: {
      address: 'G-45, Model Town, North Delhi',
      coordinates: { lat: 28.7199, lng: 77.1914 }
    },
    serviceCategory: 'Electrical',
    serviceSubcategory: 'Switch & Socket Installation',
    description: 'Replace 4 old switches and install 2 new sockets in bedroom.',
    status: 'accepted',
    assignedWorkerId: 'W016',
    estimatedDuration: 60,
    estimatedPrice: 400,
    workerEarnings: 340
  },
  
  {
    id: 'JOB009',
    customerId: 'CUST009',
    customerName: 'Pooja Reddy',
    customerLocation: {
      address: 'E-34, Mayur Vihar Phase 1, Delhi',
      coordinates: { lat: 28.6083, lng: 77.2907 }
    },
    serviceCategory: 'Plumbing',
    serviceSubcategory: 'Water Heater Installation',
    description: 'Install new geyser in bathroom. Geyser already purchased.',
    status: 'accepted',
    assignedWorkerId: 'W002',
    estimatedDuration: 120,
    estimatedPrice: 2000,
    workerEarnings: 1700
  },
  
  {
    id: 'JOB010',
    customerId: 'CUST010',
    customerName: 'Tarun Sinha',
    customerLocation: {
      address: 'B-67, Naraina, West Delhi',
      coordinates: { lat: 28.6310, lng: 77.1390 }
    },
    serviceCategory: 'Cleaning',
    serviceSubcategory: 'Office Cleaning',
    description: 'Deep cleaning for small office space, 800 sq ft.',
    status: 'accepted',
    assignedWorkerId: 'W015',
    estimatedDuration: 180,
    estimatedPrice: 3000,
    workerEarnings: 2550
  },
  
  // === COMPLETED JOBS WITH RATINGS ===
  {
    id: 'JOB011',
    customerId: 'CUST011',
    customerName: 'Vikram Singh',
    customerLocation: {
      address: 'A-15, Pitampura, North Delhi',
      coordinates: { lat: 28.6971, lng: 77.1318 }
    },
    serviceCategory: 'Electrical',
    serviceSubcategory: 'Wiring & Rewiring',
    description: 'Complete rewiring of living room and kitchen.',
    status: 'completed',
    assignedWorkerId: 'W004',
    estimatedDuration: 300,
    estimatedPrice: 4500,
    actualPrice: 4500,
    completedAt: new Date('2024-01-14T16:30:00'),
    rating: 5,
    review: 'Excellent work! Very professional and completed on time.',
    workerEarnings: 3825
  },
  
  {
    id: 'JOB012',
    customerId: 'CUST012',
    customerName: 'Neha Malhotra',
    customerLocation: {
      address: 'F-208, Saket, South Delhi',
      coordinates: { lat: 28.5244, lng: 77.2066 }
    },
    serviceCategory: 'Carpentry',
    serviceSubcategory: 'Furniture Repair',
    description: 'Dining table chair needs repair, wooden leg is broken.',
    status: 'completed',
    assignedWorkerId: 'W007',
    estimatedDuration: 90,
    estimatedPrice: 800,
    actualPrice: 750,
    completedAt: new Date('2024-01-13T14:15:00'),
    rating: 4.5,
    review: 'Good work, chair is sturdy now. Slightly delayed but quality is great.',
    workerEarnings: 638
  },
  
  {
    id: 'JOB013',
    customerId: 'CUST013',
    customerName: 'Amit Patel',
    customerLocation: {
      address: 'D-67, Vasant Kunj, South Delhi',
      coordinates: { lat: 28.5177, lng: 77.1577 }
    },
    serviceCategory: 'Painting',
    serviceSubcategory: 'Interior Wall Painting',
    description: 'Paint 2 bedrooms with Asian Paints Royale emulsion.',
    status: 'completed',
    assignedWorkerId: 'W010',
    estimatedDuration: 480,
    estimatedPrice: 6500,
    actualPrice: 6500,
    completedAt: new Date('2024-01-12T18:00:00'),
    rating: 5,
    review: 'Fantastic work! Very neat and professional. Highly recommended.',
    workerEarnings: 5525
  },
  
  {
    id: 'JOB014',
    customerId: 'CUST014',
    customerName: 'Sunita Reddy',
    customerLocation: {
      address: 'E-12, Malviya Nagar, South Delhi',
      coordinates: { lat: 28.5355, lng: 77.2074 }
    },
    serviceCategory: 'Cleaning',
    serviceSubcategory: 'Kitchen Cleaning',
    description: 'Deep clean kitchen including chimney and appliances.',
    status: 'completed',
    assignedWorkerId: 'W014',
    estimatedDuration: 120,
    estimatedPrice: 1200,
    actualPrice: 1200,
    completedAt: new Date('2024-01-11T13:45:00'),
    rating: 4,
    review: 'Good cleaning but took a bit longer than expected.',
    workerEarnings: 1020
  },
  
  {
    id: 'JOB015',
    customerId: 'CUST015',
    customerName: 'Deepak Joshi',
    customerLocation: {
      address: 'H-89, Punjabi Bagh, West Delhi',
      coordinates: { lat: 28.6722, lng: 77.1314 }
    },
    serviceCategory: 'Plumbing',
    serviceSubcategory: 'Toilet Repair',
    description: 'Toilet flush system not working properly, needs repair.',
    status: 'completed',
    assignedWorkerId: 'W018',
    estimatedDuration: 75,
    estimatedPrice: 600,
    actualPrice: 550,
    completedAt: new Date('2024-01-10T11:20:00'),
    rating: 5,
    review: 'Quick and efficient! Fixed the problem perfectly.',
    workerEarnings: 468
  },
  
  {
    id: 'JOB016',
    customerId: 'CUST016',
    customerName: 'Rakesh Kumar',
    customerLocation: {
      address: 'C-23, Shahdara, East Delhi',
      coordinates: { lat: 28.6832, lng: 77.2887 }
    },
    serviceCategory: 'Electrical',
    serviceSubcategory: 'Light Fixture Installation',
    description: 'Install chandelier in dining area.',
    status: 'completed',
    assignedWorkerId: 'W005',
    estimatedDuration: 90,
    estimatedPrice: 800,
    actualPrice: 800,
    completedAt: new Date('2024-01-09T15:30:00'),
    rating: 4.5,
    review: 'Professionally done. Very careful with the installation.',
    workerEarnings: 680
  },
  
  {
    id: 'JOB017',
    customerId: 'CUST017',
    customerName: 'Kavita Nair',
    customerLocation: {
      address: 'A-45, Laxmi Nagar, East Delhi',
      coordinates: { lat: 28.6316, lng: 77.2768 }
    },
    serviceCategory: 'Carpentry',
    serviceSubcategory: 'Window Installation',
    description: 'Replace old wooden windows with new ones in 2 bedrooms.',
    status: 'completed',
    assignedWorkerId: 'W008',
    estimatedDuration: 240,
    estimatedPrice: 3500,
    actualPrice: 3200,
    completedAt: new Date('2024-01-08T17:00:00'),
    rating: 4,
    review: 'Good work overall. Windows fit well.',
    workerEarnings: 2720
  },
  
  {
    id: 'JOB018',
    customerId: 'CUST018',
    customerName: 'Rohit Kapoor',
    customerLocation: {
      address: 'F-56, Uttam Nagar, West Delhi',
      coordinates: { lat: 28.6220, lng: 77.0605 }
    },
    serviceCategory: 'Painting',
    serviceSubcategory: 'Ceiling Painting',
    description: 'Paint bedroom ceiling, water stains need covering.',
    status: 'completed',
    assignedWorkerId: 'W011',
    estimatedDuration: 180,
    estimatedPrice: 2000,
    actualPrice: 1800,
    completedAt: new Date('2024-01-07T14:00:00'),
    rating: 5,
    review: 'Amazing transformation! Ceiling looks brand new.',
    workerEarnings: 1530
  },
  
  {
    id: 'JOB019',
    customerId: 'CUST019',
    customerName: 'Meera Shah',
    customerLocation: {
      address: 'B-101, Greater Kailash, South Delhi',
      coordinates: { lat: 28.5494, lng: 77.2426 }
    },
    serviceCategory: 'Cleaning',
    serviceSubcategory: 'Sofa & Carpet Cleaning',
    description: '3-seater sofa and living room carpet deep cleaning.',
    status: 'completed',
    assignedWorkerId: 'W013',
    estimatedDuration: 120,
    estimatedPrice: 1800,
    actualPrice: 1800,
    completedAt: new Date('2024-01-06T12:30:00'),
    rating: 4.5,
    review: 'Very thorough cleaning. Sofa looks like new.',
    workerEarnings: 1530
  },
  
  {
    id: 'JOB020',
    customerId: 'CUST020',
    customerName: 'Anil Gupta',
    customerLocation: {
      address: 'D-34, Karkardooma, East Delhi',
      coordinates: { lat: 28.6511, lng: 77.2969 }
    },
    serviceCategory: 'Appliance Repair',
    serviceSubcategory: 'Refrigerator Repair',
    description: 'Refrigerator not cooling properly, needs gas refilling.',
    status: 'completed',
    assignedWorkerId: 'W019',
    estimatedDuration: 90,
    estimatedPrice: 1500,
    actualPrice: 1500,
    completedAt: new Date('2024-01-05T16:00:00'),
    rating: 5,
    review: 'Fixed the issue perfectly. Works great now!',
    workerEarnings: 1275
  },
  
  {
    id: 'JOB021',
    customerId: 'CUST021',
    customerName: 'Simran Kaur',
    customerLocation: {
      address: 'C-78, Nehru Place, South Delhi',
      coordinates: { lat: 28.5494, lng: 77.2501 }
    },
    serviceCategory: 'Electrical',
    serviceSubcategory: 'Circuit Breaker Repair',
    description: 'Main circuit breaker keeps tripping. Need inspection and repair.',
    status: 'completed',
    assignedWorkerId: 'W004',
    estimatedDuration: 120,
    estimatedPrice: 1200,
    actualPrice: 1100,
    completedAt: new Date('2024-01-04T10:45:00'),
    rating: 4.5,
    review: 'Professional diagnosis and repair. Problem solved.',
    workerEarnings: 935
  },
  
  {
    id: 'JOB022',
    customerId: 'CUST022',
    customerName: 'Gaurav Sharma',
    customerLocation: {
      address: 'E-23, Sector 15, Rohini, Delhi',
      coordinates: { lat: 28.7461, lng: 77.0703 }
    },
    serviceCategory: 'Plumbing',
    serviceSubcategory: 'Pipe Installation',
    description: 'Install new water supply pipe for bathroom.',
    status: 'completed',
    assignedWorkerId: 'W001',
    estimatedDuration: 150,
    estimatedPrice: 1800,
    actualPrice: 1650,
    completedAt: new Date('2024-01-03T13:20:00'),
    rating: 5,
    review: 'Excellent service! No leaks, perfect installation.',
    workerEarnings: 1403
  },
  
  {
    id: 'JOB023',
    customerId: 'CUST023',
    customerName: 'Nisha Patel',
    customerLocation: {
      address: 'F-90, Vasant Kunj, South Delhi',
      coordinates: { lat: 28.5177, lng: 77.1577 }
    },
    serviceCategory: 'Painting',
    serviceSubcategory: 'Furniture Painting',
    description: 'Refinish and paint old wooden wardrobe.',
    status: 'completed',
    assignedWorkerId: 'W010',
    estimatedDuration: 240,
    estimatedPrice: 2000,
    actualPrice: 1900,
    completedAt: new Date('2024-01-02T16:15:00'),
    rating: 4,
    review: 'Good work. Wardrobe looks refreshed.',
    workerEarnings: 1615
  },
  
  {
    id: 'JOB024',
    customerId: 'CUST024',
    customerName: 'Manish Verma',
    customerLocation: {
      address: 'A-12, Model Town, North Delhi',
      coordinates: { lat: 28.7199, lng: 77.1914 }
    },
    serviceCategory: 'Appliance Repair',
    serviceSubcategory: 'Air Conditioner Repair',
    description: 'AC not cooling, possible gas leak.',
    status: 'completed',
    assignedWorkerId: 'W019',
    estimatedDuration: 120,
    estimatedPrice: 1800,
    actualPrice: 2000,
    completedAt: new Date('2024-01-01T11:30:00'),
    rating: 4.5,
    review: 'Found the issue and fixed it. Working perfectly now.',
    workerEarnings: 1700
  },
  
  // === CANCELLED JOBS ===
  {
    id: 'JOB025',
    customerId: 'CUST025',
    customerName: 'Ritu Kapoor',
    customerLocation: {
      address: 'B-301, Greater Kailash, South Delhi',
      coordinates: { lat: 28.5494, lng: 77.2426 }
    },
    serviceCategory: 'Plumbing',
    serviceSubcategory: 'Pipe Installation',
    description: 'New pipe installation for washing machine.',
    status: 'cancelled',
    estimatedDuration: 120,
    estimatedPrice: 1500,
    workerEarnings: 0
  },
  
  {
    id: 'JOB026',
    customerId: 'CUST026',
    customerName: 'Sameer Khan',
    customerLocation: {
      address: 'D-45, Karol Bagh, Central Delhi',
      coordinates: { lat: 28.6510, lng: 77.1909 }
    },
    serviceCategory: 'Electrical',
    serviceSubcategory: 'Solar Panel Installation',
    description: 'Install 3kW solar panel system on rooftop.',
    status: 'cancelled',
    estimatedDuration: 480,
    estimatedPrice: 25000,
    workerEarnings: 0
  },
  
  {
    id: 'JOB027',
    customerId: 'CUST027',
    customerName: 'Preeti Agarwal',
    customerLocation: {
      address: 'C-89, Dwarka Sector 10, Delhi',
      coordinates: { lat: 28.5921, lng: 77.0460 }
    },
    serviceCategory: 'Cleaning',
    serviceSubcategory: 'Post-Construction Cleaning',
    description: 'Post-renovation cleaning for entire apartment.',
    status: 'cancelled',
    estimatedDuration: 360,
    estimatedPrice: 5000,
    workerEarnings: 0
  },
  
  // === REJECTED JOBS ===
  {
    id: 'JOB028',
    customerId: 'CUST028',
    customerName: 'Akash Mehta',
    customerLocation: {
      address: 'E-67, Janakpuri, West Delhi',
      coordinates: { lat: 28.6211, lng: 77.0830 }
    },
    serviceCategory: 'Carpentry',
    serviceSubcategory: 'Flooring Installation',
    description: 'Install laminate flooring in bedroom, 150 sq ft.',
    status: 'rejected',
    assignedWorkerId: 'W009',
    estimatedDuration: 360,
    estimatedPrice: 8000,
    workerEarnings: 0
  },
  
  {
    id: 'JOB029',
    customerId: 'CUST029',
    customerName: 'Sneha Joshi',
    customerLocation: {
      address: 'F-34, Punjabi Bagh, West Delhi',
      coordinates: { lat: 28.6722, lng: 77.1314 }
    },
    serviceCategory: 'Painting',
    serviceSubcategory: 'Waterproofing',
    description: 'Waterproofing for terrace, 200 sq ft area.',
    status: 'rejected',
    assignedWorkerId: 'W012',
    estimatedDuration: 480,
    estimatedPrice: 12000,
    workerEarnings: 0
  },
  
  {
    id: 'JOB030',
    customerId: 'CUST030',
    customerName: 'Varun Malhotra',
    customerLocation: {
      address: 'A-90, Patel Nagar, Central Delhi',
      coordinates: { lat: 28.6506, lng: 77.1681 }
    },
    serviceCategory: 'Appliance Repair',
    serviceSubcategory: 'Microwave Repair',
    description: 'Microwave heating element not working.',
    status: 'rejected',
    assignedWorkerId: 'W019',
    estimatedDuration: 60,
    estimatedPrice: 700,
    workerEarnings: 0
  }
];

/**
 * Get jobs by status
 */
export function getJobsByStatus(status: Job['status']): Job[] {
  return mockJobs.filter(job => job.status === status);
}

/**
 * Get jobs by worker ID
 */
export function getJobsByWorker(workerId: string): Job[] {
  return mockJobs.filter(job => job.assignedWorkerId === workerId);
}

/**
 * Get jobs by service category
 */
export function getJobsByCategory(category: string): Job[] {
  return mockJobs.filter(job => job.serviceCategory === category);
}

/**
 * Get active jobs (in-progress or accepted)
 */
export function getActiveJobs(): Job[] {
  return mockJobs.filter(job => 
    job.status === 'in-progress' || job.status === 'accepted'
  );
}

/**
 * Get completed jobs
 */
export function getCompletedJobs(): Job[] {
  return getJobsByStatus('completed');
}

/**
 * Get job by ID
 */
export function getJobById(jobId: string): Job | undefined {
  return mockJobs.find(job => job.id === jobId);
}

/**
 * Calculate today's completed jobs count
 */
export function getTodayCompletedJobsCount(): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return mockJobs.filter(job => {
    if (job.status !== 'completed' || !job.completedAt) return false;
    const completedDate = new Date(job.completedAt);
    completedDate.setHours(0, 0, 0, 0);
    return completedDate.getTime() === today.getTime();
  }).length;
}

/**
 * Calculate total earnings from completed jobs
 */
export function getTotalEarnings(): number {
  return mockJobs
    .filter(job => job.status === 'completed')
    .reduce((total, job) => total + job.workerEarnings, 0);
}
