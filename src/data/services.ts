/**
 * Mock service categories data for SAHAKAR // SERVICES
 * 
 * Validates Requirements: 11.3
 * 
 * This file contains hardcoded service categories with subcategories,
 * required skills, price ranges, and duration estimates.
 */

import type { ServiceCategory } from '../types/service';

export const mockServiceCategories: ServiceCategory[] = [
  {
    id: 'S001',
    name: 'Plumbing',
    icon: 'plumbing',
    description: 'Professional plumbing services for residential and commercial needs including repairs, installations, and maintenance',
    subcategories: [
      {
        id: 'S001-01',
        name: 'Leak Repair',
        description: 'Fix leaking taps, pipes, and fixtures',
        requiredSkills: ['Plumbing', 'Leak Repair'],
        priceRange: { min: 300, max: 800 },
        durationRange: { min: 30, max: 90 }
      },
      {
        id: 'S001-02',
        name: 'Pipe Installation',
        description: 'Install new water supply or drainage pipes',
        requiredSkills: ['Plumbing', 'Pipe Fitting'],
        priceRange: { min: 1000, max: 3000 },
        durationRange: { min: 120, max: 240 }
      },
      {
        id: 'S001-03',
        name: 'Toilet Repair',
        description: 'Fix toilet flush systems, leaks, and blockages',
        requiredSkills: ['Plumbing', 'Sanitary Fitting'],
        priceRange: { min: 400, max: 1200 },
        durationRange: { min: 45, max: 120 }
      },
      {
        id: 'S001-04',
        name: 'Water Heater Installation',
        description: 'Install or repair electric and gas water heaters',
        requiredSkills: ['Plumbing', 'Water Heater Systems'],
        priceRange: { min: 1500, max: 4000 },
        durationRange: { min: 90, max: 180 }
      }
    ],
    avgPrice: '₹500-2000',
    avgDuration: '1-2 hours'
  },
  {
    id: 'S002',
    name: 'Electrical',
    icon: 'electrical',
    description: 'Licensed electrical services for home and office including wiring, repairs, and installations',
    subcategories: [
      {
        id: 'S002-01',
        name: 'Wiring & Rewiring',
        description: 'Install or replace electrical wiring systems',
        requiredSkills: ['Electrical', 'Wiring'],
        priceRange: { min: 2000, max: 8000 },
        durationRange: { min: 180, max: 480 }
      },
      {
        id: 'S002-02',
        name: 'Switch & Socket Installation',
        description: 'Install or repair switches, sockets, and outlets',
        requiredSkills: ['Electrical', 'Fixture Installation'],
        priceRange: { min: 200, max: 600 },
        durationRange: { min: 20, max: 60 }
      },
      {
        id: 'S002-03',
        name: 'Ceiling Fan Installation',
        description: 'Install or repair ceiling fans and regulators',
        requiredSkills: ['Electrical', 'Appliance Installation'],
        priceRange: { min: 300, max: 800 },
        durationRange: { min: 30, max: 60 }
      },
      {
        id: 'S002-04',
        name: 'Light Fixture Installation',
        description: 'Install chandeliers, LED lights, and decorative lighting',
        requiredSkills: ['Electrical', 'Lighting Systems'],
        priceRange: { min: 400, max: 1500 },
        durationRange: { min: 45, max: 120 }
      },
      {
        id: 'S002-05',
        name: 'Circuit Breaker Repair',
        description: 'Repair or replace faulty circuit breakers and MCBs',
        requiredSkills: ['Electrical', 'Circuit Systems'],
        priceRange: { min: 500, max: 1800 },
        durationRange: { min: 60, max: 150 }
      },
      {
        id: 'S002-06',
        name: 'Solar Panel Installation',
        description: 'Install residential solar power systems',
        requiredSkills: ['Electrical', 'Solar Installation'],
        priceRange: { min: 15000, max: 50000 },
        durationRange: { min: 480, max: 960 }
      }
    ],
    avgPrice: '₹800-3000',
    avgDuration: '1-3 hours'
  },
  {
    id: 'S003',
    name: 'Carpentry',
    icon: 'carpentry',
    description: 'Expert carpentry services for furniture, doors, windows, and custom woodwork',
    subcategories: [
      {
        id: 'S003-01',
        name: 'Furniture Repair',
        description: 'Repair broken chairs, tables, beds, and cabinets',
        requiredSkills: ['Carpentry', 'Furniture Repair'],
        priceRange: { min: 400, max: 1500 },
        durationRange: { min: 60, max: 180 }
      },
      {
        id: 'S003-02',
        name: 'Door Installation',
        description: 'Install or repair wooden doors and frames',
        requiredSkills: ['Carpentry', 'Door Fitting'],
        priceRange: { min: 1000, max: 3500 },
        durationRange: { min: 90, max: 240 }
      },
      {
        id: 'S003-03',
        name: 'Window Installation',
        description: 'Install or repair wooden windows and frames',
        requiredSkills: ['Carpentry', 'Window Fitting'],
        priceRange: { min: 1200, max: 4000 },
        durationRange: { min: 120, max: 300 }
      },
      {
        id: 'S003-04',
        name: 'Custom Furniture Making',
        description: 'Build custom wardrobes, shelves, and storage units',
        requiredSkills: ['Carpentry', 'Custom Woodwork'],
        priceRange: { min: 5000, max: 25000 },
        durationRange: { min: 480, max: 1440 }
      },
      {
        id: 'S003-05',
        name: 'Flooring Installation',
        description: 'Install wooden or laminate flooring',
        requiredSkills: ['Carpentry', 'Flooring'],
        priceRange: { min: 3000, max: 15000 },
        durationRange: { min: 240, max: 720 }
      }
    ],
    avgPrice: '₹1000-4000',
    avgDuration: '2-4 hours'
  },
  {
    id: 'S004',
    name: 'Painting',
    icon: 'painting',
    description: 'Professional painting services for interiors, exteriors, and specialized finishes',
    subcategories: [
      {
        id: 'S004-01',
        name: 'Interior Wall Painting',
        description: 'Paint interior walls with premium emulsion',
        requiredSkills: ['Painting', 'Interior Painting'],
        priceRange: { min: 2000, max: 10000 },
        durationRange: { min: 240, max: 720 }
      },
      {
        id: 'S004-02',
        name: 'Exterior Wall Painting',
        description: 'Paint exterior walls with weather-resistant paint',
        requiredSkills: ['Painting', 'Exterior Painting'],
        priceRange: { min: 3000, max: 15000 },
        durationRange: { min: 360, max: 960 }
      },
      {
        id: 'S004-03',
        name: 'Ceiling Painting',
        description: 'Paint ceilings with specialized tools and techniques',
        requiredSkills: ['Painting', 'Ceiling Work'],
        priceRange: { min: 1500, max: 6000 },
        durationRange: { min: 180, max: 480 }
      },
      {
        id: 'S004-04',
        name: 'Texture Painting',
        description: 'Apply textured or decorative finishes to walls',
        requiredSkills: ['Painting', 'Texture Work'],
        priceRange: { min: 3500, max: 12000 },
        durationRange: { min: 300, max: 720 }
      },
      {
        id: 'S004-05',
        name: 'Furniture Painting',
        description: 'Refinish and paint wooden furniture',
        requiredSkills: ['Painting', 'Furniture Finishing'],
        priceRange: { min: 800, max: 3000 },
        durationRange: { min: 120, max: 360 }
      },
      {
        id: 'S004-06',
        name: 'Waterproofing',
        description: 'Apply waterproofing solutions to walls and roofs',
        requiredSkills: ['Painting', 'Waterproofing'],
        priceRange: { min: 4000, max: 20000 },
        durationRange: { min: 360, max: 1200 }
      }
    ],
    avgPrice: '₹2000-8000',
    avgDuration: '4-8 hours'
  },
  {
    id: 'S005',
    name: 'Cleaning',
    icon: 'cleaning',
    description: 'Comprehensive cleaning services for homes, offices, and post-construction sites',
    subcategories: [
      {
        id: 'S005-01',
        name: 'Home Deep Cleaning',
        description: 'Thorough cleaning of all rooms including kitchen and bathrooms',
        requiredSkills: ['Cleaning', 'Residential Cleaning'],
        priceRange: { min: 1500, max: 4000 },
        durationRange: { min: 180, max: 360 }
      },
      {
        id: 'S005-02',
        name: 'Kitchen Cleaning',
        description: 'Deep clean kitchen including appliances and chimney',
        requiredSkills: ['Cleaning', 'Kitchen Cleaning'],
        priceRange: { min: 800, max: 2000 },
        durationRange: { min: 90, max: 180 }
      },
      {
        id: 'S005-03',
        name: 'Bathroom Cleaning',
        description: 'Sanitize and clean bathrooms and toilets',
        requiredSkills: ['Cleaning', 'Bathroom Cleaning'],
        priceRange: { min: 500, max: 1200 },
        durationRange: { min: 60, max: 120 }
      },
      {
        id: 'S005-04',
        name: 'Sofa & Carpet Cleaning',
        description: 'Deep clean upholstery and carpets with specialized equipment',
        requiredSkills: ['Cleaning', 'Upholstery Cleaning'],
        priceRange: { min: 1000, max: 3000 },
        durationRange: { min: 90, max: 180 }
      },
      {
        id: 'S005-05',
        name: 'Post-Construction Cleaning',
        description: 'Clean up after renovation or construction work',
        requiredSkills: ['Cleaning', 'Construction Cleaning'],
        priceRange: { min: 3000, max: 10000 },
        durationRange: { min: 240, max: 600 }
      },
      {
        id: 'S005-06',
        name: 'Office Cleaning',
        description: 'Regular or deep cleaning for office spaces',
        requiredSkills: ['Cleaning', 'Commercial Cleaning'],
        priceRange: { min: 2000, max: 8000 },
        durationRange: { min: 180, max: 480 }
      }
    ],
    avgPrice: '₹1000-3000',
    avgDuration: '2-4 hours'
  },
  {
    id: 'S006',
    name: 'Appliance Repair',
    icon: 'repair',
    description: 'Repair and maintenance services for home and kitchen appliances',
    subcategories: [
      {
        id: 'S006-01',
        name: 'Refrigerator Repair',
        description: 'Fix cooling issues, gas refilling, and component replacement',
        requiredSkills: ['Appliance Repair', 'Refrigeration'],
        priceRange: { min: 600, max: 2500 },
        durationRange: { min: 60, max: 180 }
      },
      {
        id: 'S006-02',
        name: 'Washing Machine Repair',
        description: 'Repair washing machines, drum issues, and water drainage',
        requiredSkills: ['Appliance Repair', 'Washing Machine'],
        priceRange: { min: 500, max: 2000 },
        durationRange: { min: 60, max: 150 }
      },
      {
        id: 'S006-03',
        name: 'Air Conditioner Repair',
        description: 'AC repair, gas charging, and maintenance',
        requiredSkills: ['Appliance Repair', 'AC Systems'],
        priceRange: { min: 700, max: 3000 },
        durationRange: { min: 90, max: 180 }
      },
      {
        id: 'S006-04',
        name: 'Microwave Repair',
        description: 'Fix microwave ovens and heating issues',
        requiredSkills: ['Appliance Repair', 'Microwave Systems'],
        priceRange: { min: 400, max: 1500 },
        durationRange: { min: 45, max: 120 }
      },
      {
        id: 'S006-05',
        name: 'Water Purifier Service',
        description: 'RO service, filter replacement, and maintenance',
        requiredSkills: ['Appliance Repair', 'Water Purifier'],
        priceRange: { min: 400, max: 1800 },
        durationRange: { min: 45, max: 90 }
      }
    ],
    avgPrice: '₹600-2000',
    avgDuration: '1-2 hours'
  }
];

/**
 * Get service category by ID
 */
export function getServiceCategoryById(id: string): ServiceCategory | undefined {
  return mockServiceCategories.find(category => category.id === id);
}

/**
 * Get service category by name
 */
export function getServiceCategoryByName(name: string): ServiceCategory | undefined {
  return mockServiceCategories.find(
    category => category.name.toLowerCase() === name.toLowerCase()
  );
}

/**
 * Get all service category names
 */
export function getAllServiceCategoryNames(): string[] {
  return mockServiceCategories.map(category => category.name);
}

/**
 * Get subcategory by ID across all categories
 */
export function getSubcategoryById(subcategoryId: string): { 
  category: ServiceCategory; 
  subcategory: any; 
} | undefined {
  for (const category of mockServiceCategories) {
    const subcategory = category.subcategories.find(sub => sub.id === subcategoryId);
    if (subcategory) {
      return { category, subcategory };
    }
  }
  return undefined;
}
