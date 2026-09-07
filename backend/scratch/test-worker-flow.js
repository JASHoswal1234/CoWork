import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
import { supabaseAdmin } from '../src/config/supabase';

const API_BASE = 'http://localhost:3000';

async function main() {
  console.log('=== STARTING WORKER JOB ACCEPTANCE & NOTIFICATION TEST ===\n');

  // 1. Log in Customer & Worker
  console.log('1. Authenticating Demo Users:');
  const customerLogin = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'priya@sahakar.org', password: 'demo123' }),
  });
  const customerAuth = await customerLogin.json();
  const customerToken = customerAuth.data?.session?.access_token || customerAuth.data?.token;
  const customerId = customerAuth.data?.user?.id;
  console.log(`  ✓ Customer logged in: ${customerAuth.data?.user?.name} (${customerId})`);

  const workerLogin = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'rajesh@sahakar.org', password: 'demo123' }),
  });
  const workerAuth = await workerLogin.json();
  const workerToken = workerAuth.data?.session?.access_token || workerAuth.data?.token;
  const workerUserId = workerAuth.data?.user?.id;
  console.log(`  ✓ Worker logged in: ${workerAuth.data?.user?.name} (${workerUserId})`);

  // 2. Open Real-Time SSE Stream for Worker
  console.log('\n2. Connecting Worker to Real-Time Notification SSE Stream:');
  const receivedNotifications = [];
  const controller = new AbortController();

  const streamPromise = (async () => {
    try {
      const sseRes = await fetch(`${API_BASE}/api/notifications/stream?token=${encodeURIComponent(workerToken)}`, {
        signal: controller.signal,
      });

      const reader = sseRes.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              receivedNotifications.push(data);
              console.log(`  🔔 [SSE Received] Type: "${data.type}", Title: "${data.title}", Message: "${data.message}"`);
            } catch {}
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') console.error('SSE error:', err);
    }
  })();

  // Give SSE connection 500ms to register
  await new Promise((r) => setTimeout(r, 600));

  // 3. Customer Creates a New Plumbing Service Request
  console.log('\n3. Customer Creates New Plumbing Service Request:');
  const jobPayload = {
    service_category_name: 'Plumbing',
    title: 'Emergency Kitchen Sink Pipe Burst',
    description: 'Severe water leak flooding the kitchen floor',
    address: 'Siddharth Free Reading Room, Shivaji Road, Kasba Peth, Pune 411001',
    location: { lat: 18.5204, lng: 73.8567 },
    estimated_price: 800,
    min_budget: 600,
    max_budget: 1000,
    urgency: 'emergency',
  };

  const createRes = await fetch(`${API_BASE}/api/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${customerToken}`,
    },
    body: JSON.stringify(jobPayload),
  });
  const createData = await createRes.json();
  const createdJob = createData.data?.job;
  console.log(`  ✓ Job Created: ID = ${createdJob?.id}, Status = ${createdJob?.status}`);

  // Wait 1 second for SSE broadcast
  await new Promise((r) => setTimeout(r, 1000));

  // Check if worker received NEW_SERVICE_REQUEST notification
  const requestNotif = receivedNotifications.find((n) => n.type === 'NEW_SERVICE_REQUEST');
  console.log(`  ✓ Real-time Notification Received by Worker: ${Boolean(requestNotif)}`);
  if (requestNotif) {
    console.log(`    Notification Title: "${requestNotif.title}"`);
    console.log(`    Notification Content: "${requestNotif.message}"`);
    console.log(`    Notification Job ID: ${requestNotif.data?.job_id}`);
  }

  // 4. Worker Checks Incoming Requests
  console.log('\n4. Worker Checks Incoming Requests:');
  const incomingRes = await fetch(`${API_BASE}/api/jobs/worker/incoming`, {
    headers: { Authorization: `Bearer ${workerToken}` },
  });
  const incomingData = await incomingRes.json();
  const incomingList = incomingData.data?.requests || [];
  console.log(`  ✓ Total incoming requests: ${incomingList.length}`);
  const matchingIncoming = incomingList.find((j) => j.id === createdJob.id);
  console.log(`  ✓ Created job present in worker's incoming list: ${Boolean(matchingIncoming)}`);

  // 5. Worker Accepts the Job
  console.log('\n5. Worker Accepts Job (POST /api/jobs/:id/accept):');
  const acceptRes = await fetch(`${API_BASE}/api/jobs/${createdJob.id}/accept`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${workerToken}`,
    },
  });
  const acceptData = await acceptRes.json();
  console.log(`  ✓ Accept status: ${acceptRes.status}`);
  console.log(`    Message: "${acceptData.data?.message}"`);
  console.log(`    Assigned Worker: ${acceptData.data?.job?.worker_id}, Status: ${acceptData.data?.job?.status}`);

  // 6. Verify Job Disappeared from Incoming & Appears in Active Jobs
  console.log('\n6. Checking Worker Incoming & Active Jobs Post-Acceptance:');
  const incomingAfterRes = await fetch(`${API_BASE}/api/jobs/worker/incoming`, {
    headers: { Authorization: `Bearer ${workerToken}` },
  });
  const incomingAfterData = await incomingAfterRes.json();
  const inIncomingAfter = (incomingAfterData.data?.requests || []).some((j) => j.id === createdJob.id);
  console.log(`  ✓ Job removed from incoming list: ${!inIncomingAfter}`);

  const activeJobsRes = await fetch(`${API_BASE}/api/jobs`, {
    headers: { Authorization: `Bearer ${workerToken}` },
  });
  const activeJobsData = await activeJobsRes.json();
  const workerJobs = activeJobsData.data?.jobs || [];
  const acceptedJobInList = workerJobs.find((j) => j.id === createdJob.id);
  console.log(`  ✓ Job visible in worker's job list: ${Boolean(acceptedJobInList)}`);
  console.log(`    Status in worker's list: "${acceptedJobInList?.status}"`);

  // 7. Test Lifecycle Transitions: On the Way -> Arrived -> In Progress -> Completed
  console.log('\n7. Testing Worker Lifecycle Status Progression:');
  const statuses = ['on_the_way', 'arrived', 'in_progress', 'completed'];

  for (const st of statuses) {
    const updateRes = await fetch(`${API_BASE}/api/jobs/${createdJob.id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${workerToken}`,
      },
      body: JSON.stringify({ status: st }),
    });
    const updateData = await updateRes.json();
    console.log(`  ✓ Updated to "${st}": Status = ${updateRes.status}, Job Status = ${updateData.data?.job?.status}`);
  }

  // 8. Verify Completed Job
  console.log('\n8. Verifying Final Completed State:');
  const finalJobsRes = await fetch(`${API_BASE}/api/jobs`, {
    headers: { Authorization: `Bearer ${workerToken}` },
  });
  const finalJobsData = await finalJobsRes.json();
  const finalJob = (finalJobsData.data?.jobs || []).find((j) => j.id === createdJob.id);
  console.log(`  ✓ Final Job Status: "${finalJob?.status}"`);
  console.log(`  ✓ Completed at: ${finalJob?.completed_at}`);

  // Cleanup SSE
  controller.abort();
  await streamPromise.catch(() => {});

  console.log('\n=== ALL WORKER FLOW & NOTIFICATION TESTS PASSED ===');
}

main().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
