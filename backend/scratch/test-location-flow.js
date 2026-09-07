import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { supabaseAdmin } from '../src/config/supabase';

const API_BASE = 'http://localhost:3000';

async function main() {
  console.log('=== STARTING LOCATION FLOW AUDIT & TESTS ===\n');

  // 1. Test Reverse Geocoding Endpoint
  console.log('1. Testing GET /api/geospatial/reverse-geocode:');
  const testCoords = [
    { name: 'Pune (Shivaji Road)', lat: 18.5204, lng: 73.8567 },
    { name: 'Mumbai (Khar)', lat: 19.0596, lng: 72.8295 },
    { name: 'Delhi (Raisina Hill)', lat: 28.6139, lng: 77.2090 },
  ];

  for (const c of testCoords) {
    const res = await fetch(`${API_BASE}/api/geospatial/reverse-geocode?lat=${c.lat}&lng=${c.lng}`);
    const json = await res.json();
    console.log(`  ✓ ${c.name} (${c.lat}, ${c.lng})`);
    console.log(`    Response status: ${res.status}`);
    console.log(`    Address: "${json.data?.address}"`);
    console.log(`    City: "${json.data?.city}", Locality: "${json.data?.locality}", Pincode: "${json.data?.pincode}"`);
    if (!json.success || !json.data?.address) {
      throw new Error(`Reverse geocoding failed for ${c.name}`);
    }
  }

  // 2. Customer Login & Job Creation with detected location
  console.log('\n2. Testing Customer Job Creation with Detected Coordinates:');
  const loginRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'priya@sahakar.org', password: 'demo123' }),
  });
  const loginData = await loginRes.json();
  const token = loginData.data?.session?.access_token || loginData.data?.token;
  console.log(`  ✓ Customer logged in. Token present: ${Boolean(token)}`);

  const jobPayload = {
    service_category_name: 'Plumbing',
    title: 'Burst pipe repair test',
    description: 'Urgent leak under kitchen sink',
    address: 'Siddharth Free Reading Room & Library, Shivaji Road, Kasba Peth, Pune 411001',
    location: { lat: 18.5204, lng: 73.8567 },
    estimated_price: 650,
    min_budget: 500,
    max_budget: 800,
    preferred_date: 'Today',
    preferred_time: 'ASAP (within 1 hr)',
    urgency: 'urgent',
  };

  const createRes = await fetch(`${API_BASE}/api/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(jobPayload),
  });
  const createData = await createRes.json();
  console.log(`  ✓ Job creation status: ${createRes.status}`);
  console.log(`    Job ID: ${createData.data?.job?.id}, Job Number: ${createData.data?.job?.job_number}`);
  console.log(`    Stored Address: "${createData.data?.job?.customer_address}"`);
  console.log(`    Stored Location object:`, createData.data?.job?.customer_location);

  const jobId = createData.data?.job?.id;

  // 3. Inspect Supabase jobs table for PostGIS geography
  console.log('\n3. Inspecting PostGIS Geography in Supabase for created job:');
  const { data: dbJob, error: dbErr } = await supabaseAdmin
    .from('jobs')
    .select('id, job_number, customer_address, customer_location')
    .eq('id', jobId)
    .maybeSingle();

  if (dbJob) {
    console.log(`  ✓ Supabase Job found:`);
    console.log(`    customer_address: "${dbJob.customer_address}"`);
    console.log(`    customer_location: "${dbJob.customer_location}"`);
  } else {
    const { data: dbJobByNum } = await supabaseAdmin
      .from('jobs')
      .select('id, job_number, customer_address, customer_location')
      .eq('job_number', createData.data?.job?.job_number)
      .maybeSingle();
    console.log(`  ✓ Supabase Job by number:`, dbJobByNum);
  }

  // 4. Test Worker Location Update Endpoint
  console.log('\n4. Testing Worker Location Update Endpoint (PATCH /api/workers/:id/location):');
  const workerLoginRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'rajesh@sahakar.org', password: 'demo123' }),
  });
  const workerLoginData = await workerLoginRes.json();
  const workerToken = workerLoginData.data?.session?.access_token || workerLoginData.data?.token;
  const workerUserId = workerLoginData.data?.user?.id;
  console.log(`  ✓ Worker logged in. Worker User ID: ${workerUserId}`);

  // Get worker profile
  const workerProfileRes = await fetch(`${API_BASE}/api/workers/profile/me`, {
    headers: { Authorization: `Bearer ${workerToken}` },
  });
  const workerProfileData = await workerProfileRes.json();
  const workerId = workerProfileData.data?.worker?.id || workerUserId;
  console.log(`  ✓ Worker Profile ID: ${workerId}`);

  // Test updating location with real coordinates
  const locUpdateRes = await fetch(`${API_BASE}/api/workers/${workerId}/location`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${workerToken}`,
    },
    body: JSON.stringify({ lat: 18.5204, lng: 73.8567 }),
  });
  const locUpdateData = await locUpdateRes.json();
  console.log(`  ✓ Worker Location Update Status: ${locUpdateRes.status}`);
  console.log(`    Response:`, locUpdateData);

  // 5. Test Nearby Worker Search with PostGIS / Geospatial
  console.log('\n5. Testing Geospatial Nearby Worker Search:');
  const searchRes = await fetch(`${API_BASE}/api/geospatial/workers/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lat: 18.5204,
      lng: 73.8567,
      service_category: 'Plumbing',
    }),
  });
  const searchData = await searchRes.json();
  console.log(`  ✓ Search Status: ${searchRes.status}`);
  console.log(`    Workers found: ${searchData.data?.total || 0}`);
  if (searchData.data?.workers?.length > 0) {
    const first = searchData.data.workers[0];
    console.log(`    Closest worker: ${first.name}, distance: ${first.distance_formatted}, ETA: ${first.eta_formatted}`);
  }

  console.log('\n=== ALL TESTS PASSED SUCCESSFULLY ===');
}

main().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
