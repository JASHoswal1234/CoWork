/**
 * Seed Service Subcategories
 * 
 * Populates the service_subcategories table with data matching
 * the frontend mock data from src/data/services.ts
 * 
 * Run: npx tsx src/scripts/seed-service-subcategories.ts
 */

import { supabase } from '../config/supabase';

interface Subcategory {
  name: string;
  description: string;
  price_min: number;
  price_max: number;
  duration_min: number;
  duration_max: number;
}

const subcategoriesByCategory: Record<string, Subcategory[]> = {
  'Plumbing': [
    {
      name: 'Leak Repair',
      description: 'Fix leaking taps, pipes, and fixtures',
      price_min: 300,
      price_max: 800,
      duration_min: 30,
      duration_max: 90
    },
    {
      name: 'Pipe Installation',
      description: 'Install new water supply or drainage pipes',
      price_min: 1000,
      price_max: 3000,
      duration_min: 120,
      duration_max: 240
    },
    {
      name: 'Toilet Repair',
      description: 'Fix toilet flush systems, leaks, and blockages',
      price_min: 400,
      price_max: 1200,
      duration_min: 45,
      duration_max: 120
    },
    {
      name: 'Water Heater Installation',
      description: 'Install or repair electric and gas water heaters',
      price_min: 1500,
      price_max: 4000,
      duration_min: 90,
      duration_max: 180
    }
  ],
  'Electrical': [
    {
      name: 'Wiring & Rewiring',
      description: 'Install or replace electrical wiring systems',
      price_min: 2000,
      price_max: 8000,
      duration_min: 180,
      duration_max: 480
    },
    {
      name: 'Switch & Socket Installation',
      description: 'Install or repair switches, sockets, and outlets',
      price_min: 200,
      price_max: 600,
      duration_min: 20,
      duration_max: 60
    },
    {
      name: 'Ceiling Fan Installation',
      description: 'Install or repair ceiling fans and regulators',
      price_min: 300,
      price_max: 800,
      duration_min: 30,
      duration_max: 60
    },
    {
      name: 'Light Fixture Installation',
      description: 'Install chandeliers, LED lights, and decorative lighting',
      price_min: 400,
      price_max: 1500,
      duration_min: 45,
      duration_max: 120
    },
    {
      name: 'Circuit Breaker Repair',
      description: 'Repair or replace faulty circuit breakers and MCBs',
      price_min: 500,
      price_max: 1800,
      duration_min: 60,
      duration_max: 150
    },
    {
      name: 'Solar Panel Installation',
      description: 'Install residential solar power systems',
      price_min: 15000,
      price_max: 50000,
      duration_min: 480,
      duration_max: 960
    }
  ],
  'Carpentry': [
    {
      name: 'Furniture Repair',
      description: 'Repair broken chairs, tables, beds, and cabinets',
      price_min: 400,
      price_max: 1500,
      duration_min: 60,
      duration_max: 180
    },
    {
      name: 'Door Installation',
      description: 'Install or repair wooden doors and frames',
      price_min: 1000,
      price_max: 3500,
      duration_min: 90,
      duration_max: 240
    },
    {
      name: 'Window Installation',
      description: 'Install or repair wooden windows and frames',
      price_min: 1200,
      price_max: 4000,
      duration_min: 120,
      duration_max: 300
    },
    {
      name: 'Custom Furniture Making',
      description: 'Build custom wardrobes, shelves, and storage units',
      price_min: 5000,
      price_max: 25000,
      duration_min: 480,
      duration_max: 1440
    },
    {
      name: 'Flooring Installation',
      description: 'Install wooden or laminate flooring',
      price_min: 3000,
      price_max: 15000,
      duration_min: 240,
      duration_max: 720
    }
  ],
  'Painting': [
    {
      name: 'Interior Wall Painting',
      description: 'Paint interior walls with premium emulsion',
      price_min: 2000,
      price_max: 10000,
      duration_min: 240,
      duration_max: 720
    },
    {
      name: 'Exterior Wall Painting',
      description: 'Paint exterior walls with weather-resistant paint',
      price_min: 3000,
      price_max: 15000,
      duration_min: 360,
      duration_max: 960
    },
    {
      name: 'Ceiling Painting',
      description: 'Paint ceilings with specialized tools and techniques',
      price_min: 1500,
      price_max: 6000,
      duration_min: 180,
      duration_max: 480
    },
    {
      name: 'Texture Painting',
      description: 'Apply textured or decorative finishes to walls',
      price_min: 3500,
      price_max: 12000,
      duration_min: 300,
      duration_max: 720
    },
    {
      name: 'Furniture Painting',
      description: 'Refinish and paint wooden furniture',
      price_min: 800,
      price_max: 3000,
      duration_min: 120,
      duration_max: 360
    },
    {
      name: 'Waterproofing',
      description: 'Apply waterproofing solutions to walls and roofs',
      price_min: 4000,
      price_max: 20000,
      duration_min: 360,
      duration_max: 1200
    }
  ],
  'Cleaning': [
    {
      name: 'Home Deep Cleaning',
      description: 'Thorough cleaning of all rooms including kitchen and bathrooms',
      price_min: 1500,
      price_max: 4000,
      duration_min: 180,
      duration_max: 360
    },
    {
      name: 'Kitchen Cleaning',
      description: 'Deep clean kitchen including appliances and chimney',
      price_min: 800,
      price_max: 2000,
      duration_min: 90,
      duration_max: 180
    },
    {
      name: 'Bathroom Cleaning',
      description: 'Sanitize and clean bathrooms and toilets',
      price_min: 500,
      price_max: 1200,
      duration_min: 60,
      duration_max: 120
    },
    {
      name: 'Sofa & Carpet Cleaning',
      description: 'Deep clean upholstery and carpets with specialized equipment',
      price_min: 1000,
      price_max: 3000,
      duration_min: 90,
      duration_max: 180
    },
    {
      name: 'Post-Construction Cleaning',
      description: 'Clean up after renovation or construction work',
      price_min: 3000,
      price_max: 10000,
      duration_min: 240,
      duration_max: 600
    },
    {
      name: 'Office Cleaning',
      description: 'Regular or deep cleaning for office spaces',
      price_min: 2000,
      price_max: 8000,
      duration_min: 180,
      duration_max: 480
    }
  ],
  'Appliance Repair': [
    {
      name: 'Refrigerator Repair',
      description: 'Fix cooling issues, gas refilling, and component replacement',
      price_min: 600,
      price_max: 2500,
      duration_min: 60,
      duration_max: 180
    },
    {
      name: 'Washing Machine Repair',
      description: 'Repair washing machines, drum issues, and water drainage',
      price_min: 500,
      price_max: 2000,
      duration_min: 60,
      duration_max: 150
    },
    {
      name: 'Air Conditioner Repair',
      description: 'AC repair, gas charging, and maintenance',
      price_min: 700,
      price_max: 3000,
      duration_min: 90,
      duration_max: 180
    },
    {
      name: 'Microwave Repair',
      description: 'Fix microwave ovens and heating issues',
      price_min: 400,
      price_max: 1500,
      duration_min: 45,
      duration_max: 120
    },
    {
      name: 'Water Purifier Service',
      description: 'RO service, filter replacement, and maintenance',
      price_min: 400,
      price_max: 1800,
      duration_min: 45,
      duration_max: 90
    }
  ]
};

