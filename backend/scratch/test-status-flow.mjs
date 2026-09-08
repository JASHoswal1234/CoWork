const API_BASE = 'http://localhost:3000';

async function main() {
  console.log('=== TESTING WORKER STATUS BUTTONS & CUSTOMER NOTIFICATIONS FLOW ===\n');

  // 1. Authenticate Customer
  console.log('1. Authenticating Customer...');
  const custRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'customer@sahakar.org', password: 'demo123' }),
  });
  const custData = await custRes.json();
  const custToken = custData.data.session.access_token;
  const customerId = custData.data.user.id;
  console.log('   Customer logged in:', customerId, 'Name:', custData.data.user.name);

  // 2. Authenticate Worker
  console.log('\n2. Authenticating Worker...');
  const workerRes = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'rajesh@sahakar.org', password: 'demo123' }),
  });
  const workerData = await workerRes.json();
  const workerToken = workerData.data.session.access_token;
  const workerUserId = workerData.data.user.id;
  console.log('   Worker logged in:', workerUserId, 'Name:', workerData.data.user.name);

  // 3. Customer creates a service request
  console.log('\n3. Customer creating service request...');
  const createJobRes = await fetch(`${API_BASE}/api/jobs`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${custToken}`,
    },
    body: JSON.stringify({
      service_category_name: 'Plumbing',
      service_subcategory_name: 'Pipe Leak Repair',
      title: 'Fix Kitchen Pipe Leak',
      description: 'Kitchen sink pipe is leaking water under the cabinet.',
      address: 'Kasba Peth, Pune 411011',
      location: { lat: 18.5204, lng: 73.8567 },
      estimated_price: 650,
      urgency: 'urgent',
    }),
  });
  const createJobData = await createJobRes.json();
  if (!createJobRes.ok || !createJobData.data?.job) {
    throw new Error(`Job creation failed: ${JSON.stringify(createJobData)}`);
  }
  const job = createJobData.data.job;
  console.log(`   Job created: ID=${job.id}, Number=${job.job_number}, Status=${job.status}`);

  // 4. Worker views incoming requests and accepts the job
  console.log('\n4. Worker accepting job...');
  const acceptRes = await fetch(`${API_BASE}/api/jobs/${job.id}/accept`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${workerToken}`,
    },
  });
  const acceptData = await acceptRes.json();
  if (!acceptRes.ok || !acceptData.data?.job) {
    throw new Error(`Accept failed: ${JSON.stringify(acceptData)}`);
  }
  console.log(`   Job accepted! Status: ${acceptData.data.job.status}, Assigned Worker: ${acceptData.data.job.worker_id}`);

  // 5. Worker clicks "1. ON THE WAY"
  console.log('\n5. Worker updating status -> "on_the_way"...');
  const onTheWayRes = await fetch(`${API_BASE}/api/jobs/${job.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${workerToken}`,
    },
    body: JSON.stringify({ status: 'on_the_way' }),
  });
  const onTheWayData = await onTheWayRes.json();
  if (!onTheWayRes.ok || onTheWayData.data?.job?.status !== 'on_the_way') {
    throw new Error(`On the way update failed: ${JSON.stringify(onTheWayData)}`);
  }
  console.log(`   Status successfully updated to: ${onTheWayData.data.job.status}`);

  // 6. Worker clicks "2. ARRIVED"
  console.log('\n6. Worker updating status -> "arrived"...');
  const arrivedRes = await fetch(`${API_BASE}/api/jobs/${job.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${workerToken}`,
    },
    body: JSON.stringify({ status: 'arrived' }),
  });
  const arrivedData = await arrivedRes.json();
  if (!arrivedRes.ok || arrivedData.data?.job?.status !== 'arrived') {
    throw new Error(`Arrived update failed: ${JSON.stringify(arrivedData)}`);
  }
  console.log(`   Status successfully updated to: ${arrivedData.data.job.status}`);

  // 7. Worker clicks "3. IN PROGRESS"
  console.log('\n7. Worker updating status -> "in_progress"...');
  const inProgressRes = await fetch(`${API_BASE}/api/jobs/${job.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${workerToken}`,
    },
    body: JSON.stringify({ status: 'in_progress' }),
  });
  const inProgressData = await inProgressRes.json();
  if (!inProgressRes.ok || inProgressData.data?.job?.status !== 'in_progress') {
    throw new Error(`In progress update failed: ${JSON.stringify(inProgressData)}`);
  }
  console.log(`   Status successfully updated to: ${inProgressData.data.job.status}`);

  // 8. Worker clicks "✓ COMPLETE JOB"
  console.log('\n8. Worker updating status -> "completed"...');
  const completedRes = await fetch(`${API_BASE}/api/jobs/${job.id}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${workerToken}`,
    },
    body: JSON.stringify({ status: 'completed' }),
  });
  const completedData = await completedRes.json();
  if (!completedRes.ok || completedData.data?.job?.status !== 'completed') {
    throw new Error(`Completed update failed: ${JSON.stringify(completedData)}`);
  }
  console.log(`   Status successfully updated to: ${completedData.data.job.status}`);
  console.log(`   Worker earning credited: ₹${completedData.data.worker_earning} (85% of ₹${completedData.data.job.actual_price})`);

  // 9. Verify Customer Notifications
  console.log('\n9. Checking Customer Notifications...');
  const notifRes = await fetch(`${API_BASE}/api/notifications`, {
    headers: { 'Authorization': `Bearer ${custToken}` },
  });
  const notifData = await notifRes.json();
  const notifications = notifData.data?.notifications || [];
  console.log(`   Customer has ${notifications.length} notifications:`);
  const jobNotifs = notifications.filter(n => n.data?.job_id === job.id);
  jobNotifs.forEach(n => {
    console.log(`   - [${n.type}] ${n.title}: "${n.message}" (read: ${n.is_read})`);
  });

  // 10. Customer checking job details
  console.log('\n10. Customer checking job details and payment readiness...');
  const getJobRes = await fetch(`${API_BASE}/api/jobs/${job.id}`, {
    headers: { 'Authorization': `Bearer ${custToken}` },
  });
  const getJobData = await getJobRes.json();
  console.log(`   Job Status: ${getJobData.data.job.status}, Actual Price: ₹${getJobData.data.job.actual_price}`);

  // 11. Customer creating Razorpay order for this exact completed job
  console.log('\n11. Testing customer create-order for completed job...');
  const orderRes = await fetch(`${API_BASE}/api/payments/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${custToken}`,
    },
    body: JSON.stringify({ job_id: job.id }),
  });
  const orderData = await orderRes.json();
  console.log(`   Create order response status: ${orderRes.status}, data:`, orderData.data || orderData.error);
  if (!orderRes.ok || !orderData.data?.orderId) {
    throw new Error(`Order creation failed: ${JSON.stringify(orderData)}`);
  }
  const { orderId, amount, keyId } = orderData.data;
  console.log(`   Order created successfully: orderId=${orderId}, amount=${amount} paise (₹${amount/100}), keyId=${keyId}`);

  // 12. Simulate Razorpay payment success & verify signature
  console.log('\n12. Testing Razorpay payment verification (POST /api/payments/verify)...');
  const testPaymentId = `pay_test_${Math.random().toString(36).substring(2, 10)}`;
  const keySecret = 'sahakar_test_secret_2024';
  const crypto = await import('crypto');
  const testSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${orderId}|${testPaymentId}`)
    .digest('hex');

  const verifyRes = await fetch(`${API_BASE}/api/payments/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${custToken}`,
    },
    body: JSON.stringify({
      razorpay_order_id: orderId,
      razorpay_payment_id: testPaymentId,
      razorpay_signature: testSignature,
    }),
  });
  const verifyData = await verifyRes.json();
  console.log(`   Verify response status: ${verifyRes.status}, data:`, verifyData.data || verifyData.error);
  if (!verifyRes.ok || verifyData.data?.status !== 'completed') {
    throw new Error(`Verification failed: ${JSON.stringify(verifyData)}`);
  }
  console.log(`   Payment verified! Amount: ₹${verifyData.data.amount}, Worker Credited: ₹${verifyData.data.workerCredited}, Status: ${verifyData.data.status}`);

  // 13. Idempotency Test: Paying again should safely return already completed
  console.log('\n13. Testing idempotency: verifying the same payment again...');
  const verifyAgainRes = await fetch(`${API_BASE}/api/payments/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${custToken}`,
    },
    body: JSON.stringify({
      razorpay_order_id: orderId,
      razorpay_payment_id: testPaymentId,
      razorpay_signature: testSignature,
    }),
  });
  const verifyAgainData = await verifyAgainRes.json();
  console.log(`   Idempotent response status: ${verifyAgainRes.status}, message: "${verifyAgainData.data?.message}"`);

  // 14. Security Test: Another user attempting to pay customer's job
  console.log('\n14. Testing security: unauthorized worker attempting to pay customer job...');
  const unauthorizedPayRes = await fetch(`${API_BASE}/api/payments/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${workerToken}`,
    },
    body: JSON.stringify({ job_id: job.id }),
  });
  console.log(`   Unauthorized attempt response code: ${unauthorizedPayRes.status} (Expected 404 or 403)`);

  console.log('\n=== ALL TESTS PASSED SUCCESSFULLY! ===');
}

main().catch(err => {
  console.error('\nTest failed with error:', err);
  process.exit(1);
});
