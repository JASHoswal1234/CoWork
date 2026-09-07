/**
 * Seed script: Provisions demo Customer, Worker, and Cooperative Admin accounts,
 * complete with PostGIS coordinates, verified skills, and active wallets in Supabase.
 *
 * Run: npx tsx src/scripts/seed-workers.ts
 */
import { supabaseAdmin } from '../config/supabase';

interface WorkerSeedData {
  name: string;
  email: string;
  phone: string;
  password: string;
  category: string;
  subcategory: string;
  skillLevel: 'beginner' | 'intermediate' | 'expert';
  city: string;
  neighborhood: string;
  lat: number;
  lng: number;
  rating: number;
  totalRatings: number;
  completedJobs: number;
  todayEarnings: number;
  monthEarnings: number;
  photoUrl: string;
}

const DEMO_WORKERS: WorkerSeedData[] = [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh@sahakar.org',
    phone: '+919822011001',
    password: 'demo123',
    category: 'Plumbing',
    subcategory: 'Pipe Fitting & Leak Repair',
    skillLevel: 'expert',
    city: 'Pune',
    neighborhood: 'Kothrud',
    lat: 18.5074,
    lng: 73.8077,
    rating: 4.88,
    totalRatings: 142,
    completedJobs: 167,
    todayEarnings: 1450,
    monthEarnings: 32400,
    photoUrl: '/illustrations/plumber.png',
  },
  {
    name: 'Amit Sharma',
    email: 'amit@sahakar.org',
    phone: '+919822011002',
    password: 'demo123',
    category: 'Electrical',
    subcategory: 'Wiring & Circuit Repair',
    skillLevel: 'expert',
    city: 'Pune',
    neighborhood: 'Baner',
    lat: 18.5590,
    lng: 73.7868,
    rating: 4.92,
    totalRatings: 118,
    completedJobs: 135,
    todayEarnings: 1200,
    monthEarnings: 29800,
    photoUrl: '/illustrations/electrician.png',
  },
  {
    name: 'Vikram Singh',
    email: 'vikram@sahakar.org',
    phone: '+919822011003',
    password: 'demo123',
    category: 'Carpentry',
    subcategory: 'Furniture & Woodwork',
    skillLevel: 'expert',
    city: 'Pune',
    neighborhood: 'Wakad',
    lat: 18.5987,
    lng: 73.7667,
    rating: 4.85,
    totalRatings: 96,
    completedJobs: 112,
    todayEarnings: 900,
    monthEarnings: 24500,
    photoUrl: '/illustrations/carpenter.png',
  },
  {
    name: 'Sunita Devi',
    email: 'sunita@sahakar.org',
    phone: '+919822011004',
    password: 'demo123',
    category: 'Cleaning',
    subcategory: 'Deep Home Cleaning',
    skillLevel: 'expert',
    city: 'Pune',
    neighborhood: 'Aundh',
    lat: 18.5626,
    lng: 73.8087,
    rating: 4.90,
    totalRatings: 154,
    completedJobs: 189,
    todayEarnings: 1100,
    monthEarnings: 28000,
    photoUrl: '/illustrations/cleaning.png',
  },
  {
    name: 'Manoj Patil',
    email: 'manoj@sahakar.org',
    phone: '+919822011005',
    password: 'demo123',
    category: 'Painting',
    subcategory: 'Interior & Exterior Painting',
    skillLevel: 'intermediate',
    city: 'Pune',
    neighborhood: 'Shivajinagar',
    lat: 18.5308,
    lng: 73.8475,
    rating: 4.79,
    totalRatings: 84,
    completedJobs: 98,
    todayEarnings: 850,
    monthEarnings: 22000,
    photoUrl: '/illustrations/painting.png',
  },
  {
    name: 'Ramesh Jadhav',
    email: 'ramesh@sahakar.org',
    phone: '+919822011006',
    password: 'demo123',
    category: 'Appliance Repair',
    subcategory: 'AC & Refrigerator Repair',
    skillLevel: 'expert',
    city: 'Pune',
    neighborhood: 'Viman Nagar',
    lat: 18.5679,
    lng: 73.9143,
    rating: 4.87,
    totalRatings: 128,
    completedJobs: 146,
    todayEarnings: 1600,
    monthEarnings: 35000,
    photoUrl: '/illustrations/appliance-repair.png',
  },
];

