/**
 * Realistic Pune seed data
 * - Deletes all existing seed data
 * - Creates 25 workers from Pune areas
 * - Creates 60 customers
 * - Creates ~150 realistic jobs with history
 * Run: npx tsx src/scripts/seed-pune-data.ts
 */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Pune areas with realistic coordinates
const PUNE_AREAS = [
  { name: 'Kothrud', lat: 18.5074, lng: 73.8077 },
  { name: 'Baner', lat: 18.5590, lng: 73.7868 },
  { name: 'Wakad', lat: 18.5975, lng: 73.7898 },
  { name: 'Aundh', lat: 18.5592, lng: 73.8078 },
  { name: 'Viman Nagar', lat: 18.5679, lng: 73.9143 },
  { name: 'Shivajinagar', lat: 18.5308, lng: 73.8474 },
  { name: 'Hadapsar', lat: 18.5018, lng: 73.9252 },
  { name: 'Hinjewadi', lat: 18.5912, lng: 73.7389 },
  { name: 'Pune Camp', lat: 18.5195, lng: 73.8792 },
  { name: 'Pimpri', lat: 18.6279, lng: 73.7997 },
  { name: 'Chinchwad', lat: 18.6440, lng: 73.7993 },
  { name: 'Swargate', lat: 18.5018, lng: 73.8618 },
  { name: 'Deccan Gymkhana', lat: 18.5162, lng: 73.8401 },
  { name: 'Karve Nagar', lat: 18.4987, lng: 73.8199 },
  { name: 'Bibwewadi', lat: 18.4778, lng: 73.8612 },
];

const WORKER_NAMES = [
  'Ramesh Patil', 'Suresh Yadav', 'Ganesh Shinde', 'Manoj Deshpande', 'Vikram Jadhav',
  'Pradeep More', 'Santosh Waghmare', 'Ajay Thorat', 'Nilesh Pawar', 'Deepak Kamble',
  'Sanjay Bhosale', 'Ravi Gaikwad', 'Anil Salve', 'Kiran Mane', 'Tushar Lokhande',
  'Mahesh Kulkarni', 'Sachin Kale', 'Abhijit Desai', 'Rohit Chavan', 'Pratik Joshi',
  'Amol Sathe', 'Sandip Naik', 'Vishal Mohite', 'Rajendra Bhamare', 'Vinod Sutar',
];

const CUSTOMER_NAMES = [
  'Priya Sharma', 'Amit Gupta', 'Sneha Patil', 'Rahul Joshi', 'Pooja Deshpande',
  'Arjun Mehta', 'Kavya Nair', 'Nikhil Reddy', 'Anita Singh', 'Suresh Kumar',
  'Ritu Agarwal', 'Prakash Iyer', 'Deepika Rao', 'Saurabh Kadam', 'Nisha Tiwari',
  'Vaibhav Pawar', 'Sunita More', 'Harish Desai', 'Meera Kulkarni', 'Rohit Sawant',
  'Aparna Joshi', 'Vinay Shinde', 'Smita Patil', 'Gaurav Bhosale', 'Rekha Yadav',
  'Sachin Wadekar', 'Priti Gaikwad', 'Mahesh Jadhav', 'Seema Thorat', 'Aakash Kamble',
  'Pallavi Mane', 'Sandesh Kale', 'Komal Salve', 'Tejas Waghmare', 'Manasi Chavan',
  'Pradip Naik', 'Shruti Sutar', 'Dinesh Mohite', 'Varsha Lokhande', 'Ramesh Bhave',
  'Anjali Datar', 'Ketan Pande', 'Madhuri Bapat', 'Sanjay Chitale', 'Neha Limaye',
  'Amol Kulkarni', 'Geeta Gokhale', 'Nilesh Khadilkar', 'Swati Ranade', 'Sudhir Jog',
  'Meghana Phadke', 'Rajan Tilak', 'Shalini Pendse', 'Vivek Savarkar', 'Usha Behere',
  'Devdatta Karve', 'Mugdha Joshi', 'Hemant Gogate', 'Ashwini Sathe', 'Pramod Kelkar',
];

