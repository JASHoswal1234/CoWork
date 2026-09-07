/**
 * Seed script: Generates realistic historical job data for ML training
 * Run: npx tsx src/scripts/seed-ml-data.ts
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CATEGORIES = ['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning', 'Appliance Repair'];
const STATUSES = ['completed', 'completed', 'completed', 'cancelled', 'pending'];
const CITIES = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Pune'];

// Realistic demand patterns
const CATEGORY_BASE: Record<string, number> = {
  'Plumbing': 8, 'Electrical': 6, 'Carpentry': 4,
  'Painting': 3, 'Cleaning': 6, 'Appliance Repair': 7,
};

const DOW_MULT = [1.3, 0.8, 0.9, 1.0, 1.1, 1.2, 1.4]; // Sun-Sat
const MONTH_MULT = [0.9, 0.9, 1.0, 1.0, 1.1, 1.2, 1.1, 1.1, 1.0, 1.2, 1.3, 1.1];

function randomFloat(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function generateJobs(daysBack: number, categoryMap: Record<string, string>): any[] {
  const jobs: any[] = [];
  const now = new Date();
  const validStatuses = ['pending', 'matched', 'accepted', 'in_progress', 'completed', 'cancelled'];
  const completedStatuses = ['completed', 'completed', 'completed', 'completed', 'cancelled', 'pending'];

  for (let d = daysBack; d >= 1; d--) {
    const date = new Date(now);
    date.setDate(now.getDate() - d);
    const dow = date.getDay();
    const month = date.getMonth();

    for (const category of CATEGORIES) {
      // Skip if category not in DB
      if (!categoryMap[category]) continue;

      const base = CATEGORY_BASE[category];
      const count = Math.round(
        base * DOW_MULT[dow] * MONTH_MULT[month] * randomFloat(0.7, 1.3)
      );

      for (let i = 0; i < count; i++) {
        const hour = Math.floor(randomFloat(7, 20));
        const jobDate = new Date(date);
        jobDate.setHours(hour, Math.floor(Math.random() * 60));

        const lat = 19.0760 + randomFloat(-0.5, 0.5);
        const lng = 72.8777 + randomFloat(-0.5, 0.5);
        const price = randomFloat(300, 2500);
        const status = completedStatuses[Math.floor(Math.random() * completedStatuses.length)];
        const rating = status === 'completed' && Math.random() > 0.3
          ? Math.floor(randomFloat(3, 6))
          : null;

        jobs.push({
          customer_id: '5c7e6e30-4470-401b-aa29-7a0fb7cc35a4',
          customer_name: 'Seed Customer',
          customer_phone: '+919999999999',
          customer_location: `POINT(${lng} ${lat})`,
          customer_address: `${Math.floor(randomFloat(1, 500))} Test Street, ${CITIES[Math.floor(Math.random() * CITIES.length)]}`,
          service_category_id: categoryMap[category],
          service_category_name: category,
          description: `${category} service required`,
          estimated_price: Number(price.toFixed(2)),
          actual_price: status === 'completed' ? Number(price.toFixed(2)) : null,
          status,
          rating,
          review: rating && rating >= 4 ? 'Great service!' : rating && rating < 3 ? 'Could be better' : null,
          review_date: rating ? jobDate.toISOString() : null,
          created_at: jobDate.toISOString(),
          updated_at: jobDate.toISOString(),
        });
      }
    }
  }

  return jobs;
}

async function seedData() {
  console.log('🌱 Generating synthetic ML training data...');

  // First get a valid service_category_id
  const { data: categories } = await supabase
    .from('service_categories')
    .select('id, name');

  if (!categories || categories.length === 0) {
    console.error('❌ No service categories found! Make sure database schema was run.');
    return;
  }

  const categoryMap: Record<string, string> = {};
  categories.forEach((c: any) => { categoryMap[c.name] = c.id; });

  console.log('✅ Found categories:', Object.keys(categoryMap).join(', '));

  const jobs = generateJobs(180, categoryMap);
  console.log(`📊 Generated ${jobs.length} jobs`);

  // Insert in batches of 100
  let inserted = 0;
  for (let i = 0; i < jobs.length; i += 100) {
    const batch = jobs.slice(i, i + 100);
    const { error } = await supabase.from('jobs').insert(batch);
    if (error) {
      console.error(`❌ Batch ${i/100 + 1} failed:`, error.message);
      if (i === 0) {
        console.error('Full error:', JSON.stringify(error, null, 2));
        break; // Stop if first batch fails - likely a schema issue
      }
    } else {
      inserted += batch.length;
      process.stdout.write(`✅ Inserted ${inserted}/${jobs.length}\r`);
    }
  }

  console.log(`\n🎉 Done! Inserted ${inserted} historical jobs for ML training`);
}

seedData().catch(console.error);