async function seedSubcategories() {
  console.log('🌱 Starting service subcategories seed...\n');

  try {
    // 1. Get all service categories
    const { data: categories, error: categoriesError } = await supabase
      .from('service_categories')
      .select('id, name')
      .eq('is_active', true);

    if (categoriesError) {
      throw new Error(`Failed to fetch categories: ${categoriesError.message}`);
    }

    if (!categories || categories.length === 0) {
      throw new Error('No service categories found. Please seed categories first.');
    }

    console.log(`✓ Found ${categories.length} service categories\n`);

    // 2. Check existing subcategories
    const { data: existing, error: existingError } = await supabase
      .from('service_subcategories')
      .select('id');

    if (existingError) {
      throw new Error(`Failed to check existing subcategories: ${existingError.message}`);
    }

    if (existing && existing.length > 0) {
      console.log(`⚠️  Found ${existing.length} existing subcategories`);
      console.log('   Deleting existing subcategories to re-seed with correct data...\n');
      
      const { error: deleteError } = await supabase
        .from('service_subcategories')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

      if (deleteError) {
        throw new Error(`Failed to delete existing subcategories: ${deleteError.message}`);
      }

      console.log(`   ✓ Deleted ${existing.length} existing subcategories\n`);
    }

    // 3. Seed subcategories for each category
    let totalInserted = 0;

    for (const category of categories) {
      const subcategories = subcategoriesByCategory[category.name];
      
      if (!subcategories) {
        console.log(`⚠️  No subcategories defined for "${category.name}"`);
        continue;
      }

      console.log(`📦 Seeding "${category.name}" (${subcategories.length} subcategories)...`);

      const subcategoriesWithCategoryId = subcategories.map(sub => ({
        ...sub,
        category_id: category.id
      }));

      const { data, error } = await supabase
        .from('service_subcategories')
        .insert(subcategoriesWithCategoryId)
        .select();

      if (error) {
        console.error(`   ❌ Failed: ${error.message}`);
        continue;
      }

      console.log(`   ✓ Inserted ${data.length} subcategories`);
      totalInserted += data.length;
    }

    console.log(`\n✅ Seed complete! Inserted ${totalInserted} subcategories across ${categories.length} categories.\n`);

    // 4. Verify the results
    const { data: verification, error: verifyError } = await supabase
      .from('service_categories')
      .select(`
        name,
        subcategories:service_subcategories(count)
      `);

    if (!verifyError && verification) {
      console.log('📊 Verification:');
      verification.forEach((cat: any) => {
        console.log(`   ${cat.name}: ${cat.subcategories[0].count} subcategories`);
      });
    }

  } catch (error: any) {
    console.error('\n❌ Seed failed:', error.message);
    process.exit(1);
  }
}

// Run the seed
seedSubcategories()
  .then(() => {
    console.log('\n🎉 Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Unexpected error:', error);
    process.exit(1);
  });