const SERVICE_CATS = ['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Cleaning', 'Appliance Repair'];
const WORKER_SKILLS: Record<string, string[]> = {
  'Plumbing': ['Plumbing'],
  'Electrical': ['Electrical'],
  'Carpentry': ['Carpentry'],
  'Painting': ['Painting'],
  'Cleaning': ['Cleaning'],
  'Appliance Repair': ['Appliance Repair'],
  'Multi': ['Plumbing', 'Electrical'],
};

const DESCRIPTIONS: Record<string, string[]> = {
  Plumbing: ['Kitchen sink leaking heavily', 'Bathroom tap dripping', 'Toilet flush not working', 'Water pressure low', 'Pipe burst near bathroom'],
  Electrical: ['Power socket not working', 'Fan making noise', 'Lights flickering in bedroom', 'MCB tripping frequently', 'New light fitting needed'],
  Carpentry: ['Door not closing properly', 'Wardrobe hinge broken', 'Window frame damaged', 'Cabinet drawer stuck', 'Bed frame loose'],
  Painting: ['Living room needs repainting', 'Bathroom wall peeling', 'Kitchen wall stain removal', 'Wall crack repair and paint', 'Full flat painting needed'],
  Cleaning: ['Deep cleaning before Diwali', 'Post-renovation cleaning', 'Kitchen exhaust cleaning', 'Full home cleaning needed', 'Bathroom deep clean'],
  'Appliance Repair': ['Washing machine not spinning', 'Refrigerator not cooling', 'AC not working', 'Microwave dead', 'Geyser not heating'],
};

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomFloat(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function addJitter(coord: number, range = 0.03): number {
  return coord + (Math.random() - 0.5) * range;
}

function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(Math.floor(randomFloat(8, 20)), Math.floor(randomFloat(0, 59)));
  return d.toISOString();
}