async function ensureAuthUser(email: string, password: string, name: string, phone: string, role: string) {
  // Check if user already exists in auth
  const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
  const existing = usersData?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  let userId: string;

  if (existing) {
    userId = existing.id;
    // Update password to ensure it matches
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      password,
      user_metadata: { name, phone, role },
      email_confirm: true,
    });
  } else {
    const { data: newUser, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      phone,
      email_confirm: true,
      phone_confirm: true,
      user_metadata: { name, phone, role },
    });

    if (error || !newUser.user) {
      throw new Error(`Failed to create auth user ${email}: ${error?.message}`);
    }
    userId = newUser.user.id;
  }

  // Upsert user into public.users
  const { error: userError } = await supabaseAdmin.from('users').upsert({
    id: userId,
    email,
    phone,
    name,
    role,
    phone_verified: true,
    email_verified: true,
    password_hash: 'managed_by_supabase_auth',
    is_active: true,
    updated_at: new Date().toISOString(),
  });

  if (userError) {
    console.error(`Error upserting public.user for ${email}:`, userError.message);
  }

  return userId;
}

async function seed() {
  console.log('🌱 Starting comprehensive database seed for SAHAKAR...');

  try {
    // 1. Seed Customer
    console.log('👤 Provisioning Demo Customer (Priya Sharma)...');
    const customerId = await ensureAuthUser(
      'customer@sahakar.org',
      'demo123',
      'Priya Sharma',
      '+919822011223',
      'customer'
    );
    console.log(`✅ Demo Customer ready (ID: ${customerId})`);

    // 2. Seed Admin
    console.log('🛡️ Provisioning Cooperative Admin...');
    const adminId = await ensureAuthUser(
      'admin@cooperative.org',
      'admin123',
      'Cooperative Admin',
      '+919822011000',
      'admin'
    );
    console.log(`✅ Cooperative Admin ready (ID: ${adminId})`);

    // 3. Seed Workers across Pune
    console.log('🛠️ Provisioning 6 Verified Workers across Pune...');
    for (const w of DEMO_WORKERS) {
      const userId = await ensureAuthUser(w.email, w.password, w.name, w.phone, 'worker');

      // Check if worker profile exists
      const { data: existingWorker } = await supabaseAdmin
        .from('workers')
        .select('id')
        .eq('user_id', userId)
        .single();

      let workerId: string;
      const locationPoint = `POINT(${w.lng} ${w.lat})`;

      if (existingWorker) {
        workerId = existingWorker.id;
        await supabaseAdmin
          .from('workers')
          .update({
            location: locationPoint,
            address: `${w.neighborhood}, Pune`,
            city: w.city,
            state: 'Maharashtra',
            pincode: '411038',
            service_radius: 25,
            available: true,
            rating: w.rating,
            total_ratings: w.totalRatings,
            completed_jobs: w.completedJobs,
            today_earnings: w.todayEarnings,
            month_earnings: w.monthEarnings,
            total_earnings: w.monthEarnings * 6,
            verification_status: 'verified',
            verified_at: new Date().toISOString(),
            photo_url: w.photoUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', workerId);
      } else {
        const { data: newWorker, error: insertError } = await supabaseAdmin
          .from('workers')
          .insert({
            user_id: userId,
            location: locationPoint,
            address: `${w.neighborhood}, Pune`,
            city: w.city,
            state: 'Maharashtra',
            pincode: '411038',
            service_radius: 25,
            available: true,
            rating: w.rating,
            total_ratings: w.totalRatings,
            completed_jobs: w.completedJobs,
            today_earnings: w.todayEarnings,
            month_earnings: w.monthEarnings,
            total_earnings: w.monthEarnings * 6,
            verification_status: 'verified',
            verified_at: new Date().toISOString(),
            photo_url: w.photoUrl,
          })
          .select()
          .single();

        if (insertError || !newWorker) {
          console.error(`Failed to insert worker ${w.name}:`, insertError?.message);
          continue;
        }
        workerId = newWorker.id;
      }

      // Upsert worker skills
      await supabaseAdmin.from('worker_skills').delete().eq('worker_id', workerId);
      await supabaseAdmin.from('worker_skills').insert([
        {
          worker_id: workerId,
          category: w.category,
          subcategory: w.subcategory,
          verified: true,
          verification_date: '2024-01-15',
          skill_level: w.skillLevel,
        },
      ]);

      // Upsert worker wallet
      await supabaseAdmin.from('worker_wallets').delete().eq('worker_id', workerId);
      await supabaseAdmin.from('worker_wallets').insert({
        worker_id: workerId,
        balance: w.todayEarnings,
        total_earned: w.monthEarnings,
        total_withdrawn: w.monthEarnings - w.todayEarnings,
      });

      console.log(`  ✓ ${w.name} (${w.category} - ${w.neighborhood}) ready! Worker ID: ${workerId}`);
    }

    console.log('\n🎉 Successfully seeded all demo users and workers in Supabase!');
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  }
}

seed();