async function cleanOldData() {
  console.log('🗑️  Cleaning old seed data...');
  // Delete in order respecting FK constraints
  await supabase.from('wallet_transactions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('worker_wallets').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('job_status_history').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('job_dispatch_attempts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('jobs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('worker_skills').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('workers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('users').delete().eq('password_hash', 'seed_data');
  console.log('✅ Old data cleaned');
}

async function seedWorkers(categoryIds: Record<string, string>) {
  console.log('👷 Creating 25 Pune workers...');
  const workers = [];

  for (let i = 0; i < 25; i++) {
    const area = randomFrom(PUNE_AREAS);
    const lat = addJitter(area.lat);
    const lng = addJitter(area.lng);
    const skillType = i < 5 ? 'Plumbing' : i < 10 ? 'Electrical' : i < 14 ? 'Carpentry' : i < 17 ? 'Painting' : i < 20 ? 'Cleaning' : i < 23 ? 'Appliance Repair' : 'Multi';
    const rating = randomFloat(3.8, 5.0);
    const completedJobs = Math.floor(randomFloat(20, 200));
    const phone = `+91${Math.floor(randomFloat(7000000000, 9999999999))}`;

    // Create user first
    const { data: user, error: userError } = await supabase.auth.admin.createUser({
      email: `worker${i + 1}@shramsangam.demo`,
      password: 'Demo@12345',
      email_confirm: true,
      user_metadata: { name: WORKER_NAMES[i], phone, role: 'worker' },
    });

    if (userError) {
      console.error(`Worker ${i+1} auth error:`, userError.message);
      continue;
    }

    // Create users table entry
    const { data: userProfile } = await supabase.from('users').insert({
      id: user.user.id,
      email: `worker${i + 1}@shramsangam.demo`,
      phone,
      name: WORKER_NAMES[i],
      role: 'worker',
      password_hash: 'seed_data',
      email_verified: true,
    }).select('id').single();

    if (!userProfile) continue;

    // Create worker profile
    const { data: worker } = await supabase.from('workers').insert({
      user_id: userProfile.id,
      location: `POINT(${lng} ${lat})`,
      address: `${Math.floor(randomFloat(1, 200))}, ${area.name}, Pune`,
      city: 'Pune',
      state: 'Maharashtra',
      pincode: `411${Math.floor(randomFloat(0, 99)).toString().padStart(3, '0')}`,
      service_radius: Math.floor(randomFloat(5, 15)),
      available: Math.random() > 0.3,
      rating: Number(rating.toFixed(2)),
      total_ratings: Math.floor(randomFloat(10, completedJobs)),
      completed_jobs: completedJobs,
      verification_status: 'verified',
      verified_at: daysAgo(Math.floor(randomFloat(30, 180))),
    }).select('id').single();

    if (!worker) continue;

    // Add skills
    const skills = WORKER_SKILLS[skillType];
    for (const skill of skills) {
      await supabase.from('worker_skills').insert({
        worker_id: worker.id,
        category: skill,
        subcategory: null,
        verified: true,
        skill_level: rating > 4.5 ? 'expert' : rating > 4.0 ? 'intermediate' : 'beginner',
      });
    }

    // Create wallet
    const earnings = completedJobs * randomFloat(300, 800) * 0.85;
    await supabase.from('worker_wallets').insert({
      worker_id: worker.id,
      balance: randomFloat(500, 5000),
      total_earned: Number(earnings.toFixed(2)),
      total_withdrawn: Number((earnings * 0.7).toFixed(2)),
    });

    workers.push({ ...worker, user_id: userProfile.id, name: WORKER_NAMES[i], skills, lat, lng, area: area.name });
    process.stdout.write(`✅ Workers: ${workers.length}/25\r`);
  }

  console.log(`\n✅ Created ${workers.length} workers`);
  return workers;
}

async function seedCustomersAndJobs(workers: any[], categoryIds: Record<string, string>) {
  console.log('👥 Creating 60 customers with job history...');
  const customers = [];

  for (let i = 0; i < 60; i++) {
    const area = randomFrom(PUNE_AREAS);
    const phone = `+91${Math.floor(randomFloat(7000000000, 9999999999))}`;
    const email = `customer${i + 1}@shramsangam.demo`;

    const { data: user, error } = await supabase.auth.admin.createUser({
      email,
      password: 'Demo@12345',
      email_confirm: true,
      user_metadata: { name: CUSTOMER_NAMES[i], phone, role: 'customer' },
    });

    if (error) {
      console.error(`Customer ${i+1} error:`, error.message);
      continue;
    }

    const { data: userProfile } = await supabase.from('users').insert({
      id: user.user.id,
      email,
      phone,
      name: CUSTOMER_NAMES[i],
      role: 'customer',
      password_hash: 'seed_data',
      email_verified: true,
    }).select('id').single();

    if (userProfile) customers.push({ ...userProfile, name: CUSTOMER_NAMES[i], area });
    process.stdout.write(`✅ Customers: ${customers.length}/60\r`);
  }

  console.log(`\n✅ Created ${customers.length} customers`);
  console.log('📋 Creating realistic job history...');

  // Create jobs: mix of completed, in-progress, and pending
  let jobCount = 0;
  const categories = Object.entries(categoryIds);

  for (const customer of customers) {
    const numJobs = Math.floor(randomFloat(1, 5));

    for (let j = 0; j < numJobs; j++) {
      const [catName, catId] = randomFrom(categories);
      const matchingWorkers = workers.filter(w => w.skills.includes(catName));
      if (matchingWorkers.length === 0) continue;

      const worker = randomFrom(matchingWorkers);
      const daysBack = Math.floor(randomFloat(0, 60));
      const isRecent = daysBack < 3;
      const estimatedPrice = randomFloat(200, 1500);

      let status: string;
      if (isRecent && Math.random() > 0.5) {
        status = randomFrom(['pending', 'matched', 'accepted', 'in_progress']);
      } else {
        status = Math.random() > 0.1 ? 'completed' : 'cancelled';
      }

      const area = customer.area || randomFrom(PUNE_AREAS);
      const lat = addJitter(area.lat);
      const lng = addJitter(area.lng);
      const rating = status === 'completed' && Math.random() > 0.2 ? Math.floor(randomFloat(3, 6)) : null;
      const completedAt = status === 'completed' ? daysAgo(daysBack) : null;

      await supabase.from('jobs').insert({
        customer_id: customer.id,
        customer_name: customer.name,
        customer_phone: (customer as any).phone || '+919999999999',
        customer_location: `POINT(${lng} ${lat})`,
        customer_address: `${Math.floor(randomFloat(1, 500))}, ${area.name}, Pune`,
        service_category_id: catId,
        service_category_name: catName,
        description: randomFrom(DESCRIPTIONS[catName] || ['Service required']),
        estimated_price: Number(estimatedPrice.toFixed(2)),
        actual_price: status === 'completed' ? Number(estimatedPrice.toFixed(2)) : null,
        worker_id: status !== 'pending' ? worker.id : null,
        assigned_at: status !== 'pending' ? daysAgo(daysBack + 0.02) : null,
        accepted_at: ['accepted', 'in_progress', 'completed'].includes(status) ? daysAgo(daysBack + 0.01) : null,
        started_at: ['in_progress', 'completed'].includes(status) ? daysAgo(daysBack) : null,
        completed_at: completedAt,
        status,
        rating,
        review: rating && rating >= 4 ? randomFrom(['Excellent work!', 'Very professional', 'Highly recommended', 'Great service', 'Will hire again']) :
                rating && rating < 3 ? randomFrom(['Work was okay', 'Could be better', 'Average service']) : null,
        review_date: rating ? completedAt : null,
        worker_earnings: status === 'completed' ? Number((estimatedPrice * 0.85).toFixed(2)) : null,
        cooperative_share: status === 'completed' ? Number((estimatedPrice * 0.15).toFixed(2)) : null,
        is_immediate: true,
        created_at: daysAgo(daysBack + 0.1),
        updated_at: daysAgo(daysBack),
      });

      jobCount++;
    }
  }

  console.log(`✅ Created ${jobCount} jobs`);
}

async function main() {
  console.log('🚀 Starting Pune realistic data seed...\n');

  await cleanOldData();

  // Get category IDs
  const { data: cats } = await supabase.from('service_categories').select('id, name');
  if (!cats || cats.length === 0) {
    console.error('❌ No service categories! Run database-schema.sql first.');
    return;
  }
  const categoryIds: Record<string, string> = {};
  cats.forEach((c: any) => { categoryIds[c.name] = c.id; });
  console.log('✅ Categories:', Object.keys(categoryIds).join(', '));

  const workers = await seedWorkers(categoryIds);
  await seedCustomersAndJobs(workers, categoryIds);

  // Update worker ratings based on jobs
  for (const worker of workers) {
    const { data: jobs } = await supabase
      .from('jobs')
      .select('rating')
      .eq('worker_id', worker.id)
      .not('rating', 'is', null);

    if (jobs && jobs.length > 0) {
      const avg = jobs.reduce((s: number, j: any) => s + j.rating, 0) / jobs.length;
      await supabase.from('workers').update({ rating: Number(avg.toFixed(2)), total_ratings: jobs.length }).eq('id', worker.id);
    }
  }

  console.log('\n🎉 Pune data seeded successfully!');
  console.log('📊 Summary:');
  console.log('   - 25 verified workers across Pune areas');
  console.log('   - 60 customers with realistic profiles');
  console.log('   - ~150 jobs with full lifecycle history');
  console.log('   - Real GPS coordinates for all workers/customers');
}

main().catch(console.error);
